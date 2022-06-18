# -*- encoding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User
import uuid


class Building(models.Model):
    id = models.AutoField(primary_key=True)
    address = models.TextField(null=False)
    key = models.UUIDField(default=uuid.uuid4())


class Point(models.Model):
    id = models.AutoField(primary_key=True)
    latitude = models.FloatField(null=False)
    longtitude = models.FloatField(null=False)
    description = models.TextField(default="COVID19 point")
    date = models.DateTimeField(auto_now_add=True)
    check_date = models.DateTimeField(null=True)
    address = models.TextField(default='Some address')
    level = models.PositiveSmallIntegerField(default=1)
    from_user = models.ForeignKey(to=User, on_delete=models.DO_NOTHING, null=True)
    building = models.ForeignKey(to=Building, on_delete=models.DO_NOTHING, null=True)


class Banned(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(default="Spam")

