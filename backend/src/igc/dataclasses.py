
import math
from dataclasses import dataclass
from datetime import datetime

from core.models import Signatory
from .exceptions import CouldNotFinishCalculate

from .utils import calculate_concurrency_factor, kcal_p_min_to_kcal_p_h, kpa_to_kgf_p_cm2, rgb2hex

from .models import Config, Diameter, Fitting, GAS, Material


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
    pressure_drop_color: str = None
    pressure_drop_accumulated: float = 0
    pressure_drop_accumulated_color: str = None
    fail: bool = False
    fail_level: int = 0

    def __str__(self):
        return f'{self.start} - {self.end or ""}'

    def calculate_power_rating_adopted(self, calc_type: str):
        assert (self.power_rating_accumulated is not None), (
            'You must call `.__sum_paths_power_rating_accumulated()` before calling `.calculate_power_rating_adopted()`.'
        )
        if (calc_type == Config.CalcType.SECONDARY):
            self.concurrency_factor = 1
            self.power_rating_adopted = self.power_rating_accumulated
        else:
            self.concurrency_factor = calculate_concurrency_factor(self.power_rating_accumulated)
            self.power_rating_adopted = self.power_rating_accumulated * self.concurrency_factor

    def calculate_flow(self, gas: GAS):
        assert (self.power_rating_adopted is not None), (
            'You must call `.__calculate_paths_power_rating_adopted()` before calling `.calculate_flow()`.'
        )
        _power_rating = kcal_p_min_to_kcal_p_h(self.power_rating_adopted)
        self.flow = _power_rating/gas.pci

    def calculate_pressure_drop(self, gas: GAS, calc_type: str):
        assert (self.flow is not None), (
            'You must call `.__calculate_paths_flow()` before calling `.calculate_pressure_drop()`.'
        )
        _relative_density = float(gas.relative_density)

        if (calc_type == Config.CalcType.SECONDARY):
            if ('GN' in gas.name):
                drop_total = (math.pow(self.flow, 1.8)*math.pow(_relative_density, 0.8)*self.total_length) / \
                    (0.00049284*math.pow(self.diameter.internal_diameter, 4.8))
            else:
                drop_total = (2273 * _relative_density * self.total_length * math.pow(self.flow, 1.82)) / \
                    math.pow(self.diameter.internal_diameter, 4.82)
        else:
            drop_total = (467000 * _relative_density * self.total_length * math.pow(self.flow, 1.82)) / \
                math.pow(self.diameter.internal_diameter, 4.82)
        drop_up = 0.01318 * self.length_up*(_relative_density-1)
        drop_down = 0.01318 * self.length_down*(_relative_density-1)
        self.pressure_drop = drop_total - drop_up + drop_down

    def calculate_end_pressure(self, start_pressure: float, calc_type: str):
        assert (self.pressure_drop is not None), (
            'You must call `.__calculate_paths_pressure_drop()` before calling `.calculate_end_pressure()`.'
        )
        self.start_pressure = start_pressure
        if (calc_type == Config.CalcType.SECONDARY):
            if self.start_pressure < self.pressure_drop:
                self.end_pressure = 0
            else:
                self.end_pressure = self.start_pressure - self.pressure_drop
        else:
            if math.pow(self.start_pressure, 2) < self.pressure_drop:
                self.end_pressure = 0
            else:
                self.end_pressure = math.pow(math.pow(self.start_pressure, 2) - self.pressure_drop, 0.5)

    def calculate_speed(self):
        assert (self.flow is not None and self.start_pressure is not None), (
            'You must call `.__calculate_paths_pressure()` before calling `.calculate_speed()`.'
        )
        self.speed = 354 * self.flow * math.pow(kpa_to_kgf_p_cm2(self.start_pressure) +
                                                1.033, -1) * math.pow(self.diameter.internal_diameter, -2)

    def calculate_pressure_drop_accumulated(self, calc_start_pressure, pressure_drop_limit: float):
        assert (self.end_pressure is not None), (
            'You must call `.__calculate_paths_pressure()` before calling `.calculate_pressure_drop_accumulated()`.'
        )

        self.pressure_drop_accumulated = (calc_start_pressure - self.end_pressure) / calc_start_pressure
        if self.pressure_drop_accumulated > pressure_drop_limit:
            self.fail = True
            self.pressure_drop_accumulated_color = rgb2hex(244, 67, 54)
        else:
            self.fail = False
            self.pressure_drop_accumulated_color = rgb2hex(76, 175, 80)

    def calculate_paths_pressure_drop_color(self, max_fail_level: int):
        assert (self.fail_level >= 0), (
            'You must call `.__sum_paths_fail_level()` before calling `.calculate_paths_pressure_drop_color()`.'
        )
        if self.fail_level > 0:
            green = int(200 * ((max_fail_level - self.fail_level) / max_fail_level))
            green = min(max(green, 0), 200)
            self.pressure_drop_color = rgb2hex(255, green, 0)
        else:
            self.pressure_drop_color = None


@dataclass(kw_only=True)
class IGCCalc:
    fileinfo: IGCCalcFileInfo
    name: str = None
    observation: str = None
    calc_type: str
    material_id: int
    diameter_id: int
    gas_id: int
    gas: GAS = None
    signatory_id: int
    signatory: Signatory = None
    start_pressure: float = 0
    paths: list[IGCCalcPath]
    reservoir_path: IGCCalcPath = None
    error: str = None
    calculated_at: datetime
    max_fail_level: int = 0

    def __post_init__(self):
        self.fileinfo = IGCCalcFileInfo(**self.fileinfo)
        newPaths = []
        for path in self.paths:
            newPaths.append(IGCCalcPath(**path))
        self.paths = newPaths
