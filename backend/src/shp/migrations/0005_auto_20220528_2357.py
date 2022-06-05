# Generated by Django 3.2.13 on 2022-05-28 23:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shp', '0004_auto_20220527_2057'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='fittingdiameter',
            options={'ordering': ['fitting', 'diameter', 'equivalent_length']},
        ),
        migrations.AlterField(
            model_name='fittingdiameter',
            name='equivalent_length',
            field=models.DecimalField(decimal_places=2, max_digits=9, verbose_name='Comprimento equivalente'),
        ),
        migrations.AlterField(
            model_name='materialconnection',
            name='equivalent_length',
            field=models.DecimalField(decimal_places=2, max_digits=9, verbose_name='Comprimento equivalente'),
        ),
        migrations.AlterField(
            model_name='reduction',
            name='equivalent_length',
            field=models.DecimalField(decimal_places=2, max_digits=9, verbose_name='Comprimento equivalente'),
        ),
        migrations.AlterUniqueTogether(
            name='fittingdiameter',
            unique_together={('fitting', 'diameter')},
        ),
    ]
