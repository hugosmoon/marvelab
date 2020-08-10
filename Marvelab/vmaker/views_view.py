from django.shortcuts import render,HttpResponse,redirect
from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import math
import random
import json
from django.db.models import Sum, Count
# from vmm.models import Load_models_conf,folder,com_model,views,display_views,users,visit_log,view_program
import os
import time
from django.db.models import Q

from .qiniu import qiniu_file_manage
from qiniu import Auth, put_file, etag
import qiniu.config
import requests

from vmaker.models import model_base,com_model,child_view,parent_view,child_view_parent_view_ralation,child_view_model_conf,model_base_model_relation



#查询场景
@csrf_exempt
def get_parent_views(request):
    if request.method == 'POST':
        owner_id=int(request.POST.get('owner_id'))
        get_views=parent_view.objects.filter(is_delete=False,owner_id=owner_id).values()
        data={}
        data['views']=list(get_views)
        return JsonResponse(data)
@csrf_exempt
def get_child_views(request):
    if request.method == 'POST':
        parent_view_id=int(request.POST.get('parent_view_id'))
        get_views=child_view.objects.filter(is_delete=False,child_view_parent_view_ralation__parent_view_id=parent_view_id).values()
        data={}
        data['views']=list(get_views)
        return JsonResponse(data)

# 验证（子）场景名是否存在
@csrf_exempt
def is_view_exist(request):
    if request.method == 'POST':
        view_name=request.POST.get('view_name')
        owner_id=request.POST.get('owner_id')
        view_type=request.POST.get('view_type')
        parent_view_id=request.POST.get('parent_view_id')
        if int(view_type)==1:
            if len(parent_view.objects.filter(parent_view_name=view_name,owner_id=owner_id,is_delete=False)) == 0:
                return HttpResponse('false')
        else:
            if len(child_view.objects.filter(child_view_parent_view_ralation__parent_view_id=parent_view_id,child_view_name=view_name,is_delete=False)) == 0:
                return HttpResponse('false')
        
        return HttpResponse('true')

# 创建场景
@csrf_exempt
def add_parent_view(request):
    if request.method == 'POST':
        view_name=request.POST.get('view_name')
        owner_id=int(request.POST.get('owner_id'))
        if len(parent_view.objects.filter(parent_view_name=view_name,owner_id=owner_id,is_delete=False)) == 0:
            parent_view.objects.create(parent_view_name=view_name,owner_id=owner_id)
            return HttpResponse(view_name+'场景新建成功')
        else:
            return HttpResponse('您已经创建了名为'+view_name+'的场景了，换一个吧~~')
        return HttpResponse(view_name+'场景新建失败')
@csrf_exempt
def add_child_view(request):
    if request.method == 'POST':
        view_name=request.POST.get('view_name')
        parent_view_id=int(request.POST.get('parent_view_id'))
        if len(child_view.objects.filter(child_view_name=view_name,child_view_parent_view_ralation__parent_view_id=parent_view_id,is_delete=False)) == 0:
            c=child_view.objects.create(child_view_name=view_name)
            child_view_parent_view_ralation.objects.create(parent_view_id=parent_view.objects.get(pk=parent_view_id),child_view_id=c)
            return HttpResponse(view_name+'场景新建成功')
        else:
            return HttpResponse('您已经创建了名为'+view_name+'的场景了，换一个吧~~')
        return HttpResponse(view_name+'场景新建失败')
        



