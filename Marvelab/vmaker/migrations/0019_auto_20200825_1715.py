# Generated by Django 2.1.5 on 2020-08-25 17:15

from django.db import migrations, models
import vmaker.views_common


class Migration(migrations.Migration):

    dependencies = [
        ('vmaker', '0018_child_view_version'),
    ]

    operations = [
        migrations.AlterField(
            model_name='child_view',
            name='version',
            field=models.CharField(db_column='version', default=vmaker.views_common.generate_random_str, max_length=255),
        ),
        migrations.AlterField(
            model_name='parent_view',
            name='version',
            field=models.CharField(db_column='version', default=vmaker.views_common.generate_random_str, max_length=255),
        ),
    ]
