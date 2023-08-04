
import math
from dataclasses import dataclass
from datetime import datetime

from igc.utils import calculate_concurrency_factor, kcal_p_min_to_kcal_p_h, kpa_to_kgf_p_cm2

from .models import Diameter, Fitting, GAS, Material


@dataclass(kw_only=True)
class IGCCalcFileInfo:
    type: str
    version: str
    created: str
    updated: str


@dataclass(kw_only=True)
class IGCCalcPath:
    start: str
    end: str = None
    material_id: int
    material: Material = None
    diameter_id: int
    diameter: Diameter = None
    power_rating_added: float = 0
    power_rating_accumulated: float = 0
    power_rating_adopted: float = 0
    concurrency_factor: float = 0
    length: float = 0
    length_up: float = 0
    length_down: float = 0
    fittings_ids: list[int] = None
    fittings: list[Fitting] = None
    connection_names: list[str] = None
    extra_equivalent_length: float = 0
    equivalent_length: float = 0
    flow: float = 0
    speed: float = 0
    total_length: float = 0
    start_pressure: float = 0
    end_pressure: float = 0
    pressure_drop: float = 0
    pressure_drop_accumulated: float = 0

    def __str__(self):
        return f'{self.start} - {self.end or ""}'

    def calculate_power_rating_adopted(self):
        assert (self.power_rating_accumulated is not None), (
            'You must call `.__sum_paths_power_rating_accumulated()` before calling `.calculate_power_rating_adopted()`.'
        )
        self.concurrency_factor = calculate_concurrency_factor(self.power_rating_accumulated)
        self.power_rating_adopted = self.power_rating_accumulated * self.concurrency_factor

    def calculate_flow(self, gas: GAS):
        assert (self.power_rating_adopted is not None), (
            'You must call `.__calculate_paths_power_rating_adopted()` before calling `.calculate_flow()`.'
        )
        _power_rating = kcal_p_min_to_kcal_p_h(self.power_rating_adopted)
        self.flow = _power_rating/gas.pci

    def calculate_pressure_drop(self, gas: GAS):
        assert (self.flow is not None), (
            'You must call `.__calculate_paths_flow()` before calling `.calculate_pressure_drop()`.'
        )
        _relative_density = float(gas.relative_density)
        drop_total = (467000 * _relative_density * self.total_length * math.pow(self.flow, 1.82)) / \
            math.pow(self.diameter.internal_diameter, 4.82)
        drop_up = 0.01318 * self.length_up*(_relative_density-1)
        drop_down = 0.01318 * self.length_down*(_relative_density-1)
        self.pressure_drop = drop_total - drop_up + drop_down

    def calculate_end_pressure(self, start_pressure: float):
        assert (self.pressure_drop is not None), (
            'You must call `.__calculate_paths_pressure_drop()` before calling `.calculate_end_pressure()`.'
        )
        self.start_pressure = start_pressure
        self.end_pressure = math.pow(math.pow(self.start_pressure, 2) - self.pressure_drop, 0.5)

    def calculate_speed(self):
        # must have pressure
        assert (self.flow is not None), (
            'You must call `.__calculate_paths_flow()` before calling `.calculate_speed()`.'
        )
        self.speed = 354 * self.flow * math.pow(kpa_to_kgf_p_cm2(self.start_pressure) +
                                                1.033, -1) * math.pow(self.diameter.internal_diameter, -2)


@dataclass(kw_only=True)
class IGCCalc:
    fileinfo: IGCCalcFileInfo
    name: str
    material_id: int
    diameter_id: int
    gas_id: int
    gas: GAS = None
    paths: list[IGCCalcPath]
    reservoir_path: IGCCalcPath = None
    error: str = None
    calculated_at: datetime

    def __post_init__(self):
        self.fileinfo = IGCCalcFileInfo(**self.fileinfo)
        newPaths = []
        for path in self.paths:
            newPaths.append(IGCCalcPath(**path))
        self.paths = newPaths
