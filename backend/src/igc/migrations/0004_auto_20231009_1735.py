# Generated by Django 3.2.13 on 2023-10-09 17:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('igc', '0003_remove_gas_start_pressure'),
    ]

    operations = [
        migrations.CreateModel(
            name='Cilinder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=25, unique=True, verbose_name='nome')),
                ('vaporization_rate', models.DecimalField(decimal_places=2, max_digits=5, verbose_name='Taxa de Vaporização')),
            ],
            options={
                'verbose_name': 'cilindro',
                'verbose_name_plural': 'cilindros',
                'ordering': ['name', 'vaporization_rate'],
            },
        ),
        migrations.AlterModelOptions(
            name='gas',
            options={'ordering': ['name', 'pci'], 'verbose_name': 'gas', 'verbose_name_plural': 'gases'},
        ),
        migrations.CreateModel(
            name='Meter',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=25, unique=True, verbose_name='nome')),
                ('max_flow', models.DecimalField(decimal_places=2, max_digits=5, verbose_name='Vazão máxima (m³/h)')),
                ('gas', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='meters', to='igc.gas', verbose_name='Gás')),
            ],
            options={
                'verbose_name': 'medidor',
                'verbose_name_plural': 'medidores',
                'ordering': ['gas', 'name', 'max_flow'],
            },
        ),
    ]
