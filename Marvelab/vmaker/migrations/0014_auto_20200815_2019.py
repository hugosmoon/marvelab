# Generated by Django 2.1.5 on 2020-08-15 12:19

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('vmaker', '0013_auto_20200815_0342'),
    ]

    operations = [
        migrations.AlterField(
            model_name='child_view_model_conf',
            name='child_view',
            field=models.ForeignKey(db_column='child_view', on_delete=django.db.models.deletion.CASCADE, to='vmaker.child_view'),
        ),
        migrations.AlterField(
            model_name='child_view_model_conf',
            name='com_model',
            field=models.ForeignKey(db_column='model', on_delete=django.db.models.deletion.CASCADE, to='vmaker.com_model'),
        ),
    ]