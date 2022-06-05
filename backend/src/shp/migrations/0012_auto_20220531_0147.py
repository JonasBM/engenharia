# Generated by Django 3.2.13 on 2022-05-31 01:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shp', '0011_rename_fixtures_fixture'),
    ]

    operations = [
        migrations.AlterField(
            model_name='fixture',
            name='extra_equivalent_length',
            field=models.DecimalField(blank=True, decimal_places=2, default=0, max_digits=9, null=True, verbose_name='comprimento equivalente extra'),
        ),
        migrations.AlterField(
            model_name='fixture',
            name='k_factor',
            field=models.DecimalField(blank=True, decimal_places=2, default=0, max_digits=9, null=True, verbose_name='fator K do esguicho'),
        ),
    ]