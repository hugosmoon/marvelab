from django.shortcuts import render,HttpResponse,redirect
from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import math
import random
import json
from django.db.models import Sum, Count
import os
import time
from django.db.models import Q

#from .qiniu import qiniu_file_manage
from qiniu import Auth, put_file, etag
import qiniu.config
import requests



# 首页
@csrf_exempt

def home(request):
    return render(request, 'index.html')

def view_design(request):
    return render(request, 'product/view_design.html')

def model_manage(request):
    return render(request, 'model/model_manage.html')

