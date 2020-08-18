#和模型有关的逻辑
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

from ..qiniu import qiniu_file_manage
from qiniu import Auth, put_file, etag
import qiniu.config
import requests

from vmaker.models import model_base,com_model,child_view,parent_view,child_view_parent_view_ralation,child_view_model_conf,model_base_model_relation
from .. import views_common



#创建模型库
@csrf_exempt
def create_model_base(request):
    if request.method == 'POST':
        base_name=request.POST.get('base_name')
        owner_id=request.POST.get('owner_id')
        model_bases_existence=model_base.objects.filter(is_delete=False,base_name=base_name,owner_id=owner_id).values()
        if len(model_bases_existence)!=0:
            return HttpResponse('新建失败，与已有模型库重名')
        model_base.objects.create(base_name=base_name,owner_id=owner_id)
        return HttpResponse('文件夹新建成功')

#查询模型库
@csrf_exempt
def get_model_base(request):
    if request.method == 'POST':
        owner_id=request.POST.get('owner_id')
        model_base_own=model_base.objects.filter(owner_id=owner_id,is_delete=False).values()
        model_base_open=model_base.objects.filter(base_type=0,is_delete=False).values()
        data={}
        data['model_base_own']=list(model_base_own)
        data['model_base_open']=list(model_base_open)

        return JsonResponse(data)

#查询对应模型库中的模型
@csrf_exempt
def get_model_by_base_id(request):
    if request.method == 'POST':
        model_base_id=int(request.POST.get('model_base_id'))
        moldels=com_model.objects.filter(model_base_model_relation__model_base_id=model_base_id,is_delete=False).values()
        # relations=model_base_model_relation.objects.filter(model_base_id=model_base_id,is_delete=False).values()
        data={}
        data['models']=list(moldels)

        # model_ids=[]
        # for r in relations:
        #    model_ids.append(r[model_id])
        
        return JsonResponse(data)


#上传模型-本地
@csrf_exempt
def upload_model(request):
    if request.method == 'POST':
        file = request.FILES.get('file')
        model_base_id=int(request.POST.get('model_base_id'))
        model_name = request.POST.get('model_name')
        # 验证模型库是否存在
        model_base_list=model_base.objects.filter(is_delete=False,id=model_base_id).values()
        if len(model_base_list) == 0:
            return HttpResponse(model_name+'上传失败,因为模型库不存在')

        # 验证该模型库中有重名的模型
        model_exist=com_model.objects.filter(model_name=model_name).values()
        if len(model_exist) != 0:
            return HttpResponse('模型上传失败，因为'+model_name+'在该模型库中已经存在')
        # 验证文件是否是STL
        file_type = file.name.split('.')[1]
        if file_type != 'STL' and file_type != 'stl':
            return HttpResponse(model_name+'上传失败,因为文件格式不是STL')
        # 文件暂存到服务器
        file_path = os.path.join(os.path.abspath(os.path.dirname(os.path.dirname(__file__))),'static','models','test.STL')
        f = open(file_path, 'wb')
        for chunk in file.chunks():
            f.write(chunk)
        f.close()
        # 文件上传至七牛
        access_key = 'VfUZy5Gm-aQkbLkpm_lcTraFLW9ac9h1wj-SHbbr'
        secret_key = 'hBwXWe0BBbkkntfGRUtSEmsA1M9uZqrESiWyIzzk'
        #构建鉴权对象
        q = Auth(access_key, secret_key)
        #要上传的空间
        bucket_name = 'hugosmodel'
        #上传后保存的文件名
        key = model_name.split('.')[0]+"("+str(round(time.time()*1000000)) + str(random.randint(0,10000)) + ').STL'
        #生成上传 Token，可以指定过期时间等
        token = q.upload_token(bucket_name, key, 3600)
        #要上传文件的本地路径
        localfile = file_path
        ret, info = put_file(token, key, localfile)
        assert ret['key'] == key
        assert ret['hash'] == etag(localfile)
        m=com_model.objects.create(model_name=model_name,url='http://hugosmodel.diandijiaoyu.com.cn/'+key)
        # model_id=com_model.objects.get(url='http://hugosmodel.diandijiaoyu.com.cn/'+key,is_delete=False)
        model_base_model_relation.objects.create(model_id=m,model_base_id=model_base.objects.get(pk=model_base_id))
        return HttpResponse(model_name+'上传成功')

# 根据id获取模型信息
@csrf_exempt
def get_model_info_by_id(request):
    if request.method == 'POST':
        model_id=int(request.POST.get('model_id'))
        model_info=com_model.objects.filter(id=model_id).values()
        data={}
        data['model']=list(model_info)
        data['model'][0]['url']=views_common.get_private_model(data['model'][0]['url'])
        return JsonResponse(data)

