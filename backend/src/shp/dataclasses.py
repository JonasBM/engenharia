
import math
from dataclasses import dataclass
from datetime import datetime

from .models import Diameter, Fitting, Material


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
class SHPCalcPump:
    node: str
    head_height: float
    flow: float
    NPSHd: float


@dataclass(kw_only=True)
class SHPCalc:
    fileinfo: SHPCalcFileInfo
    name: str
    pressure_type: str
    calc_type: str
    material_id: int
    diameter_id: int
    fixture_id: int
    paths: list[SHPCalcPath]
    paths_with_fixture: list[SHPCalcPath] = None
    less_favorable_path_fixture_index: int = None
    reservoir_path: SHPCalcPath = None
    pump_path: SHPCalcPath = None
    pump: SHPCalcPump = None
    error: str = None
    calculated_at: datetime

    def __post_init__(self):
        self.fileinfo = SHPCalcFileInfo(**self.fileinfo)
        self.pump = SHPCalcPump(**self.pump)
        newPaths = []
        for path in self.paths:
            newPaths.append(SHPCalcPath(**path))
        self.paths = newPaths
