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
# 获取私有链接
# @csrf_exempt
def get_private_model(url):
    access_key = 'VfUZy5Gm-aQkbLkpm_lcTraFLW9ac9h1wj-SHbbr'
    secret_key = 'hBwXWe0BBbkkntfGRUtSEmsA1M9uZqrESiWyIzzk'
    #构建鉴权对象
    q = Auth(access_key, secret_key)
    private_url = q.private_download_url(url, expires=360)
    return private_url

# objects.get()结果转换
def object_to_json(obj):
    return dict([(kk, obj.__dict__[kk]) for kk in obj.__dict__.keys() if kk != "_state"])