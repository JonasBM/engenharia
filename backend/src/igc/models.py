from django.db import models


class Config(models.Model):

    class CalcType(models.TextChoices):
        PRIMARY = 'PR', 'Primária'
        SECONDARY = 'SC', 'Secondária'

    material = models.ForeignKey('Material', default=None, null=True, blank=True,
                                 on_delete=models.SET_NULL, verbose_name='Material padrão')
    gas = models.ForeignKey('GAS', default=None, null=True, blank=True,
                            on_delete=models.SET_NULL, verbose_name='Gás padrão')

    class Meta:
        verbose_name = 'configuração'
        verbose_name_plural = 'configurações'

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

    name = models.CharField(max_length=255, unique=True, verbose_name='nome')
    one_outlet_connection = models.ForeignKey(
        'Fitting', default=None, null=True, blank=True, related_name='one_outlet_materials',
        on_delete=models.SET_NULL, verbose_name='conexão para uma saída')
    two_outlet_connection = models.ForeignKey(
        'Fitting', default=None, null=True, blank=True, related_name='two_outlet_materials',
        on_delete=models.SET_NULL, verbose_name='conexão para duas saídas')
    three_outlet_connection = models.ForeignKey(
        'Fitting', default=None, null=True, blank=True, related_name='three_outlet_materials',
        on_delete=models.SET_NULL, verbose_name='conexão para três saídas')
    default_diameter = models.ForeignKey(
        'Diameter', default=None, null=True, blank=True, related_name='default_diameter_materials',
        on_delete=models.SET_NULL, verbose_name='Diâmetro padrão')

    class Meta:
        verbose_name = 'material'
        verbose_name_plural = 'materias'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return (f'{self.id} - {self.name}')


class Diameter(models.Model):

    material = models.ForeignKey(Material, related_name='diameters', on_delete=models.CASCADE, verbose_name='material')
    name = models.CharField(max_length=255, verbose_name='nome')
    internal_diameter = models.DecimalField(max_digits=9, decimal_places=2, verbose_name='diâmetro interno')

    class Meta:
        verbose_name = 'diâmetro'
        verbose_name_plural = 'diâmetros'
        ordering = ['material', 'internal_diameter']
        indexes = [
            models.Index(fields=['material']),
        ]
        unique_together = [['material', 'name']]

    def __str__(self):
        return (f'{self.id} - {self.material.name} - {self.name}')


class Fitting(models.Model):

    name = models.CharField(max_length=255, unique=True, verbose_name='nome')

    class Meta:
        verbose_name = 'conexão'
        verbose_name_plural = 'conexões'
        ordering = ['name']

    def __str__(self):
        return (f'{self.id} - {self.name}')


class FittingDiameter(models.Model):

    fitting = models.ForeignKey(Fitting, related_name='equivalent_lengths',
                                on_delete=models.CASCADE, verbose_name='conexão')
    diameter = models.ForeignKey(Diameter, related_name='equivalent_lengths',
                                 on_delete=models.CASCADE, verbose_name='diâmetro')
    equivalent_length = models.DecimalField(max_digits=9, decimal_places=2, verbose_name='comprimento equivalente')

    class Meta:
        verbose_name = 'conexão-diâmetro'
        verbose_name_plural = 'conexões-diâmetros'
        ordering = ['fitting', 'diameter', 'equivalent_length']
        indexes = [
            models.Index(fields=['fitting']),
            models.Index(fields=['diameter']),
        ]
        unique_together = [['fitting', 'diameter']]

    def __str__(self):
        return (f'{self.id} -  {self.diameter.material.name} - {self.diameter.name} - {self.fitting.name}')


class Reduction(models.Model):

    inlet_diameter = models.ForeignKey(Diameter, related_name='inlet_reductions',
                                       on_delete=models.CASCADE, verbose_name='diâmetro de Entrada')
    outlet_diameter = models.ForeignKey(Diameter, related_name='outlet_reductions',
                                        on_delete=models.CASCADE, verbose_name='diâmetro de Saída')
    name = models.CharField(max_length=255, verbose_name='nome')
    equivalent_length = models.DecimalField(max_digits=9, decimal_places=2, verbose_name='comprimento equivalente')

    class Meta:
        verbose_name = 'redução'
        verbose_name_plural = 'reduções'
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
        Material, related_name='inlet_material_connections', on_delete=models.CASCADE,
        verbose_name='Material de Entrada')
    outlet_material = models.ForeignKey(
        Material, related_name='outlet_material_connections', on_delete=models.CASCADE,
        verbose_name='Material de Saída')
    inlet_diameter = models.ForeignKey(Diameter, related_name='inlet_diameter_connections',
                                       on_delete=models.CASCADE, verbose_name='diâmetro do material de Entrada')
    outlet_diameter = models.ForeignKey(Diameter, related_name='outlet_diameter_connections',
                                        on_delete=models.CASCADE, verbose_name='diâmetro do material de Saída')
    name = models.CharField(max_length=255, verbose_name='nome')
    equivalent_length = models.DecimalField(max_digits=9, decimal_places=2, verbose_name='Comprimento equivalente')

    class Meta:
        verbose_name = 'conexão entre materiais'
        verbose_name_plural = 'conexões entre materiais'
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


class GAS(models.Model):

    name = models.CharField(max_length=25, unique=True, verbose_name='nome')
    description = models.CharField(max_length=255, default=None, null=True, blank=True, verbose_name='descrição')
    pci = models.IntegerField(verbose_name='poder calorifico inferior (kcal/m³)')
    pck = models.IntegerField(verbose_name='poder calorifico (kcal/Kg)')
    relative_density = models.DecimalField(max_digits=5, decimal_places=2, verbose_name='densidade relativa')

    class Meta:
        verbose_name = 'gas'
        verbose_name_plural = 'gases'
        ordering = ['name']

    def __str__(self):
        return (f'{self.id} - {self.name}')


class Cilinder(models.Model):

    name = models.CharField(max_length=25, unique=True, verbose_name='nome')
    vaporization_rate = models.DecimalField(max_digits=5, decimal_places=2, verbose_name='Taxa de Vaporização')

    class Meta:
        verbose_name = 'cilindro'
        verbose_name_plural = 'cilindros'
        ordering = ['name', 'vaporization_rate']

    def __str__(self):
        return (f'{self.id} - {self.name}')


class Meter(models.Model):

    name = models.CharField(max_length=25, unique=True, verbose_name='nome')
    gas = models.ForeignKey(GAS, related_name='meters', on_delete=models.CASCADE, verbose_name='Gás')
    max_flow = models.DecimalField(max_digits=5, decimal_places=2, verbose_name='Vazão máxima (m³/h)')

    class Meta:
        verbose_name = 'medidor'
        verbose_name_plural = 'medidores'
        ordering = ['gas', 'name', 'max_flow']

    def __str__(self):
        return (f'{self.id} - ({self.gas.id}){self.name}')
