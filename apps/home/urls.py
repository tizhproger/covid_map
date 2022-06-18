# -*- encoding: utf-8 -*-
from django.urls import path
from apps.home import views

urlpatterns = [
    path('points/', views.getPoints),
    path('unchecked/', views.getUnchecked),
    path('addpoint/', views.savePoint),
    path('updpoint/', views.updatePoint),
    path('droppoint/', views.deletePoint),
    path('institution/<str:key>', views.institutePoint),
    path('banuser/', views.banUser),

    # Initial page, guest mode
    path('', views.home, name='guest'),

    # Main page with map
    path('map.html', views.main, name='home'),

]
