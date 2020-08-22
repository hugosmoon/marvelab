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

from vmaker.models import model_base,com_model,child_view,parent_view,child_view_parent_view_ralation,child_view_model_conf,model_base_model_relation,camera
from . import views_common


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
        data={}
        if len(parent_view.objects.filter(parent_view_name=view_name,owner_id=owner_id,is_delete=False)) == 0:
            new_parent_view=parent_view.objects.create(parent_view_name=view_name,owner_id=owner_id)
            data['new_parent_view_id']=new_parent_view.id
            data['new_parent_view_name']=new_parent_view.parent_view_name
            data['message_type']='success'
            data['message']=new_parent_view.parent_view_name+'场景新建成功'
            return JsonResponse(data)
        else:
            # return HttpResponse('您已经创建了名为'+view_name+'的场景了，换一个名字吧~~')
            data['message']='您已经创建了名为'+view_name+'的场景了，换一个吧~~'
            data['message_type']='error'
            return JsonResponse(data)
@csrf_exempt
def add_child_view(request):
    if request.method == 'POST':
        view_name=request.POST.get('view_name')
        parent_view_id=int(request.POST.get('parent_view_id'))
        data={}
        if len(child_view.objects.filter(child_view_name=view_name,child_view_parent_view_ralation__parent_view_id=parent_view_id,is_delete=False)) == 0:
            new_child_view = child_view.objects.create(child_view_name=view_name)
            child_view_parent_view_ralation.objects.create(parent_view_id=parent_view.objects.get(pk=parent_view_id,is_delete=False),child_view_id=new_child_view)
            data['new_child_view_id']=new_child_view.id
            data['new_child_view_name']=new_child_view.child_view_name
            data['message_type']='success'
            data['message']=new_child_view.child_view_name+'场景新建成功'
            return JsonResponse(data)
        else:
            data['message']='您在当前场景中已经创建了名为'+view_name+'的子场景了，换一个名字吧~~'
            data['message_type']='error'
            return JsonResponse(data)
        
#将模型的配置信息存入数据库  
@csrf_exempt
def save_view(request):
    #接收基础参数
    if request.method == 'POST':
        views_models_info=request.POST.get('views_models_info')
        views_models_info= json.loads(views_models_info)
        for v in views_models_info['views_info']:
            view = views_models_info['views_info'][v]
            view_id=view['id']
            view_position_x=view['view_position_x']
            view_position_y=view['view_position_y']
            view_position_z=view['view_position_z']
            child_view.objects.filter(id=view_id,is_delete=False).update(view_position_x=view_position_x,view_position_y=view_position_y,view_position_z=view_position_z)
            
 
        for m in views_models_info['models_info']:
            model = views_models_info['models_info'][m]
            view_id=model['view_id']
            model_id=model['model_id']
            serial=model['serial']
            position_x=model['position_x']
            position_y=model['position_y']
            position_z=model['position_z']
            rotation_x=model['rotation_x']
            rotation_y=model['rotation_y']
            rotation_z=model['rotation_z']
            materials_color_r=model['materials_color_r']
            materials_color_g=model['materials_color_g']
            materials_color_b=model['materials_color_b']
            scale_x=model['scale_x']
            scale_y=model['scale_y']
            scale_z=model['scale_z']
            materials_type=model['materials_type']
            metalness=model['metalness']
            roughness=model['roughness']
            emissive_r=model['emissive_r']
            emissive_g=model['emissive_g']
            emissive_b=model['emissive_b']
            emissiveIntensity=model['emissiveIntensity']
            reflectivity=model['reflectivity']
            
            models_in=child_view_model_conf.objects.filter(child_view=child_view.objects.get(id=view_id,is_delete=False),com_model=com_model.objects.get(id=model_id,is_delete=False),serial=serial,is_delete=False)
            if len(models_in) > 0:
                models_in.update(
                position_x=position_x,position_y=position_y,position_z=position_z,
                rotation_x=rotation_x,rotation_y=rotation_y,rotation_z=rotation_z,
                materials_color_r=materials_color_r,materials_color_g=materials_color_g,materials_color_b=materials_color_b,
                scale_x=scale_x,scale_y=scale_y,scale_z=scale_z,
                materials_type=materials_type,metalness=metalness,roughness=roughness,
                emissive_r=emissive_r,emissive_g=emissive_g,emissive_b=emissive_b,
                emissiveIntensity=emissiveIntensity,reflectivity=reflectivity)
            else:
                child_view_model_conf.objects.create(
                child_view=child_view.objects.get(id=view_id,is_delete=False),com_model=com_model.objects.get(id=model_id,is_delete=False),
                serial=serial,position_x=position_x,position_y=position_y,position_z=position_z,
                rotation_x=rotation_x,rotation_y=rotation_y,rotation_z=rotation_z,
                materials_color_r=materials_color_r,materials_color_g=materials_color_g,materials_color_b=materials_color_b,
                scale_x=scale_x,scale_y=scale_y,scale_z=scale_z,
                materials_type=materials_type,metalness=metalness,roughness=roughness,
                emissive_r=emissive_r,emissive_g=emissive_g,emissive_b=emissive_b,
                emissiveIntensity=emissiveIntensity,reflectivity=reflectivity
                )

                
        return HttpResponse('Save Success')


