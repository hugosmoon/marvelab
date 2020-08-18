from django.db import models
import django.utils.timezone as timezone



'''
模型：
model_base - 模型库 
model - 模型的基本参数
model_base_model_relation - 模型库和模型的对应关系

场景:
child_view
parent_view
child_view_parent_view_ralation - 子场景和父场景的对应关系
child_view_model_conf - 子场景中模型的设置参数
display_view - 预览场景
view_program - 场景编程

用户:
user - 用户表
visit_log - 访问日志
'''

class model_base(models.Model):
    '''
    id -
    owner_id - 所有者的用户ID
    base_type - 模型库类型，若为1则只有所有者自己可见，若为0则所有人可见
    '''
    id = models.AutoField(primary_key=True, db_column="id")
    owner_id=models.IntegerField(default=1,db_column="owner_id")
    base_name = models.CharField(max_length=255, db_column="base_name")
    is_delete = models.BooleanField(default=False, db_column="is_delete")
    base_type = models.IntegerField(default=1,db_column="type")
    createtime = models.DateTimeField(default=timezone.now, db_column="createtime")
    updatetime = models.DateTimeField(default=timezone.now, db_column="f_updatetime")

#模型
class com_model(models.Model):
    id = models.AutoField(primary_key=True, db_column="id")
    model_name = models.CharField(max_length=255, db_column="model_name")
    url=models.URLField(max_length=500, db_column="url")
    createtime = models.DateTimeField(default=timezone.now, db_column="createtime")
    is_delete = models.BooleanField(default=False, db_column="is_delete")

class model_base_model_relation(models.Model):
    id = models.AutoField(primary_key=True, db_column="id")
    model_id = models.ForeignKey(
        'com_model',
        on_delete=models.CASCADE,
        db_column="model_id"
    )
    model_base_id = models.ForeignKey(
        'model_base',
        on_delete=models.CASCADE,
        db_column="model_base_id"
    )
    createtime = models.DateTimeField(default=timezone.now, db_column="createtime")
    is_delete = models.BooleanField(default=False, db_column="is_delete")

# 场景
class child_view(models.Model):
    id = models.AutoField(primary_key=True, db_column="id")
    child_view_name = models.CharField(max_length=255, db_column="child_view_name")
    createtime = models.DateTimeField(default=timezone.now, db_column="createtime")
    is_delete = models.BooleanField(default=False, db_column="is_delete")
    view_position_x=models.FloatField(default=0,db_column="view_position_x")
    view_position_y=models.FloatField(default=0,db_column="view_position_y")
    view_position_z=models.FloatField(default=0,db_column="view_position_z")
    


class parent_view(models.Model):
    id = models.AutoField(primary_key=True, db_column="id")
    parent_view_name = models.CharField(max_length=255, db_column="parent_view_name")
    owner_id=models.IntegerField(default=1,db_column="owner_id")
    createtime = models.DateTimeField(default=timezone.now, db_column="createtime")
    is_delete = models.BooleanField(default=False, db_column="is_delete")

class child_view_parent_view_ralation(models.Model):
    id = models.AutoField(primary_key=True, db_column="id")
    parent_view_id = models.ForeignKey(
        'parent_view',
        on_delete=models.CASCADE,
        db_column="parent_view_id"
    )
    child_view_id = models.ForeignKey(
        'child_view',
        on_delete=models.CASCADE,
        db_column="child_view_id"
    )
    createtime = models.DateTimeField(default=timezone.now, db_column="createtime")
    is_delete = models.BooleanField(default=False, db_column="is_delete")

class child_view_model_conf(models.Model):
    id = models.AutoField(primary_key=True, db_column="id")
    child_view = models.ForeignKey(
        'child_view',
        on_delete=models.CASCADE,
        db_column="child_view"
    )
    com_model = models.ForeignKey(
        'com_model',
        on_delete=models.CASCADE,
        db_column="model"
    )
    serial = models.CharField(default='',max_length=255, db_column="serial")
    is_delete = models.BooleanField(default=False, db_column="is_delete")
    # view_position_x=models.FloatField(default=0,db_column="view_position_x")
    # view_position_y=models.FloatField(default=0,db_column="view_position_y")
    # view_position_z=models.FloatField(default=0,db_column="view_position_z")
    position_x=models.FloatField(default=0,db_column="position_x")
    position_y=models.FloatField(default=0,db_column="position_y")
    position_z=models.FloatField(default=0,db_column="position_z")
    rotation_x=models.FloatField(default=0,db_column="rotation_x")
    rotation_y=models.FloatField(default=0,db_column="rotation_y")
    rotation_z=models.FloatField(default=0,db_column="rotation_z")
    materials_color_r=models.FloatField(default=0.13,db_column="materials_color_r")
    materials_color_g=models.FloatField(default=0.13,db_column="materials_color_g")
    materials_color_b=models.FloatField(default=0.13,db_column="materials_color_b")
    scale_x=models.FloatField(default=1,db_column="scale_x")
    scale_y=models.FloatField(default=1,db_column="scale_y")
    scale_z=models.FloatField(default=1,db_column="scale_z")
    materials_type=models.IntegerField(default=1,db_column="materials_type")
    metalness=models.FloatField(default=1,db_column="metalness")
    roughness=models.FloatField(default=0.5,db_column="roughness")
    emissive_r=models.FloatField(default=1,db_column="emissive_r")
    emissive_g=models.FloatField(default=1,db_column="emissive_g")
    emissive_b=models.FloatField(default=1,db_column="emissive_b")
    emissiveIntensity=models.FloatField(default=0,db_column="emissiveIntensity")
    reflectivity=models.FloatField(default=0.5,db_column="reflectivity")
    createtime = models.DateTimeField(default=timezone.now, db_column="createtime")
    updatetime = models.DateTimeField(default=timezone.now, db_column="updatetime")


class user(models.Model):
    '''
    usertype:1-普通 0-管理员
    '''
    id = models.AutoField(primary_key=True, db_column="id")
    usertype=models.IntegerField(default=1,db_column="usertype")
    username = models.CharField(max_length=255, db_column="username")
    password = models.CharField(max_length=255, db_column="password")
    createtime = models.DateTimeField(default=timezone.now, db_column="createtime")
    updatetime = models.DateTimeField(default=timezone.now, db_column="updatetime")
    is_delete = models.BooleanField(default=False, db_column="is_delete")
    # verify_token = models.CharField(default='',max_length=255, db_column="verify_token")

class visit_log(models.Model):
    id = models.AutoField(primary_key=True, db_column="id")
    user_id = models.IntegerField(default=0, db_column="user_id")
    page =models.IntegerField(db_column="page")
    ip = models.CharField(max_length=255, db_column="ip") 
    city = models.CharField(default="",max_length=255, db_column="city") 
    createtime = models.DateTimeField(default=timezone.now, db_column="createtime")