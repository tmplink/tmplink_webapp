class download {
    parent_op = null
    download_queue = []
    download_queue_processing = false
    download_retry = 0
    download_retry_max = 10

    init(parent_op) {
        this.parent_op = parent_op;
    }

    // 启动单个文件下载
    single_start(url, filename) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("progress", (evt) => {
            this.single_progress_on(evt, filename);
        }, false);
        xhr.addEventListener("error", (evt) => {
            if (this.download_retry < this.download_retry_max) {
                this.download_retry++;
                setTimeout(() => {
                    this.single_start(url, filename);
                }, 3000);
            } else {
                this.parent_op.alert(app.languageData.download_error_retry);
                this.single_reset();
                this.download_retry = 0;
            }
        }, false);
        xhr.addEventListener("timeout", (evt) => {
            if (this.download_retry < this.download_retry_max) {
                this.download_retry++;
                setTimeout(() => {
                    this.single_start(url, filename);
                }, 3000);
            } else {
                this.parent_op.alert(app.languageData.download_error_retry);
                this.single_reset();
                this.download_retry = 0;
            }
        }, false);
        xhr.addEventListener("abort", (evt) => {
            this.parent_op.alert(app.languageData.download_error_abort);
            this.single_reset();
        }, false);
        xhr.open("GET", url);
        xhr.onload = () => {
            this.single_complete(xhr, filename);
        };
        xhr.responseType = 'blob';
        xhr.send();
        $('.single_download_msg').html(app.languageData.download_preparing);
        $('.single_download_progress_bar').show();
        $('#btn_quick_download').attr('disabled', true);
    }

    // 单个文件下载完成处理
    single_complete(evt, filename) {
        this.download_retry = 0;
        let blob = new Blob([evt.response], {
            type: evt.response.type
        });
        if (window.navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(link.href);
        }
        $('.single_download_msg').html(app.languageData.download_complete);
        $('.single_download_progress_bar_set').removeClass('progress-bar-animated');
        $('.single_download_progress_bar_set').removeClass('progress-bar-striped');
        this.single_reset();
        this.queue_run();
    }

    // 单个文件下载进度更新
    single_progress_on(evt) {
        $('.single_download_msg').html(app.languageData.download_progress + ' ' + bytetoconver(evt.loaded, true));
        $('.single_download_progress_bar_set').css('width', (evt.loaded / evt.total) * 100 + '%');
        $('.single_download_progress_bar_set').addClass('progress-bar-animated');
        $('.single_download_progress_bar_set').addClass('progress-bar-striped');
    }

    // 重置单个文件下载状态
    single_reset() {
        $('#btn_quick_download').removeAttr('disabled');
    }

    // 添加到下载队列
    queue_add(url, filename, ukey, filesize, filetype) {
        this.download_queue[ukey] = [url, filename, ukey, ukey];
    }

    // 从队列中删除下载项
    queue_del(index) {
        delete this.download_queue[index];
        this.queue_run();
    }

    // 启动队列下载
    queue_start() {
        this.queue_run();
    }

    // 运行下载队列
    queue_run() {
        if (this.download_queue_processing) {
            return false;
        }
        for (let x in this.download_queue) {
            let data = this.download_queue[x];
            if (data !== undefined) {
                this.download_queue_processing = true;
                this.queue_progress_start(data[0], data[1], data[2], data[3]);
                return true;
            }
        }
        $('#download_queue').fadeOut();
    }

    // 开始下载队列中的文件
    queue_progress_start(url, filename, id, index) {
        $('.download_progress_bar_' + index).show();
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("progress", (evt) => {
            this.progress_on(evt, id, filename, index);
        }, false);
        xhr.addEventListener("load", (evt) => {
            delete this.download_queue[index];
            this.queue_start();
        }, false);
        xhr.addEventListener("timeout", (evt) => {
            if (this.download_retry < this.download_retry_max) {
                this.download_retry++;
                setTimeout(() => {
                    this.queue_progress_start(url, filename, id, index);
                }, 3000);
            } else {
                delete this.download_queue[index];
                this.queue_start();
                this.download_retry = 0;
            }
        }, false);
        xhr.addEventListener("error", (evt) => {
            if (this.download_retry < this.download_retry_max) {
                this.download_retry++;
                setTimeout(() => {
                    this.queue_progress_start(url, filename, id, index);
                }, 3000);
            } else {
                delete this.download_queue[index];
                this.queue_start();
                this.download_retry = 0;
            }
        }, false);
        xhr.addEventListener("abort", (evt) => {
            delete this.download_queue[index];
            this.queue_start();
        }, false);
        xhr.open("GET", url);
        xhr.onload = () => {
            this.queue_complete(xhr, filename, id, index);
        };
        xhr.responseType = 'blob';
        xhr.send();
    }

    // 队列下载完成处理
    queue_complete(evt, filename, id, index) {
        this.download_retry = 0;
        let blob = new Blob([evt.response], {
            type: evt.response.type
        });
        if (window.navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(link.href);
        }
        this.download_queue_processing = false;
        $('.btn_download_' + index).removeAttr('disabled');
        $('.btn_download_' + index).html('<iconpark-icon name="cloud-arrow-down" class="fa-fw"></iconpark-icon>');

        delete this.download_queue[index];
        this.queue_run();
    }

    // 下载进度更新
    progress_on(evt, id, filename, index) {
        $('.download_progress_bar_set_' + index).css('width', (evt.loaded / evt.total) * 100 + '%');
        if (evt.loaded == evt.total) {
            $('.download_progress_bar_' + index).fadeOut();
        }
    }

    // 请求下载权限和获取下载链接
    request_download(ukey, recaptcha, callback) {
        $.post(this.parent_op.api_file, {
            action: 'download_req',
            ukey: ukey,
            token: this.parent_op.api_token,
            captcha: recaptcha
        }, (req) => {
            if (req.status == 1) {
                callback(req.data);
                return true;
            }
            if (req.status == 3) {
                this.parent_op.alert(app.languageData.status_need_login);
                return false;
            }
            this.parent_op.alert(app.languageData.status_error_0);
        });
    }
}