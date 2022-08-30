from django import template
from shp.models import Config, Diameter, Fixture, Material
from shp.utils import flow_to_l_p_min, format_decimal
from django.utils.safestring import mark_safe
register = template.Library()


@register.filter
def format_calc_name(value):
    if value:
        return value
    else:
        return mark_safe('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-----&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')


@register.filter
def get_calc_type(value):
    label = Config.CalcType(value).label
    if label:
        return label
    else:
        return mark_safe('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-----&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')


@register.filter
def get_perssure_type(value):
    label = Config.PressureType(value).label
    if label:
        return label
    else:
        return mark_safe('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-----&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')


@register.filter
def get_nozzle_type(value):
    label = Fixture.FixtureType(value).label
    if label:
        return label
    else:
        return mark_safe('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-----&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')


@register.filter
def get_material_title(material_id):
    material: Material = Material.objects.filter(id=material_id).first()
    if material:
        return f'{material.name} ({material.hazen_williams_coefficient})'
    else:
        return material_id


@register.filter
def get_diameter_title(diameter_id):
    diameter: Diameter = Diameter.objects.filter(id=diameter_id).first()
    if diameter:
        return f'{diameter.name} ({diameter.internal_diameter}mm)'
    else:
        return diameter_id


@register.filter
def format_reservoir_level(value):
    if isinstance(value, float):
        return f'{format_decimal(-value, 2)} m'
    else:
        return mark_safe('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-----&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')


@register.filter
def format_flow(value):
    if isinstance(value, float):
        return f'{format_decimal(value, 6)} m³/s ({format_decimal(flow_to_l_p_min(value))} l/min)'
    else:
        return mark_safe('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-----&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')


@register.filter
def is_pump(value):
    return value == Config.PressureType.BOMBA


@register.filter
def is_residual(value):
    return value == Config.CalcType.VAZAO_RESIDUAL
