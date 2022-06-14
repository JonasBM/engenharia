import logging
import math
from dataclasses import asdict, dataclass
from typing import Union


from .exceptions import (MoreThenOneReservoir, NoActiveFixtureFound,
                         NoFixtureError, NoInitialDataError, NoReservoir,
                         PathNotLeadingToReservoir)
from .models import Diameter, Fitting, FittingDiameter, Fixture, Material, MaterialConnection, Reduction
from .serializers import SHPCalcSerializer

logger = logging.getLogger(__name__)


@dataclass(kw_only=True)
class SHPCalcFileInfo:
    type: str
    version: str
    created: str
    updated: str


@dataclass(kw_only=True)
class SHPCalcFixture:
    active: bool = False
    end: str
    hose_length: float
    level_difference: float = 0
    flow: float = 0
    total_length: float = 0
    start_pressure: float = 0
    middle_pressure: float = 0
    end_pressure: float = 0
    start_level: float = 0
    end_level: float = 0
    minimum_flow: float = 0
    hose_pressure_drop: float = 0
    unit_hose_pressure_drop: float = 0
    pressure_drop: float = 0
    nozzle_pressure_drop: float = 0
    unit_pressure_drop: float = 0
    inlet_material: Material = None
    inlet_diameter: Diameter = None
    connection_names: list[str] = None


@dataclass(kw_only=True)
class SHPCalcPath:
    start: str
    end: str = None
    fixture: SHPCalcFixture = None
    material_id: int
    material: Material = None
    diameter_id: int
    diameter: Diameter = None
    length: float = 0
    level_difference: float = 0
    fittings_ids: list[int] = None
    fittings: list[Fitting] = None
    connection_names: list[str] = None
    extra_equivalent_length: float = 0
    equivalent_length: float = 0
    has_fixture: bool = False
    has_active_fixture: bool = False
    flow: float = 0
    speed: float = 0
    total_length: float = 0
    start_pressure: float = 0
    end_pressure: float = 0
    pressure_drop: float = 0
    unit_pressure_drop: float = 0

    def __post_init__(self):
        if self.has_fixture and self.fixture and self.fixture['active']:
            self.has_active_fixture = True
            self.fixture = SHPCalcFixture(**self.fixture)
        else:
            self.has_active_fixture = False

    def get_speed(self) -> float:
        if self.flow and self.diameter and self.diameter.internal_diameter:
            area = (math.pi * math.pow(float(self.diameter.internal_diameter)/float(1000), 2)) / float(4)
            speed = self.flow/area
            return speed
        return 0


@dataclass(kw_only=True)
class SHPCalc:
    fileinfo: SHPCalcFileInfo
    name: str
    pressure_type: str  # PRESSURE_TYPES
    calc_type: str  # CALC_TYPES
    pump_node: str
    material_id: int
    material: Material = None
    diameter_id: int
    diameter: Diameter = None
    fixture_id: int
    fixture: Fixture = None
    paths: list[SHPCalcPath]
    paths_with_fixture: list[SHPCalcPath] = None
    less_favorable_path_fixture_index: int = None
    reservoir_path: SHPCalcPath = None
    error: str = None

    def __post_init__(self):
        self.fileinfo = SHPCalcFileInfo(**self.fileinfo)
        newPaths = []
        for path in self.paths:
            newPaths.append(SHPCalcPath(**path))
        self.paths = newPaths


