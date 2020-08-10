# Generated by Django 2.1.3 on 2020-08-08 08:23

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('vmaker', '0009_auto_20200808_0258'),
    ]

    operations = [
        migrations.AlterField(
            model_name='child_view_model_conf',
            name='child_view_id',
            field=models.ForeignKey(db_column='child_view_id', on_delete=django.db.models.deletion.CASCADE, to='vmaker.child_view'),
        ),
        migrations.AlterField(
            model_name='child_view_model_conf',
            name='model_id',
            field=models.ForeignKey(db_column='model_id', on_delete=django.db.models.deletion.CASCADE, to='vmaker.com_model'),
        ),
    ]