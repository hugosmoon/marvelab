# Generated by Django 2.1.3 on 2020-08-06 17:38

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='model_base',
            fields=[
                ('id', models.AutoField(db_column='id', primary_key=True, serialize=False)),
                ('owner_id', models.IntegerField(db_column='owner_id', default=1)),
                ('base_name', models.CharField(db_column='base_name', max_length=255)),
                ('is_delete', models.BooleanField(db_column='is_delete', default=False)),
                ('base_type', models.IntegerField(db_column='type', default=1)),
                ('createtime', models.DateTimeField(db_column='f_createtime', default=django.utils.timezone.now)),
                ('updatetime', models.DateTimeField(db_column='f_updatetime', default=django.utils.timezone.now)),
            ],
        ),
    ]