# Generated by Django 2.1.3 on 2020-08-06 18:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vmaker', '0002_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='verify_token',
            field=models.CharField(db_column='verify_token', default='', max_length=255),
        ),
    ]
