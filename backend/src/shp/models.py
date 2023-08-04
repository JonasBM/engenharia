import math
from typing import Union

from django.db import models

from .constants import GRAVITY


class Config(models.Model):

    class CalcType(models.TextChoices):
        VAZAO_MINIMA = 'VM', 'Vazão mínima'
        VAZAO_RESIDUAL = 'VR', 'Vazão Residual'

    class PressureType(models.TextChoices):
        GRAVITACIONAL = 'GR', 'Gravitacional'
        BOMBA = 'BO', 'Bomba'

    material = models.ForeignKey('Material', default=None, null=True, blank=True,
                                 on_delete=models.SET_NULL, verbose_name="Material padrão")
    fixture = models.ForeignKey('Fixture', default=None, null=True, blank=True,
                                on_delete=models.SET_NULL, verbose_name="Hidrante padrão")
    calc_type = models.CharField(max_length=2, default=CalcType.VAZAO_MINIMA,
                                 choices=CalcType.choices, verbose_name="tipo de cálculo")
    pressure_type = models.CharField(max_length=2, default=PressureType.GRAVITACIONAL,
                                     choices=PressureType.choices, verbose_name="tipo de pressurização")

    class Meta:
        verbose_name = "configuração"
        verbose_name_plural = "configurações"

    def save(self, *args, **kwargs):
        self.id = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(id=1)
        return obj


class Material(models.Model):

    name = models.CharField(max_length=255, unique=True, verbose_name="nome")
    hazen_williams_coefficient = models.IntegerField(verbose_name="coeficiente de hazen-williams")
    one_outlet_connection = models.ForeignKey(
        'Fitting', default=None, null=True, blank=True, related_name="one_outlet_materials",
        on_delete=models.SET_NULL, verbose_name="conexão para uma saída")
    two_outlet_connection = models.ForeignKey(
        'Fitting', default=None, null=True, blank=True, related_name="two_outlet_materials",
        on_delete=models.SET_NULL, verbose_name="conexão para duas saídas")
    three_outlet_connection = models.ForeignKey(
        'Fitting', default=None, null=True, blank=True, related_name="three_outlet_materials",
        on_delete=models.SET_NULL, verbose_name="conexão para três saídas")
    default_diameter = models.ForeignKey(
        'Diameter', default=None, null=True, blank=True, related_name="default_diameter_materials",
        on_delete=models.SET_NULL, verbose_name="Diâmetro padrão")

    class Meta:
        verbose_name = "material"
        verbose_name_plural = "materias"
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return (f'{self.id} - {self.name}')


class Diameter(models.Model):

    material = models.ForeignKey(Material, related_name="diameters", on_delete=models.CASCADE, verbose_name="material")
    name = models.CharField(max_length=255, verbose_name="nome")
    internal_diameter = models.IntegerField(verbose_name="diâmetro interno")

    class Meta:
        verbose_name = "diâmetro"
        verbose_name_plural = "diâmetros"
        ordering = ['material', 'internal_diameter']
        indexes = [
            models.Index(fields=['material']),
        ]
        unique_together = [['material', 'name']]

    def __str__(self):
        return (f'{self.id} - {self.material.name} - {self.name}')


class Fitting(models.Model):

    name = models.CharField(max_length=255, unique=True, verbose_name="nome")

    class Meta:
        verbose_name = "conexão"
        verbose_name_plural = "conexões"
        ordering = ['name']

    def __str__(self):
        return (f'{self.id} - {self.name}')


class FittingDiameter(models.Model):

    fitting = models.ForeignKey(Fitting, related_name="equivalent_lengths",
                                on_delete=models.CASCADE, verbose_name="conexão")
    diameter = models.ForeignKey(Diameter, related_name="equivalent_lengths",
                                 on_delete=models.CASCADE, verbose_name="diâmetro")
    equivalent_length = models.DecimalField(max_digits=9, decimal_places=2, verbose_name="comprimento equivalente")

    class Meta:
        verbose_name = "conexão-diâmetro"
        verbose_name_plural = "conexões-diâmetros"
        ordering = ['fitting', 'diameter', 'equivalent_length']
        indexes = [
            models.Index(fields=['fitting']),
            models.Index(fields=['diameter']),
        ]
        unique_together = [['fitting', 'diameter']]

    def __str__(self):
        return (f'{self.id} -  {self.diameter.material.name} - {self.diameter.name} - {self.fitting.name}')


class Reduction(models.Model):

    inlet_diameter = models.ForeignKey(Diameter, related_name="inlet_reductions",
                                       on_delete=models.CASCADE, verbose_name="diâmetro de Entrada")
    outlet_diameter = models.ForeignKey(Diameter, related_name="outlet_reductions",
                                        on_delete=models.CASCADE, verbose_name="diâmetro de Saída")
    name = models.CharField(max_length=255, verbose_name="nome")
    equivalent_length = models.DecimalField(max_digits=9, decimal_places=2, verbose_name="comprimento equivalente")

    class Meta:
        verbose_name = "redução"
        verbose_name_plural = "reduções"
        ordering = ['name', 'equivalent_length']
        indexes = [
            models.Index(fields=['inlet_diameter']),
            models.Index(fields=['outlet_diameter']),
        ]
        unique_together = [['inlet_diameter', 'outlet_diameter']]

    def __str__(self):
        return (
            f'{self.id} - {self.inlet_diameter.material.name} - '
            f'{self.inlet_diameter.name} -> {self.outlet_diameter.name} - {self.name}'
        )


