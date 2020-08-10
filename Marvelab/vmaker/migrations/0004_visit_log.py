# Generated by Django 2.1.3 on 2020-08-07 08:57

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('vmaker', '0003_user_verify_token'),
    ]

    operations = [
        migrations.CreateModel(
            name='visit_log',
            fields=[
                ('id', models.AutoField(db_column='id', primary_key=True, serialize=False)),
                ('user_id', models.IntegerField(db_column='user_id', default=0)),
                ('page', models.IntegerField(db_column='page')),
                ('ip', models.CharField(db_column='ip', max_length=255)),
                ('city', models.CharField(db_column='city', default='', max_length=255)),
                ('createtime', models.DateTimeField(db_column='createtime', default=django.utils.timezone.now)),
            ],
        ),
    ]