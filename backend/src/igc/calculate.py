import logging
from dataclasses import asdict
from typing import List, Tuple, Union

from django.conf import settings
from django.utils import timezone

from core.models import Signatory

from .dataclasses import IGCCalc, IGCCalcPath
from .exceptions import (MoreThenOneReservoir, NoGasError, NoInitialDataError,
                         NoReservoir)
from .models import (GAS, Config, Diameter, Fitting, FittingDiameter, Material,
                     MaterialConnection)
from .serializers import IGCCalcSerializer
from .utils import format_decimal, get_best_reduction

logger = logging.getLogger(__name__)


assert hasattr(settings, 'CALC_LOGGING_DETAIL') and settings.CALC_LOGGING_DETAIL is not None, (
    'please set CALC_LOGGING_DETAIL attribute in the settings file'
)

CALC_LOGGING_DETAIL = settings.CALC_LOGGING_DETAIL


class IGC():

    igcCalc: IGCCalc = None
    serializer_class = IGCCalcSerializer

    def __pre_init__(self, data):
        paths = data.get('paths')
        attrToZero = [
            'power_rating_added',
            'length',
            'length_up',
            'length_down',
            'extra_equivalent_length',
            'equivalent_length',
        ]

        for path in paths:
            for attr, value in path.items():
                if attr in attrToZero and not value:
                    path[attr] = 0
            if not path.get('fittings_ids'):
                path['fittings_ids'] = []
        return data

    def __init__(self, data):
        if not data:
            raise NoInitialDataError()
        serializer = self.serializer_class(data=self.__pre_init__(data))
        serializer.is_valid(raise_exception=True)
        self.igcCalc = IGCCalc(**serializer.data)

    def __getValue(self, obj, attr, empty='-'):
        value = getattr(obj, attr)
        if value is None:
            return empty
        if isinstance(value, float):
            return "{:.6f}".format(value)
        return value

    def __trunk_string(self, value, max_length, empty='-'):
        if value is None:
            return empty
        if len(value) > max_length:
            length = (max_length - 3) // 2
            return f'{value[:length]}...{value[-length:]}'
        return value

    def print_paths(self, p: IGCCalcPath, print_header=True):
        fields = ['start_pressure', 'pressure_drop', 'end_pressure']
        if print_header:
            print('{:^8} | '.format('path'),
                  f'{" | ".join(map(lambda attr: "{:^15}".format(self.__trunk_string(attr,15)), fields))}')
            print('{:^8} | '.format('-----'),  f'{" | ".join(map(lambda attr: "{:^15}".format("----------"), fields))}')

        print(
            '{:<8} | '.format(f'{self.__getValue(p,"start")}-{self.__getValue(p,"end", "")}'),
            f'{" | ".join(map(lambda attr: "{:>15}".format(self.__getValue(p,attr)), fields))}'
        )
        paths_after: list[IGCCalcPath] = self.get_paths_after(p)
        for next_path in paths_after:
            self.print_paths(next_path, False)

    def calculate(self) -> IGCCalcSerializer:

        self.__prepare_calc()

        # Calculate
        logger.debug('Calculating')
        self.__sum_paths_power_rating_accumulated(self.igcCalc.reservoir_path)
        self.__calculate_paths_power_rating_adopted()
        self.__calculate_paths_flow()
        self.__calculate_paths_pressure_drop()
        self.__calculate_paths_pressure(self.igcCalc.reservoir_path)

        # Finish calculation
        logger.debug('Finishing calculation')
        self.__calculate_paths_speed()
        self.__calculate_paths_pressure_drop_accumulated()
        self.__sum_paths_fail_level(self.igcCalc.reservoir_path)
        self.__calculate_paths_pressure_drop_color()

        logger.debug('Finished calculate')

        self.igcCalc.calculated_at = timezone.now()
        return self.serializer_class(data=asdict(self.igcCalc))

    def __prepare_calc(self):
        self.igcCalc.gas: GAS = GAS.objects.get(id=self.igcCalc.gas_id)
        if not self.igcCalc.gas:
            raise NoGasError()
        if self.igcCalc.signatory_id and self.igcCalc.signatory_id > 0:
            self.igcCalc.signatory: Signatory = Signatory.objects.get(id=self.igcCalc.signatory_id)
        else:
            self.igcCalc.signatory = None

        self.igcCalc.reservoir_path = None
        self.igcCalc.error = None
        self.igcCalc.calculated_at = None
        self.igcCalc.max_fail_level = 0

        for path in self.igcCalc.paths:
            path.material = Material.objects.get(id=path.material_id)
            path.diameter = Diameter.objects.get(id=path.diameter_id)

            if path.start == 'CG':
                if self.igcCalc.reservoir_path:
                    raise MoreThenOneReservoir()
                self.igcCalc.reservoir_path = path

            path.power_rating_accumulated = 0
            path.power_rating_adopted = 0
            path.concurrency_factor = 0
            path.flow = 0
            path.speed = 0
            path.total_length = 0
            path.equivalent_length = path.extra_equivalent_length if path.extra_equivalent_length else 0
            path.start_pressure = 0
            path.end_pressure = 0
            path.pressure_drop = 0
            path.pressure_drop_color = None
            path.pressure_drop_accumulated = 0
            path.pressure_drop_accumulated_color = None
            path.fail = False
            path.fail_level = 0

            path.connection_names = [
                f'Comprimento extra: {format_decimal(path.equivalent_length)} m'
            ]

            # Get connections to connect to the previous path
            previous_path = self.get_path_before(path)

            if previous_path and previous_path.material_id != path.material_id:
                material_connections = (
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

            path.total_length = path.equivalent_length + path.length + path.length_up + path.length_down

        if not self.igcCalc.reservoir_path:
            raise NoReservoir()

    def __sum_paths_power_rating_accumulated(self, path: IGCCalcPath):
        paths_after: list[IGCCalcPath] = self.get_paths_after(path)
        path.power_rating_accumulated = path.power_rating_added
        for next_path in paths_after:
            path.power_rating_accumulated += self.__sum_paths_power_rating_accumulated(next_path)
        return path.power_rating_accumulated

    def __calculate_paths_power_rating_adopted(self):
        for path in self.igcCalc.paths:
            path.calculate_power_rating_adopted(self.igcCalc.calc_type)

    def __calculate_paths_flow(self):
        for path in self.igcCalc.paths:
            path.calculate_flow(self.igcCalc.gas)

    def __calculate_paths_pressure_drop(self):
        for path in self.igcCalc.paths:
            path.calculate_pressure_drop(self.igcCalc.gas, self.igcCalc.calc_type)

    def __calculate_paths_pressure(self, path: IGCCalcPath):
        if path == self.igcCalc.reservoir_path:
            path.calculate_end_pressure(float(self.igcCalc.start_pressure), self.igcCalc.calc_type)
        else:
            path.calculate_end_pressure(path.start_pressure, self.igcCalc.calc_type)
        paths_after: list[IGCCalcPath] = self.get_paths_after(path)
        for next_path in paths_after:
            next_path.start_pressure = path.end_pressure
            self.__calculate_paths_pressure(next_path)

    def __calculate_paths_speed(self):
        for path in self.igcCalc.paths:
            path.calculate_speed()

    def __calculate_paths_pressure_drop_accumulated(self):
        pressure_drop_limit = 0.3
        if (self.igcCalc.calc_type == Config.CalcType.SECONDARY):
            pressure_drop_limit = 0.1
        for path in self.igcCalc.paths:
            path.calculate_pressure_drop_accumulated(self.igcCalc.start_pressure, pressure_drop_limit)

    def __sum_paths_fail_level(self, path: IGCCalcPath):
        paths_after: list[IGCCalcPath] = self.get_paths_after(path)
        path.fail_level = 1 if path.fail else 0
        for next_path in paths_after:
            path.fail_level += self.__sum_paths_fail_level(next_path)
        if path.fail_level > self.igcCalc.max_fail_level:
            self.igcCalc.max_fail_level = path.fail_level
        return path.fail_level

    def __calculate_paths_pressure_drop_color(self):
        for path in self.igcCalc.paths:
            path.calculate_paths_pressure_drop_color(self.igcCalc.max_fail_level)

    def get_path_before(self, actual_path: IGCCalcPath) -> Union[IGCCalcPath, None]:
        for path in self.igcCalc.paths:
            if path.end == actual_path.start:
                return path
        return None

    def get_paths_after(self, actual_path: IGCCalcPath, exclude_path: IGCCalcPath = None) -> List[IGCCalcPath]:
        paths = []
        if actual_path and actual_path.end:
            for path in self.igcCalc.paths:
                if path.start == actual_path.end and path != exclude_path:
                    paths.append(path)
        return paths
