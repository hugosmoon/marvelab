from django.urls import path,re_path
from django.conf.urls import url


from . import views
from . import views_view
from .views_model import views_model
from .views_user import views_user

urlpatterns = [
    path('index/', views.home,name='home'),
    path('model_manage/',views.model_manage,name='model_manage'),
    url('view_design/',views.view_design,name='view_design'),
    # path('tool_display/', views.tool_display,name='tool_display'),
    # path('qxyl/', views.qxyl,name='qxyl'),
    # path('jgzl/', views.jgzl,name='jgzl'),
    # path('qxwd/', views.qxwd,name='qxwd'),
    # path('cuttingforce_cal/',views.cuttingforce_cal,name='cuttingforce_cal'),
    # path('cutting_temp_cal/',views.cutting_temp_cal,name='cutting_temp_cal'),
    # path('cutting_roughness_cal/',views.cutting_roughness_cal,name='cutting_roughness_cal'),
    # url(r'model_debugger/',views.model_debugger,name='model_debugger'),
    # path('save_models/',views.save_models,name='save_models'),
    # path('get_models_by_view/',views.get_models_by_view,name='get_models_by_view'),
    # path('delete_model/',views.delete_model,name='delete_model'),
    # path('get_views/',views.get_views,name='get_views'),
    # path('add_view/',views.add_view,name='add_view'),
    
    
    # path('get_model_info_by_id/',views.get_model_info_by_id,name='get_model_info_by_id'),
    
    # re_path('^view_display/(?P<view_id>[0-9]+)/',views.view_display,name='view_display'),
    # path('create_display_view/',views.create_display_view,name='create_display_view'),
    # path('get_display_view/',views.get_display_view,name='get_display_view'),
    # path('test/',views.test,name='test'),
    
    
    
    
    # path('admin_verification/',views.admin_verification,name='admin_verification'),

    # # 异常处理
    # path('view_exception/',views.view_exception,name='view_exception'),
    # # 创建访问日志
    
    # # 打开编程页面
    # path('view_program_page/',views.view_program_page,name='view_program_page'),
    # # 保存代码
    # path('save_code/',views.save_code,name='save_code'),

    # # 执行代码的页面
    # re_path('^view_run/(?P<view_id>[0-9]+)/',views.view_run,name='view_run'),

    # #ajax
    # #用七牛公有链接获取私有链接
    # # path('get_private_model/', views.get_private_model,name='get_private_model'),

    # 用户
    path('createuser/',views_user.createuser,name='createuser'),
    path('login/',views_user.login_page,name='login_page'),
    path('login_verification/',views_user.login_verification,name='login_verification'),
    path('do_login/',views_user.do_login,name='do_login'),
    path('adduser/',views_user.adduser,name='adduser'),
    path('create_visit_log/',views_user.create_visit_log,name='create_visit_log'),

    # 模型
    path('create_model_base/',views_model.create_model_base,name='create_model_base'),
    path('get_model_base/',views_model.get_model_base,name='get_model_base'),
    path('get_model_info_by_id/',views_model.get_model_info_by_id,name='get_model_info_by_id'),

    path('upload_model/',views_model.upload_model,name='upload_model'),
    path('get_model_by_base_id/',views_model.get_model_by_base_id,name='get_model_by_base_id'),

    # 场景
    path('get_parent_views/',views_view.get_parent_views,name='get_parent_views'),
    path('get_child_views/',views_view.get_child_views,name='get_child_views'),
    path('is_view_exist/',views_view.is_view_exist,name='is_view_exist'),
    path('add_parent_view/',views_view.add_parent_view,name='add_parent_view'),
    path('add_child_view/',views_view.add_child_view,name='add_child_view'),
   
    
    

    


    
]