#获取子场景的所有模型设置参数
@csrf_exempt
def get_models_by_child_view(request):
    if request.method == 'POST':
        child_view_id=request.POST.get('child_view_id')
        models = child_view_model_conf.objects.filter(child_view=child_view.objects.get(id=child_view_id),is_delete=False).values()
        data={}
        data['models'] = list(models)
        for i in range(len(data['models'])):
            data['models'][i]['url']=views_common.get_private_model(com_model.objects.get(id=data['models'][i]['com_model_id'],is_delete=False).url)
            data['models'][i]['model_name']=com_model.objects.get(id=data['models'][i]['com_model_id'],is_delete=False).model_name
          
        data['child_views']=views_common.object_to_json(child_view.objects.get(id=child_view_id,is_delete=False))



            
        return JsonResponse(data)

# 根据场景id获取其所有的子场景id
@csrf_exempt
def get_child_view_by_parent_view_id(request):
    if request.method == 'POST':
        parent_view_id=request.POST.get('parent_view_id')
        child_views=child_view.objects.filter(child_view_parent_view_ralation__parent_view_id=parent_view.objects.get(id=parent_view_id),is_delete=False).values()
        data=[]
        for v in child_views:
            data.append(v['id'])
        return JsonResponse({
            'parent_view_id':int(parent_view_id),
            'child_view_id':data
        })


#获取母场景中模型的数量
@csrf_exempt
def get_model_number_by_parent_view_id(request):
    if request.method == 'POST':
        parent_view_id=request.POST.get('parent_view_id')
        child_views=child_view.objects.filter(child_view_parent_view_ralation__parent_view_id=parent_view.objects.get(id=parent_view_id),is_delete=False)
        number=0
        for c_child_view in child_views:
            model_confs = child_view_model_conf.objects.filter(child_view=c_child_view,is_delete=False)
            number+=len(model_confs)
        return HttpResponse(number)

# 根据serial删除子场景中的模型
@csrf_exempt
def delete_model_conf_by_serial(request):
    if request.method == 'POST':
        serial=request.POST.get('serial')
        child_view_model_conf.objects.filter(serial=serial,is_delete=False).update(is_delete=True)
        return HttpResponse('成功从场景中删除模型')

# 创建camera
@csrf_exempt
def create_camera(request):
    if request.method == 'POST':
        camera_info=request.POST.get('camera_info')
        camera_info= json.loads(camera_info)
        position_x=camera_info['position']['x']
        position_y=camera_info['position']['y']
        position_z=camera_info['position']['z']
        up_x=camera_info['up']['x']
        up_y=camera_info['up']['y']
        up_z=camera_info['up']['z']
        lookAt_x=camera_info['lookAt']['x']
        lookAt_y=camera_info['lookAt']['y']
        lookAt_z=camera_info['lookAt']['z']

        parent_view_id=request.POST.get('parent_view_id')
        camera_name=request.POST.get('camera_name')
        pv=parent_view.objects.get(pk=parent_view_id,is_delete=False)
        data={}
        if camera_name != "":
            new_camera=camera.objects.create(parent_view=pv,camera_name=camera_name,
            position_x=position_x,position_y=position_y,position_z=position_z,
            up_x=up_x,up_y=up_y,up_z=up_z,
            lookAt_x=lookAt_x,lookAt_y=lookAt_y,lookAt_z=lookAt_z)
            data['new_camera']=views_common.object_to_json(new_camera)
            # data['camera_name']=new_camera.camera_name
            # data['parent_view_id']=parent_view_id
        return JsonResponse(data)

# 根据parent_view_id获取camera列表
@csrf_exempt
def get_cameras_by_parent_view_id(request):
    if request.method == 'POST':
        parent_view_id=request.POST.get('parent_view_id')
        pv=parent_view.objects.get(pk=parent_view_id,is_delete=False)
        cameras=camera.objects.filter(parent_view=pv,is_delete=False)
        data={}
        data['cameras']=[]
        cameras_list=list(cameras)
        # print(len(cameras_list))
        for i in range(len(cameras_list)):
             data['cameras'].append({
                'id':cameras_list[i].id,
                'camera_name':cameras_list[i].camera_name,
                'position':{
                    'x':cameras_list[i].position_x,
                    'y':cameras_list[i].position_y,
                    'z':cameras_list[i].position_z
                },
                'up':{
                    'x':cameras_list[i].up_x,
                    'y':cameras_list[i].up_y,
                    'z':cameras_list[i].up_z
                },
                'lookAt':{
                    'x':cameras_list[i].lookAt_x,
                    'y':cameras_list[i].lookAt_y,
                    'z':cameras_list[i].lookAt_z
                }
             })
        return JsonResponse(data)

# 根据id获取camera列表
@csrf_exempt
def get_camera_by_id(request):
    if request.method == 'POST':
        id=request.POST.get('id')
        c=camera.objects.get(pk=id,is_delete=False)
        data={}
        data['id']=id
        data['camera_name']=c.camera_name
        data['position']={}
        data['position']['x']=c.position_x
        data['position']['y']=c.position_y
        data['position']['z']=c.position_z
        data['up']={}
        data['up']['x']=c.up_x
        data['up']['y']=c.up_y
        data['up']['z']=c.up_z
        data['lookAt']={}
        data['lookAt']['x']=c.lookAt_x
        data['lookAt']['y']=c.lookAt_y
        data['lookAt']['z']=c.lookAt_z
        return JsonResponse(data)



    






