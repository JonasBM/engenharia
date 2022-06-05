# Generated by Django 3.2.13 on 2022-05-30 22:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('shp', '0009_auto_20220530_1546'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='diameter',
            options={'ordering': ['material', 'internal_diameter'], 'verbose_name': 'diâmetro', 'verbose_name_plural': 'diâmetros'},
        ),
        migrations.AlterModelOptions(
            name='fitting',
            options={'ordering': ['material', 'name'], 'verbose_name': 'conexão', 'verbose_name_plural': 'conexões'},
        ),
        migrations.AlterModelOptions(
            name='fittingdiameter',
            options={'ordering': ['fitting', 'diameter', 'equivalent_length'], 'verbose_name': 'conexão-diâmetro', 'verbose_name_plural': 'conexões-diâmetros'},
        ),
        migrations.AlterModelOptions(
            name='material',
            options={'ordering': ['name'], 'verbose_name': 'material', 'verbose_name_plural': 'materias'},
        ),
        migrations.AlterModelOptions(
            name='materialconnection',
            options={'ordering': ['inlet_material', 'outlet_material', 'name', 'equivalent_length'], 'verbose_name': 'conexão entre materiais', 'verbose_name_plural': 'conexões entre materiais'},
        ),
        migrations.AlterModelOptions(
            name='reduction',
            options={'ordering': ['inlet_diameter', 'outlet_diameter', 'name', 'equivalent_length'], 'verbose_name': 'redução', 'verbose_name_plural': 'reduções'},
        ),
        migrations.AlterField(
            model_name='fittingdiameter',
            name='diameter',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='equivalent_lengths', to='shp.diameter', verbose_name='diâmetro'),
        ),
        migrations.AlterField(
            model_name='fittingdiameter',
            name='equivalent_length',
            field=models.DecimalField(decimal_places=2, max_digits=9, verbose_name='comprimento equivalente'),
        ),
        migrations.AlterField(
            model_name='fittingdiameter',
            name='fitting',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='equivalent_lengths', to='shp.fitting', verbose_name='conexão'),
        ),
        migrations.AlterField(
            model_name='material',
            name='one_outlet_connection',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='one_outlet_materials', to='shp.fitting', verbose_name='conexão para uma saída'),
        ),
        migrations.AlterField(
            model_name='material',
            name='three_outlet_connection',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='three_outlet_materials', to='shp.fitting', verbose_name='conexão para três saídas'),
        ),
        migrations.AlterField(
            model_name='material',
            name='two_outlet_connection',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='two_outlet_materials', to='shp.fitting', verbose_name='conexão para duas saídas'),
        ),
        migrations.AlterField(
            model_name='reduction',
            name='equivalent_length',
            field=models.DecimalField(decimal_places=2, max_digits=9, verbose_name='comprimento equivalente'),
        ),
        migrations.AlterField(
            model_name='reduction',
            name='inlet_diameter',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inlet_reductions', to='shp.diameter', verbose_name='diâmetro de Entrada'),
        ),
        migrations.AlterField(
            model_name='reduction',
            name='outlet_diameter',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='outlet_reductions', to='shp.diameter', verbose_name='diâmetro de Saída'),
        ),
        migrations.CreateModel(
            name='Fixtures',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='nome')),
                ('type', models.CharField(choices=[('TC', 'tronco-cônico'), ('RE', 'regulável'), ('MA', 'mangotinho')], max_length=2, verbose_name='tipo do hidrante')),
                ('extra_equivalent_length', models.DecimalField(decimal_places=2, max_digits=9, verbose_name='comprimento equivalente extra')),
                ('hose_hazen_williams_coefficient', models.IntegerField(verbose_name='coeficiente de hazen-williams da mangueira')),
                ('k_factor', models.DecimalField(decimal_places=2, max_digits=9, verbose_name='fator K do esguicho')),
                ('outlet_diameter', models.DecimalField(decimal_places=2, max_digits=9, verbose_name='diâmetro da saída')),
                ('minimum_flow_rate', models.DecimalField(decimal_places=2, max_digits=9, verbose_name='vazão mínima no esguicho')),
                ('fittings', models.ManyToManyField(related_name='fixtures', to='shp.Fitting', verbose_name='conexões')),
                ('inlet_diameter', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='fixtures', to='shp.diameter', verbose_name='diâmetro de Entrada')),
                ('material', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='fixtures', to='shp.material', verbose_name='material')),
            ],
            options={
                'verbose_name': 'hidrante',
                'verbose_name_plural': 'hidrantes',
                'ordering': ['name', 'inlet_diameter', 'outlet_diameter'],
            },
        ),
    ]