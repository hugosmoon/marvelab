# Generated by Django 2.1.3 on 2020-08-10 08:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vmaker', '0011_auto_20200810_1642'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='child_view',
            name='view_position_x',
        ),
        migrations.RemoveField(
            model_name='child_view',
            name='view_position_y',
        ),
        migrations.RemoveField(
            model_name='child_view',
            name='view_position_z',
        ),
        migrations.AddField(
            model_name='child_view_model_conf',
            name='view_position_x',
            field=models.FloatField(db_column='view_position_x', default=0),
        ),
        migrations.AddField(
            model_name='child_view_model_conf',
            name='view_position_y',
            field=models.FloatField(db_column='view_position_y', default=0),
        ),
        migrations.AddField(
            model_name='child_view_model_conf',
            name='view_position_z',
            field=models.FloatField(db_column='view_position_z', default=0),
        ),
    ]
