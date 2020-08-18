# Generated by Django 2.1.3 on 2020-08-14 19:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vmaker', '0012_auto_20200810_1648'),
    ]

    operations = [
        migrations.RenameField(
            model_name='child_view_model_conf',
            old_name='child_view_id',
            new_name='child_view',
        ),
        migrations.RenameField(
            model_name='child_view_model_conf',
            old_name='model_id',
            new_name='com_model',
        ),
        migrations.RemoveField(
            model_name='child_view_model_conf',
            name='view_position_x',
        ),
        migrations.RemoveField(
            model_name='child_view_model_conf',
            name='view_position_y',
        ),
        migrations.RemoveField(
            model_name='child_view_model_conf',
            name='view_position_z',
        ),
        migrations.AddField(
            model_name='child_view',
            name='view_position_x',
            field=models.FloatField(db_column='view_position_x', default=0),
        ),
        migrations.AddField(
            model_name='child_view',
            name='view_position_y',
            field=models.FloatField(db_column='view_position_y', default=0),
        ),
        migrations.AddField(
            model_name='child_view',
            name='view_position_z',
            field=models.FloatField(db_column='view_position_z', default=0),
        ),
    ]
