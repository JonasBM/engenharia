
import math
from dataclasses import dataclass
from datetime import datetime

from shp.utils import get_unit_pressure_drop

from .models import Diameter, Fitting, Fixture, Material


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

    def calculate_start_pressure(self, end_pressure: float):
        assert (self.nozzle_pressure_drop is not None
                and self.hose_pressure_drop is not None
                and self.level_difference is not None
                and self.pressure_drop is not None), (
                    'You must call `.calculate_pressure_drop()` before calling `.calculate_start_pressure()`.'
        )
        self.end_pressure = end_pressure
        self.middle_pressure = (
            self.end_pressure +
            self.hose_pressure_drop +
            self.nozzle_pressure_drop +
            self.level_difference
        )
        self.start_pressure = self.middle_pressure + self.pressure_drop

    def calculate_end_pressure(self, start_pressure: float):
        assert (self.nozzle_pressure_drop is not None
                and self.hose_pressure_drop is not None
                and self.level_difference is not None
                and self.pressure_drop is not None), (
                    'You must call `.calculate_pressure_drop()` before calling `.calculate_start_pressure()`.'
        )
        self.start_pressure = start_pressure
        self.middle_pressure = self.start_pressure - self.pressure_drop
        self.end_pressure = (
            self.middle_pressure -
            self.hose_pressure_drop -
            self.nozzle_pressure_drop -
            self.level_difference
        )

    def calculate_pressure_drop(self, flow: float, fixture: Fixture):
        self.flow = flow
        if (fixture.k_factor_includes_hose):
            self.unit_hose_pressure_drop = 0
        else:
            self.unit_hose_pressure_drop = get_unit_pressure_drop(self.flow,
                                                                  fixture.hose_hazen_williams_coefficient,
                                                                  fixture.hose_internal_diameter)
        self.hose_pressure_drop = self.unit_hose_pressure_drop * self.hose_length
        if self.inlet_material and self.inlet_diameter:
            self.unit_pressure_drop = get_unit_pressure_drop(self.flow,
                                                             self.inlet_material.hazen_williams_coefficient,
                                                             self.inlet_diameter.internal_diameter,)
            self.nozzle_pressure_drop = fixture.get_fixture_pressure_drop(self.flow)
            self.pressure_drop = self.unit_pressure_drop * self.total_length


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
    head_lift: float = 0
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

    def __str__(self):
        if self.has_fixture:
            return f'{self.start} - {self.fixture.end}'
        return f'{self.start} - {self.end or ""}'

    def __post_init__(self):
        self.has_active_fixture = False
        if self.has_fixture and self.fixture:
            self.fixture = SHPCalcFixture(**self.fixture)
            if self.fixture.active:
                self.has_active_fixture = True

    def get_speed(self) -> float:
        if self.flow and self.diameter and self.diameter.internal_diameter:
            area = (math.pi * math.pow(float(self.diameter.internal_diameter)/float(1000), 2)) / float(4)
            speed = self.flow/area
            return speed
        return 0

    def calculate_start_pressure(self, end_pressure: float):
        assert (self.pressure_drop is not None and self.level_difference is not None), (
            'You must call `.calculate_pressure_drop()` before calling `.calculate_start_pressure()`.'
        )
        self.end_pressure = end_pressure
        self.start_pressure = self.end_pressure + self.pressure_drop + self.level_difference - self.head_lift

    def calculate_end_pressure(self, start_pressure: float):
        assert (self.pressure_drop is not None and self.level_difference is not None), (
            'You must call `.calculate_pressure_drop()` before calling `.calculate_start_pressure()`.'
        )
        self.start_pressure = start_pressure
        self.end_pressure = self.start_pressure - self.pressure_drop - self.level_difference + self.head_lift

    def calculate_pressure_drop(self, flow: float):
        self.flow = flow
        self.unit_pressure_drop = get_unit_pressure_drop(
            self.flow,
            self.material.hazen_williams_coefficient,
            self.diameter.internal_diameter,
        )
        self.pressure_drop = self.unit_pressure_drop * self.total_length


@dataclass(kw_only=True)
class SHPCalcPump:
    node: str
    head_lift: float
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
