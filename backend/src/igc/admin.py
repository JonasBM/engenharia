from django.contrib import admin

from .models import (Cilinder, FittingDiameter, Material, Diameter, Fitting, Meter, Reduction, MaterialConnection, GAS)


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    model = Material
    list_display = ['id', 'name' ]
    search_fields = ['id', 'name']


@admin.register(Diameter)
class DiameterAdmin(admin.ModelAdmin):
    model = Diameter
    list_display = ['id', 'material', 'name', 'internal_diameter']
    search_fields = ['id', 'material__name', 'name']


@admin.register(Fitting)
class FittingAdmin(admin.ModelAdmin):
    model = Fitting
    list_display = ['id', 'name']
    search_fields = ['id', 'name']


@admin.register(FittingDiameter)
class FittingDiameterAdmin(admin.ModelAdmin):
    model = FittingDiameter
    list_display = ['id', 'fitting', 'diameter', 'equivalent_length']
    search_fields = ['id', 'fitting__name', 'diameter__name']


@admin.register(Reduction)
class ReductionAdmin(admin.ModelAdmin):
    model = Reduction
    list_display = ['id', 'inlet_diameter', 'outlet_diameter', 'name', 'equivalent_length']
    search_fields = ['id', 'inlet_diameter__name', 'outlet_diameter__name', 'name']


@admin.register(MaterialConnection)
class MaterialConnectionAdmin(admin.ModelAdmin):
    model = MaterialConnection
    list_display = ['id', 'inlet_material', 'outlet_material', 'name', 'equivalent_length']
    search_fields = ['id', 'inlet_material__name', 'outlet_material__name', 'name']


@admin.register(GAS)
class GASAdmin(admin.ModelAdmin):
    model = GAS
    list_display = ['id', 'name', 'pci', 'pck', 'relative_density']
    search_fields = ['id', 'name']

@admin.register(Cilinder)
class CilinderAdmin(admin.ModelAdmin):
    model = Cilinder
    list_display = ['id', 'name', 'vaporization_rate']
    search_fields = ['id', 'name']


@admin.register(Meter)
class MeterAdmin(admin.ModelAdmin):
    model = Meter
    list_display = ['id', 'name', 'gas', 'max_flow']
    search_fields = ['id', 'name']
