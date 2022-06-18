# Generated by Django 3.2.6 on 2022-06-17 15:47

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0008_auto_20220617_1807'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='point',
            name='point_source',
        ),
        migrations.AlterField(
            model_name='building',
            name='key',
            field=models.UUIDField(default=uuid.UUID('c672ca70-d009-4691-8476-a0d029c35c35')),
        ),
    ]