class SHP():

    shpCalc: SHPCalc = None
    serializer_class = SHPCalcSerializer

    def __pre_init__(self, data):
        paths = data.get('paths')
        attrToZero = ['length', 'level_difference', 'extra_equivalent_length']
        for path in paths:
            for attr, value in path.items():
                if attr in attrToZero and not value:
                    path[attr] = 0
            path['equivalent_length'] = 0
            path['total_length'] = 0
            if not path.get('fittings_ids'):
                path['fittings_ids'] = []
            if path.get('fixture') and not path.get('fixture', {}).get('hose_length'):
                path['fixture']['hose_length'] = 0
            if path.get('fixture') and not path.get('fixture', {}).get('level_difference'):
                path['fixture']['level_difference'] = 0
            if path.get('has_fixture') and path.get('fixture', {}).get('active'):
                path['end'] = None
        return data

    def __init__(self, data):
        if not data:
            raise NoInitialDataError()
        serializer = self.serializer_class(data=self.__pre_init__(data))
        serializer.is_valid(raise_exception=True)
        self.shpCalc = SHPCalc(**serializer.data)

    def getValue(self, obj, attr):
        value = getattr(obj, attr)
        if value is None:
            return '-'
        if isinstance(value, float):
            return "{:.6f}".format(value)
        return value

    def print_paths(self, p: SHPCalcPath, fields):
        print(
            f'{self.getValue(p,"start")}-{self.getValue(p,"end")}:  '
            f'{"".join(map(lambda attr: f"| {self.getValue(p,attr)}", fields))}'
        )
        if p.has_active_fixture:
            print(
                f'{self.getValue(p,"start")}-{self.getValue(p.fixture,"end")}: '
                f'{"".join(map(lambda attr: f"| {self.getValue(p.fixture,attr)}", fields))}'
            )
        paths_after: list[SHPCalcPath] = self.get_paths_after(p)
        for next_path in paths_after:
            self.print_paths(next_path, fields)

    def calculate(self) -> SHPCalcSerializer:
        self.__prepare_calc()
        # fields = ['start_pressure', 'end_pressure', 'flow', 'pressure_drop', 'level_difference']
        # self.print_paths(self.shpCalc.reservoir_path, fields=fields)
        print('start')
        self.__calculate_fixtures_flow(minimum=True)
        count = 0
        for i in range(50):
            count += 1
            self.shpCalc.reservoir_path.start_pressure = 0
            self.__calculate_paths_pressure(self.shpCalc.reservoir_path)
            self.__calculate_reservoir_pressure()
            missing_height = self.shpCalc.reservoir_path.start_pressure
            if (abs(missing_height) < 0.0001):
                break
            self.shpCalc.reservoir_path.level_difference -= (
                missing_height / (1 - self.shpCalc.reservoir_path.unit_pressure_drop)
            )
            self.shpCalc.reservoir_path.total_length = (
                self.shpCalc.reservoir_path.length + self.shpCalc.reservoir_path.equivalent_length - self.shpCalc.reservoir_path.level_difference
            )
        print(count)
        self.shpCalc.reservoir_path.level_difference = '{:.2f}'.format(self.shpCalc.reservoir_path.level_difference)
        self.shpCalc.less_favorable_path_fixture_index = self.shpCalc.paths.index(
            self.shpCalc.paths_with_fixture[0]
        )
        print('FIM')
        return self.serializer_class(data=asdict(self.shpCalc))

    def __prepare_calc(self):
        self.shpCalc.fixture = Fixture.objects.get(id=self.shpCalc.fixture_id)
        if not self.shpCalc.fixture:
            raise NoFixtureError()
        self.shpCalc.paths_with_fixture = []
        self.shpCalc.reservoir_path = None

        for path in self.shpCalc.paths:
            path.material = Material.objects.get(id=path.material_id)
            path.diameter = Diameter.objects.get(id=path.diameter_id)

            # FIXME: this just works for calc of minimum flow, with gravitational pressure
            if path.start == 'RES':
                if self.shpCalc.reservoir_path:
                    raise MoreThenOneReservoir()
                self.shpCalc.reservoir_path = path
                logger.warning('calc only works for minimum flow, with gravitational pressure right now')
                path.level_difference = 0

            path.flow = 0
            path.total_length = 0
            path.start_pressure = 0
            path.end_pressure = 0
            path.equivalent_length = path.extra_equivalent_length if path.extra_equivalent_length else 0
            path.pressure_drop = 0
            path.unit_pressure_drop = 0

            path.connection_names = [
                f'Comprimento extra: {format_decimal(path.equivalent_length)} m'
            ]

            # Get connections to connect to the previous path
            previous_path = self.get_path_before(path)

            if previous_path and previous_path.material_id != path.material_id:
                material_connections: MaterialConnection = (
                    MaterialConnection.objects
                    .filter(inlet_material=previous_path.material_id, outlet_material=path.material_id)
                )
                current_material_connection: MaterialConnection = None
                for material_connection in material_connections.all():
                    if (
                        material_connection.inlet_diameter == previous_path.diameter_id
                        and material_connection.outlet_diameter == path.diameter_id
                    ):
                        current_material_connection = material_connection
                        break
                    if (material_connection.inlet_diameter == previous_path.diameter_id):
                        current_material_connection = material_connection
                    elif (material_connection.outlet_diameter == path.diameter_id):
                        current_material_connection = material_connection
                    if not current_material_connection:
                        current_material_connection = material_connection

                if (current_material_connection and current_material_connection.equivalent_length):
                    path.equivalent_length += float(current_material_connection.equivalent_length)
                    path.connection_names.append(
                        f'{current_material_connection.name}: {format_decimal(current_material_connection.equivalent_length)} m'
                    )
                    if current_material_connection.inlet_diameter_id != previous_path.diameter_id:
                        inlet_reduction: Reduction = (
                            Reduction.objects.filter(
                                inlet_diameter=previous_path.diameter_id,
                                outlet_diameter=current_material_connection.inlet_diameter_id
                            )
                            .first())
                        if (inlet_reduction and inlet_reduction.equivalent_length):
                            path.equivalent_length += float(inlet_reduction.equivalent_length)
                            path.connection_names.append(
                                f'{inlet_reduction.name}: {format_decimal(inlet_reduction.equivalent_length)} m'
                            )
                    if current_material_connection.outlet_diameter_id != path.diameter_id:
                        outlet_reduction: Reduction = (
                            Reduction.objects.filter(
                                inlet_diameter=current_material_connection.outlet_diameter_id,
                                outlet_diameter=path.diameter_id
                            )
                            .first())
                        if (outlet_reduction and outlet_reduction.equivalent_length):
                            path.equivalent_length += float(outlet_reduction.equivalent_length)
                            path.connection_names.append(
                                f'{outlet_reduction.name}: {format_decimal(outlet_reduction.equivalent_length)} m'
                            )

            elif previous_path and previous_path.diameter_id != path.diameter_id:
                reduction: Reduction = (
                    Reduction.objects
                    .filter(inlet_diameter=previous_path.diameter_id, outlet_diameter=path.diameter_id)
                    .first()
                )
                if (reduction and reduction.equivalent_length):
                    path.equivalent_length += float(reduction.equivalent_length)
                    path.connection_names.append(
                        f'{reduction.name}: {format_decimal(reduction.equivalent_length)} m'
                    )

            # Get connections in the path
            if path.fittings_ids:
                path.fittings = Fitting.objects.filter(id__in=path.fittings_ids)
                for fitting_id in path.fittings_ids:
                    fitting_diameter: FittingDiameter = (
                        FittingDiameter.objects
                        .filter(diameter_id=path.diameter_id, fitting=fitting_id)
                        .prefetch_related('fitting')
                        .first()
                    )
                    if (fitting_diameter and fitting_diameter.equivalent_length):
                        path.equivalent_length += float(fitting_diameter.equivalent_length)
                        path.connection_names.append(
                            f'{fitting_diameter.fitting.name}: {format_decimal(fitting_diameter.equivalent_length)} m'
                        )
            else:
                path.fittings = []

            # Get connections to connect to the next path
            connection_fitting_id = None
            count_paths_after = len(self.get_paths_after(path))
            if count_paths_after == 1:
                connection_fitting_id = path.material.one_outlet_connection_id
            if count_paths_after == 2:
                connection_fitting_id = path.material.two_outlet_connection_id
            if count_paths_after == 3:
                connection_fitting_id = path.material.three_outlet_connection_id
            if connection_fitting_id:
                fitting_diameter: FittingDiameter = (
                    FittingDiameter.objects
                    .filter(diameter_id=path.diameter_id, fitting=connection_fitting_id)
                    .prefetch_related('fitting')
                    .first()
                )
                if (fitting_diameter and fitting_diameter.equivalent_length):
                    path.equivalent_length += float(fitting_diameter.equivalent_length)
                    path.connection_names.append(
                        f'{fitting_diameter.fitting.name}: {format_decimal(fitting_diameter.equivalent_length)} m'
                    )

            path.total_length = path.equivalent_length + path.length
            if path.has_active_fixture:

                path.fixture.flow = 0
                path.fixture.start_pressure = 0
                path.fixture.middle_pressure = 0
                path.fixture.hose_pressure_drop = 0
                path.fixture.unit_hose_pressure_drop = 0
                path.fixture.pressure_drop = 0
                path.fixture.unit_pressure_drop = 0
                path.fixture.end_pressure = 0
                path.fixture.inlet_diameter = self.shpCalc.fixture.inlet_diameter
                if path.fixture.inlet_diameter:
                    path.fixture.inlet_material = path.fixture.inlet_diameter.material
                else:
                    path.fixture.inlet_material = None
                path.fixture.total_length = (
                    float(self.shpCalc.fixture.extra_equivalent_length)
                    if self.shpCalc.fixture.extra_equivalent_length else 0
                )
                path.fixture.connection_names = [
                    f'Comprimento extra: {format_decimal(path.fixture.total_length)} m'
                ]
                for fitting in self.shpCalc.fixture.fittings.all():
                    if path.fixture.inlet_diameter:
                        fitting_diameter: FittingDiameter = (
                            FittingDiameter.objects
                            .filter(diameter_id=path.fixture.inlet_diameter.id, fitting=fitting.id)
                            .prefetch_related('fitting')
                            .first()
                        )
                        if (fitting_diameter and fitting_diameter.equivalent_length):
                            path.fixture.total_length += float(fitting_diameter.equivalent_length)
                            path.fixture.connection_names.append(
                                f'{fitting_diameter.fitting.name}: {format_decimal(fitting_diameter.equivalent_length)} m'
                            )
                for reduction in self.shpCalc.fixture.reductions.all():
                    if (reduction.equivalent_length):
                        path.fixture.total_length += float(reduction.equivalent_length)
                        path.fixture.connection_names.append(
                            f'{reduction.name}: {format_decimal(reduction.equivalent_length)} m'
                        )
                self.shpCalc.paths_with_fixture.append(path)

        if not self.shpCalc.paths_with_fixture:
            raise NoActiveFixtureFound()
        if not self.shpCalc.reservoir_path:
            raise NoReservoir()

    # def __calculate_paths_pressure_teste(self):
    #     for path in self.shpCalc.paths:
    #         path.start_pressure = 0
    #         path.end_pressure = 0

    #     for path in self.shpCalc.paths_with_fixture:
    #         path.fixture.end_pressure = self.shpCalc.fixture.flow_to_pressure(path.fixture.flow)
    #         path.fixture.middle_pressure = (
    #             path.fixture.end_pressure + path.fixture.nozzle_pressure_drop + path.fixture.hose_pressure_drop + path.fixture.level_difference
    #         )
    #         path.fixture.start_pressure = path.fixture.middle_pressure + path.fixture.pressure_drop
    #         path.end_pressure = path.fixture.start_pressure
    #         path.start_pressure = path.end_pressure + path.pressure_drop + path.level_difference

    #         while path.start != 'RES':
    #             path_after = path
    #             path = self.get_path_before(path)
    #             if not path:
    #                 raise PathNotLeadingToReservoir
    #             if path_after.start_pressure > path.end_pressure:
    #                 path.end_pressure = path_after.start_pressure
    #             path.start_pressure = path.end_pressure + path.pressure_drop + path.level_difference

    def __calculate_fixtures_flow(self, minimum=False):
        minimum_flow = self.shpCalc.fixture.minimum_flow_rate_in_m3_p_s
        for path in self.shpCalc.paths_with_fixture:
            pressure_flow = self.shpCalc.fixture.pressure_to_flow(path.fixture.end_pressure)
            if minimum or pressure_flow is None or pressure_flow < minimum_flow:
                path.fixture.flow = minimum_flow
            else:
                path.fixture.flow = pressure_flow

    def __calculate_paths_flow(self, path: SHPCalcPath):
        if path.has_active_fixture:
            path.flow = path.fixture.flow
            return path.flow
        paths_after: list[SHPCalcPath] = self.get_paths_after(path)
        flow_sum = 0
        for next_path in paths_after:
            teste = self.__calculate_paths_flow(next_path)
            flow_sum += teste
        path.flow = flow_sum
        return flow_sum

    def __calculate_paths_speed(self):
        for path in self.shpCalc.paths:
            path.speed = path.get_speed()

    def __calculate_paths_pressure_drop(self):
        for path in self.shpCalc.paths:
            if path.has_active_fixture:
                path.fixture.unit_hose_pressure_drop = get_unit_pressure_drop(
                    path.fixture.flow,
                    self.shpCalc.fixture.hose_hazen_williams_coefficient,
                    self.shpCalc.fixture.hose_internal_diameter
                )
                path.fixture.hose_pressure_drop = path.fixture.unit_hose_pressure_drop * path.fixture.hose_length
                if path.fixture.inlet_material and path.fixture.inlet_diameter:
                    path.fixture.unit_pressure_drop = get_unit_pressure_drop(
                        path.fixture.flow,
                        path.fixture.inlet_material.hazen_williams_coefficient,
                        path.fixture.inlet_diameter.internal_diameter,
                    )
                    path.fixture.nozzle_pressure_drop = self.shpCalc.fixture.get_fixture_pressure_drop(
                        path.fixture.flow)
                    path.fixture.pressure_drop = (
                        path.fixture.unit_pressure_drop * path.fixture.total_length
                    )
            path.unit_pressure_drop = get_unit_pressure_drop(
                path.flow,
                path.material.hazen_williams_coefficient,
                path.diameter.internal_diameter,
            )
            path.pressure_drop = path.unit_pressure_drop * path.total_length

    def __calculate_paths_pressure(self, path: SHPCalcPath):
        path.end_pressure = path.start_pressure - path.pressure_drop - path.level_difference
        if path.has_active_fixture:
            path.fixture.start_pressure = path.end_pressure
            path.fixture.middle_pressure = path.fixture.start_pressure - path.fixture.pressure_drop
            path.fixture.end_pressure = (
                path.fixture.middle_pressure - path.fixture.hose_pressure_drop - path.fixture.nozzle_pressure_drop - path.fixture.level_difference
            )
        paths_after: list[SHPCalcPath] = self.get_paths_after(path)
        for next_path in paths_after:
            next_path.start_pressure = path.end_pressure
            self.__calculate_paths_pressure(next_path)

    def __calculate_reservoir_pressure(self):
        for path in self.shpCalc.paths:
            path.start_pressure = 0
            path.end_pressure = 0

        self.shpCalc.paths_with_fixture.sort(key=sortByEndPressure)
        path = self.shpCalc.paths_with_fixture[0]
        path.fixture.flow = self.shpCalc.fixture.minimum_flow_rate_in_m3_p_s
        path.fixture.end_pressure = self.shpCalc.fixture.flow_to_pressure(path.fixture.flow)
        self.__calculate_fixtures_flow()
        self.__calculate_paths_flow(self.shpCalc.reservoir_path)
        self.__calculate_paths_pressure_drop()

        path.fixture.middle_pressure = (
            path.fixture.end_pressure + path.fixture.nozzle_pressure_drop + path.fixture.hose_pressure_drop + path.fixture.level_difference
        )
        path.fixture.start_pressure = path.fixture.middle_pressure + path.fixture.pressure_drop
        path.end_pressure = path.fixture.start_pressure
        path.start_pressure = path.end_pressure + path.pressure_drop + path.level_difference

        while path.start != 'RES':
            path_after = path
            path = self.get_path_before(path)
            if not path:
                raise PathNotLeadingToReservoir
            if path_after.start_pressure > path.end_pressure:
                path.end_pressure = path_after.start_pressure
            path.start_pressure = path.end_pressure + path.pressure_drop + path.level_difference

    def __get_pressure_by_level(self, path: SHPCalcPath, fixture=False):
        '''
        Calculates the global level from the res to the point
        '''
        level = 0
        if fixture:
            level += path.fixture.level_difference
        level += path.level_difference
        while path.start != 'RES':
            path = self.get_path_before(path)
            if not path:
                raise PathNotLeadingToReservoir
            level += path.level_difference
        return level

    def get_path_before(self, actual_path: SHPCalcPath):
        for path in self.shpCalc.paths:
            if path.end == actual_path.start:
                return path
        return None

    def get_paths_after(self, actual_path: SHPCalcPath):
        paths = []
        if actual_path and actual_path.end and not actual_path.has_active_fixture:
            for path in self.shpCalc.paths:
                if path.start == actual_path.end:
                    paths.append(path)
        return paths


# def convert_flow(flow: float, revert=False):
#     '''
#     Converts flow from l/min to m³/s
#     '''
#     return flow * 60000 if revert else flow/60000


def sortByEndPressure(path_with_fixture: SHPCalcPath):
    return path_with_fixture.fixture.end_pressure


def get_unit_pressure_drop(flow: float, coefficient: int, diameter: float) -> float:
    '''
    returns unit pressure drop in m/m
    args={
        flow: flow in m³/s
        coefficient: Hazen-Williams coefficient
        diameter: internal diameter in mm
    }
    '''
    numerator = 10.641*math.pow(float(flow), 1.85)
    denominator = math.pow(float(coefficient), 1.85)*math.pow(float(diameter)/float(1000), 4.87)
    return numerator/denominator


def format_decimal(number: Union[int, float], decimals=2):
    if number:
        return "{:.2f}".format(number).replace('.', ',')
    return '0,00'
