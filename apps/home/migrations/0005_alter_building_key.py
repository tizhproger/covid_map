# Generated by Django 3.2.6 on 2022-06-17 14:42

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0004_auto_20220617_1742'),
    ]

    operations = [
        migrations.AlterField(
            model_name='building',
            name='key',
            field=models.UUIDField(default=uuid.UUID('911b6ecb-8405-4a76-9cde-35ff83f8b6ca')),
        ),
    ]