class MaterialConnection(models.Model):

    inlet_material = models.ForeignKey(
        Material, related_name="inlet_material_connections", on_delete=models.CASCADE,
        verbose_name="Material de Entrada")
    outlet_material = models.ForeignKey(
        Material, related_name="outlet_material_connections", on_delete=models.CASCADE,
        verbose_name="Material de Saída")
    inlet_diameter = models.ForeignKey(Diameter, related_name="inlet_diameter_connections",
                                       on_delete=models.CASCADE, verbose_name="diâmetro do material de Entrada")
    outlet_diameter = models.ForeignKey(Diameter, related_name="outlet_diameter_connections",
                                        on_delete=models.CASCADE, verbose_name="diâmetro do material de Saída")
    name = models.CharField(max_length=255, verbose_name="nome")
    equivalent_length = models.DecimalField(max_digits=9, decimal_places=2, verbose_name="Comprimento equivalente")

    class Meta:
        verbose_name = "conexão entre materiais"
        verbose_name_plural = "conexões entre materiais"
        ordering = ['name', 'equivalent_length']
        indexes = [
            models.Index(fields=['inlet_material']),
            models.Index(fields=['inlet_diameter']),
            models.Index(fields=['outlet_material']),
            models.Index(fields=['outlet_diameter']),
        ]
        unique_together = [['inlet_material', 'inlet_diameter', 'outlet_material', 'outlet_diameter']]

    def __str__(self):
        return (
            f'{self.id} - {self.inlet_diameter.material.name} ({self.inlet_diameter.name}) -> '
            f'{self.outlet_diameter.material.name} ({self.outlet_diameter.name}) - {self.name}'
        )


class Fixture(models.Model):

    class FixtureType(models.TextChoices):
        TRONCO_CONICO = 'TC', 'tronco-cônico'
        REGULAVEL = 'RE', 'regulável'
        MANGOTINHO = 'MA', 'mangotinho'

    name = models.CharField(max_length=255, verbose_name="nome")
    nozzle_type = models.CharField(max_length=2, choices=FixtureType.choices, verbose_name="tipo do hidrante")
    material = models.ForeignKey(Material, default=None, null=True, blank=True,
                                 related_name="fixtures", on_delete=models.CASCADE, verbose_name="material")
    inlet_diameter = models.ForeignKey(Diameter, default=None, null=True, blank=True, related_name="fixtures",
                                       on_delete=models.CASCADE, verbose_name="diâmetro de Entrada")
    reductions_ids = models.JSONField(default=list, verbose_name="reduções")
    fittings_ids = models.JSONField(default=list, verbose_name="conexões")
    extra_equivalent_length = models.DecimalField(
        max_digits=9, decimal_places=2, default=0, null=True,
        blank=True, verbose_name="comprimento equivalente extra")
    hose_hazen_williams_coefficient = models.IntegerField(verbose_name="coeficiente de hazen-williams da mangueira")
    hose_internal_diameter = models.IntegerField(verbose_name="diâmetro interno da mangueira")
    k_factor = models.DecimalField(default=None, max_digits=9, decimal_places=2,
                                   verbose_name="coeficiente de vazão do esguicho")
    k_factor_includes_hose = models.BooleanField(default=False, verbose_name="coeficiente de vazão inclue a mangueira")
    k_nozzle = models.DecimalField(default=0, max_digits=9, decimal_places=2,
                                   verbose_name="coeficiente próprio do esguicho")
    outlet_diameter = models.DecimalField(max_digits=9, decimal_places=2, verbose_name="diâmetro da saída")
    minimum_flow_rate = models.DecimalField(max_digits=9, decimal_places=2, verbose_name="vazão mínima no esguicho")

    class Meta:
        verbose_name = "hidrante"
        verbose_name_plural = "hidrantes"
        ordering = ['name', 'inlet_diameter', 'outlet_diameter']

    def __str__(self):
        return (
            f'{self.id} - {self.name}'
        )

    @property
    def area(self) -> float:
        '''
        return area in m²
        '''
        return (math.pi * math.pow(float(self.outlet_diameter)/float(1000), 2)) / float(4)

    @property
    def minimum_flow_rate_in_m3_p_s(self) -> float:
        return float(self.minimum_flow_rate)/float(60000)

    def flow_to_pressure(self, flow: float) -> float:
        '''
        converts from flow in m³/s to pressure in m.c.a.
        '''
        if flow and flow > 0:
            if self.k_factor:
                corrected_factor = float(self.k_factor)/float(60000)
                return math.pow(flow/corrected_factor, 2)
            if self.outlet_diameter:
                speed = flow/self.area
                return math.pow(speed, 2) / (2 * GRAVITY * math.pow(0.97, 2))  # Cd = 0.97
        return None

    def pressure_to_flow(self, pressure: float) -> Union[float, None]:
        '''
        converts from pressure m.c.a. to flow in m³/s
        '''
        if pressure and pressure > 0:
            if self.k_factor:
                corrected_factor = float(self.k_factor)/float(60000)
                return corrected_factor * math.sqrt(pressure)
            speed = math.sqrt(2*GRAVITY*pressure)
            if self.outlet_diameter:
                return self.area * speed * 0.97  # Cd = 0.97
        return 0

    def get_fixture_pressure_drop(self, flow: float) -> float:
        '''
        converts from pressure m.c.a. to flow in m³/s
        '''
        if flow and flow > 0 and self.outlet_diameter:
            speed = flow/self.area
            return float(self.k_nozzle) * (math.pow(speed, 2) / (2 * GRAVITY))
        return 0
