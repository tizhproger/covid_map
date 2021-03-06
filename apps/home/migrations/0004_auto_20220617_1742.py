# Generated by Django 3.2.6 on 2022-06-17 14:42

from django.conf import settings
from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('home', '0003_alter_building_key'),
    ]

    operations = [
        migrations.AlterField(
            model_name='building',
            name='key',
            field=models.UUIDField(default=uuid.UUID('e822fd34-ac94-4753-b60f-1119071f5e85')),
        ),
        migrations.RemoveField(
            model_name='point',
            name='building',
        ),
        migrations.AddField(
            model_name='point',
            name='building',
            field=models.ManyToManyField(null=True, to='home.Building'),
        ),
        migrations.RemoveField(
            model_name='point',
            name='from_user',
        ),
        migrations.AddField(
            model_name='point',
            name='from_user',
            field=models.ManyToManyField(null=True, to=settings.AUTH_USER_MODEL),
        ),
    ]
