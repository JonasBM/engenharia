# Generated by Django 3.2.13 on 2023-08-01 20:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('igc', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='diameter',
            name='internal_diameter',
            field=models.DecimalField(decimal_places=2, max_digits=9, verbose_name='diâmetro interno'),
        ),
        migrations.AlterField(
            model_name='gas',
            name='description',
            field=models.CharField(blank=True, default=None, max_length=255, null=True, verbose_name='descrição'),
        ),
    ]
