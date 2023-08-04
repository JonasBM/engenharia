# Generated by Django 3.2.13 on 2023-08-01 17:17

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Diameter',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='nome')),
                ('internal_diameter', models.IntegerField(verbose_name='diâmetro interno')),
            ],
            options={
                'verbose_name': 'diâmetro',
                'verbose_name_plural': 'diâmetros',
                'ordering': ['material', 'internal_diameter'],
            },
        ),
        migrations.CreateModel(
            name='Fitting',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True, verbose_name='nome')),
            ],
            options={
                'verbose_name': 'conexão',
                'verbose_name_plural': 'conexões',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='GAS',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=25, unique=True, verbose_name='nome')),
                ('description', models.CharField(max_length=255, verbose_name='descrição')),
                ('pci', models.IntegerField(verbose_name='poder calorifico inferior')),
                ('relative_density', models.DecimalField(decimal_places=2, max_digits=5, verbose_name='densidade relativa')),
                ('start_pressure', models.DecimalField(decimal_places=2, max_digits=9, verbose_name='pressão inicial')),
            ],
            options={
                'verbose_name': 'gas',
                'verbose_name_plural': 'gases',
            },
        ),
        migrations.CreateModel(
            name='Material',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True, verbose_name='nome')),
                ('default_diameter', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='default_diameter_materials', to='igc.diameter', verbose_name='Diâmetro padrão')),
                ('one_outlet_connection', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='one_outlet_materials', to='igc.fitting', verbose_name='conexão para uma saída')),
                ('three_outlet_connection', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='three_outlet_materials', to='igc.fitting', verbose_name='conexão para três saídas')),
                ('two_outlet_connection', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='two_outlet_materials', to='igc.fitting', verbose_name='conexão para duas saídas')),
            ],
            options={
                'verbose_name': 'material',
                'verbose_name_plural': 'materias',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Reduction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='nome')),
                ('equivalent_length', models.DecimalField(decimal_places=2, max_digits=9, verbose_name='comprimento equivalente')),
                ('inlet_diameter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inlet_reductions', to='igc.diameter', verbose_name='diâmetro de Entrada')),
                ('outlet_diameter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='outlet_reductions', to='igc.diameter', verbose_name='diâmetro de Saída')),
            ],
            options={
                'verbose_name': 'redução',
                'verbose_name_plural': 'reduções',
                'ordering': ['name', 'equivalent_length'],
            },
        ),
        migrations.CreateModel(
            name='MaterialConnection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='nome')),
                ('equivalent_length', models.DecimalField(decimal_places=2, max_digits=9, verbose_name='Comprimento equivalente')),
                ('inlet_diameter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inlet_diameter_connections', to='igc.diameter', verbose_name='diâmetro do material de Entrada')),
                ('inlet_material', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inlet_material_connections', to='igc.material', verbose_name='Material de Entrada')),
                ('outlet_diameter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='outlet_diameter_connections', to='igc.diameter', verbose_name='diâmetro do material de Saída')),
                ('outlet_material', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='outlet_material_connections', to='igc.material', verbose_name='Material de Saída')),
            ],
            options={
                'verbose_name': 'conexão entre materiais',
                'verbose_name_plural': 'conexões entre materiais',
                'ordering': ['name', 'equivalent_length'],
            },
        ),
        migrations.CreateModel(
            name='FittingDiameter',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('equivalent_length', models.DecimalField(decimal_places=2, max_digits=9, verbose_name='comprimento equivalente')),
                ('diameter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='equivalent_lengths', to='igc.diameter', verbose_name='diâmetro')),
                ('fitting', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='equivalent_lengths', to='igc.fitting', verbose_name='conexão')),
            ],
            options={
                'verbose_name': 'conexão-diâmetro',
                'verbose_name_plural': 'conexões-diâmetros',
                'ordering': ['fitting', 'diameter', 'equivalent_length'],
            },
        ),
        migrations.AddField(
            model_name='diameter',
            name='material',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='diameters', to='igc.material', verbose_name='material'),
        ),
        migrations.CreateModel(
            name='Config',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('gas', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, to='igc.gas', verbose_name='Gás padrão')),
                ('material', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, to='igc.material', verbose_name='Material padrão')),
            ],
            options={
                'verbose_name': 'configuração',
                'verbose_name_plural': 'configurações',
            },
        ),
        migrations.AddIndex(
            model_name='reduction',
            index=models.Index(fields=['inlet_diameter'], name='igc_reducti_inlet_d_6e5ea2_idx'),
        ),
        migrations.AddIndex(
            model_name='reduction',
            index=models.Index(fields=['outlet_diameter'], name='igc_reducti_outlet__f1d90a_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='reduction',
            unique_together={('inlet_diameter', 'outlet_diameter')},
        ),
        migrations.AddIndex(
            model_name='materialconnection',
            index=models.Index(fields=['inlet_material'], name='igc_materia_inlet_m_422a5c_idx'),
        ),
        migrations.AddIndex(
            model_name='materialconnection',
            index=models.Index(fields=['inlet_diameter'], name='igc_materia_inlet_d_f9764f_idx'),
        ),
        migrations.AddIndex(
            model_name='materialconnection',
            index=models.Index(fields=['outlet_material'], name='igc_materia_outlet__413ecc_idx'),
        ),
        migrations.AddIndex(
            model_name='materialconnection',
            index=models.Index(fields=['outlet_diameter'], name='igc_materia_outlet__065e34_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='materialconnection',
            unique_together={('inlet_material', 'inlet_diameter', 'outlet_material', 'outlet_diameter')},
        ),
        migrations.AddIndex(
            model_name='material',
            index=models.Index(fields=['name'], name='igc_materia_name_fb3bbf_idx'),
        ),
        migrations.AddIndex(
            model_name='fittingdiameter',
            index=models.Index(fields=['fitting'], name='igc_fitting_fitting_86645b_idx'),
        ),
        migrations.AddIndex(
            model_name='fittingdiameter',
            index=models.Index(fields=['diameter'], name='igc_fitting_diamete_23285a_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='fittingdiameter',
            unique_together={('fitting', 'diameter')},
        ),
        migrations.AddIndex(
            model_name='diameter',
            index=models.Index(fields=['material'], name='igc_diamete_materia_d42d2c_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='diameter',
            unique_together={('material', 'name')},
        ),
    ]