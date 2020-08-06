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
    createtime = models.DateTimeField(default=timezone.now, db_column="f_createtime")
    updatetime = models.DateTimeField(default=timezone.now, db_column="f_updatetime")