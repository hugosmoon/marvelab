// 引入文件之前必须定义的变量views_models_info, views_models_info_history , models, scene  renderer  camera   controller
// 渲染器、相机、场景、
let renderer,camera,scene,controller,dragControls,transformControls;

////模型信息列表
let views_models_info={
    'models_info':{},
    'views_info':{}
};
let camera_info=new Camera_info();

////模型实体列表
let models={};

// 记录调试过程的历史信息
let views_models_info_history=[];
////当前操作在history中的位置
let action_anchor=0;

let models_view_control_arguments={
    // 一共加载了多少次模型
    models_load_sum:0,
    // 本次加载了多少次模型
    models_load_this_time_sum:0,
    // 有新模型成功加载后，变为true
    model_loaded_status:false,
    // 重新计数
    models_number_reset:function(){
        this.models_load_this_time_sum=0;
    },
    models_loaded:function(){
        this.models_load_this_time_sum+=1;
        this.models_load_sum+=1;
        this.model_loaded_status=true;
    }

}


//初始化渲染器
function initThree(debug) {
    
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });//定义渲染器
    renderer.setSize(window.innerWidth, window.innerHeight);//设置渲染的宽度和高度
    document.getElementById('render').appendChild(renderer.domElement);//将渲染器加在html中的div里面

    renderer.setClearColor(0x202040, 0.5);//渲染的颜色设置
    // renderer.shadowMap.enabled = true;//开启阴影，默认是关闭的，太影响性能
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;//阴影的一个类型

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 500000);//perspective是透视摄像机，这种摄像机看上去画面有3D效果
    // camera = new THREE.OrthographicCamera(window.innerWidth , window.innerWidth , window.innerHeight, window.innerHeight , -20000, 50000);

    //摄像机的位置
    // console.log(camera_info.position.x);
    camera.position.x = camera_info.position.x;//200;
    camera.position.y = camera_info.position.y;//-5000;
    camera.position.z = camera_info.position.z;//1000;
    camera.up.x = camera_info.up.x;
    camera.up.y = camera_info.up.y;
    camera.up.z = camera_info.up.z;//1;//摄像机的上方向是Z轴
    camera.lookAt(camera_info.lookAt.x, camera_info.lookAt.y, camera_info.lookAt.z);//摄像机对焦的位置(0, -50, 0)
    //这三个参数共同作用才能决定画面

    scene = new THREE.Scene();
    let light = new THREE.SpotLight(0xffffff, 1, 0);//点光源
    light.position.set(0, 0, 80000);
    light.angle=Math.PI;
    light.castShadow = true;//开启阴影
    light.shadow.mapSize.width = 8192;//阴影的分辨率，可以不设置对比看效果
    light.shadow.mapSize.height = 8192;
    scene.add(light);

    let light2 = new THREE.SpotLight(0xffffff, 0.4, 0);//点光源
    light2.position.set(80000,-80000,300);
    scene.add(light2);

    let light3 = new THREE.SpotLight(0xffffff, 0.4, 0);//点光源
    light3.position.set(80000,80000,300);
    scene.add(light3);

    let light4 = new THREE.SpotLight(0xffffff, 0.4, 0);//点光源
    light4.position.set(-80000,-80000,300);
    scene.add(light4);

    let light6 = new THREE.SpotLight(0xffffff, 0.4, 0);//点光源
    light6.position.set(-80000,80000,300);
    scene.add(light6);

    let light5 = new THREE.AmbientLight(0xaaaaaa, 0.99);//环境光，如果不加，点光源照不到的地方就完全是黑色的
    scene.add(light5);

    // controls = new THREE.TrackballControls(camera, renderer.domElement);

    controller = new THREE.OrbitControls(camera, renderer.domElement);
    controller.target = new THREE.Vector3(0, 0, 0);

    let color=new THREE.Color(0x151535);
    let helper = new THREE.GridHelper(50000, 50, color, color);
    // helper.rotation.x=Math.PI*0.5;
    helper.position.y = -2000;
    
    helper.material.opacity=0
    // console.log(helper)

    scene.add(helper);

    if(debug==1){     
            let color1 = new THREE.Color( 0xff0000 ), color2= new THREE.Color( 0x00ff00 ), color3= new THREE.Color( 0x6666ff );
            // 线的材质可以由2点的颜色决定
            let p1 = new THREE.Vector3( -25000, 0, 0 );
            let p2 = new THREE.Vector3( 25000, 0, 0 );
            let p3 = new THREE.Vector3( 0, -25000, 0 );
            let p4 = new THREE.Vector3( 0, 25000, 0 );
            let p5 = new THREE.Vector3( 0, 0, -25000 );
            let p6 = new THREE.Vector3( 0, 0, 25000 );
         
            // x轴
            add_line(p1,p2,color1,color1);
            // y轴
            add_line(p3,p4,color2,color2);
            // z轴
            add_line(p5,p6,color3,color3);
    
    }   
}
function add_line(p1,p2,color1,color2){
    let geometry = new THREE.Geometry();
    let material = new THREE.LineBasicMaterial({vertexColors:THREE.VertexColors});
    geometry.vertices.push(p1);
    geometry.vertices.push(p2);
    geometry.colors.push( color1, color2 );
    let line = new THREE.Line( geometry, material, THREE.LineSegments );
    scene.add(line);
}

