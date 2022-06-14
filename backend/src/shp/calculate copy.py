from typing import Optional
from .models import Diameter, Fitting, FittingDiameter, Fixture, Material
from .serializers import SHPCalcSerializer
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class SHPCalcFileInfo:
    type: str
    version: str
    created: str
    updated: str


@dataclass
class SHPCalcFixture:
    active: bool
    end: str
    hose_length: float
    level_difference: float


@dataclass
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


@dataclass
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


class SHP():

    serializer: SHPCalcSerializer = None
    shpCalc: SHPCalc = None
    serializer_class = SHPCalcSerializer

    def __init__(self, data):
        if not data:
            logger.error('no data was passed')
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
        self.serializer = self.serializer_class(data=data)

    def validate(self, raise_exception=True):
        if self.serializer.is_valid(raise_exception=raise_exception):
            # print(self.serializer.data)
            self.shpCalc = SHPCalc(**self.serializer.data, material=None, diameter=None, fixture=None)
            return True
        return False

    def calculate(self) -> SHPCalcSerializer:
        if not self.shpCalc:
            logger.error('You should call ".validate" first')
            return None
        # print('calculate:', self.shpCalc)
        self.prepare_calc()
        return self.serializer

    def prepare_calc(self):
        self.shpCalc.material = Material.objects.get(id=self.shpCalc.material_id)
        self.shpCalc.diameter = Diameter.objects.get(id=self.shpCalc.diameter_id)
        self.shpCalc.fixture = Fixture.objects.get(id=self.shpCalc.fixture_id)
        for path in self.shpCalc.paths:
            path.material = Material.objects.get(id=self.shpCalc.material_id)
            path.diameter = Diameter.objects.get(id=self.shpCalc.diameter_id)
            path.equivalent_length = path.extra_equivalent_length if hasattr(path, 'extra_equivalent_length') else 0
            path.fitting_diameters = []

            if path.get('fittings_ids'):
                path.fittings = Fitting.objects.filter(id__in=path.fittings_ids)
                for fitting_id in path.fittings_ids:
                    fitting_diameter: FittingDiameter = FittingDiameter.objects.get(
                        diameter_id=path.diameter_id, fitting=fitting_id)
                    if (fitting_diameter and fitting_diameter.equivalent_length):
                        path.fitting_diameters.append(fitting_diameter)
                        path.equivalent_length += fitting_diameter.equivalent_length
            else:
                path.fittings = None
            print(path['length'])
            # path.total_length = path.equivalent_length + path.length
