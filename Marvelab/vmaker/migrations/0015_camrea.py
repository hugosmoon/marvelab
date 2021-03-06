# Generated by Django 2.1.5 on 2020-08-18 15:48

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('vmaker', '0014_auto_20200815_2019'),
    ]

    operations = [
        migrations.CreateModel(
            name='camrea',
            fields=[
                ('id', models.AutoField(db_column='id', primary_key=True, serialize=False)),
                ('camrea_name', models.CharField(db_column='camrea_name', max_length=255)),
                ('position_x', models.FloatField(db_column='position_x', default=0)),
                ('position_y', models.FloatField(db_column='position_y', default=0)),
                ('position_z', models.FloatField(db_column='position_z', default=0)),
                ('up_x', models.IntegerField(db_column='up_x', default=0)),
                ('up_y', models.IntegerField(db_column='up_y', default=0)),
                ('up_z', models.IntegerField(db_column='up_z', default=1)),
                ('lookAt_x', models.FloatField(db_column='lookAt_x', default=0)),
                ('lookAt_y', models.FloatField(db_column='lookAt_y', default=0)),
                ('lookAt_z', models.FloatField(db_column='lookAt_z', default=0)),
                ('createtime', models.DateTimeField(db_column='createtime', default=django.utils.timezone.now)),
                ('updatetime', models.DateTimeField(db_column='updatetime', default=django.utils.timezone.now)),
                ('is_delete', models.BooleanField(db_column='is_delete', default=False)),
                ('parent_view', models.ForeignKey(db_column='parent_view', on_delete=django.db.models.deletion.CASCADE, to='vmaker.parent_view')),
            ],
        ),
    ]
