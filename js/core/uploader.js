class uploader {
    parent_op = null

    upload_count = 0;
    upload_queue_id = 0
    upload_queue_file = []
    upload_processing = 0
    single_file_size = 50 * 1024 * 1024 * 1024

    upload_progressbar_counter_total = []
    upload_progressbar_counter_loaded = []
    upload_progressbar_counter_count = []
    upload_progressbar_counter = []
    upload_s2_status = []

    init(parent_op) {
        this.parent_op = parent_op;
    }

    upload_queue_clean() {
        $('.upload_file_ok').remove();
        if (this.upload_queue_file.length > 0) {
            for (let x in this.upload_queue_file) {
                $('#uq_' + id).remove();
            }
            this.upload_queue_file = [];
        }
    }

    upload_cli() {
        if (this.parent_op.logined === 1) {
            $('#uploadCliModal').modal('show');
            $('#upload_cli_token').html(this.parent_op.api_token);
        } else {
            this.parent_op.alert(this.parent_op.languageData.status_need_login);
            app.open('/login');
        }
    }

    open(mr_id) {
        if (!this.parent_op.logined) {
            this.parent_op.alert(this.parent_op.languageData.status_need_login);
            return false;
        }

        if (mr_id == 0) {
            $('#dirsToUpload').hide();
            $('#dirsToUpload_label').hide();
        }

        // this.upload_model_selected(Number(this.upload_model_selected_val));

        $('#upload_mr_id').val(mr_id);

        //如果可用的私有空间不足，则隐藏选项
        if (this.storage_used >= this.storage) {
            $('.storage_needs').hide();
        }

        $('#uploadModal').modal('show');
    }

    upload_start() {
        if (this.upload_processing == 1) {
            return false;
        }
        if (this.upload_queue_file.length > 0) {
            let f = this.upload_queue_file.shift();
            if (typeof f === 'object') {
                this.upload_processing = 1;
                this.upload_core(f, f.is_dir);
            }
        }
    }

    upload_queue_remove(id) {
        // delete this.upload_queue_file[id];
        // this.upload_queue_file.length--;
        $('#uq_' + id).hide();
    }

    upload_model_get() {
        return $("#upload_model").val();
    }

    upload_mrid_get() {
        return $("#upload_mr_id").val();
    }

    upload_core(file_res, is_dir) {
        $('#nav_upload_btn').html('<i class="fa-fw fad fa-spinner-third fa-spin"></i>');
        let file = file_res.file;
        let id = file_res.id;
        let model = this.upload_model_get();
        if (file.size > this.single_file_size) {
            this.parent_op.alert(this.parent_op.languageData.upload_limit_size);
            $('#uq_' + id).fadeOut();
            return false;
        }
        // if (this.parent_op.logined === false) {
        //     this.parent_op.alert(this.parent_op.languageData.upload_model99_needs_login);
        //     $('#uq_' + id).fadeOut();
        //     return false;
        // }
        // if (this.storage == 0) {
        //     this.parent_op.alert(this.parent_op.languageData.upload_buy_storage);
        //     $('#uq_' + id).fadeOut();
        //     return false;
        // }
        if (file.size > (this.storage - this.storage_used) && (model == 99)) {
            this.parent_op.alert(this.parent_op.languageData.upload_fail_storage);
            $('#uq_' + id).fadeOut();
            return false;
        }
        $('#uq_delete_' + id).hide();
        $('#uqnn_' + id).html(this.parent_op.languageData.upload_upload_prepare);
        this.upload_prepare(file, id, (f, sha1, id) => {
            //如果sha1不等于0，则调用另外的接口直接发送文件名信息。
            let filename = is_dir ? file.webkitRelativePath : file.name;
            if (sha1 !== 0) {
                $.post(this.parent_op.api_file, {
                    'sha1': sha1,
                    'filename': filename,
                    'model': this.upload_model_get(),
                    'mr_id': this.upload_mrid_get(),
                    'action': 'prepare_v4',
                    'token': this.parent_op.api_token
                }, (rsp) => {
                    if (rsp.status === 1) {
                        this.upload_final(rsp, file, id);
                        this.upload_processing = 0;
                        this.upload_start();
                    } else {
                        this.upload_worker(f, id, filename);
                    }
                }, 'json');
            } else {
                this.upload_worker(f, id);
            }
        });
    }

    model_selected(model) {
        console.log('upload::model::' + model);

        //检查账号是否有足够可用的空间
        if (model == 99) {
            if (this.storage_used >= this.storage) {
                alert('私有空间已经用完，请考虑购买私有空间扩展包。');
                return false;
            }
        }

        switch (model) {
            case 0:
                $('#seleted_model').html(this.parent_op.languageData.modal_settings_upload_model1);
                $('#upload_model').val(0);
                break;
            case 1:
                $('#seleted_model').html(this.parent_op.languageData.modal_settings_upload_model2);
                $('#upload_model').val(1);
                break;
            case 2:
                $('#seleted_model').html(this.parent_op.languageData.modal_settings_upload_model3);
                $('#upload_model').val(2);
                break;
            case 3:
                $('#seleted_model').html(this.parent_op.languageData.modal_settings_upload_model4);
                $('#upload_model').val(3);
                break;
            case 99:
                $('#seleted_model').html(this.parent_op.languageData.modal_settings_upload_model99);
                $('#upload_model').val(99);
                break;
        }
        $('#select_model_list').hide();
        $('#upload_select_file').show();
        $('#selected_model_box').show();
        localStorage.setItem('app_upload_model', model);
    }

    model_reset() {
        $('#select_model_list').show();
        $('#upload_select_file').hide();
        $('#selected_model_box').hide();
    }


    upload_prepare(file, id, callback) {
        //不支持FileReader，直接下一步。
        if (!window.FileReader) {
            callback(file, 0, id);
            return false;
        }
        //支持FileReader，计算sha1再进行下一步
        var reader = new FileReader();
        reader.onload = (event) => {
            var file_sha1 = sha1(event.target.result);
            callback(file, file_sha1, id);
        };
        reader.readAsArrayBuffer(file.slice(0, (1024 * 1024 * 32)));
    }

    upload_worker(file, id, filename) {
        this.parent_op.recaptcha_do('upload_request_select', (captcha) => {
            $.post(this.parent_op.api_url_upload, {
                'token': this.parent_op.api_token,
                'action': 'upload_request_select',
                'filesize': file.size,
                'captcha': captcha,
                'sync': '1'
            }, (rsp) => {
                if (rsp.status == 1) {
                    var fd = new FormData();
                    fd.append("file", file);
                    fd.append("filename", filename);
                    fd.append("utoken", rsp.data.utoken);
                    fd.append("model", this.upload_model_get());
                    fd.append("mr_id", this.upload_mrid_get());
                    fd.append("token", this.parent_op.api_token);
                    this.upload_s2_status[id] = 0;
                    var xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener("progress", (evt) => {
                        this.upload_progress(evt, id)
                    }, false);
                    xhr.addEventListener("load", (evt) => {
                        this.upload_complete(evt, file, id)
                    }, false);
                    xhr.addEventListener("error", (evt) => {
                        //add retry
                        if (this.download_retry < this.download_retry_max) {
                            this.download_retry++;
                            setTimeout(() => {
                                this.upload_worker(file, id, filename);
                            }, 1000);
                        } else {
                            this.download_retry = 0;
                            this.upload_failed(evt, id);
                        }
                    }, false);
                    xhr.addEventListener("abort", (evt) => {
                        this.upload_canceled(evt, id)
                    }, false);
                    xhr.open("POST", rsp.data.uploader);
                    xhr.send(fd);
                } else {
                    //无法获得可用的上传服务器
                    this.parent_op.alert('上传失败，无法获得可用的服务器。');
                }
            });
        });
    }

    upload_progressbar_draw(id) {
        let speed = this.upload_progressbar_counter_count[id];
        let left_time = formatTime(Math.ceil((this.upload_progressbar_counter_total[id] - this.upload_progressbar_counter_loaded[id]) / speed));
        let msg = bytetoconver(this.upload_progressbar_counter_loaded[id], true) + ' / ' + bytetoconver(this.upload_progressbar_counter_total[id], true);
        let uqmid = "#uqm_" + id;
        let uqpid = "#uqp_" + id;
        msg += ' | ' + bytetoconver(speed, true) + '/s | ' + left_time;
        $(uqmid).html(msg);
        var percentComplete = Math.round(this.upload_progressbar_counter_loaded[id] * 100 / this.upload_progressbar_counter_total[id]);
        $(uqpid).css('width', percentComplete + '%');
        this.upload_s2_status[id] = this.upload_progressbar_counter_loaded[id];
        this.upload_progressbar_counter_count[id] = 0;
        //更新上传按钮的速度指示器
        $('.upload_speed').show();
        $('.upload_speed').html(bytetoconver(speed, true) + '/s');

    }

    selected(dom) {
        let file = document.getElementById('fileToUpload').files;
        let f = null;
        if (file.length > 0) {
            for (let x in file) {
                f = file[x];
                if (typeof f !== 'object') {
                    continue;
                }
                if (f.size !== 0) {
                    this.upload_queue_add({
                        file: f,
                        is_dir: false
                    });
                }
            }
        }

        //清空文件选择框
        dom.value = '';
    }

    dir_selected(e) {
        let file = document.getElementById('dirsToUpload').files;
        let f = null;
        if (file.length > 0) {
            for (let x in file) {
                f = file[x];
                if (typeof f !== 'object') {
                    continue;
                }
                if (f.size !== 0) {
                    this.upload_queue_add({
                        file: f,
                        is_dir: true
                    });
                }
            }
        }
        //清空文件选择框
        dom.value = '';
    }


    drop(e) {
        e.preventDefault();
        var fileList = e.dataTransfer.files;
        //files
        if (fileList.length == 0) {
            return false;
        }
        for (let x in fileList) {
            if (typeof fileList[x] === 'object') {
                setTimeout(() => {
                    this.upload_queue_add({
                        file: fileList[x],
                        is_dir: false
                    });
                }, 500);
            }
        }

        if (this.upload_processing == 0) {
            this.upload_start();
        }
    }

    upload_queue_add(f) {
        setTimeout(() => {
            f.id = this.upload_queue_id;
            this.upload_queue_file.push(f);
            let file = f.file;

            //如果未登录，添加队列到首页
            let target = this.parent_op.isLogin() ? '#uploaded_file_box' : '#upload_index_box';
            $(target).append(app.tpl('upload_list_wait_tpl', {
                name: file.name,
                size: bytetoconver(file.size, true),
                id: this.upload_queue_id
            }));
            $(target).show();
            this.upload_queue_id++;
            //更新状态
            this.upload_btn_status_update();
            //自动启动上传
            this.upload_start();
        }, 500, f);
    }

    upload_btn_status_update() {
        //更新队列数
        $('.upload_queue').fadeIn();
        $('.upload_queue').html(this.upload_queue_file.length);
        //更新已完成📖
        $('.upload_count').fadeIn();
        $('.upload_count').html(this.upload_count);
    }

    upload_progress(evt, id) {
        if (evt.lengthComputable) {
            if (evt.total === evt.loaded) {
                $('#uqnn_' + id).html(this.parent_op.languageData.upload_sync);
                $('#uqp_' + id).css('width', '100%');
                $('#uqp_' + id).addClass('progress-bar-striped');
                $('#uqp_' + id).addClass('progress-bar-animated');
                $('#uqm_' + id).fadeOut();
                clearInterval(this.upload_progressbar_counter[id]);
                //移除按钮上的速度指示器
                $('.upload_speed').hide();
                this.upload_progressbar_counter[id] = null;
                //执行下一个上传
                // delete this.upload_queue_file[id];
                // this.upload_queue_file.length--;
                this.upload_processing = 0;
                this.upload_start();
            } else {
                //
                $('#uqnn_' + id).html(this.parent_op.languageData.upload_sync);
                this.upload_progressbar_counter_count[id] += evt.loaded - this.upload_s2_status[id];
                this.upload_s2_status[id] = evt.loaded;
                //
                this.upload_progressbar_counter_total[id] = evt.total;
                this.upload_progressbar_counter_loaded[id] = evt.loaded;
                //检查进度条是否运行
                if (this.upload_progressbar_counter[id] === undefined) {
                    this.upload_progressbar_counter[id] = setInterval(() => {
                        this.upload_progressbar_draw(id);
                    }, 1000);
                }
            }
        }
    }

    upload_complete(evt, file, id) {
        this.download_retry = 0;
        clearInterval(this.upload_progressbar_counter[id]);
        this.upload_progressbar_counter[id] = null;
        var data = JSON.parse(evt.target.responseText);
        this.upload_final(data, file, id);
    }

    upload_failed(evt, id) {
        clearInterval(this.upload_progressbar_counter[id]);
        this.upload_progressbar_counter[id] = null;
        this.parent_op.alert(this.parent_op.languageData.upload_fail);
        $('#uq_' + id).fadeOut();
        this.upload_processing = 0;
        this.upload_start();
    }

    upload_canceled(evt, id) {
        clearInterval(this.upload_progressbar_counter[id]);
        this.upload_progressbar_counter[id] = null;
        this.parent_op.alert(this.parent_op.languageData.upload_cancel);
        $('#uq_' + id).fadeOut();
        this.upload_processing = 0;
        this.upload_start();
    }

    upload_final(rsp, file, id) {
        //$('#nav_upload_btn').html(this.parent_op.languageData.nav_upload);
        if (rsp.status === 1) {
            $('#uqnn_' + id).html(this.parent_op.languageData.upload_ok);

            //如果未登录状态下上传，则不隐藏上传完成后的信息
            if (this.parent_op.isLogin()) {
                setTimeout(() => {
                    $('#uq_' + id).hide();
                }, 3000);
                if (get_page_mrid() != undefined && this.upload_queue_file.length == 0) {
                    this.parent_op.room_list();
                }
                if (get_page_mrid() == undefined && this.upload_queue_file.length == 0) {
                    this.parent_op.workspace_filelist(0);
                }
                this.upload_btn_status_update();
            } else {
                $('#uq_' + id).hide();
                $('#upload_index_box').append(app.tpl('upload_list_ok_tpl', {
                    name: file.name,
                    size: bytetoconver(file.size, true),
                    ukey: rsp.data.ukey
                }));
                this.parent_op.btn_copy_bind();
            }

            // $('#uploaded_file_box').append(app.tpl('upload_list_ok_tpl', {
            //     name: file.name,
            //     size: bytetoconver(file.size, true),
            //     ukey: rsp.data.ukey
            // }));
            //this.btn_copy_bind();
        } else {
            $('#uqnn_' + id).html(`<span class="text-red">${this.parent_op.languageData.upload_fail}</span>`);
        }
        
        // this.upload_processing = 0;
        // this.upload_start();
        //更新上传统计
        this.upload_count++;
    }
}