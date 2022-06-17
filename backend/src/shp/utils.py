import math
from typing import Union

from .dataclasses import SHPCalcPath


def sortByEndPressure(path_with_fixture: SHPCalcPath):
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
    print(flow, coefficient, diameter)
    return 0


def format_decimal(number: Union[int, float], decimals=2):
    if number:
        return "{:.2f}".format(number).replace('.', ',')
    return '0,00'
