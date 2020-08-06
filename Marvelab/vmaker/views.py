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

from .views_model import views_model


# 首页
def home(request):
    return render(request, 'index.html')