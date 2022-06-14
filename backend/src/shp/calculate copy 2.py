from dataclasses import dataclass
from typing import Optional

from .exceptions import NoFixtureError, NoInitialDataError
from .models import Diameter, Fitting, FittingDiameter, Fixture, Material
from .serializers import SHPCalcSerializer
import logging

logger = logging.getLogger(__name__)


@dataclass(kw_only=True)
class SHPCalcFileInfo:
    type: str
    version: str
    created: str
    updated: str


@dataclass(kw_only=True)
class SHPCalcFixture:
    active: bool
    end: str
    hose_length: float
    level_difference: float


@dataclass(kw_only=True)
class SHPCalcPath:
    start: str
    end: str
    fixture: SHPCalcFixture
    material_id: int
    material: Optional[Material]
    diameter_id: int
    diameter: Optional[Diameter]
    length: float
    level_difference: float
    fittings_ids: list[int]
    fittings: Optional[list[Fitting]]
    fitting_diameters: Optional[list[FittingDiameter]]
    extra_equivalent_length: float
    equivalent_length: float
    total_length: float
    has_fixture: bool


@dataclass(kw_only=True)
class SHPCalc:
    fileinfo: SHPCalcFileInfo
    name: str
    pressure_type: str  # PRESSURE_TYPES
    calc_type: str  # CALC_TYPES
    pump_node: str
    material_id: int
    material: Optional[Material]
    diameter_id: int
    diameter: Optional[Diameter]
    fixture_id: int
    fixture: Optional[Fixture]
    paths: list[SHPCalcPath]
    paths_with_fixture: Optional[list[SHPCalcPath]]


class SHP():

    serializer: SHPCalcSerializer = None
    shpCalc: SHPCalc = None
    serializer_class = SHPCalcSerializer
    fixture = Fixture
    highest_fixture_path: SHPCalcPath = None

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
        self.serializer = self.serializer_class(data=self.__pre_init__(data))
        self.serializer.is_valid(raise_exception=True)
        self.shpCalc = SHPCalc(**self.serializer.data)

    def calculate(self) -> SHPCalcSerializer:
        self.__prepare_calc__()
        self.__calculate_flow__()
        return None

    def __prepare_calc__(self):
        self.fixture = Fixture.objects.get(id=self.shpCalc.fixture_id)
        if not self.fixture:
            raise NoFixtureError()
        self.shpCalc.paths_with_fixture = []
        for path in self.data['paths']:
            path['material'] = Material.objects.get(id=path.get('material_id'))
            path['diameter'] = Diameter.objects.get(id=path.get('diameter_id'))
            path['equivalent_length'] = (
                path.get('extra_equivalent_length') if path.get('extra_equivalent_length') else 0
            )
            path['fitting_diameters'] = []
            path['fitting_list'] = []
            if path.get('fittings_ids'):
                path['fittings'] = Fitting.objects.filter(id__in=path.get('fittings_ids'))
                for fitting_id in path.get('fittings_ids'):
                    fitting_diameter: FittingDiameter = (
                        FittingDiameter.objects
                        .filter(diameter_id=path.get('diameter_id'), fitting=fitting_id)
                        .prefetch_related('fitting')
                        .first()
                    )
                    if (fitting_diameter and fitting_diameter.equivalent_length):
                        path['fitting_diameters'].append(fitting_diameter)
                        path['fitting_list'].append(fitting_diameter.fitting.name)
                        path['equivalent_length'] += float(fitting_diameter.equivalent_length)
            else:
                path['fittings'] = []
            path['total_length'] = path.get('equivalent_length') + path.get('length')
            if path.get('has_fixture') and path.get('fixture') and path.get('fixture', {}).get('active'):
                self.data['paths_with_fixture'].append(path)
        if not self.data.get('paths_with_fixture'):
            message = 'No active fixture found'
            logger.error(message)
            self.errors.append(message)

    def __calculate_flow__(self):

        for path_with_fixtures in self.data.get('paths_with_fixture'):
            path_with_fixtures['fixture']['minimum_flow'] = self.convert_flow(self.fixture.minimum_flow_rate)
            path_with_fixtures['fixture']['real_level'] = self.get_real_level(path_with_fixtures, True)
            if not self.highest_fixture_path:
                self.highest_fixture_path = path_with_fixtures
            elif self.highest_fixture_path.get('fixture').get('real_level') < path_with_fixtures.get(
                    'fixture').get('real_level'):
                self.highest_fixture_path = path_with_fixtures
        print(self.data.get('paths_with_fixture'))
        print(self.highest_fixture_path)

    def get_real_level(self, path, fixture=False):
        '''
        Calculates the global level from the res to the point
        '''
        level = 0
        if fixture:
            level += path.get('fixture').get('level_difference')
        level += path.get('level_difference')
        while path.get('start') != 'RES':
            path = self.get_path_before(path)
            if not path:
                message = 'Found path that dont lead to the Reservatory'
                logger.error(message)
                self.errors.append(message)
                break
            level += path.get('level_difference')
        return level

    def get_path_before(self, _path):
        for path in self.data['paths']:
            if path.get('end') == _path.get('start'):
                return path
        return None

    @staticmethod
    def convert_flow(flow: float, revert=False):
        '''
        Converts flow from l/min to m³/s
        '''
        return flow * 60000 if revert else flow/60000
