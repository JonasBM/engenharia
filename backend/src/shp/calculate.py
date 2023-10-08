import logging
from dataclasses import asdict
from typing import List, Tuple, Union

from django.conf import settings
from django.utils import timezone

from core.models import Signatory

from .dataclasses import SHPCalc, SHPCalcPath
from .exceptions import (BifurcationBeforePump, CalculeNotImplemented, CouldNotFinishCalculate,
                         MoreThenOnePump, MoreThenOneReservoir,
                         NoActiveFixtureFound, NoFixtureError,
                         NoInitialDataError, NoPumpFound, NoReservoir,
                         PathNotLeadingToReservoir)
from .models import (Config, Diameter, Fitting, FittingDiameter, Fixture,
                     Material, MaterialConnection, Reduction)
from .serializers import SHPCalcSerializer
from .utils import format_decimal, get_best_reduction, sortByEndPressure

logger = logging.getLogger(__name__)


assert hasattr(settings, 'CALC_LOGGING_DETAIL') and settings.CALC_LOGGING_DETAIL is not None, (
    'please set CALC_LOGGING_DETAIL attribute in the settings file'
)

CALC_LOGGING_DETAIL = settings.CALC_LOGGING_DETAIL


class SHP():

    shpCalc: SHPCalc = None
    serializer_class = SHPCalcSerializer
    fixture: Fixture = None
    minimum_flow: float = None

    def __pre_init__(self, data):
        paths = data.get('paths')
        if data.get('pressure_type') == 'GR':
            data['pump'] = {}
        attrToZero = ['length', 'level_difference', 'extra_equivalent_length',
                      'equivalent_length', 'total_length', 'head_lift']
        for path in paths:
            for attr, value in path.items():
                if attr in attrToZero and not value:
                    path[attr] = 0
            # path['equivalent_length'] = 0
            # path['total_length'] = 0
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

    def getValue(self, obj, attr, empty='-'):
        value = getattr(obj, attr)
        if value is None:
            return empty
        if isinstance(value, float):
            return "{:.6f}".format(value)
        return value

    def print_paths(self, p: SHPCalcPath, print_header=True):
        fields = ['start_pressure', 'end_pressure', 'flow', 'pressure_drop', 'level_difference']
        if print_header:
            print('{:^8} | '.format('path'),  f'{" | ".join(map(lambda attr: "{:^15}".format(attr), fields))}')
            print('{:^8} | '.format('-----'),  f'{" | ".join(map(lambda attr: "{:^15}".format("----------"), fields))}')

        print(
            '{:<8} | '.format(f'{self.getValue(p,"start")}-{self.getValue(p,"end", "")}'),
            f'{" | ".join(map(lambda attr: "{:>15}".format(self.getValue(p,attr)), fields))}'
        )
        if p.has_active_fixture:
            print(
                '{:<8} | '.format(f'{self.getValue(p,"start")}-{self.getValue(p.fixture,"end")}'),
                f'{" | ".join(map(lambda attr: "{:>15}".format(self.getValue(p.fixture,attr)), fields))}'
            )
        paths_after: list[SHPCalcPath] = self.get_paths_after(p)
        for next_path in paths_after:
            self.print_paths(next_path, False)

    def __calculate_minimum_height(self):
        logger.debug('Calculating minimum height')
        self.shpCalc.reservoir_path.level_difference = 0
        self.__calculate_required_pressure(self.fixture.minimum_flow_rate_in_m3_p_s)
        self.shpCalc.reservoir_path.level_difference = (
            -(self.shpCalc.reservoir_path.start_pressure / (1 - self.shpCalc.reservoir_path.unit_pressure_drop))
        )
        self.shpCalc.reservoir_path.start_pressure = 0
        self.shpCalc.reservoir_path.total_length = (
            self.shpCalc.reservoir_path.length +
            self.shpCalc.reservoir_path.equivalent_length +
            abs(self.shpCalc.reservoir_path.level_difference)
        )
        logger.debug(
            f'Finished calculate minimum height. level required: {self.shpCalc.reservoir_path.level_difference} m'
        )

    def __calculate_residual_flow(self) -> SHPCalcSerializer:
        logger.debug('Calculating residual flow for gravity system')

        path_less_pressure, has_flow = self.__get_path_with_less_pressure_and_flow()
        if not has_flow:
            message = 'Nenhum hidrante com vazão com esta altura de reservatório.'
            logger.error(message)
            raise CouldNotFinishCalculate(message)

        min_flow = 0
        max_flow = self.fixture.minimum_flow_rate_in_m3_p_s
        for i in range(50):
            self.__calculate_required_pressure(max_flow, [path_less_pressure])
            if self.shpCalc.reservoir_path.start_pressure > 0:
                break
            else:
                logger.debug(f'Found max flow: {max_flow}, in the {i} iteration')
                max_flow *= 2
        else:
            message = f'Reservatório alto demais. Maior vazão usada para o calculo: {max_flow}'
            logger.error(message)
            raise CouldNotFinishCalculate(message)

        flow = max_flow * 0.5

        for i in range(50):
            self.__calculate_required_pressure(flow, [path_less_pressure])
            if abs(self.shpCalc.reservoir_path.start_pressure) < 0.000001:
                break
            if self.shpCalc.reservoir_path.start_pressure > 0:
                (max_flow, flow) = (flow, (flow + min_flow) * 0.5)
            elif self.shpCalc.reservoir_path.start_pressure < 0:
                (min_flow, flow) = (flow, (max_flow + flow) * 0.5)

        else:
            message = 'Não foi possivel calcular uma vazão residual.'
            logger.error(message)
            raise CouldNotFinishCalculate(message)

        logger.debug(f'Finished calculate residual flow. minimum non zero flow: {flow} m³s')

    def __calculate_pump(self) -> SHPCalcSerializer:

        logger.debug('Calculating pump')

        if not self.shpCalc.pump_path:
            raise NoPumpFound()

        self.__calculate_required_pressure(self.fixture.minimum_flow_rate_in_m3_p_s)

        self.shpCalc.pump.head_lift = self.shpCalc.reservoir_path.start_pressure
        self.shpCalc.reservoir_path.start_pressure = 0
        self.shpCalc.pump.flow = self.shpCalc.reservoir_path.flow
        RES_BOM_pressure_drop = self.shpCalc.pump.head_lift - self.shpCalc.pump_path.end_pressure
        self.shpCalc.pump.NPSHd = 10.33 - 0.238 - RES_BOM_pressure_drop

        logger.debug(
            f'Finished calculate pump (head_lift: {self.shpCalc.pump.head_lift} m.c.a. | flow: {self.shpCalc.pump.flow}'
        )

    def __calculate_pump_residual_flow(self) -> SHPCalcSerializer:
        logger.debug('Calculating residual flow for pump system')

        self.shpCalc.pump_path.head_lift = self.shpCalc.pump.head_lift

        self.__calculate_residual_flow()

        self.shpCalc.pump.flow = self.shpCalc.reservoir_path.flow
        RES_BOM_pressure_drop = self.shpCalc.pump.head_lift - self.shpCalc.pump_path.end_pressure
        self.shpCalc.pump.NPSHd = 10.33 - 0.238 - RES_BOM_pressure_drop

    def calculate(self) -> SHPCalcSerializer:
        self.__prepare_calc()
        if (self.shpCalc.pressure_type == Config.PressureType.BOMBA):
            self.__validate_pump_calc()

        if (self.shpCalc.calc_type == Config.CalcType.VAZAO_MINIMA and
                self.shpCalc.pressure_type == Config.PressureType.GRAVITACIONAL):
            self.__calculate_minimum_height()
        elif (self.shpCalc.calc_type == Config.CalcType.VAZAO_RESIDUAL and
                self.shpCalc.pressure_type == Config.PressureType.GRAVITACIONAL):
            self.__calculate_residual_flow()
        elif (self.shpCalc.calc_type == Config.CalcType.VAZAO_MINIMA and
                self.shpCalc.pressure_type == Config.PressureType.BOMBA):
            self.__calculate_pump()
        elif (self.shpCalc.calc_type == Config.CalcType.VAZAO_RESIDUAL and
                self.shpCalc.pressure_type == Config.PressureType.BOMBA):
            self.__calculate_pump_residual_flow()
        else:
            raise CalculeNotImplemented()

        self.shpCalc.reservoir_path.head_lift = 0
        if self.shpCalc.pump_path:
            self.shpCalc.pump_path.head_lift = self.shpCalc.pump.head_lift

        self.__sum_paths_flow(self.shpCalc.reservoir_path)
        self.__calculate_paths_pressure_drop()
        self.__calculate_paths_pressure(self.shpCalc.reservoir_path)

        self.__calculate_paths_speed()
        if self.shpCalc.pump.head_lift:
            self.shpCalc.pump.head_lift = '{:.3f}'.format(self.shpCalc.pump.head_lift)
        self.shpCalc.reservoir_path.level_difference = '{:.3f}'.format(self.shpCalc.reservoir_path.level_difference)

        self.shpCalc.paths_with_fixture.sort(key=sortByEndPressure)
        self.shpCalc.less_favorable_path_fixture_index = self.shpCalc.paths.index(
            self.shpCalc.paths_with_fixture[0]
        )
        self.shpCalc.calculated_at = timezone.now()
        return self.serializer_class(data=asdict(self.shpCalc))

    def __prepare_calc(self):
        self.fixture: Fixture = Fixture.objects.get(id=self.shpCalc.fixture_id)
        if not self.fixture:
            raise NoFixtureError()
        if self.shpCalc.signatory_id and self.shpCalc.signatory_id > 0:
            self.shpCalc.signatory: Signatory = Signatory.objects.get(id=self.shpCalc.signatory_id)
        else:
            self.shpCalc.signatory = None

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
            path.head_lift = 0

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
                path.fixture.nozzle_pressure_drop = 0
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

    def __validate_pump_calc(self):
        if not self.shpCalc.pump_path:
            raise NoPumpFound()

        path = self.shpCalc.reservoir_path
        while path and path != self.shpCalc.pump_path:
            paths_after = self.get_paths_after(path)
            print([str(p) for p in paths_after])
            if len(paths_after) == 0:
                raise PathNotLeadingToReservoir()
            elif (len(paths_after) > 1):
                raise BifurcationBeforePump()
            path = paths_after[0]
        print(path)

    def __sum_paths_flow(self, path: SHPCalcPath):
        if path.has_active_fixture:
            path.flow = path.fixture.flow
            return path.flow
        paths_after: list[SHPCalcPath] = self.get_paths_after(path)
        path.flow = 0
        for next_path in paths_after:
            path.flow += self.__sum_paths_flow(next_path)
        return path.flow

    def __calculate_paths_speed(self):
        for path in self.shpCalc.paths:
            path.speed = path.get_speed()

    def __calculate_paths_pressure_drop(self):
        for path in self.shpCalc.paths:
            if path.has_fixture:
                path.fixture.calculate_pressure_drop(path.fixture.flow, self.fixture)
            path.calculate_pressure_drop(path.flow)

    def __calculate_paths_pressure(self, path: SHPCalcPath):
        path.calculate_end_pressure(path.start_pressure)
        if path.has_fixture:
            path.fixture.calculate_end_pressure(path.end_pressure)
        paths_after: list[SHPCalcPath] = self.get_paths_after(path)
        for next_path in paths_after:
            next_path.start_pressure = path.end_pressure
            self.__calculate_paths_pressure(next_path)

    def __calculate_reservoir_start_pressure(self, path_less_pressure: SHPCalcPath):

        assert self.minimum_flow is not None, 'self.minimum_flow is required'

        logger.debug(f'Calculating reservoir start pressure for path {str(path_less_pressure)}')
        # clean all
        for path in self.shpCalc.paths:
            path.start_pressure = 0
            path.end_pressure = 0
            path.flow = 0
            path.pressure_drop = 0
            if path.has_active_fixture:
                path.fixture.start_pressure = 0
                path.fixture.middle_pressure = 0
                path.fixture.end_pressure = 0
                path.fixture.flow = 0
                path.fixture.nozzle_pressure_drop = 0
                path.fixture.hose_pressure_drop = 0

        path_after = None
        path = path_less_pressure
        path.fixture.calculate_pressure_drop(self.minimum_flow, self.fixture)
        pressure = self.fixture.flow_to_pressure(path.fixture.flow) or 0
        path.fixture.calculate_start_pressure(pressure)
        path.calculate_pressure_drop(path.fixture.flow)
        path.calculate_start_pressure(path.fixture.start_pressure)

        count = 0
        max_count = len(self.shpCalc.paths)*2
        while path.start != 'RES':
            count += 1
            if count > max_count:
                raise PathNotLeadingToReservoir()
            (path_after, path) = (path, self.get_path_before(path))
            if not path:
                raise PathNotLeadingToReservoir()
            flow = path_after.flow
            paths_after = self.get_paths_after(path, path_after)
            for _path_after in paths_after:
                flow += self.__calculate_paths_flow(_path_after, path_after.start_pressure)
            path.calculate_pressure_drop(flow)
            path.calculate_start_pressure(path_after.start_pressure)

        logger.debug(f'Calculated reservoir start pressure: {path.start_pressure}, for path {str(path_less_pressure)}')

    def __calculate_required_pressure(self,
                                      minimum_flow: float,
                                      paths_with_fixture: List[SHPCalcPath] = None) -> SHPCalcPath:
        logger.debug('Calculating required pressure')

        if paths_with_fixture is None:
            paths_with_fixture = self.shpCalc.paths_with_fixture
        elif not isinstance(paths_with_fixture, list):
            paths_with_fixture = [paths_with_fixture]

        self.minimum_flow = minimum_flow
        logger.debug(f'Minimum flow expected: {self.minimum_flow}')

        self.shpCalc.reservoir_path.total_length = (
            self.shpCalc.reservoir_path.length +
            self.shpCalc.reservoir_path.equivalent_length +
            abs(self.shpCalc.reservoir_path.level_difference)
        )

        self.__calculate_paths_pressure(self.shpCalc.reservoir_path)
        paths_with_fixture.sort(key=sortByEndPressure)
        path_less_pressure = paths_with_fixture[0]
        logger.debug(f'Best starting path: {str(path_less_pressure)}')

        while paths_with_fixture and path_less_pressure:
            self.shpCalc.reservoir_path.start_pressure = 0
            self.__calculate_reservoir_start_pressure(path_less_pressure)
            paths_with_fixture.sort(key=sortByEndPressure)
            if path_less_pressure == paths_with_fixture[0]:
                break
            else:
                paths_with_fixture = [path for path in paths_with_fixture if path != path_less_pressure]
                path_less_pressure = paths_with_fixture[0]

        logger.debug(f'Path with least pressure: {str(path_less_pressure)}')

        logger.debug(f'Finished calculate required pressure: {self.shpCalc.reservoir_path.start_pressure} m.c.a.')

        return path_less_pressure

    def __get_path_with_less_pressure_and_flow(self) -> Tuple[SHPCalcSerializer, bool]:
        minimum_flow = self.fixture.minimum_flow_rate_in_m3_p_s

        logger.debug('Finding path with less pressure, with flow')
        paths_with_fixture = self.shpCalc.paths_with_fixture
        paths_with_fixture_count = len(paths_with_fixture)
        path_less_pressure = None

        for i in range(paths_with_fixture_count):
            paths_with_fixture = [path for path in paths_with_fixture if path != path_less_pressure]
            path_less_pressure = self.__calculate_required_pressure(minimum_flow, paths_with_fixture)
            self.__calculate_required_pressure(0, [path_less_pressure])
            if self.shpCalc.reservoir_path.start_pressure < 0:
                logger.debug(f'Found {str(path_less_pressure)} as path with less pressure')
                return path_less_pressure, True
        else:
            return path_less_pressure, False

    def __calculate_paths_flow(self, path: SHPCalcPath, start_pressure: float):

        if path.has_fixture:
            if not path.has_active_fixture:
                return 0

            flow = min_flow = 0
            path.calculate_pressure_drop(flow)
            path.calculate_end_pressure(start_pressure)
            path.fixture.calculate_pressure_drop(flow, self.fixture)
            path.fixture.calculate_end_pressure(path.end_pressure)
            flow = max_flow = self.fixture.pressure_to_flow(path.fixture.end_pressure)

            if min_flow == max_flow:
                return max_flow

            for i in range(100):

                path.fixture.calculate_pressure_drop(flow, self.fixture)
                pressure = self.fixture.flow_to_pressure(path.fixture.flow) or start_pressure
                path.fixture.calculate_start_pressure(pressure)
                path.calculate_pressure_drop(path.fixture.flow)
                path.calculate_start_pressure(path.fixture.start_pressure)

                if (abs(start_pressure - path.start_pressure) < 0.000001):
                    if CALC_LOGGING_DETAIL:
                        logger.debug(f'Found {str(path)} fixture flow: {path.fixture.flow}, in the {i} iteration')
                    return flow
                if start_pressure > path.start_pressure:
                    (min_flow, flow) = (flow, (max_flow + flow) * 0.5)
                elif start_pressure < path.start_pressure:
                    (max_flow, flow) = (flow, (flow + min_flow) * 0.5)
            else:
                message = f'Não foi possivel calcular a vazão no trecho {str(path)}.'
                logger.error(message)
                raise CouldNotFinishCalculate(message)

        else:
            paths_after = self.get_paths_after(path)

            flow = 0
            path.calculate_pressure_drop(flow)
            path.calculate_end_pressure(start_pressure)
            last_pressure = path.end_pressure
            last_flow = path.flow

            for i in range(100):
                flow = 0
                for _path in paths_after:
                    flow += self.__calculate_paths_flow(_path, path.end_pressure)
                path.calculate_pressure_drop(flow)
                path.calculate_end_pressure(start_pressure)
                if (abs(last_flow - path.flow) < 0.000001) and (abs(last_pressure - path.end_pressure) < 0.000001):
                    if CALC_LOGGING_DETAIL:
                        logger.debug(f'Found {str(path)} path flow: {path.flow}, in the {i} iteration')
                    return path.flow
                else:
                    last_pressure = path.end_pressure
                    last_flow = path.flow
            else:
                message = f'Não foi possivel calcular a vazão no trecho {str(path)}.'
                logger.error(message)
                raise CouldNotFinishCalculate(message)

    def get_path_before(self, actual_path: SHPCalcPath) -> Union[SHPCalcPath, None]:
        for path in self.shpCalc.paths:
            if path.end == actual_path.start:
                return path
        return None

    def get_paths_after(self, actual_path: SHPCalcPath, exclude_path: SHPCalcPath = None) -> List[SHPCalcPath]:
        paths = []
        if actual_path and actual_path.end and not actual_path.has_active_fixture:
            for path in self.shpCalc.paths:
                if path.start == actual_path.end and path != exclude_path:
                    paths.append(path)
        return paths
