from datetime import datetime
from xmlrpc.client import boolean
from sqlalchemy import null
from .models import *


def get_points():
    #get all points
    res_dict = {}
    res = list(Point.objects.values())
    for el in res:
        res_dict[el['id']] = el
    return res_dict


def get_unchecked():
    #get all unchecked points
    res_dict = {}
    res = list(Point.objects.filter(check_date__isnull=True).values())
    for el in res:
        res_dict[el['id']] = el
    return res_dict


def update_point(old_lat, old_long, lat, lng, desc, adrs, threat, checked):
    #update point status
    try:
        if type(threat) is boolean and threat:
            lvl = 3
        else:
            lvl = threat

        saved_point = Point.objects.filter(latitude=old_lat, longtitude=old_long)
        if checked and saved_point[0].check_date == None:
            saved_point.update(check_date=datetime.now(), latitude=lat, longtitude=lng, description=desc, address=adrs, level=lvl)
        else:
            saved_point.update(latitude=lat, longtitude=lng, description=desc, address=adrs, level=lvl)
        return True
    except:
        return False


def save_point(lat, lng, desc, adrs, threat, checked=False, user=None, bkey=''):
    #save point to database
    threat_level = 0
    if type(threat) is boolean and threat:
        threat_level = 3
    elif type(threat) is int:
        threat_level = threat
    
    if bkey == '':
        usr = User.objects.filter(username=user.username).first()
        if checked:
            res = Point.objects.create(latitude=lat, longtitude=lng, description=desc, address=adrs, level=threat_level, check_date=datetime.now(), from_user=usr)
        else:
            res = Point.objects.create(latitude=lat, longtitude=lng, description=desc, address=adrs, level=threat_level, from_user=usr)
        return res
    else:
        bld = Building.objects.filter(key=bkey).first()
        res = Point.objects.create(latitude=lat, longtitude=lng, description=desc, address=adrs, level=threat_level, building=bld, check_date=datetime.now())
        return res


def drop_point(lat, lng):
    try:
        saved_point = Point.objects.filter(latitude=lat, longtitude=lng)
        saved_point.delete()
        return True
    except:
        return False


def ban_user(lat, lng, reason):
    #add user to ban list
    point = Point.objects.filter(latitude=lat, longtitude=lng).first()

    if point.from_user is null:
        return 'This point was set by institution, not user!'

    if point.from_user.is_staff or point.from_user.is_superuser:
        return 'Cannot ban admins'

    if Banned.objects.filter(user=point.from_user).exists():
        return 'User aready in banlist'

    else:
        Banned.objects.create(user=point.from_user, reason=reason)
        return True


def check_ban(user):
    usr = User.objects.filter(username=user.username).first()
    ban = Banned.objects.filter(user=usr).first()
    if ban is None:
        return False
    else:
        return True


def check_key(building_key):
    institute = Building.objects.filter(key=building_key).first()
    if institute is None:
        return False
    else:
        return True


def check_spam(user):
    usr = User.objects.filter(username=user.username).first()
    number = Point.objects.filter(from_user=usr, check_date__isnull=True).count()
    if number <= 3:
        return False
    else:
        return True