import logging
from dataclasses import asdict

from django.utils import timezone

from .dataclasses import SHPCalc, SHPCalcPath
from .exceptions import (MoreThenOnePump, MoreThenOneReservoir, NoActiveFixtureFound,
                         NoFixtureError, NoInitialDataError, NoReservoir,
                         PathNotLeadingToReservoir, CalculeNotImplemented)
from .models import (Config, Diameter, Fitting, FittingDiameter, Fixture,
                     Material, MaterialConnection, Reduction)
from .serializers import SHPCalcSerializer
from .utils import format_decimal, get_best_reduction, get_unit_pressure_drop, sortByEndPressure

logger = logging.getLogger(__name__)


class SHP():

    shpCalc: SHPCalc = None
    serializer_class = SHPCalcSerializer
    fixture: Fixture = None
    minimum_flow: float = None

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

    def print_paths(self, p: SHPCalcPath):
        fields = ['start_pressure', 'end_pressure', 'flow', 'pressure_drop', 'level_difference']
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
            self.print_paths(next_path)

    def __calculate_minimum_height(self) -> SHPCalcSerializer:
        print('START: __calculate_minimum_height')
        self.shpCalc.reservoir_path.level_difference = 0
        self.shpCalc.reservoir_path.total_length = (
            self.shpCalc.reservoir_path.length +
            self.shpCalc.reservoir_path.equivalent_length -
            self.shpCalc.reservoir_path.level_difference
        )
        self.__calculate_fixtures_flow(minimum=True)
        for i in range(100):
            self.shpCalc.reservoir_path.start_pressure = 0
            self.__calculate_paths_pressure(self.shpCalc.reservoir_path)
            self.__calculate_reservoir_pressure()
            missing_height = self.shpCalc.reservoir_path.start_pressure
            if (abs(missing_height) < 0.001):
                break
            self.shpCalc.reservoir_path.level_difference -= (
                missing_height / (1 - self.shpCalc.reservoir_path.unit_pressure_drop)
            )
            if (
                self.shpCalc.calc_type == Config.CalcType.VAZAO_MINIMA and
                self.shpCalc.pressure_type == Config.PressureType.GRAVITACIONAL
            ):
                self.shpCalc.reservoir_path.total_length = (
                    self.shpCalc.reservoir_path.length +
                    self.shpCalc.reservoir_path.equivalent_length -
                    self.shpCalc.reservoir_path.level_difference
                )
        self.__calculate_paths_pressure(self.shpCalc.reservoir_path)
        print('FIM: ', i+1)
        return i+1

    def __calculate_residual_flow(self) -> SHPCalcSerializer:
        print('START: __calculate_residual_flow')
        reservoir_level_difference = self.shpCalc.reservoir_path.level_difference
        self.minimum_flow = self.fixture.minimum_flow_rate_in_m3_p_s
        for i in range(50):
            self.__calculate_minimum_height()
            missing_height = reservoir_level_difference - self.shpCalc.reservoir_path.level_difference
            if (abs(missing_height) < 0.001):
                break
            current_pressure = self.fixture.flow_to_pressure(self.minimum_flow)
            current_pressure -= missing_height
            if current_pressure < 0:
                self.minimum_flow = self.minimum_flow * 0.5
            else:
                self.minimum_flow = self.fixture.pressure_to_flow(current_pressure)
        self.shpCalc.reservoir_path.level_difference = reservoir_level_difference
        print('FIM: ', i + 1)
        return i+1

    def __calculate_pump(self) -> SHPCalcSerializer:
        print('START: __calculate_pump')
        self.minimum_flow = self.fixture.minimum_flow_rate_in_m3_p_s
        reservoir_level_difference = self.shpCalc.reservoir_path.level_difference
        counter = self.__calculate_minimum_height()
        self.shpCalc.pump.head_height = reservoir_level_difference - self.shpCalc.reservoir_path.level_difference
        self.shpCalc.pump.flow = self.shpCalc.reservoir_path.flow
        RES_BOM_pressure_drop = self.shpCalc.pump.head_height - self.shpCalc.pump_path.end_pressure
        self.shpCalc.pump.NPSHd = 10.33 - 0.238 - RES_BOM_pressure_drop
        self.shpCalc.reservoir_path.level_difference = reservoir_level_difference
        print('FIM: ')
        return counter

    def __calculate_pump_residual_flow(self) -> SHPCalcSerializer:
        print('START: __calculate_pump')
        self.minimum_flow = self.fixture.minimum_flow_rate_in_m3_p_s
        reservoir_level_difference = self.shpCalc.reservoir_path.level_difference
        self.shpCalc.reservoir_path.level_difference = -reservoir_level_difference - self.shpCalc.pump.head_height
        counter = self.__calculate_residual_flow()
        self.shpCalc.pump.flow = self.shpCalc.reservoir_path.flow
        RES_BOM_pressure_drop = self.shpCalc.pump.head_height - self.shpCalc.pump_path.end_pressure
        self.shpCalc.pump.NPSHd = 10.33 - 0.238 - RES_BOM_pressure_drop
        self.shpCalc.reservoir_path.level_difference = reservoir_level_difference
        print('FIM: ')
        return counter

    def calculate(self) -> SHPCalcSerializer:
        self.__prepare_calc()
        if (
            self.shpCalc.calc_type == Config.CalcType.VAZAO_MINIMA and
            self.shpCalc.pressure_type == Config.PressureType.GRAVITACIONAL
        ):
            self.minimum_flow = self.fixture.minimum_flow_rate_in_m3_p_s
            self.__calculate_minimum_height()
        elif (
                self.shpCalc.calc_type == Config.CalcType.VAZAO_RESIDUAL and
                self.shpCalc.pressure_type == Config.PressureType.GRAVITACIONAL
        ):
            self.__calculate_residual_flow()
        elif (
                self.shpCalc.calc_type == Config.CalcType.VAZAO_MINIMA and
                self.shpCalc.pressure_type == Config.PressureType.BOMBA
        ):
            self.__calculate_pump()
        elif (
                self.shpCalc.calc_type == Config.CalcType.VAZAO_RESIDUAL and
                self.shpCalc.pressure_type == Config.PressureType.BOMBA
        ):
            self.__calculate_pump_residual_flow()
        else:
            raise CalculeNotImplemented()
        self.__calculate_paths_speed()
        if self.shpCalc.pump.head_height:
            self.shpCalc.pump.head_height = '{:.2f}'.format(self.shpCalc.pump.head_height)
        self.shpCalc.reservoir_path.level_difference = '{:.2f}'.format(self.shpCalc.reservoir_path.level_difference)
        self.shpCalc.less_favorable_path_fixture_index = self.shpCalc.paths.index(
            self.shpCalc.paths_with_fixture[0]
        )
        self.shpCalc.calculated_at = timezone.now()
        return self.serializer_class(data=asdict(self.shpCalc))

    def __prepare_calc(self):
        self.fixture: Fixture = Fixture.objects.get(id=self.shpCalc.fixture_id)
        if not self.shpCalc:
            raise NoFixtureError()
        self.shpCalc.paths_with_fixture = []
        self.shpCalc.reservoir_path = None
        self.shpCalc.error = None
        self.shpCalc.less_favorable_path_fixture_index = None
        self.shpCalc.calculated_at = None

        for path in self.shpCalc.paths:
            path.material = Material.objects.get(id=path.material_id)
            path.diameter = Diameter.objects.get(id=path.diameter_id)

            if path.start == 'RES':
                if self.shpCalc.reservoir_path:
                    raise MoreThenOneReservoir()
                self.shpCalc.reservoir_path = path

            if self.shpCalc.pressure_type == Config.PressureType.BOMBA and path.end == self.shpCalc.pump.node:
                if self.shpCalc.pump_path:
                    raise MoreThenOnePump()
                self.shpCalc.pump_path = path

            path.flow = 0
            path.speed = 0
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
                        f'{current_material_connection.name}: '
                        f'{format_decimal(current_material_connection.equivalent_length)} m'
                    )
                    if current_material_connection.inlet_diameter_id != previous_path.diameter_id:
                        inlet_reductions = get_best_reduction(
                            previous_path.diameter_id, current_material_connection.inlet_diameter_id)
                        for reduction in inlet_reductions:
                            if (reduction and reduction.equivalent_length):
                                path.equivalent_length += float(reduction.equivalent_length)
                                path.connection_names.append(
                                    f'{reduction.name}: {format_decimal(reduction.equivalent_length)} m'
                                )
                    if current_material_connection.outlet_diameter_id != path.diameter_id:
                        outlet_reductions = get_best_reduction(
                            current_material_connection.outlet_diameter_id, path.diameter_id)
                        for reduction in outlet_reductions:
                            if (reduction and reduction.equivalent_length):
                                path.equivalent_length += float(reduction.equivalent_length)
                                path.connection_names.append(
                                    f'{reduction.name}: {format_decimal(reduction.equivalent_length)} m'
                                )

            elif previous_path and previous_path.diameter_id != path.diameter_id:
                inlet_reductions = get_best_reduction(previous_path.diameter_id, path.diameter_id)
                for reduction in inlet_reductions:
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

            if path.fixture:
                path.fixture.flow = 0
                path.fixture.start_pressure = 0
                path.fixture.middle_pressure = 0
                path.fixture.hose_pressure_drop = 0
                path.fixture.unit_hose_pressure_drop = 0
                path.fixture.pressure_drop = 0
                path.fixture.unit_pressure_drop = 0
                path.fixture.end_pressure = 0
                path.fixture.total_length = 0
                path.fixture.connection_names = []

            if path.has_active_fixture:
                path.fixture.inlet_diameter = self.fixture.inlet_diameter
                if path.fixture.inlet_diameter:
                    path.fixture.inlet_material = path.fixture.inlet_diameter.material
                else:
                    path.fixture.inlet_material = None
                path.fixture.total_length = (
                    float(self.fixture.extra_equivalent_length)
                    if self.fixture.extra_equivalent_length else 0
                )
                path.fixture.connection_names = [
                    f'Comprimento extra: {format_decimal(path.fixture.total_length)} m'
                ]
                for fitting_id in self.fixture.fittings_ids:
                    if path.fixture.inlet_diameter:
                        fitting_diameter: FittingDiameter = (
                            FittingDiameter.objects
                            .filter(diameter_id=path.fixture.inlet_diameter.id, fitting=fitting_id)
                            .prefetch_related('fitting')
                            .first()
                        )
                        if (fitting_diameter and fitting_diameter.equivalent_length):
                            path.fixture.total_length += float(fitting_diameter.equivalent_length)
                            path.fixture.connection_names.append(
                                f'{fitting_diameter.fitting.name}: '
                                f'{format_decimal(fitting_diameter.equivalent_length)} m'
                            )
                for reduction_id in self.fixture.reductions_ids:
                    reduction: Reduction = (Reduction.objects.filter(id=reduction_id).first())
                    if (reduction and reduction.equivalent_length):
                        path.fixture.total_length += float(reduction.equivalent_length)
                        path.fixture.connection_names.append(
                            f'{reduction.name}: {format_decimal(reduction.equivalent_length)} m'
                        )
                self.shpCalc.paths_with_fixture.append(path)
        if not self.shpCalc.paths_with_fixture:
            raise NoActiveFixtureFound()
        if not self.shpCalc.reservoir_path:
            raise NoReservoir()

    def __calculate_fixtures_flow(self, minimum=False):
        for path in self.shpCalc.paths_with_fixture:
            if minimum:
                path.fixture.flow = self.minimum_flow
                continue
            pressure_flow = self.fixture.pressure_to_flow(path.fixture.end_pressure)
            if not pressure_flow or pressure_flow < self.minimum_flow:
                path.fixture.flow = self.minimum_flow
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
                if (self.fixture.k_factor_includes_hose):
                    path.fixture.unit_hose_pressure_drop = 0
                else:
                    path.fixture.unit_hose_pressure_drop = get_unit_pressure_drop(
                        path.fixture.flow,
                        self.fixture.hose_hazen_williams_coefficient,
                        self.fixture.hose_internal_diameter
                    )
                path.fixture.hose_pressure_drop = path.fixture.unit_hose_pressure_drop * path.fixture.hose_length
                if path.fixture.inlet_material and path.fixture.inlet_diameter:
                    path.fixture.unit_pressure_drop = get_unit_pressure_drop(
                        path.fixture.flow,
                        path.fixture.inlet_material.hazen_williams_coefficient,
                        path.fixture.inlet_diameter.internal_diameter,
                    )
                    path.fixture.nozzle_pressure_drop = self.fixture.get_fixture_pressure_drop(
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
                path.fixture.middle_pressure -
                path.fixture.hose_pressure_drop -
                path.fixture.nozzle_pressure_drop -
                path.fixture.level_difference
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
        path.fixture.end_pressure = self.fixture.flow_to_pressure(self.minimum_flow)

        self.__calculate_fixtures_flow()
        self.__calculate_paths_flow(self.shpCalc.reservoir_path)
        self.__calculate_paths_pressure_drop()

        path.fixture.middle_pressure = (
            path.fixture.end_pressure +
            path.fixture.nozzle_pressure_drop +
            path.fixture.hose_pressure_drop +
            path.fixture.level_difference
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
