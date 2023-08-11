from django import template
from igc.models import Config, Diameter, GAS, Material
from igc.utils import format_decimal
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
    # label = GAS.FixtureType(value).label
    label = None
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



