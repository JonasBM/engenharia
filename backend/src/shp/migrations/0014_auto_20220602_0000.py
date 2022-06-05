# Generated by Django 3.2.13 on 2022-06-02 00:00

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('shp', '0013_alter_fixture_fittings'),
    ]

    operations = [
        migrations.AddField(
            model_name='materialconnection',
            name='inlet_diameter',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='inlet_material_connections', to='shp.diameter', verbose_name='diâmetro do material de Entrada'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='materialconnection',
            name='outlet_diameter',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='outlet_material_connections', to='shp.diameter', verbose_name='diâmetro do material de Saída'),
            preserve_default=False,
        ),
        migrations.AlterUniqueTogether(
            name='materialconnection',
            unique_together={('inlet_material', 'inlet_diameter', 'outlet_material', 'outlet_diameter')},
        ),
        migrations.AddIndex(
            model_name='materialconnection',
            index=models.Index(fields=['inlet_diameter'], name='shp_materia_inlet_d_7ac312_idx'),
        ),
        migrations.AddIndex(
            model_name='materialconnection',
            index=models.Index(fields=['outlet_diameter'], name='shp_materia_outlet__debd39_idx'),
        ),
    ]
