let hugo;
let Main = {
    data() {
        return {
            // 用户的id
            owner_id: $.cookie("user_id"),
            parent_view_name_select_disable_status: false,
            parent_view_selected: '',
            parent_view_selected_name: '',
            parent_views_list: [],
            will_load_models_number: 0,
            // 场景加载状态
            loding_status: false,
            // 加载进度条
            loding_percentage: 0,
            percentageColors: [
                { color: '#f56c6c', percentage: 20 },
                { color: '#e6a23c', percentage: 40 },
                { color: '#5cb87a', percentage: 60 },
                { color: '#1989fa', percentage: 80 },
                { color: '#6f7ad3', percentage: 100 }
            ],
            child_view_selected: '',
            child_view_list: [],
            child_view_model_list: [],
            model_selected: '',
            model_base_selected: '',
            model_in_model_base_selected: '',
            select_model_status: true,
            base_list: [],
            model_in_base_list: [],
            add_model_status: true,
            // 是否可以预览场景
            display_status: false,
            // views_models_info的哈希值，校验是否需要保存
            views_models_info_hashcode: 0,

            //定时计数
            update_num: 0,
            cancle_action_status: true,
            redo_action_status: true,


            // 模型拖动状态,两种拖拽方式
            drag_status: 0,

            // 拖拽模型列表
            drag_objects: [],
            model_gui: null,
            child_view_gui: null,
            camera_gui: null,

            // 模型增加已经开启，加载可能尚未结束
            model_adding: false,

            // 视角相关
            camera_selected: '',
            camera_list: [],
            camera_info_list: {},

            // 与已选模型最近的接触模型
            in_nearest_model: '',
            // 当前被鼠标悬停的模型（子场景内）
            hoveron_model: '',

        }
    },
    mounted: function () {
        initThree(1);
        loadAutoScreen(camera, renderer);
        render();
        this.get_parent_views();
        this.timer = setInterval(this.update_data, 300);
        this.get_model_base();
        this.listen_action();
    },
    watch: {
        parent_view_selected() {
            this.get_camera_by_parent_view_id();
        },
        in_nearest_model(new_serilal, old_serilal) {
            if (new_serilal) {
                this.model_change_color(2, new_serilal);
                if (old_serilal) {
                    this.model_change_color(0, old_serilal);
                }
            }
            else {
                this.model_change_color(0, old_serilal);
            }
        },
        hoveron_model(new_serilal, old_serilal) {
            if (new_serilal) {
                this.model_change_color(1, new_serilal);
            }
            else {
                if (old_serilal != 0 && old_serilal == this.in_nearest_model) {
                    this.model_change_color(2, old_serilal);
                }
                else {
                    this.model_change_color(0, old_serilal);
                }

            }
        },
    },
    methods: {
        // 定时更新
        update_data: function () {
            // ——————————每次更新都执行
            if (this.loding_status && this.will_load_models_number != 0 && models_view_control_arguments['models_load_this_time_sum'] != 0) {
                if (this.will_load_models_number <= models_view_control_arguments['models_load_this_time_sum']) {
                    this.loding_status = false;
                    if (models_view_control_arguments['models_load_sum'] == models_view_control_arguments['models_load_this_time_sum']) {
                        history_push();
                    }
                }
                this.loding_percentage = parseInt(100 * (models_view_control_arguments['models_load_this_time_sum'] / this.will_load_models_number));
            }
            // 当child_view中有新模型加入时，更新至可拖动范围中
            if (this.model_adding && models_view_control_arguments['model_loaded_status'] && this.child_view_selected != '') {
                //添加完成
                try {
                    this.initDragControls()
                    models_view_control_arguments['model_loaded_status'] = false;
                    this.model_adding = false;
                }
                catch{
                    console.log("有空学习异步编程")
                }
            }
            // 前进一步，后退一步
            if (views_models_info_history.length > 1) {
                if (action_anchor > 0) {
                    this.cancle_action_status = false;
                }
                else {
                    this.cancle_action_status = true;
                }
                if ((views_models_info_history.length - 1 - action_anchor) > 0) {
                    this.redo_action_status = false;
                }
                else {
                    this.redo_action_status = true;
                }
            }
            // 同步camera_info和camera
            if(camera){
                camera_info.position.x=camera.position.x;
                camera_info.position.y=camera.position.y;
                camera_info.position.z=camera.position.z;
                camera_info.lookAt.x=controller.lookAt_point.x;
                camera_info.lookAt.y=controller.lookAt_point.y;
                camera_info.lookAt.z=controller.lookAt_point.z;
            }
            this.check_model_selected_vs_nearest_model();
            // ——————————每10次更新执行一次
            if (this.update_num % 10 == 0) {
                // 自动保存
                this.save_view(0)
            }
            // 更新定时计数器
            this.update_num += 1;
        },
        // 获取该用户可以加载的母场景
        get_parent_views: function () {
            hugo = this;
            this.$http.post(
                '/vmaker/get_parent_views/',
                {
                    owner_id: this.owner_id
                },
                { emulateJSON: true }
            ).then(function (res) {
                this.parent_views_list = [];
                res.body.views.forEach(view => {
                    this.parent_views_list.push({ value: view.id, label: view.parent_view_name });
                })

            });
        },
        // 获取可用的模型库
        get_model_base: function () {
            this.$http.post(
                '/vmaker/get_model_base/',
                {
                    owner_id: this.owner_id,
                },
                { emulateJSON: true }
            ).then(function (res) {
                res.body.model_base_own.forEach(base => {
                    this.base_list.push({ value: base.id, label: base.base_name });
                })
            });
        },
        // 用户修改母场景
        parent_view_change: function () {

        },
        // 创建母场景
        create_parent_view: function () {
            this.$prompt('输入场景名称（不能与现有场景名称重复）', '新建场景', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                // inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]/,
                // inputErrorMessage: '名称格式不正确'
            }).then(({ value }) => {
                this.$http.post(
                    '/vmaker/add_parent_view/',
                    {
                        view_name: value,
                        owner_id: this.owner_id
                    },
                    { emulateJSON: true }
                ).then(function (res) {
                    this.$message({
                        type: res.body.message_type,
                        duration: 3000,
                        message: res.body.message
                    });
                    if (res.body.message_type == 'success') {
                        this.parent_views_list.push({ value: res.body.new_parent_view_id, label: res.body.new_parent_view_name });
                    }
                    return res.body;
                });
            }).catch(e => e);

        },
        // 创建子场景
        create_child_view: function () {
            if (!this.parent_view_selected) {
                console.log('未选中母场景')
                return false;
            }
            this.$prompt('输入场景名称（不能与现有子场景名称重复）', '新建场景', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                // inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]/,
                // inputErrorMessage: '名称格式不正确'
            }).then(({ value }) => {
                this.$http.post(
                    '/vmaker/add_child_view/',
                    {
                        view_name: value,
                        parent_view_id: this.parent_view_selected
                    },
                    { emulateJSON: true }
                ).then(function (res) {
                    this.$message({
                        type: res.body.message_type,
                        duration: 3000,
                        message: res.body.message
                    });
                    if (res.body.message_type == 'success') {
                        this.child_view_list.push({ value: res.body.new_child_view_id, label: res.body.new_child_view_name });
                    }
                    this.load_child_view_model(res.body.new_child_view_id);
                    return res.body;
                });
            });

        },
        // 加载选中的母场景的所有模型
        load_parent_view: function () {
            if (this.parent_view_selected == '') {
                alert("没有选中任何场景")
                return false;
            }
            this.parent_views_list.forEach(p =>{
                if(p['value']==this.parent_view_selected){
                    this.parent_view_selected_name=p['label'];
                }
            })

            // 获取母场景模型的总数,赋值给will_load_models_number
            this.$http.post(
                '/vmaker/get_model_number_by_parent_view_id/',
                {
                    parent_view_id: this.parent_view_selected
                },
                { emulateJSON: true }
            ).then(function (res) {
                // 本次加载计数清零
                models_view_control_arguments.models_number_reset();
                this.will_load_models_number = res.body;
                if (this.will_load_models_number != 0) {
                    this.loding_status = true;
                }
            });

            this.$http.post(
                '/vmaker/get_child_view_by_parent_view_id/',
                {
                    parent_view_id: this.parent_view_selected
                },
                { emulateJSON: true }
            ).then(function (res) {
                res.body.child_view_id.forEach(child_view_id => {
                    this.load_child_view_model(child_view_id)
                })
            })
            this.get_child_views(this.parent_view_selected);
            this.parent_view_name_select_disable_status = true;
        },

        // 根据场景的ID加载所有子场景场景中的模型
        load_child_view_model: function (child_view_id) {
            let models_got_list = [];
            this.$http.post(
                '/vmaker/get_models_by_child_view/',
                {
                    child_view_id: child_view_id
                },
                { emulateJSON: true }
            ).then(function (res) {
                // console.log(res.body);
                res.body.models.forEach(model => {
                    let m_serial = model.serial;
                    views_models_info['models_info'][m_serial] = new Model(model.child_view_id, model.com_model_id, model.model_name, model.url, m_serial, model.materials_type);
                    views_models_info['models_info'][m_serial].change_po_x(model.position_x);
                    views_models_info['models_info'][m_serial].change_po_y(model.position_y)
                    views_models_info['models_info'][m_serial].change_po_z(model.position_z)
                    views_models_info['models_info'][m_serial].change_ro_x(model.rotation_x)
                    views_models_info['models_info'][m_serial].change_ro_y(model.rotation_y)
                    views_models_info['models_info'][m_serial].change_ro_z(model.rotation_z)
                    views_models_info['models_info'][m_serial].change_materials_color_r(model.materials_color_r)
                    views_models_info['models_info'][m_serial].change_materials_color_g(model.materials_color_g)
                    views_models_info['models_info'][m_serial].change_materials_color_b(model.materials_color_b)
                    views_models_info['models_info'][m_serial].change_metalness(model.metalness)
                    views_models_info['models_info'][m_serial].change_roughness(model.roughness)
                    views_models_info['models_info'][m_serial].change_emissive_r(model.emissive_r)
                    views_models_info['models_info'][m_serial].change_emissive_g(model.emissive_g)
                    views_models_info['models_info'][m_serial].change_emissive_b(model.emissive_b)
                    views_models_info['models_info'][m_serial].change_emissiveIntensity(model.emissiveIntensity)
                    views_models_info['models_info'][m_serial].change_reflectivity(model.reflectivity)
                    views_models_info['models_info'][m_serial].change_scale_x(model.scale_x)
                    views_models_info['models_info'][m_serial].change_scale_y(model.scale_y)
                    views_models_info['models_info'][m_serial].change_scale_z(model.scale_z)
                    initObject(m_serial);
                });
                views_models_info['views_info']['v' + child_view_id] = new ChildView(child_view_id)
                views_models_info['views_info']['v' + child_view_id].change_view_name(res.body.child_views.child_view_name)
                views_models_info['views_info']['v' + child_view_id].change_view_position_x(res.body.child_views.view_position_x)
                views_models_info['views_info']['v' + child_view_id].change_view_position_y(res.body.child_views.view_position_y)
                views_models_info['views_info']['v' + child_view_id].change_view_position_z(res.body.child_views.view_position_z)
            });

        },
        // 通过parent_view_id更新child_view列表
        get_child_views: function (parent_view_id) {
            this.$http.post(
                '/vmaker/get_child_views/',
                {
                    parent_view_id: parent_view_id,
                },
                { emulateJSON: true }
            ).then(function (res) {
                this.child_view_list = [];
                res.body.views.forEach(view => {
                    this.child_view_list.push({ value: view.id, label: view.child_view_name });
                })
            });
        },
        //更新子场景对应的模型列表
        update_child_view_models_list: function () {
            this.child_view_model_list = [];
            Object.keys(views_models_info['models_info']).forEach(key => {
                if (views_models_info['models_info'][key].view_id == this.child_view_selected) {
                    this.child_view_model_list.push({ value: views_models_info['models_info'][key].serial, label: views_models_info['models_info'][key].model_name + '(' + views_models_info['models_info'][key].serial + ')' })
                }
            });
            this.select_model_status = false;
            this.initDragControls();
        },
        select_model: function () {
            // drag_serial = this.model_selected;
            // 目标模型上出现十字光标
            transformControls.attach(models[this.model_selected].children[0]);
        },
        to_manage_models: function () {
            window.open('/vmaker/model_manage/');
        },
        get_model_by_model_base: function () {
            this.$http.post(
                '/vmaker/get_model_by_base_id/',
                {
                    model_base_id: this.model_base_selected
                },
                { emulateJSON: true }
            ).then(function (res) {
                this.model_in_base_list = [];
                res.body.models.forEach(model => {
                    // console.log(model)
                    this.model_in_base_list.push({ value: model.id, label: model.model_name });
                })
            });
        },
        select_model_in_model_base: function () {
            this.add_model_status = false;

        },
        // 向子场景中添加模型
        add_model: function () {
            // console.log(this.model_base_selected)
            models_view_control_arguments.models_number_reset();
            this.will_load_models_number = 1;
            this.loding_status = true;

            if (this.model_base_selected == '') {
                alert("请选择模型库")
                return false;
            }
            if (this.model_in_model_base_selected == '') {
                alert("请选择模型")
                return false;
            }
            if (this.model_in_model_base_selected != '') {
                this.$http.post(
                    '/vmaker/get_model_info_by_id/',
                    {
                        model_id: this.model_in_model_base_selected,
                    },
                    { emulateJSON: true }
                ).then(function (res) {
                    // console.log(res.body.model[0].model_name+'添加完成');
                    let model_id = res.body.model[0].id;
                    let model_name = res.body.model[0].model_name;
                    let url = res.body.model[0].url

                    unique_code = 'm' + Math.random().toString().substr(2, 5) + Date.now().toString();
                    views_models_info['models_info'][unique_code] = (new Model(this.child_view_selected, model_id, model_name, url, unique_code, 0));
                    this.child_view_model_list.push({ value: unique_code, label: model_name + '(' + unique_code + ')' })
                    // this.model_name='';
                    initObject(unique_code);
                }).then(function () {
                    history_push();
                    this.model_adding = true;
                })
            }
            else {
                alert('模型名称不能为空')
            }
        },
        view_display: function () {

        },
        save_view: function (save_type) {
            if (Object.keys(views_models_info['models_info']).length == 0) {
                // console.log("没有加载场景")
                return false;
            }
            // save_type 0自动
            if (save_type == 0) {
                let hashcode = JSON.stringify(views_models_info).hashCode();
                if (hashcode != this.views_models_info_hashcode) {
                    this.views_models_info_hashcode = hashcode;
                }
                else {
                    // console.log("没有修改")
                    return false;
                }
            }
            this.$http.post(
                '/vmaker/save_view/',
                {
                    views_models_info: JSON.stringify(views_models_info),
                    parent_view_id:this.parent_view_selected
                },
                { emulateJSON: true }
            ).then(function (res) {
                this.$message({
                    type: 'success',
                    duration: 1000,
                    position: 'top-left',
                    message: "保存完成"
                });
            });
        },
        initDragControls: function () {
            // console.log((Object.keys(models).length))
            // console.log(this.child_view_selected)
            let main = this;
            // 将当前选中的child_view模型初始化到模型列表中
            let models_to_control = [];
            Object.keys(views_models_info['models_info']).forEach(key => {
                if (views_models_info['models_info'][key].view_id == this.child_view_selected) {
                    models_to_control.push(models[key]);
                }
            })
            // console.log(models_to_control)

            // 添加平移控件
            if (!transformControls) {
                // scene.remove(transformControls);
                transformControls = new THREE.TransformControls(camera, renderer.domElement);
                scene.add(transformControls);
            }


            transformControls.addEventListener('mouseDown', (event) => {
                main.drag_status = 1;
                dragControls.enabled = false;
            });

            transformControls.addEventListener('mouseUp', (event) => {
                main.drag_status = 0;
                dragControls.enabled = true;
                update_modelsinfo(event.target.position.x, event.target.position.y, event.target.position.z)
                // main.drag_form_status=0;
            });
            // 过滤不是 Mesh 的物体,例如辅助网格
            main.drag_objects = [];
            for (let i = 0; i < models_to_control.length; i++) {
                // console.log(models[i].isObject3D)
                if (models_to_control[i].isObject3D) {
                    main.drag_objects.push(models_to_control[i].children[0]);
                }
            }
            // 当重新加载时，把之前的选择监听事件删除
            if (dragControls) {
                dragControls.enabled = false;
                dragControls.deactivate();
                scene.remove(dragControls);
            }
            // 初始化拖拽控件
            dragControls = new THREE.DragControls(main.drag_objects, camera, renderer.domElement);

            // 鼠标略过
            //  移上变色
            dragControls.addEventListener('hoveron', function (event) {
                // console.log(event)
                if (main.drag_status == 0) {
                    Object.keys(models).forEach(i => {
                        if (models[i]) {
                            if (event.object.id == models[i].children[0].id) {
                                main.hoveron_model = i;
                                // main.model_change_color(1,i);
                            }

                        }
                    });
                }
            });
            // 移出还原
            dragControls.addEventListener('hoveroff', function (event) {
                if (main.drag_status == 0) {

                    Object.keys(models).forEach(i => {
                        if (models[i] && event.object.id == models[i].children[0].id) {
                            main.hoveron_model = '';
                        }
                    });
                }

            });
            // 点击选中模型
            dragControls.addEventListener('dragstart', function (event) {
                // console.log(event)
                if (main.drag_status == 0) {
                    Object.keys(models).forEach(i => {
                        if (models[i] && event.object.id == models[i].children[0].id) {
                            timeStamp_out = Date.now();
                            main.model_selected = i;
                        }
                    });
                    transformControls.attach(event.object);
                    main.debug_model(main.model_selected);
                }
            });

            function update_modelsinfo(x, y, z) {
                let c_view_id = 'v' + views_models_info['models_info'][main.model_selected].view_id;
                // console.log(views_models_info['views_info'][].view_position_y)
                if (views_models_info['models_info'][main.model_selected]) {
                    views_models_info['models_info'][main.model_selected].change_po_x(x - views_models_info['views_info'][c_view_id].view_position_x);
                    views_models_info['models_info'][main.model_selected].change_po_y(y - views_models_info['views_info'][c_view_id].view_position_y);
                    views_models_info['models_info'][main.model_selected].change_po_z(z - views_models_info['views_info'][c_view_id].view_position_z);
                    history_push();
                    main.debug_model(main.model_selected);
                }
            }

        },
        // 调试相机参数
        // debug_camera: function () {
        //     if (this.camera_gui) {
        //         this.camera_gui.destroy();
        //     }
        //     this.camera_gui = new dat.GUI();
        //     this.camera_gui.width = 300;
        //     let controls = new function () {
        //         this.position_x = camera_info.position.x;
        //         this.position_y = camera_info.position.y;
        //         this.position_z = camera_info.position.z;

        //         this.up_x = camera_info.up.x;
        //         this.up_y = camera_info.up.y;
        //         this.up_z = camera_info.up.z;

        //         this.lookAt_x = camera_info.lookAt.x;
        //         this.lookAt_y = camera_info.lookAt.y;
        //         this.lookAt_z = camera_info.lookAt.z;
        //         this.change_position_x = function (x) {
        //             camera_info.change('position', 'x', x);
        //         }
        //         this.change_position_y = function (x) {
        //             camera_info.change('position', 'y', x);
        //         }
        //         this.change_position_z = function (x) {
        //             camera_info.change('position', 'z', x);
        //         }

        //         this.change_up_x = function (x) {
        //             camera_info.change('up', 'x', x);
        //         }
        //         this.change_up_y = function (x) {
        //             camera_info.change('up', 'y', x);
        //         }
        //         this.change_up_z = function (x) {
        //             camera_info.change('up', 'z', x);
        //         }

        //         this.change_lookAt_x = function (x) {
        //             camera_info.change('lookAt', 'x', x);
        //         }
        //         this.change_lookAt_y = function (x) {
        //             camera_info.change('lookAt', 'y', x);
        //         }
        //         this.change_lookAt_z = function (x) {
        //             camera_info.change('lookAt', 'z', x);
        //         }
        //     }
        //     this.camera_gui.add({ m: '' }, 'm').name('相机参数');
        //     this.camera_gui.add(controls, "position_x", -25000, 25000).name('位置-X').onChange(controls.change_position_x).onFinishChange(history_push);
        //     this.camera_gui.add(controls, "position_y", -25000, 25000).name('位置-X').onChange(controls.change_position_y).onFinishChange(history_push);
        //     this.camera_gui.add(controls, "position_z", -25000, 25000).name('位置-X').onChange(controls.change_position_z).onFinishChange(history_push);
        //     this.camera_gui.add(controls, "lookAt_x", -25000, 25000).name('lookAt-X').onChange(controls.change_lookAt_x).onFinishChange(history_push);
        //     this.camera_gui.add(controls, "lookAt_y", -25000, 25000).name('lookAt-X').onChange(controls.change_lookAt_y).onFinishChange(history_push);
        //     this.camera_gui.add(controls, "lookAt_z", -25000, 25000).name('lookAt-X').onChange(controls.change_lookAt_z).onFinishChange(history_push);

        // },
        // 调试场景参数
        debug_child_view: function () {
            let child_view_id = this.child_view_selected;
            let view_position_x = views_models_info['views_info']['v' + child_view_id].view_position_x;
            let view_position_y = views_models_info['views_info']['v' + child_view_id].view_position_y;
            let view_position_z = views_models_info['views_info']['v' + child_view_id].view_position_z;

            if (this.child_view_gui) {
                this.child_view_gui.destroy();
            }
            this.child_view_gui = new dat.GUI();
            this.child_view_gui.width = 300;
            let controls = new function () {
                this.all_mov_x = view_position_x;
                this.all_mov_x_last = 0;
                this.all_mov_y = view_position_y;
                this.all_mov_y_last = 0;
                this.all_mov_z = view_position_z;
                this.all_mov_z_last = 0;
                this.change_all_mov_x = function () {
                    if (!(isNaN(controls.all_mov_x))) {
                        views_models_info['views_info']['v' + child_view_id].change_view_position_x(controls.all_mov_x)
                    }
                };
                this.change_all_mov_y = function () {
                    if (!(isNaN(controls.all_mov_y))) {
                        views_models_info['views_info']['v' + child_view_id].change_view_position_y(controls.all_mov_y)
                    }
                };
                this.change_all_mov_z = function () {
                    if (!(isNaN(controls.all_mov_z))) {
                        views_models_info['views_info']['v' + child_view_id].change_view_position_z(controls.all_mov_z)
                    }
                };
            }
            this.child_view_gui.add({ m: views_models_info['views_info']['v' + child_view_id].child_view_name }, 'm').name('子场景名称');
            this.child_view_gui.add(controls, 'all_mov_x', -25000, 25000).name('整体位置-X').onChange(controls.change_all_mov_x).onFinishChange(history_push);
            this.child_view_gui.add(controls, 'all_mov_y', -25000, 25000).name('整体位置-Y').onChange(controls.change_all_mov_y).onFinishChange(history_push);
            this.child_view_gui.add(controls, 'all_mov_z', -25000, 25000).name('整体位置-Z').onChange(controls.change_all_mov_z).onFinishChange(history_push);
        },
        //调试模型参数
        debug_model: function (aim_serial = '') {
            this.destory_model_gui();
            this.create_model_gui();
            this.model_gui.width = 400;
            let serial = this.model_selected;
            if (aim_serial != '') {
                serial = aim_serial;
            }
            let controls = new function () {
                this.model_name = views_models_info['models_info'][serial].model_name;
                this.x = views_models_info['models_info'][serial].position_x;
                this.y = views_models_info['models_info'][serial].position_y;
                this.z = views_models_info['models_info'][serial].position_z;
                this.rx = views_models_info['models_info'][serial].rotation_x * (180 / Math.PI);
                this.ry = views_models_info['models_info'][serial].rotation_y * (180 / Math.PI);
                this.rz = views_models_info['models_info'][serial].rotation_z * (180 / Math.PI);
                this.scale_x = views_models_info['models_info'][serial].scale_x;
                this.scale_y = views_models_info['models_info'][serial].scale_y;
                this.scale_z = views_models_info['models_info'][serial].scale_z;
                ////材质金属性
                this.metalness = views_models_info['models_info'][serial].metalness;
                ////材质粗糙度（从镜面反射到漫反射）
                this.roughness = views_models_info['models_info'][serial].roughness;
                ////反光颜色                
                this.materials_color = [parseInt((views_models_info['models_info'][serial].materials_color_r * 255).toFixed(0)), parseInt((views_models_info['models_info'][serial].materials_color_g * 255).toFixed(0)), parseInt((views_models_info['models_info'][serial].materials_color_b * 255).toFixed(0))];
                this.materials_color_number = (views_models_info['models_info'][serial].materials_color_r * 255).toFixed(0) + ',' + (views_models_info['models_info'][serial].materials_color_g * 255).toFixed(0) + ',' + (views_models_info['models_info'][serial].materials_color_b * 255).toFixed(0);
                ////材质本身的颜色，与光线无关
                this.emissive_color = [parseInt((views_models_info['models_info'][serial].emissive_r * 255).toFixed(0)), parseInt((views_models_info['models_info'][serial].emissive_g * 255).toFixed(0)), parseInt((views_models_info['models_info'][serial].emissive_b * 255).toFixed(0))];
                this.emissive_color_number = (views_models_info['models_info'][serial].emissive_r * 255).toFixed(0) + ',' + (views_models_info['models_info'][serial].emissive_g * 255).toFixed(0) + ',' + (views_models_info['models_info'][serial].emissive_b * 255).toFixed(0);
                this.emissive_r = views_models_info['models_info'][serial].emissive_r;
                this.emissive_g = views_models_info['models_info'][serial].emissive_g;
                this.emissive_b = views_models_info['models_info'][serial].emissive_b;
                ////材质本身颜色的强度
                this.emissiveIntensity = views_models_info['models_info'][serial].emissiveIntensity;
                ////非金属材料的反射率。 当metalness为1.0时无效
                this.reflectivity = views_models_info['models_info'][serial].reflectivity;

                this.move_x = function () {
                    if (!(isNaN(controls.x))) {
                        views_models_info['models_info'][serial].change_po_x(controls.x)
                        transformControls.position.x = controls.x + views_models_info['views_info']['v' + views_models_info['models_info'][serial].view_id].view_position_x;
                    }
                };
                this.move_y = function () {
                    if (!(isNaN(controls.y))) {
                        views_models_info['models_info'][serial].change_po_y(controls.y)
                        transformControls.position.y = controls.y + views_models_info['views_info']['v' + views_models_info['models_info'][serial].view_id].view_position_y;
                    }
                };
                this.move_z = function () {
                    if (!(isNaN(controls.z))) {
                        views_models_info['models_info'][serial].change_po_z(controls.z)
                        transformControls.position.z = controls.z + views_models_info['views_info']['v' + views_models_info['models_info'][serial].view_id].view_position_z;
                    }
                };
                this.rotate_x = function () {
                    if (!(isNaN(controls.rx))) {
                        views_models_info['models_info'][serial].change_ro_x((Math.PI / 180) * controls.rx)
                    }
                };
                this.rotate_y = function () {
                    if (!(isNaN(controls.ry))) {
                        views_models_info['models_info'][serial].change_ro_y((Math.PI / 180) * controls.ry)
                    }
                };
                this.rotate_z = function () {
                    if (!(isNaN(controls.rz))) {
                        views_models_info['models_info'][serial].change_ro_z((Math.PI / 180) * controls.rz)
                    }
                };
                this.change_scale_x = function () {
                    if (!(isNaN(controls.scale_x))) {
                        views_models_info['models_info'][serial].change_scale_x(controls.scale_x);
                    }
                };
                this.change_scale_y = function () {
                    if (!(isNaN(controls.scale_y))) {
                        views_models_info['models_info'][serial].change_scale_y(controls.scale_y);
                    }
                };
                this.change_scale_z = function () {
                    if (!(isNaN(controls.scale_z))) {
                        views_models_info['models_info'][serial].change_scale_z(controls.scale_z);
                    }
                };
                this.change_materials_color = function () {
                    if (controls.materials_color.length == 7) {
                        views_models_info['models_info'][serial].change_materials_color_r(parseInt(controls.materials_color.substr(1, 2), 16) / 255);
                        views_models_info['models_info'][serial].change_materials_color_g(parseInt(controls.materials_color.substr(3, 2), 16) / 255);
                        views_models_info['models_info'][serial].change_materials_color_b(parseInt(controls.materials_color.substr(5, 2), 16) / 255);
                    }
                    else if (controls.materials_color.length == 3) {
                        views_models_info['models_info'][serial].change_materials_color_r(controls.materials_color[0] / 255);
                        views_models_info['models_info'][serial].change_materials_color_g(controls.materials_color[1] / 255);
                        views_models_info['models_info'][serial].change_materials_color_b(controls.materials_color[2] / 255);
                    }
                };
                this.change_materials_color_number = function () {
                    let color = controls.materials_color_number.split(',');
                    console.log(color);
                    if (color.length == 3 && !(isNaN(Number(color[0]))) && !(isNaN(Number(color[1]))) && !(isNaN(Number(color[2])))) {
                        views_models_info['models_info'][serial].change_materials_color_r(Number(color[0]) / 255);
                        views_models_info['models_info'][serial].change_materials_color_r(Number(color[1]) / 255);
                        views_models_info['models_info'][serial].change_materials_color_r(Number(color[2]) / 255);
                    }
                    else {
                        alert("色值输入格式必须为'R,G,B',其中R、G、B均为0~255之间的整数")
                        return false;
                    }
                };
                this.change_metalness = function () {
                    if (!(isNaN(controls.metalness))) {
                        views_models_info['models_info'][serial].change_metalness(controls.metalness);
                    }
                };
                this.change_roughness = function () {
                    if (!(isNaN(controls.roughness))) {
                        views_models_info['models_info'][serial].change_roughness(controls.roughness);
                    }
                };
                this.change_emissive_color = function () {

                    if (controls.emissive_color.length == 7) {
                        views_models_info['models_info'][serial].change_emissive_r(parseInt(controls.emissive_color.substr(1, 2), 16) / 255);
                        views_models_info['models_info'][serial].change_emissive_g(parseInt(controls.emissive_color.substr(3, 2), 16) / 255);
                        views_models_info['models_info'][serial].change_emissive_b(parseInt(controls.emissive_color.substr(5, 2), 16) / 255);

                    }
                    else if (controls.emissive_color.length == 3) {
                        views_models_info['models_info'][serial].change_emissive_r(controls.emissive_color[0] / 255);
                        views_models_info['models_info'][serial].change_emissive_g(controls.emissive_color[1] / 255);
                        views_models_info['models_info'][serial].change_emissive_b(controls.emissive_color[2] / 255);
                    }
                };
                this.change_emissive_color_number = function () {
                    let color = controls.emissive_color_number.split(',');
                    console.log(color);
                    if (color.length == 3 && !(isNaN(Number(color[0]))) && !(isNaN(Number(color[1]))) && !(isNaN(Number(color[2])))) {
                        views_models_info['models_info'][serial].change_emissive_r(Number(color[0]) / 255);
                        views_models_info['models_info'][serial].change_emissive_g(Number(color[1]) / 255);
                        views_models_info['models_info'][serial].change_emissive_b(Number(color[2]) / 255);
                    }
                    else {
                        alert("色值输入格式必须为'R,G,B',其中R、G、B均为0~255之间的整数")
                        return false;
                    }
                };
                this.change_emissiveIntensity = function () {
                    if (!(isNaN(controls.emissiveIntensity))) {
                        views_models_info['models_info'][serial].change_emissiveIntensity(controls.emissiveIntensity);
                    }

                };
                this.change_reflectivity = function () {
                    if (!(isNaN(controls.reflectivity))) {
                        views_models_info['models_info'][serial].change_reflectivity(controls.reflectivity);
                    }

                };
            }
            let f1 = this.model_gui;
            f1.add({ m: controls.model_name + '-' + serial }, 'm').name('模型名称');
            f1.add(controls, 'x', -5000, 5000).name('X轴移动').step(0.01).onChange(controls.move_x).onFinishChange(history_push);
            f1.add(controls, 'y', -5000, 5000).name('Y轴移动').step(0.01).onChange(controls.move_y).onFinishChange(history_push);
            f1.add(controls, 'z', -5000, 5000).name('Z轴移动').step(0.01).onChange(controls.move_z).onFinishChange(history_push);
            let f1_2 = f1.addFolder('旋转设置');
            f1_2.add(controls, 'rx', -180, 180).name('X轴旋转度数').onChange(controls.rotate_x).onFinishChange(history_push);
            f1_2.add(controls, 'ry', -180, 180).name('Y轴旋转度数').onChange(controls.rotate_y).onFinishChange(history_push);
            f1_2.add(controls, 'rz', -180, 180).name('Z轴旋转度数').onChange(controls.rotate_z).onFinishChange(history_push);
            let f1_3 = f1.addFolder('缩放设置');
            f1_3.add(controls, 'scale_x', 0, 10).name('X轴缩放比例').onChange(controls.change_scale_x).onFinishChange(history_push);
            f1_3.add(controls, 'scale_y', 0, 10).name('Y轴缩放比例').onChange(controls.change_scale_y).onFinishChange(history_push);
            f1_3.add(controls, 'scale_z', 0, 10).name('Z轴缩放比例').onChange(controls.change_scale_z).onFinishChange(history_push);
            let f1_4 = f1.addFolder('材质设置');
            f1_4.add(controls, 'metalness', 0, 1).name('金属质感').onChange(controls.change_metalness).onFinishChange(history_push);
            f1_4.add(controls, 'roughness', 0, 1).name('粗糙度').onChange(controls.change_roughness).onFinishChange(history_push);
            f1_4.add(controls, 'reflectivity', 0, 1).name('非金属反光度（金属质感=1时失效）').onChange(controls.change_reflectivity).onFinishChange(history_push);
            let f1_4_1 = f1_4.addFolder('反光颜色设置');
            f1_4_1.addColor(controls, 'materials_color').name('取色设置').onChange(controls.change_materials_color).onFinishChange(history_push);
            // f1_4_1.add(controls, 'materials_color_number').name('色值设置').onFinishChange(controls.change_materials_color_number).onFinishChange(history_push);
            let f1_4_2 = f1_4.addFolder('发光颜色设置');
            f1_4_2.addColor(controls, 'emissive_color').name('发光颜色').onChange(controls.change_emissive_color).onFinishChange(history_push);
            // f1_4_2.add(controls, 'emissive_color_number').name('色值设置').onFinishChange(controls.change_emissive_color_number).onFinishChange(history_push);
            f1_4_2.add(controls, 'emissiveIntensity', 0, 1).step(0.01).name('发光材质不透明度').onChange(controls.change_emissiveIntensity).onFinishChange(history_push);
        },
        // 销毁当前的model_gui,如果当前没有model_gui,则什么都不会发生
        destory_model_gui() {
            if (this.model_gui && !this.model_gui.destoryed) {
                this.model_gui.destroy();
                this.model_gui.destoryed = true;
            }
        },
        // 创建新的model_gui
        create_model_gui() {
            if (this.model_gui && !this.model_gui.destoryed) {
                console.log("已经有了model_gui")
                return false;
            }
            this.model_gui = new dat.GUI();
            this.model_gui.destoryed = false;
        },
        cancle_action: function () {
            if (action_anchor <= 0) {
                this.cancle_action_status = true;
                return false;
            }
            action_anchor = action_anchor - 1;
            this.update_models_info_by_action_anchor(action_anchor);
            this.transformControls_foucs_model_selected();
        },
        redo_action: function () {
            if (action_anchor >= views_models_info_history.length - 1) {
                this.redo_action_status = true;
                return false;
            }
            action_anchor = action_anchor + 1;
            this.update_models_info_by_action_anchor(action_anchor);
            this.transformControls_foucs_model_selected();
        },
        update_models_info_by_action_anchor: function (anchor) {
            // console.log("更改设置")
            Object.keys(views_models_info['models_info']).forEach(i => {
                views_models_info['models_info'][i].change_po_x(views_models_info_history[anchor]['models_info'][i].position_x)
                views_models_info['models_info'][i].change_po_y(views_models_info_history[anchor]['models_info'][i].position_y)
                views_models_info['models_info'][i].change_po_z(views_models_info_history[anchor]['models_info'][i].position_z)
                views_models_info['models_info'][i].change_ro_x(views_models_info_history[anchor]['models_info'][i].rotation_x)
                views_models_info['models_info'][i].change_ro_y(views_models_info_history[anchor]['models_info'][i].rotation_y)
                views_models_info['models_info'][i].change_ro_z(views_models_info_history[anchor]['models_info'][i].rotation_z)
                views_models_info['models_info'][i].change_scale_x(views_models_info_history[anchor]['models_info'][i].scale_x)
                views_models_info['models_info'][i].change_scale_y(views_models_info_history[anchor]['models_info'][i].scale_y)
                views_models_info['models_info'][i].change_scale_z(views_models_info_history[anchor]['models_info'][i].scale_z)
                views_models_info['models_info'][i].change_materials_color_r(views_models_info_history[anchor]['models_info'][i].materials_color_r)
                views_models_info['models_info'][i].change_materials_color_g(views_models_info_history[anchor]['models_info'][i].materials_color_g)
                views_models_info['models_info'][i].change_materials_color_b(views_models_info_history[anchor]['models_info'][i].materials_color_b)
                views_models_info['models_info'][i].change_metalness(views_models_info_history[anchor]['models_info'][i].metalness)
                views_models_info['models_info'][i].change_roughness(views_models_info_history[anchor]['models_info'][i].roughness)
                views_models_info['models_info'][i].change_emissive_r(views_models_info_history[anchor]['models_info'][i].emissive_r)
                views_models_info['models_info'][i].change_emissive_g(views_models_info_history[anchor]['models_info'][i].emissive_g)
                views_models_info['models_info'][i].change_emissive_b(views_models_info_history[anchor]['models_info'][i].emissive_b)
                views_models_info['models_info'][i].change_emissiveIntensity(views_models_info_history[anchor]['models_info'][i].emissiveIntensity)
                views_models_info['models_info'][i].change_reflectivity(views_models_info_history[anchor]['models_info'][i].reflectivity)
            });
        },
        delete_model_confirm: function () {
            this.$confirm('删除模型的操作不能撤销, 是否继续?', '删除模型', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.delete_model(this.model_selected);
                this.$message({
                    type: 'success',
                    message: '删除成功!'
                });
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        delete_model: function (serial) {
            if (serial && views_models_info['models_info'][serial] && models[serial]) {
                delete views_models_info['models_info'][serial];
                scene.remove(models[serial]);
                delete models[serial];
                console.log('删除')
            }
            if (transformControls) {
                transformControls.detach();
            }
            this.destory_model_gui();
            this.child_view_model_list.forEach(function (item, index, arr) {
                if (item.value == serial) {
                    arr.splice(index, 1);
                }
            });
            this.$http.post(
                '/vmaker/delete_model_conf_by_serial/',
                {
                    serial: serial
                },
                { emulateJSON: true }
            ).then(function (res) {
                console.log(res.body)
            })
        },
        // 让选择十字光标位于当前被选中的模型中心
        transformControls_foucs_model_selected: function () {
            if (models[this.model_selected]) {
                transformControls.attach(models[this.model_selected].children[0])
            }
        },
        // 取消模型选中
        cancle_model_selected: function () {
            transformControls.detach();
            this.destory_model_gui();
            let m = this.model_selected;
            this.model_selected = '';
            return m;
        },
        // 监听键盘
        listen_action: function () {
            let self = this;
            this.$nextTick(function () {
                document.addEventListener('keyup', function (e) {
                    //esc键
                    if (e.keyCode == 27) {
                        self.cancle_model_selected();
                    }
                })
            });
        },
        save_camera: function () {
            this.$prompt('输入视野名称（不能与现有视野名称重复）', '保存当前视野', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                // inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]/,
                // inputErrorMessage: '名称格式不正确'
            }).then(({ value }) => {
                this.$http.post(
                    '/vmaker/create_camera/',
                    {
                        camera_info: JSON.stringify(camera_info),
                        parent_view_id: this.parent_view_selected,
                        camera_name: value
                    },
                    { emulateJSON: true }
                ).then(function (res) {
                    this.get_camera_by_parent_view_id();
                });
            });
        },
        select_camera: function () {
            if (this.camera_selected) {
                let o = ['position', 'up', 'lookAt'];
                let axis = ['x', 'y', 'z'];
                o.forEach(o_key => {
                    axis.forEach(a_key => {
                        camera_info.change(o_key, a_key, this.camera_info_list['c' + this.camera_selected][o_key][a_key])
                    })
                });
                //更新controller，让场景移动连续
                controller.target = new THREE.Vector3(camera_info.lookAt.x, camera_info.lookAt.y, camera_info.lookAt.z);
                controller.position0 = new THREE.Vector3(camera_info.position.x, camera_info.position.y, camera_info.position.z);
            }
        },
        // 根据parent_view_id取回所有的视角
        get_camera_by_parent_view_id: function () {
            this.$http.post(
                '/vmaker/get_cameras_by_parent_view_id/',
                {
                    parent_view_id: this.parent_view_selected
                },
                { emulateJSON: true }
            ).then(function (res) {
                this.camera_info_list = {};
                this.camera_list = [];
                let cs = res.body.cameras;
                cs.forEach(c => {
                    this.camera_info_list['c' + c['id']] = c;
                    this.camera_list.push({ value: c.id, label: c.camera_name });
                })
            })
        },
        // 检测当前模型与最近的模型的关系
        check_model_selected_vs_nearest_model: function () {
            if (!models || !this.model_selected) {
                if (this.in_nearest_model) {
                    // console.log("被释放"+this.in_nearest_model)
                    this.model_change_color(0, this.in_nearest_model)
                    this.in_nearest_model = '';
                }
                return false;
            }
            let serial = this.model_selected;
            let serial_nearest = '';
            let x_in_list = [];
            let y_in_list = [];
            let in_list = [];
            let m = '';
            let distance = -1;
            Object.keys(models).forEach(key => {
                if (key != serial && !models[key].children[0].rotation.x && !models[key].children[0].rotation.y && !models[key].children[0].rotation.z) {
                    let h1 = models[key].children[0].geometry.boundingBox.max.x - models[serial].children[0].geometry.boundingBox.min.x;
                    let h2 = Math.abs(models[key].children[0].position.x - models[serial].children[0].position.x);
                    if (h2 < h1) {
                        x_in_list.push(key);
                    }
                }
            });
            x_in_list.forEach(key => {
                if (key != serial && !models[key].children[0].rotation.x && !models[key].children[0].rotation.y && !models[key].children[0].rotation.z) {
                    let h1 = models[key].children[0].geometry.boundingBox.max.y - models[serial].children[0].geometry.boundingBox.min.y;
                    let h2 = Math.abs(models[key].children[0].position.y - models[serial].children[0].position.y);
                    if (h2 < h1) {
                        y_in_list.push(key);
                    }
                }
            });
            y_in_list.forEach(key => {
                if (key != serial && !models[key].children[0].rotation.x && !models[key].children[0].rotation.y && !models[key].children[0].rotation.z) {
                    let h1 = models[key].children[0].geometry.boundingBox.max.z - models[serial].children[0].geometry.boundingBox.min.z;
                    let h2 = Math.abs(models[key].children[0].position.z - models[serial].children[0].position.z);
                    if (h2 < h1) {
                        in_list.push(key);
                    }
                }
            });
            Object.keys(models).forEach(key => {
                if (key != serial && (models[key].children[0].rotation.x || models[key].children[0].rotation.y || models[key].children[0].rotation.z)) {
                    let h1 = Math.pow((models[key].children[0].geometry.boundingSphere.radius + models[serial].children[0].geometry.boundingSphere.radius), 2);
                    let h2 = Math.pow((models[key].children[0].position.x - models[serial].children[0].position.x), 2) + Math.pow((models[key].children[0].position.y - models[serial].children[0].position.y), 2) + Math.pow((models[key].children[0].position.z - models[serial].children[0].position.z), 2);
                    if (h1 > h2) {
                        in_list.push(key);
                    }
                }
            })
            in_list.forEach(key => {
                let d = Math.pow((models[key].children[0].position.x - models[serial].children[0].position.x), 2) + Math.pow((models[key].children[0].position.y - models[serial].children[0].position.y), 2) + Math.pow((models[key].children[0].position.z - models[serial].children[0].position.z), 2)
                if (d < distance || distance == -1) {
                    distance = d;
                    m = key;
                }
            });
            if (m) {
                this.in_nearest_model = m;
            }
            else {
                if (this.in_nearest_model) {
                    // console.log("被释放"+this.in_nearest_model)
                    // this.model_change_color(0,this.in_nearest_model)
                    this.in_nearest_model = '';
                }
            }
        },
        // A模型与B模型中心重合
        model_center_equal: function (serial_1, serial_2) {
            views_models_info['models_info'][serial_1].change_po_x(views_models_info['models_info'][serial_2].position_x);
            views_models_info['models_info'][serial_1].change_po_y(views_models_info['models_info'][serial_2].position_y);
            views_models_info['models_info'][serial_1].change_po_z(views_models_info['models_info'][serial_2].position_z);
            this.transformControls_foucs_model_selected();
            history_push();
        },
        // 模型选中变色
        model_change_color: function (x, i) {
            switch (x) {
                // 被选中
                case 1:
                    models[i].children[0].material.metalness = 0.4;
                    models[i].children[0].material.roughness = 1;
                    models[i].children[0].material.emissive.r = 0;
                    models[i].children[0].material.emissive.g = 0;
                    models[i].children[0].material.emissive.b = 1;
                    models[i].children[0].material.color.r = 1;
                    models[i].children[0].material.color.g = 1;
                    models[i].children[0].material.color.b = 1;
                    models[i].children[0].material.emissiveIntensity = 1;
                    break;
                //与已选模型最近的接触模型
                case 2:
                    models[i].children[0].material.metalness = 0.4;
                    models[i].children[0].material.roughness = 1;
                    models[i].children[0].material.emissive.r = 1;
                    models[i].children[0].material.emissive.g = 0;
                    models[i].children[0].material.emissive.b = 0;
                    models[i].children[0].material.color.r = 1;
                    models[i].children[0].material.color.g = 0.5;
                    models[i].children[0].material.color.b = 0.5;
                    models[i].children[0].material.emissiveIntensity = 1;
                    break;
                // 还原
                case 0:
                    models[i].children[0].material.emissive.r = views_models_info['models_info'][i].emissive_r;
                    models[i].children[0].material.emissive.g = views_models_info['models_info'][i].emissive_g;
                    models[i].children[0].material.emissive.b = views_models_info['models_info'][i].emissive_b;
                    models[i].children[0].material.color.r = views_models_info['models_info'][i].materials_color_r;
                    models[i].children[0].material.color.g = views_models_info['models_info'][i].materials_color_g;
                    models[i].children[0].material.color.b = views_models_info['models_info'][i].materials_color_b;
                    models[i].children[0].material.metalness = views_models_info['models_info'][i].metalness;
                    models[i].children[0].material.roughness = views_models_info['models_info'][i].roughness;
                    models[i].children[0].material.emissiveIntensity = views_models_info['models_info'][i].emissiveIntensity;
                    break;
            }

        },

    },
}
let Ctor = Vue.extend(Main)
new Ctor().$mount('#app')
