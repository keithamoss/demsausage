# Generated by Django 2.2 on 2019-04-26 03:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0015_auto_20190426_0150'),
    ]

    operations = [
        migrations.AddField(
            model_name='pollingplaces',
            name='favourited',
            field=models.BooleanField(default=False),
        ),
    ]
