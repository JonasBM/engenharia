import math
from typing import Union

from .models import Diameter, Reduction


def sortByEndPressure(path_with_fixture):
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
    if (flow and coefficient and diameter):
        numerator = 10.641*math.pow(float(flow), 1.85)
        denominator = math.pow(float(coefficient), 1.85)*math.pow(float(diameter)/float(1000), 4.87)
        return numerator/denominator
    return 0


def format_decimal(number: Union[int, float], decimals=2):
    if number:
        return '{:.{decimals}f}'.format(number, decimals=decimals).replace('.', ',')
    return '0,00'


def get_reduction_path(inlet_diameter: Diameter, final_diameter_id: int, reduce: bool) -> list[list[Reduction]]:
    reduction_paths = []
    queryset = inlet_diameter.inlet_reductions
    if reduce:
        queryset = queryset.filter(outlet_diameter__internal_diameter__lt=inlet_diameter.internal_diameter)
    else:
        queryset = queryset.filter(outlet_diameter__internal_diameter__gt=inlet_diameter.internal_diameter)
    for reduction in queryset.all():
        if reduction.outlet_diameter_id == final_diameter_id:
            reduction_paths.append([reduction])
        else:
            reduction_paths = get_reduction_path(reduction.outlet_diameter, final_diameter_id, reduce)
            for reduction_path in reduction_paths:
                if len(reduction_path):
                    reduction_path.append(reduction)
    return reduction_paths


def get_best_reduction(inlet_diameter_id: int, outlet_diameter_id: int) -> list[Reduction]:
    reduction: Reduction = (
        Reduction.objects.filter(
            inlet_diameter=inlet_diameter_id,
            outlet_diameter=outlet_diameter_id
        )
        .first())
    if reduction:
        return [reduction]
    inlet_diameter: Diameter = Diameter.objects.get(id=inlet_diameter_id)
    outlet_diameter: Diameter = Diameter.objects.get(id=outlet_diameter_id)
    reduce = True
    if inlet_diameter.internal_diameter < outlet_diameter.internal_diameter:
        reduce = False
    reduction_paths = get_reduction_path(inlet_diameter, outlet_diameter_id, reduce)
    reductions = []
    for reduction_path in reduction_paths:
        if len(reductions) == 0 or len(reduction_path) < len(reductions):
            reductions = reduction_path
    reductions.reverse()
    return reductions


def kcal_p_min_to_kcal_p_h(power_rating: float):
    if power_rating:
        return power_rating * 60
    return None


def kpa_to_kgf_p_cm2(pressure):
    conversion_factor = 0.010197162
    return pressure * conversion_factor


def calculate_concurrency_factor(power_rating: float):
    _power_rating = kcal_p_min_to_kcal_p_h(power_rating)
    if _power_rating < 21000:
        return 1
    if _power_rating < 576720:
        return 1 / (1 + 0.001 * math.pow((_power_rating/60) - 349, 0.8712))
    if _power_rating < 1200000:
        return 1 / (1 + 0.4705 * math.pow((_power_rating/60) - 1055, 0.19931))
    return 0.23


def flow_to_l_p_min(flow: float) -> float:
    if isinstance(flow, float):
        return flow * 60000
    return None
