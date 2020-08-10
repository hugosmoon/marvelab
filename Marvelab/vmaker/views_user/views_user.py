#和用户有关的逻辑
from django.shortcuts import render,HttpResponse,redirect
from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt
# import math
import random
# import json
# from django.db.models import Sum, Count
# import os
import time
# from django.db.models import Q

# from ..qiniu import qiniu_file_manage
# from qiniu import Auth, put_file, etag
# import qiniu.config
# import requests

from vmaker.models import user,visit_log

# 创建用户
@csrf_exempt
def createuser(request):
    if request.method == 'POST':
       
        verify_token=request.POST.get('verify_token')
        if verifyuser(request,verify_token) == False:
            return HttpResponse('身份验证失败')
        username=request.POST.get('username')
        if username=="":
            return HttpResponse('用户名不能为空')
        password=request.POST.get('password')
        if password == "":
            return HttpResponse('密码不能为空')
        usertype=request.POST.get('usertype')
        if usertype != '1' and usertype != '0':
            return HttpResponse('请选择正确的用户类型')
        else:
            usertype=int(usertype)
        user_exist=user.objects.filter(is_delete=False,username=username)
        if len(user_exist) != 0:
            return HttpResponse('用户名与已有用户重复')
        user.objects.create(username=username,password=password,usertype=usertype)
        return HttpResponse('用户创建成功')
    return HttpResponse('用户创建失败')

# 当用户进行涉及安全的请求时，验证用户身份
def verifyuser(request,verify_token):
    if str(request.session.get('verify_session',default=None)) == str(verify_token):
        return True
    return False

# 登录页面
@csrf_exempt
def login_page(request):
    url="/vmaker/index/"
    if request.method == 'POST':
        url=request.POST.get('url')
    return render(request, 'user/login.html',{"url": url})
# 登录
@csrf_exempt
def do_login(request): 
    if request.method == 'POST':
        # print(request.POST)
        username=request.POST.get('username')
        password=request.POST.get('password')
        url=request.POST.get('url')
        if username != "" and password != "" and url != "":
            users=user.objects.filter(is_delete=False,username=username)
            if len(users)==0:
                return HttpResponse("账号不存在")
            else:
                # print(user[0].password)
                if password==users[0].password:
                    try:
                        del request.session['verify_session']
                    except:
                        pass
                    request.session['verify_session'] = hash(str(random.randint(10000,99999)))
                    rt = redirect(url) #跳转页面
                    rt.set_cookie('username', username)
                    rt.set_cookie('password', password)
                    rt.set_cookie('user_id', users[0].id)
                    rt.set_cookie('verify_token', request.session.get('verify_session',default=None))
                    return rt
                else:
                    return HttpResponse("密码错误")
    return HttpResponse("登录失败")

# 登录验证
@csrf_exempt
def login_verification(request):
    if request.method == 'POST':
        # print(request.POST)
        username=request.POST.get('username')
        password=request.POST.get('password')
        if username != "" and password != "":
            users=user.objects.filter(is_delete=False,username=username)
            if len(users)==0:
                return HttpResponse(False)
            if password==users[0].password:
                return HttpResponse(True)
        return HttpResponse(False)

# 管理员验证
@csrf_exempt
def admin_verification(request):
    if request.method == 'POST':
        print(request.POST)
        username=request.POST.get('username')
        if username != "" :
            users=user.objects.get(is_delete=False,username=username)   
            if users.usertype==0:
                return HttpResponse(True)
        return HttpResponse(False)

# 创建用户页面
def adduser(request):
    return render(request, 'user/adduser.html')

#创建访问日志
@csrf_exempt
def create_visit_log(request):
    if request.method == 'POST':
        page=int(request.POST.get('page'))
        ip=request.POST.get('ip')
        city=request.POST.get('city')
        user_id=int(request.POST.get('user_id'))
        visit_log.objects.create(user_id=user_id,page=page,ip=ip,city=city)
        return HttpResponse('success')



