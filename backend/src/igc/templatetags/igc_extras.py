from django import template
from igc.models import Config, Diameter, GAS, Material
from igc.utils import format_decimal
from django.utils.safestring import mark_safe
register = template.Library()

def get_default_return():
    return mark_safe('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-----&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')

@register.filter
def format_calc_name(value):
    if value:
        return value
    else:
        return get_default_return()


@register.filter
def get_calc_type(value):
    label = Config.CalcType(value).label
    if label:
        return label
    else:
        return get_default_return()


@register.filter
def get_material_title(material_id):
    material: Material = Material.objects.filter(id=material_id).first()
    if material:
        return material.name
    else:
        return material_id


@register.filter
def get_diameter_name(diameter_id):
    diameter: Diameter = Diameter.objects.filter(id=diameter_id).first()
    if diameter:
        return diameter.name
    else:
        return diameter_id

@register.filter
def get_diameter_internal_diameter(diameter_id):
    diameter: Diameter = Diameter.objects.filter(id=diameter_id).first()
    if diameter:
        return diameter.internal_diameter
    else:
        return diameter_id


@register.filter
def get_diameter(diameter_id):
    diameter: Diameter = Diameter.objects.filter(id=diameter_id).first()
    return diameter


@register.filter
def subtract(value, arg):
    return value - arg



@register.filter
def multiply(value, arg):
    return value * arg