//初始化一个模型
function initObject(index) {
    // console.log('正在加载');
    //模型材质
    let color=new THREE.Color(views_models_info['models_info'][index].materials_color_r,views_models_info['models_info'][index].materials_color_g,views_models_info['models_info'][index].materials_color_b);
    let emissive_color=new THREE.Color(views_models_info['models_info'][index].emissive_r,views_models_info['models_info'][index].emissive_g,views_models_info['models_info'][index].emissive_b);
    let materials;
    materials = [
        new THREE.MeshPhysicalMaterial({
            color:color,
            // 材质像金属的程度. 非金属材料，如木材或石材，使用0.0，金属使用1.0，中间没有（通常）.
            // 默认 0.5. 0.0到1.0之间的值可用于生锈的金属外观
            metalness: views_models_info['models_info'][index].metalness,
            // 材料的粗糙程度. 0.0表示平滑的镜面反射，1.0表示完全漫反射. 默认 0.5
            roughness: views_models_info['models_info'][index].roughness,
            // opacity:0.5,
            // 设置环境贴图
            // envMap: textureCube,
            // 反射程度, 从 0.0 到1.0.默认0.5.
            // 这模拟了非金属材料的反射率。 当metalness为1.0时无效
            reflectivity: views_models_info['models_info'][index].reflectivity,
            emissive:emissive_color,
            emissiveIntensity:views_models_info['models_info'][index].emissiveIntensity,
            }),
    ];
    // console.log(materials);

    let loader = new THREE.STLLoader();
    loader.load(views_models_info['models_info'][index].url, function (geometry) {
       
        // //console.log(geometry);
        geometry.center();
          models[index] = THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
          models[index].receiveShadow = true; 
          models[index].children[0].position.x=views_models_info['models_info'][index].position_x+views_models_info['views_info']['v'+views_models_info['models_info'][index].view_id].view_position_x;
          models[index].children[0].position.y=views_models_info['models_info'][index].position_y+views_models_info['views_info']['v'+views_models_info['models_info'][index].view_id].view_position_y;
          models[index].children[0].position.z=views_models_info['models_info'][index].position_z+views_models_info['views_info']['v'+views_models_info['models_info'][index].view_id].view_position_z;
          models[index].children[0].rotation.x=views_models_info['models_info'][index].rotation_x;
          models[index].children[0].rotation.y=views_models_info['models_info'][index].rotation_y;
          models[index].children[0].rotation.z=views_models_info['models_info'][index].rotation_z;
          models[index].children[0].scale.x=views_models_info['models_info'][index].scale_x;
          models[index].children[0].scale.y=views_models_info['models_info'][index].scale_y;
          models[index].children[0].scale.z=views_models_info['models_info'][index].scale_z;

        
        scene.add(models[index]);
        console.log(views_models_info['models_info'][index].model_name+'加载完成');
        models_view_control_arguments.models_loaded();

    });  
}

// 相机对象
function Camera_info(){
    this.position={
        x:1000,
        y:1000,
        z:1000,
    };
    this.up={
        x:0,
        y:1,
        z:0
    };
    this.lookAt={
        x:0,
        y:-50,
        z:0
    };
    this.change=function(o,axis,num){
        switch (o) {
            case 'position':
                switch (axis){
                    case 'x':
                        this.position.x=num;
                        camera.position.x=num;
                        break;
                    case 'y':
                        this.position.y=num;
                        camera.position.y=num;
                        break;
                    case 'z':
                        this.position.z=num;
                        camera.position.z=num;
                        break;
                };
                break;
            case 'up':
                switch (axis){
                    case 'x':
                        this.up.x=num;
                        camera.up.x=num;
                        break;
                    case 'y':
                        this.up.y=num;
                        camera.up.y=num;
                        break;
                    case 'z':
                        this.up.z=num;
                        camera.up.z=num;
                        break;
                };
                break;
            case 'lookAt':
                switch (axis){
                    case 'x':
                        this.lookAt.x=num;
                        camera.lookAt(this.lookAt.x,this.lookAt.y,this.lookAt.z);
                        break;
                    case 'y':
                        this.lookAt.y=num;
                        camera.lookAt(this.lookAt.x,this.lookAt.y,this.lookAt.z);
                        break;
                    case 'z':
                        this.lookAt.z=num;
                        camera.lookAt(this.lookAt.x,this.lookAt.y,this.lookAt.z);
                        break;
                };
                break;
        }
    }
}

