# -*- encoding: utf-8 -*-
import json
from django import template
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.shortcuts import redirect
from django.template import loader
from django.views.decorators.csrf import csrf_exempt
from .db_actions import check_ban, get_points, get_unchecked, update_point, save_point, drop_point, ban_user, check_key, check_spam

mapbox_access_token = 'pk.eyJ1IjoidGl6aHByb2dlciIsImEiOiJjbDN2dXB3bmYxdjYyM2lsdHZwZjRhbmJwIn0.LrtqGvP5I0RhbKjyVpDbwA'


def home(request):
    context = {}
    if not request.user.is_authenticated:
        context['auth'] = False
        context['staff'] = False
        context['superuser'] = False
        context['page_name'] = 'Guest'
        context['mapbox_access_token'] = mapbox_access_token
        html_template = loader.get_template('home/map.html')
        return HttpResponse(html_template.render(context, request))
    else:
        return redirect('/map.html')


@login_required(login_url="/login/")
def main(request):
    context = {}
    context['auth'] = False
    context['staff'] = False
    context['superuser'] = False
    context['segment'] = 'map'
    context['mapbox_access_token'] = mapbox_access_token
    context['user_name'] = request.user.username
    context['page_name'] = 'Map'

    if request.user.is_staff or request.user.is_superuser:
        context['staff'] = True
        context['page_name'] = 'Map admin'

    elif request.user.is_authenticated:
        context['auth'] = True
    
    try:
        html_template = loader.get_template('home/map.html')
        return HttpResponse(html_template.render(context, request))
    except template.TemplateDoesNotExist:
        html_template = loader.get_template('home/page-404.html')
        return HttpResponse(html_template.render(context, request))

    except:
        html_template = loader.get_template('home/page-500.html')
        return HttpResponse(html_template.render(context, request))


def getPoints(request):
    if request.method == 'GET':
        return JsonResponse(get_points())
    else:
        response = JsonResponse({'error': 'Condition check not satisfied, permission error'})
        response.status_code = 403
        return response


def getUnchecked(request):
    if request.method == 'GET':
        return JsonResponse(get_unchecked())
    else:
        response = JsonResponse({'error': 'Condition check not satisfied, permission error'})
        response.status_code = 403
        return response


def savePoint(request):
    if request.method == 'POST' and (request.user.is_superuser or request.user.is_staff or request.user.is_authenticated):
        if check_ban(request.user):
            response = JsonResponse({'error': 'You can not add points, you are banned!'})
            response.status_code = 500
            return response
        
        if check_spam(request.user) and not (request.user.is_superuser or request.user.is_staff):
            response = JsonResponse({'error': 'You can not add more points, wait confirmation of others!'})
            response.status_code = 500
            return response

        data = json.loads(request.body)
        res = save_point(lat=data['latitude'], lng=data['longtitude'], desc=data['description'], adrs=data['address'], threat=data['threat'], checked=data['checked'], user=request.user)
        if res:
           return HttpResponse(200)
        response = JsonResponse({'error': 'Something wrong on server side, oooops...'})
        response.status_code = 500
        return response
    else:
        response = JsonResponse({'error': 'Condition check not satisfied, permission error'})
        response.status_code = 403
        return response

    
@csrf_exempt
def institutePoint(request, key):
    print(key)
    if request.method == 'POST' and check_key(key):
        data = json.loads(request.body)
        if save_point(lat=data['latitude'], lng=data['longtitude'], desc=data['description'], adrs=data['address'], threat=data['threat'], bkey=key):
           return HttpResponse(200)
        response = JsonResponse({'error': 'Something wrong on server side, oooops...'})
        response.status_code = 500
        return response
    else:
        response = JsonResponse({'error': 'Not authorized request...'})
        response.status_code = 403
        return response


def updatePoint(request):
    if request.method == 'POST' and (request.user.is_superuser or request.user.is_staff):
        data = json.loads(request.body)
        res = update_point(data['old_latitude'], data['old_longtitude'], data['latitude'], data['longtitude'], data['description'], data['address'], data['threat'], data['checked'])
        if res:
           return HttpResponse(200)
        response = JsonResponse({'error': 'Something wrong on server side, oooops...'})
        response.status_code = 500
        return response
    else:
        response = JsonResponse({'error': 'Condition check not satisfied, permission error'})
        response.status_code = 403
        return response


def deletePoint(request):
    if request.method == 'DELETE' and (request.user.is_superuser or request.user.is_staff):
        data = json.loads(request.body)
        if drop_point(data['latitude'], data['longtitude']):
           return HttpResponse(200)
        response = JsonResponse({'error': 'Something wrong on server side, oooops...'})
        response.status_code = 500
        return response
    else:
        response = JsonResponse({'error': 'Condition check not satisfied, permission error'})
        response.status_code = 403
        return response


def banUser(request):
    if request.method == 'DELETE' and (request.user.is_superuser or request.user.is_staff):
        data = json.loads(request.body)
        res = ban_user(data['latitude'], data['longtitude'], data['reason'])
        if res == True:
           return HttpResponse(200)
        else:
            response = JsonResponse({'error': res})
            response.status_code = 500
            return response
    else:
        response = JsonResponse({'error': 'Condition check not satisfied, permission error'})
        response.status_code = 403
        return response
