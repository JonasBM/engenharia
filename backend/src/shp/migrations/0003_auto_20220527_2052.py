# Generated by Django 3.2.13 on 2022-05-27 20:52

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('shp', '0002_auto_20220527_1602'),
    ]

    operations = [
        migrations.CreateModel(
            name='FittingDiameter',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('equivalent_length', models.IntegerField(verbose_name='Comprimento equivalente')),
            ],
            options={
                'ordering': ['diameter', 'fitting', 'equivalent_length'],
            },
        ),
        migrations.AlterModelOptions(
            name='fitting',
            options={'ordering': ['name']},
        ),
        migrations.RemoveIndex(
            model_name='fitting',
            name='shp_fitting_diamete_84eac6_idx',
        ),
        migrations.AlterUniqueTogether(
            name='fitting',
            unique_together=set(),
        ),
        migrations.AddField(
            model_name='fittingdiameter',
            name='diameter',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='equivalent_lengths', to='shp.diameter', verbose_name='Diâmetro'),
        ),
        migrations.AddField(
            model_name='fittingdiameter',
            name='fitting',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='equivalent_lengths', to='shp.fitting', verbose_name='Fitting'),
        ),
        migrations.RemoveField(
            model_name='fitting',
            name='diameter',
        ),
        migrations.RemoveField(
            model_name='fitting',
            name='equivalent_length',
        ),
        migrations.AddIndex(
            model_name='fittingdiameter',
            index=models.Index(fields=['diameter'], name='shp_fitting_diamete_c5fdb9_idx'),
        ),
        migrations.AddIndex(
            model_name='fittingdiameter',
            index=models.Index(fields=['fitting'], name='shp_fitting_fitting_25a77a_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='fittingdiameter',
            unique_together={('diameter', 'fitting')},
        ),
    ]