//模型对象
function Model(view_id,model_id,model_name,url,serial,materials_type){
    this.view_id=view_id;
    this.serial=serial;
    this.model_id=model_id;
    this.model_name=model_name;
    this.url=url;
    // this.url="/static/model/"+view_name+'/'+name;
    this.position_x=0;
    this.position_y=0;
    this.position_z=0;

    // this.view_position_x=0;
    // this.view_position_y=0;
    // this.view_position_z=0;

    this.rotation_x=0;
    this.rotation_y=0;
    this.rotation_z=0;

    this.materials_type=materials_type;

    // 材质参数
    ////材质金属性
    this.metalness=1.0;
    ////材质粗糙度（从镜面反射到漫反射）
    this.roughness=0.5;
    ////材质在光线下的颜色，不是材质本身的颜色
    this.materials_color=0x212121;
    this.materials_color_r=0.63;
    this.materials_color_g=0.63;
    this.materials_color_b=0.63;
    ////材质本身的颜色，与光线无关
    this.emissive_r=1.0;
    this.emissive_g=1.0;
    this.emissive_b=1.0;
    ////材质本身颜色的强度
    this.emissiveIntensity=0;
    ////非金属材料的反射率。 当metalness为1.0时无效
    this.reflectivity=0.5;


    // 缩放比例
    this.scale_x=1;
    this.scale_y=1;
    this.scale_z=1;
   
    this.change_po_x=function(x,history_push_status){
        this.position_x=x;
        if(models[this.serial]){
            models[this.serial].children[0].position.x=x+views_models_info['views_info']['v'+this.view_id].view_position_x;
        }
        if(history_push_status){
            history_push();
        }
    };
    this.change_po_y=function(x,history_push_status){
        this.position_y=x;
        if(models[this.serial]){
            models[this.serial].children[0].position.y=x+views_models_info['views_info']['v'+this.view_id].view_position_y;
        }
        if(history_push_status){
            history_push();
        }
    };
    this.change_po_z=function(x,history_push_status){
        this.position_z=x;
        if(models[this.serial]){
            models[this.serial].children[0].position.z=x+views_models_info['views_info']['v'+this.view_id].view_position_z;
        }
        if(history_push_status){
            history_push();
        }
    };
   
    this.change_ro_x=function(x,history_push_status){
        this.rotation_x=x;
        if(models[this.serial]){
            models[this.serial].children[0].rotation.x=x;
        }
        if(history_push_status){
            history_push();
        }
        
    };
    this.change_ro_y=function(x,history_push_status){
        this.rotation_y=x;
        if(models[this.serial]){
            models[this.serial].children[0].rotation.y=x;
        }
        if(history_push_status){
            history_push();
        }
    };
    this.change_ro_z=function(x,history_push_status){
        this.rotation_z=x;       
        if(models[this.serial]){
            models[this.serial].children[0].rotation.z=x;
        }
        if(history_push_status){
            history_push();
        }
    };

    this.change_materials_color_r=function(x,history_push_status){
        this.materials_color_r=x;
        if(models[this.serial]){
            models[this.serial].children[0].material.color.r=x;
        }
        if(history_push_status){
            history_push();
        }
    };
    this.change_materials_color_g=function(x,history_push_status){
        this.materials_color_g=x;
        if(models[this.serial]){
            models[this.serial].children[0].material.color.g=x;
        }
        if(history_push_status){
            history_push();
        }
    };
    this.change_materials_color_b=function(x,history_push_status){
        this.materials_color_b=x;
        if(models[this.serial]){
            models[this.serial].children[0].material.color.b=x;
        }
        if(history_push_status){
            history_push();
        }
    };

    this.change_scale_x=function(x,history_push_status){
        this.scale_x=x;
        if(models[this.serial]){
            models[this.serial].children[0].scale.x=x;
        }
        if(history_push_status){
            history_push();
        }
    };
    this.change_scale_y=function(x,history_push_status){
        this.scale_y=x;
        if(models[this.serial]){
            models[this.serial].children[0].scale.y=x;
        }
        if(history_push_status){
            history_push();
        }
    };
    this.change_scale_z=function(x,history_push_status){
        this.scale_z=x;
        if(models[this.serial]){
            models[this.serial].children[0].scale.z=x;
        }
        if(history_push_status){
            history_push();
        }
    };
    this.change_materials_type=function(x,history_push_status){
        this.materials_type=x;
    };



    this.change_metalness=function(x,history_push_status){
        this.metalness=x;
        if(models[this.serial]){
            models[this.serial].children[0].material.metalness=x;
        }
        if(history_push_status){
            history_push();
        }
    };
    this.change_roughness=function(x,history_push_status){
        this.roughness=x;
        if(models[this.serial]){
            models[this.serial].children[0].material.roughness=x;
        }
        if(history_push_status){
            history_push();
        }
    };
    this.change_emissive_r=function(x,history_push_status){
        this.emissive_r=x;
        if(models[this.serial]){
            models[this.serial].children[0].material.emissive.r=x;
        }
        if(history_push_status){
            history_push();
        }
    };
    this.change_emissive_g=function(x,history_push_status){
        this.emissive_g=x;
        if(models[this.serial]){
            models[this.serial].children[0].material.emissive.g=x;
        }
        if(history_push_status){
            history_push();
        }
    };
    this.change_emissive_b=function(x,history_push_status){
        this.emissive_b=x;
        if(models[this.serial]){
            models[this.serial].children[0].material.emissive.b=x;
        }
        if(history_push_status){
            history_push();
        }
    };
    this.change_emissiveIntensity=function(x,history_push_status){
        this.emissiveIntensity=x;
        if(models[this.serial]){
            models[this.serial].children[0].material.emissiveIntensity=x;
        }
        if(history_push_status){
            history_push();
        }
    };
    this.change_reflectivity=function(x,history_push_status){
        this.reflectivity=x;
        if(models[this.serial]){
            models[this.serial].children[0].material.reflectivity=x;
        }
        if(history_push_status){
            history_push();
        }
    };

}
// 子场景对象
function ChildView(id){
    this.id=id
    this.child_view_name='child_view_name'
    this.view_position_x=0
    this.view_position_y=0
    this.view_position_z=0
    this.change_view_name=function(x,history_push_status){
        this.child_view_name=x
    }
    this.change_view_position_x=function(x,history_push_status){
        this.view_position_x=x
        Object.keys(views_models_info['models_info']).forEach(key =>{
            if(views_models_info['models_info'][key].view_id==id){
                if(models[key]){
                    models[key].children[0].position.x=x+views_models_info['models_info'][key].position_x;
                }
            }
        });
    }
    this.change_view_position_y=function(x,history_push_status){
        this.view_position_y=x
        Object.keys(views_models_info['models_info']).forEach(key =>{
            if(views_models_info['models_info'][key].view_id==id){
                if(models[key]){
                    models[key].children[0].position.y=x+views_models_info['models_info'][key].position_y;
                }
            }
        });
    }
    this.change_view_position_z=function(x,history_push_status){
        this.view_position_z=x
        Object.keys(views_models_info['models_info']).forEach(key =>{
            if(views_models_info['models_info'][key].view_id==id){
                if(models[key]){
                    models[key].children[0].position.z=x+views_models_info['models_info'][key].position_z;
                }
            }
        });
    }
}
//渲染场景
function render(){
    requestAnimationFrame(this.render);
    renderer.render(scene, camera);
}

//向views_models_info修改历史队列中插入数据
function history_push(){
    if(action_anchor<views_models_info_history.length-1){
        views_models_info_history.splice(action_anchor+1);
    }
    if(views_models_info_history.length>100){
        views_models_info_history.shift();
    }
    // 只有在历史记录为空或者当前的模型参数与历史记录中最近一次存储的参数不同时，才会保存
    if(views_models_info_history.length==0||JSON.stringify(views_models_info).hashCode()!=JSON.stringify(views_models_info_history[views_models_info_history.length-1]).hashCode()){
        // console.log(views_models_info_history.length)
        views_models_info_history.push(JSON.parse(JSON.stringify(views_models_info)));
    }
    action_anchor=views_models_info_history.length-1;
    // console.log(views_models_info_history.length)
}
String.prototype.hashCode = function() {
    let hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 10) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };
  JSON.stringify(views_models_info).hashCode()