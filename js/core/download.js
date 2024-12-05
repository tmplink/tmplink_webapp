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

    // 获取下载地址
    async get_download_url(ukey) {
        try {
            const recaptcha = await this.parent_op.recaptcha_do_async('download_req');
            const response = await $.post(this.parent_op.api_file, {
                action: 'download_req',
                ukey: ukey,
                token: this.parent_op.api_token,
                captcha: recaptcha
            });

            if (response.status === 1) {
                return response.data;
            } else if (response.status === 3) {
                throw new Error(app.languageData.status_need_login);
            } else {
                throw new Error(app.languageData.status_error_0);
            }
        } catch (error) {
            throw error;
        }
    }

    // 文件夹下载处理
    async folder_download(select_data) {
        console.log(select_data);
        try {
            // 准备文件列表并显示下载管理器
            $('#multipleDownloadModel').modal('show');
            
            // 初始化UI
            this.init_folder_download_progress();
            
            // 获取文件列表
            const file_list = await this.folder_download_prepare(select_data);
            console.log(file_list);
            
            // 计算总文件大小
            const totalSize = file_list.reduce((acc, file) => acc + parseInt(file.size), 0);
            let downloadedBytes = 0;
            
            this.append_download_info(`${app.languageData.multi_download_start} ${file_list.length} ${app.languageData.multi_download_files}, ${app.languageData.multi_download_count} ${bytetoconver(totalSize, true)}`);
            
            try {
                // 请求用户选择下载目录
                const dirHandle = await window.showDirectoryPicker();
                
                // 显示开始下载的消息
                this.append_download_info(app.languageData.multi_download_start);
                
                // 开始处理文件
                for (let i = 0; i < file_list.length; i++) {
                    const file = file_list[i];
                    try {
                        // 获取下载链接
                        const downloadUrl = await this.get_download_url(file.ukey);
                        
                        // 创建目录结构并下载文件
                        const dirPath = file.path.split('/').slice(0, -1).join('/');
                        const fileName = file.path.split('/').pop();
                        
                        // 获取或创建目标目录
                        const targetDirHandle = dirPath ?
                            await this.ensureDirectoryExists(dirHandle, file.path) :
                            dirHandle;
                        
                        // 下载文件并更新进度
                        await this.download_and_save_file(
                            downloadUrl, 
                            targetDirHandle, 
                            fileName, 
                            file.path,
                            // 添加进度回调函数
                            (receivedBytes) => {
                                // 更新当前文件之前已下载的字节数
                                const previousFilesBytes = file_list
                                    .slice(0, i)
                                    .reduce((acc, f) => acc + parseInt(f.size), 0);
                                
                                // 计算总进度
                                const totalProgress = ((previousFilesBytes + receivedBytes) / totalSize) * 100;
                                
                                // 更新进度条
                                $('#multipleDownloadModel .progress-bar')
                                    .css('width', `${totalProgress}%`)
                                    .attr('aria-valuenow', totalProgress);
                            }
                        );
                        
                        // 更新已下载字节数
                        downloadedBytes += parseInt(file.size);
                        
                    } catch (error) {
                        console.error(`Error downloading file ${file.path}:`, error);
                        this.append_download_info(app.languageData.multi_download_error+`: ${file.path} (${error.message})`);
                    }
                }
                
                // 完成所有下载
                const progressBar = $('#multipleDownloadModel .progress-bar');
                progressBar.css('width', '100%')
                          .removeClass('progress-bar-animated progress-bar-striped')
                          .addClass('bg-success')
                          .attr('aria-valuenow', 100);
                
                this.append_download_info(app.languageData.multi_download_complete);
                
            } catch (error) {
                console.error('Folder download error:', error);
                this.append_download_info(app.languageData.multi_download_error+`: ${error.message}`);
                throw error;
            }
        } catch (error) {
            this.append_download_info(app.languageData.multi_download_error+`: ${error.message}`);
            this.parent_op.alert(app.languageData.download_error_abort);
        }
    }
    
    // 更新下载单个文件的方法以支持进度回调
    async download_and_save_file(url, dirHandle, fileName, fullPath, onProgress) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
            const contentLength = parseInt(response.headers.get('content-length') || '0');
            const reader = response.body.getReader();
            const chunks = [];
            let receivedLength = 0;
    
            // 创建消息元素并显示开始下载状态
            const msgElement = this.appendProgressLine();
            this.updateProgressText(
                msgElement,
                app.languageData.multi_download_start+`: ${fullPath} (0/${bytetoconver(contentLength, true)}) ...`
            );
    
            while (true) {
                const { done, value } = await reader.read();
    
                if (done) break;
    
                chunks.push(value);
                receivedLength += value.length;
    
                // 调用进度回调
                if (onProgress) {
                    onProgress(receivedLength);
                }
    
                // 更新进度信息
                if (contentLength) {
                    this.updateProgressText(
                        msgElement,
                        app.languageData.multi_download_start+`: ${fullPath} (${bytetoconver(receivedLength, true)}/${bytetoconver(contentLength, true)}) ...`
                    );
                }
            }
    
            // 保存文件
            const blob = new Blob(chunks);
            const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
    
            // 更新完成状态
            this.updateProgressText(
                msgElement,
                app.languageData.multi_download_finish+`: ${fullPath} (${bytetoconver(receivedLength, true)})`,
                'text-success'
            );
    
        } catch (error) {
            // 更新错误状态
            this.updateProgressText(
                msgElement,
                app.languageData.multi_download_error+`:${fullPath} (${error.message})`,
                'text-danger'
            );
            throw error;
        }
    }

    // 处理选中的文件信息
    async folder_download_prepare(select_data) {
        let file_list = [];
        for (let x in select_data) {
            if (select_data[x].type === 'dir') {
                try {
                    let response = await $.post(this.parent_op.api_mr, {
                        action: 'get_all_file',
                        token: this.parent_op.api_token,
                        mr_id: select_data[x].id
                    });

                    if (response.status === 1) {
                        file_list.push(...response.data);
                    } else {
                        console.error('API returned error status:', response);
                    }
                } catch (error) {
                    console.error('jQuery post error:', error);
                }
            } else {
                this.parent_op.dir.file_list.forEach((item) => {
                    console.log(item);
                    if (item.ukey === select_data[x].id) {
                        console.log(item);
                        file_list.push({
                            ukey: item.ukey,
                            size: item.filesize,
                            path: item.fname
                        });
                    }
                });
            }
        }
        return file_list;
    }

    // 确保目录结构存在
    async ensureDirectoryExists(rootDirHandle, filePath) {
        const parts = filePath.split('/');
        parts.pop(); // Remove filename

        let currentHandle = rootDirHandle;

        for (const part of parts) {
            if (part) {
                try {
                    currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
                } catch (error) {
                    console.error(`Error creating directory ${part}:`, error);
                    throw error;
                }
            }
        }

        return currentHandle;
    }

    // 添加进度行并返回元素引用
    appendProgressLine(fileName) {
        const infoArea = $('#multiple_download_info');
        const msgDiv = $('<div class="download-message mb-1"></div>');
        infoArea.prepend(msgDiv);

        // 自动滚动到顶部
        infoArea.scrollTop(0);

        return msgDiv;
    }

    // 更新进度文本
    updateProgressText(element, message, className = '') {
        const timestamp = new Date().toLocaleTimeString();
        element.attr('class', 'download-message mb-1 ' + className)
            .html(`[${timestamp}] ${message}`);
    }

    // 显示文件下载错误
    errorFileProgress(fileId) {
        const element = $(`#${fileId}`);
        if (element.length) {
            element.find('.progress-bar')
                .removeClass('progress-bar-animated progress-bar-striped')
                .addClass('bg-danger');
            element.find('.status-text').text(app.languageData.multi_download_error);
        }
    }

    // 完成文件下载
    completeFileProgress(fileId) {
        const element = $(`#${fileId}`);
        if (element.length) {
            element.find('.progress-bar')
                .removeClass('progress-bar-animated progress-bar-striped')
                .addClass('bg-success')
                .css('width', '100%');
            element.find('.status-text').text(app.languageData.multi_download_finish);
        }
    }

    // 创建文件进度UI
    createFileProgressUI(fileId, fileName) {
        if (!$(`#${fileId}`).length) {
            $('#multiple_download_files').append(`
            <div id="${fileId}" class="mb-2 border-bottom pb-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="text-truncate me-2" style="max-width: 70%;">
                        <small class="status-text text-muted">${app.languageData.multi_download_start}: </small>
                        <small class="filename">${fileName}</small>
                    </div>
                    <small class="progress-text text-muted ms-auto"></small>
                </div>
                <div class="progress mt-1" style="height: 2px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" 
                         role="progressbar" 
                         style="width: 0%" 
                         aria-valuenow="0" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                    </div>
                </div>
            </div>
        `);
        }
    }

    // 初始化下载进度UI
    init_folder_download_progress() {
        // 重置主进度条
        const progressBar = $('#multipleDownloadModel .progress-bar');
        progressBar.css('width', '0%')
            .removeClass('bg-success')
            .addClass('progress-bar-striped progress-bar-animated')
            .attr('aria-valuenow', 0);

        // 清空信息区域
        $('#multiple_download_info').empty();
    }

    // 更新总体下载进度
    update_folder_download_progress(current, total) {
        const percentage = Math.floor((current / total) * 100);
        const progressBar = $('#multipleDownloadModel .progress-bar');

        progressBar.css('width', `${percentage}%`)
            .attr('aria-valuenow', percentage);

        if (percentage === 100) {
            progressBar.removeClass('progress-bar-animated progress-bar-striped')
                .addClass('bg-success');
        }
    }

    // 更新单个文件的下载进度
    updateFileProgress(fileId, progress, progressText) {
        const element = $(`#${fileId}`);
        if (element.length) {
            element.find('.progress-bar')
                .css('width', `${progress}%`)
                .attr('aria-valuenow', progress);
            element.find('.progress-text').text(progressText);
        }
    }

    // 添加普通信息
    append_download_info(message) {
        const timestamp = new Date().toLocaleTimeString();
        const msgElement = this.appendProgressLine();
        this.updateProgressText(msgElement, message);
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
        } this.download_queue_processing = false;
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