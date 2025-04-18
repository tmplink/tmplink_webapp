class download {
    parent_op = null
    download_queue = []
    download_queue_processing = false
    download_retry = 0
    download_retry_max = 10

    // 新增多线程下载相关属性
    chunks = []
    downloadSpeed = 0
    lastSpeedUpdate = 0
    downloadedBytes = 0
    threads = []
    chunkSize = 0
    totalSize = 0
    multiThreadActive = false
    lastTotalBytes = 0;
    numberOfChunks = 3;     // <— NEW: dynamic chunk count (1 or 3)

    init(parent_op) {
        this.parent_op = parent_op;
        this.resetMultiThreadStatus();
    }

    //
    resetMultiThreadStatus() {
        this.chunks = [];
        this.downloadSpeed = 0;
        this.lastSpeedUpdate = Date.now();
        this.downloadedBytes = 0;
        this.threads = [];
        this.chunkSize = 0;
        this.totalSize = 0;
        this.multiThreadActive = false;
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
        try {
            // 准备文件列表并显示下载管理器
            $('#multipleDownloadModel').modal('show');
            $('#multiple_download_prepare').show();
            $('#multiple_download_processing').hide();

            // 初始化UI
            this.init_folder_download_progress();

            // 获取文件列表
            const file_list = await this.folder_download_prepare(select_data);

            // 检查是否包含文件夹结构
            const hasFolder = file_list.some(file => file.path.includes('/'));

            // 计算总文件大小
            const totalSize = file_list.reduce((acc, file) => acc + parseInt(file.size), 0);
            let downloadedBytes = 0;

            this.append_download_info(`${app.languageData.multi_download_start} ${file_list.length} ${app.languageData.multi_download_files}, ${app.languageData.multi_download_count} ${bytetoconver(totalSize, true)}`);

            $('#multiple_download_prepare').hide();
            $('#multiple_download_processing').show();

            // 如果包含文件夹结构，尝试使用 File System Access API
            if (hasFolder) {
                try {
                    const dirHandle = await window.showDirectoryPicker();
                    const hasPermission = await this.verifyDirectoryPermissions(dirHandle);

                    if (hasPermission) {
                        this.append_download_info(app.languageData.multi_download_start);

                        // 使用现代API下载文件夹结构
                        for (let i = 0; i < file_list.length; i++) {
                            const file = file_list[i];
                            try {
                                const downloadUrl = await this.get_download_url(file.ukey);
                                const dirPath = file.path.split('/').slice(0, -1).join('/');
                                const fileName = file.path.split('/').pop();
                                const targetDirHandle = dirPath ?
                                    await this.ensureDirectoryExists(dirHandle, dirPath) :
                                    dirHandle;

                                await this.download_and_save_file(
                                    downloadUrl,
                                    targetDirHandle,
                                    fileName,
                                    file.path,
                                    (receivedBytes) => {
                                        const previousFilesBytes = file_list
                                            .slice(0, i)
                                            .reduce((acc, f) => acc + parseInt(f.size), 0);
                                        const totalProgress = ((previousFilesBytes + receivedBytes) / totalSize) * 100;
                                        $('#multiple_download_process-bar')
                                            .css('width', `${totalProgress}%`)
                                            .attr('aria-valuenow', totalProgress);
                                    }
                                );
                                downloadedBytes += parseInt(file.size);
                            } catch (error) {
                                console.error(`Error downloading file ${file.path}:`, error);
                                this.append_download_info(`${app.languageData.multi_download_error}: ${file.path} (${error.message})`);
                            }
                        }

                        const progressBar = $('#multiple_download_process-bar');
                        progressBar.css('width', '100%')
                            .removeClass('progress-bar-animated progress-bar-striped')
                            .addClass('bg-success')
                            .attr('aria-valuenow', 100);

                        this.append_download_info(app.languageData.multi_download_complete);
                        return;
                    }
                } catch (error) {
                    console.log("File System Access API not supported or permission denied, falling back to legacy download");
                    this.append_download_info(app.languageData.multi_download_legacy);
                }
            }

            // 使用传统下载方式（无文件夹或现代API不可用时）
            for (let i = 0; i < file_list.length; i++) {
                const file = file_list[i];
                try {
                    const downloadUrl = await this.get_download_url(file.ukey);

                    // 转换文件夹路径为文件名（如果有文件夹）
                    const parts = file.path.split('/');
                    const fileName = parts.pop();
                    const folderPath = parts.length > 0 ? `[${parts.join('][')}]` : '';
                    const convertedFilename = folderPath + fileName;

                    await this.legacyDownloadFile(
                        downloadUrl,
                        convertedFilename,
                        file.path,
                        (receivedBytes) => {
                            const previousFilesBytes = file_list
                                .slice(0, i)
                                .reduce((acc, f) => acc + parseInt(f.size), 0);
                            const totalProgress = ((previousFilesBytes + receivedBytes) / totalSize) * 100;
                            $('#multiple_download_process-bar')
                                .css('width', `${totalProgress}%`)
                                .attr('aria-valuenow', totalProgress);
                        }
                    );

                    downloadedBytes += parseInt(file.size);
                } catch (error) {
                    this.append_download_info(`${app.languageData.multi_download_error}: ${file.path} (${error.message})`);
                }
            }

            const progressBar = $('#multiple_download_process-bar');
            progressBar.css('width', '100%')
                .removeClass('progress-bar-animated progress-bar-striped')
                .addClass('bg-success')
                .attr('aria-valuenow', 100);

            this.append_download_info(app.languageData.multi_download_complete);

        } catch (error) {
            this.append_download_info(`${app.languageData.multi_download_error}: ${error.message}`);
            this.parent_op.alert(app.languageData.download_error_abort);
        }
    }

    async legacyDownloadFile(url, fileName, originalPath, onProgress) {
        const msgElement = this.appendProgressLine();

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const contentLength = parseInt(response.headers.get('content-length') || '0');
            const reader = response.body.getReader();
            const chunks = [];
            let receivedLength = 0;

            this.updateProgressText(
                msgElement,
                `${app.languageData.multi_download_start}: ${originalPath} (0/${bytetoconver(contentLength, true)}) ...`
            );

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                receivedLength += value.length;

                if (onProgress) {
                    onProgress(receivedLength);
                }

                if (contentLength && msgElement) {
                    this.updateProgressText(
                        msgElement,
                        `${app.languageData.multi_download_start}: ${originalPath} (${bytetoconver(receivedLength, true)}/${bytetoconver(contentLength, true)}) ...`
                    );
                }
            }

            const blob = new Blob(chunks);
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            window.URL.revokeObjectURL(link.href);

            this.updateProgressText(
                msgElement,
                `${app.languageData.multi_download_finish}: ${originalPath} (${bytetoconver(receivedLength, true)})`,
                'text-success'
            );

        } catch (error) {
            this.updateProgressText(
                msgElement,
                `${app.languageData.multi_download_error}:${originalPath} (${error.message})`,
                'text-danger'
            );
            throw error;
        }
    }

    // 下载并保存单个文件
    async download_and_save_file(url, dirHandle, fileName, fullPath, onProgress) {
        let msgElement = null;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const contentLength = parseInt(response.headers.get('content-length') || '0');
            const reader = response.body.getReader();
            const chunks = [];
            let receivedLength = 0;

            msgElement = this.appendProgressLine();
            this.updateProgressText(
                msgElement,
                `${app.languageData.multi_download_start}: ${fullPath} (0/${bytetoconver(contentLength, true)}) ...`
            );

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                receivedLength += value.length;

                if (onProgress) {
                    onProgress(receivedLength);
                }

                if (contentLength && msgElement) {
                    this.updateProgressText(
                        msgElement,
                        `${app.languageData.multi_download_start}: ${fullPath} (${bytetoconver(receivedLength, true)}/${bytetoconver(contentLength, true)}) ...`
                    );
                }
            }

            try {
                const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(new Blob(chunks));
                await writable.close();

                if (msgElement) {
                    this.updateProgressText(
                        msgElement,
                        `${app.languageData.multi_download_finish}: ${fullPath} (${bytetoconver(receivedLength, true)})`,
                        'text-success'
                    );
                }
            } catch (fileError) {
                throw new Error(`${app.languageData.file_write_error || '文件写入失败'}: ${fileError.message}`);
            }

        } catch (error) {
            if (msgElement) {
                this.updateProgressText(
                    msgElement,
                    `${app.languageData.multi_download_error}:${fullPath} (${error.message})`,
                    'text-danger'
                );
            }
            throw error;
        }
    }

    // 验证目录权限
    async verifyDirectoryPermissions(dirHandle) {
        try {
            const options = { mode: 'readwrite' };

            // 先检查是否已有权限
            const verifyPermission = await dirHandle.queryPermission(options);

            if (verifyPermission === 'granted') {
                return true;
            }

            // 如果没有权限，请求权限
            const permission = await dirHandle.requestPermission(options);
            return permission === 'granted';

        } catch (error) {
            console.error('Permission verification failed:', error);
            return false;
        }
    }

    // 创建目录结构
    async ensureDirectoryExists(rootDirHandle, dirPath) {
        const parts = dirPath.split('/');

        let currentHandle = rootDirHandle;

        for (const part of parts) {
            if (part) {
                try {
                    currentHandle = await currentHandle.getDirectoryHandle(part, { create: true });
                } catch (error) {
                    console.error(`Error creating directory ${part}:`, error);
                    throw new Error(`${app.languageData.folder_create_error || '创建文件夹失败'}: ${error.message}`);
                }
            }
        }

        return currentHandle;
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
                    if (item.ukey === select_data[x].id) {
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

    // 添加进度行并返回元素引用
    appendProgressLine() {
        const infoArea = $('#multiple_download_info');
        const msgDiv = $('<div class="download-message mb-1"></div>');
        infoArea.prepend(msgDiv);
        infoArea.scrollTop(0);
        return msgDiv;
    }

    // 更新进度文本
    updateProgressText(element, message, className = '') {
        if (!element) return;
        const timestamp = new Date().toLocaleTimeString();
        element.attr('class', 'download-message mb-1 ' + className)
            .html(`[${timestamp}] ${message}`);
    }

    // 初始化下载进度UI
    init_folder_download_progress() {
        const progressBar = $('#multiple_download_process-bar');
        progressBar.css('width', '0%')
            .removeClass('bg-success')
            .addClass('progress-bar-striped progress-bar-animated')
            .attr('aria-valuenow', 0);

        $('#multiple_download_info').empty();
    }

    // 添加普通信息
    append_download_info(message) {
        const timestamp = new Date().toLocaleTimeString();
        const msgElement = this.appendProgressLine();
        this.updateProgressText(msgElement, message);
    }

    // 新增文件下载处理方法
    async handleFileDownload(params, uiCallbacks) {
        const {
            updateButtonText,
            updateButtonState,
            updateButtonClass,
            showError
        } = uiCallbacks;

        let downloadBtnText = app.languageData.file_btn_download;

        try {
            updateButtonClass('btn-success', 'btn-azure');
            updateButtonText('<img src="/img/loading-outline.svg" style="width: 24px;">');
            updateButtonState(true);

            const downloadUrl = await this.getDownloadUrl(params.ukey);

            if (downloadUrl) {
                if (params.mode === 'fast') {
                    downloadBtnText = app.languageData.file_btn_download_fast;
                    try {
                        await this.startMultiThreadDownload(downloadUrl, params.filename);
                    } catch (error) {
                        console.error('Multi-thread download failed, fallback to normal download:', error);
                        window.location.href = downloadUrl;
                    }
                } else {
                    window.location.href = downloadUrl;
                }

                setTimeout(() => {
                    updateButtonClass('btn-azure', 'btn-success');
                    updateButtonText(downloadBtnText);
                    updateButtonState(false);
                }, 3000);

                return true;
            }
        } catch (error) {
            showError(app.languageData.status_file_2);
            return false;
        }
    }

    // 新增多线程下载相关方法
    async startMultiThreadDownload(url, filename) {
        try {
            const headResponse = await fetch(url, { method: 'HEAD' });
            if (!headResponse.ok) throw new Error('Failed to get file info');
    
            this.totalSize = parseInt(headResponse.headers.get('content-length'));
            if (!this.totalSize) throw new Error('Invalid file size');
    
            // 新增：小于512MB直接单线程下载
            const MAX_SINGLE_THREAD = 512 * 1024 * 1024;
    
            // 1 chunk for small files, 3 chunks otherwise
            const numberOfChunks = this.totalSize < MAX_SINGLE_THREAD ? 1 : 3;
            this.chunkSize = Math.ceil(this.totalSize / numberOfChunks);
    
            // 初始化多线程/单线程下载
            this.initMultiThreadDownload(numberOfChunks);   // <— updated call
    
            // 进度条初始化与可见性
            $('#download_progress_container').show();
            $('#download_progress_container_hr').show();
            for (let i = 1; i <= 3; i++) {
                const bar = $(`#progress_thread_${i}`);
                if (i <= numberOfChunks) {
                    bar.show().css('width', '0%');
                } else {
                    bar.hide();                          // hide unused bars
                }
            }
    
            // 创建下载任务数组，包含每个块的详细信息
            const downloadTasks = Array.from({ length: numberOfChunks }, (_, i) => {
                const start = i * this.chunkSize;
                const end = i === numberOfChunks - 1 ? 
                    this.totalSize - 1 : 
                    Math.min(start + this.chunkSize - 1, this.totalSize - 1);
                const expectedSize = end - start + 1;
                
                return {
                    index: i,
                    start,
                    end,
                    expectedSize
                };
            });
    
            // 启动速度计算
            this.startSpeedCalculator();
    
            // 并行下载所有块
            const downloadPromises = downloadTasks.map(task => 
                this.downloadChunk(url, task.index, task.start, task.end, task.expectedSize)
            );
    
            // 等待所有下载完成
            const chunks = await Promise.all(downloadPromises);
    
            // 验证所有块的完整性
            let totalBytesReceived = 0;
            chunks.forEach((chunk, index) => {
                const task = downloadTasks[index];
                if (chunk.byteLength !== task.expectedSize) {
                    throw new Error(`Chunk ${index} size mismatch: expected ${task.expectedSize}, got ${chunk.byteLength}`);
                }
                totalBytesReceived += chunk.byteLength;
            });
    
            // 验证总大小
            if (totalBytesReceived !== this.totalSize) {
                throw new Error(`Total size mismatch: expected ${this.totalSize}, got ${totalBytesReceived}`);
            }
    
            // 按正确顺序合并块
            const blob = new Blob(chunks, { type: headResponse.headers.get('content-type') || 'application/octet-stream' });
            
            // 触发下载
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
    
            this.cleanupMultiThreadDownload();
            return true;
        } catch (error) {
            console.error('Multi-thread download failed:', error);
            this.cleanupMultiThreadDownload();
            throw error;
        }
    }
    

    // 获取下载链接的方法
    async getDownloadUrl(ukey) {
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
            }
            throw new Error('Download request failed');
        } catch (error) {
            throw error;
        }
    }

    initMultiThreadDownload(numChunks = 3) {           // <— allow dynamic chunk count
        this.numberOfChunks = numChunks;
        this.chunks = [];
        this.downloadSpeed = 0;
        this.lastSpeedUpdate = Date.now();
        this.downloadedBytes = 0;
        this.threads = new Array(numChunks).fill(null).map(() => ({ loaded: 0 }));
        this.multiThreadActive = true;
    }

    downloadChunk(url, index, start, end, expectedSize) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            this.threads[index] = xhr;
            this.threads[index].loaded = 0;
    
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            xhr.setRequestHeader('Range', `bytes=${start}-${end}`);
    
            xhr.onprogress = (event) => {
                if (this.multiThreadActive) {
                    this.updateChunkProgress(index, event.loaded, end - start + 1);
                }
            };
    
            xhr.onload = () => {
                if (xhr.status === 206) {
                    const chunk = xhr.response;
                    if (chunk.byteLength !== expectedSize) {
                        reject(new Error(`Chunk ${index} size mismatch: expected ${expectedSize}, got ${chunk.byteLength}`));
                        return;
                    }
                    resolve(chunk);
                } else {
                    reject(new Error(`Chunk ${index} download failed with status ${xhr.status}`));
                }
            };
    
            xhr.onerror = () => reject(new Error(`Chunk ${index} download failed`));
            xhr.send();
        });
    }

    updateChunkProgress(index, loaded, total) {
        // 更新当前线程的已下载量
        this.threads[index].loaded = loaded;

        // 计算新的总下载量
        this.downloadedBytes = this.threads.map(thread =>
            thread ? thread.loaded || 0 : 0
        ).reduce((a, b) => a + b, 0);

        // 计算每个线程的进度占总进度的比例
        const threadProgress = (loaded / this.chunkSize) * (100 / this.numberOfChunks); // <— use dynamic chunk count
        $(`#progress_thread_${index + 1}`).css('width', `${threadProgress}%`);

        // 计算总体下载进度
        const totalProgress = (this.downloadedBytes / this.totalSize) * 100;

        // 更新进度显示
        $('#download_progress').text(
            `${this.formatBytes(this.downloadedBytes)} / ${this.formatBytes(this.totalSize)}`
        );
    }

    startSpeedCalculator() {
        this.lastSpeedUpdate = Date.now();
        this.lastTotalBytes = 0;

        const speedInterval = setInterval(() => {
            if (!this.multiThreadActive) {
                clearInterval(speedInterval);
                return;
            }

            const now = Date.now();
            const timeDiff = (now - this.lastSpeedUpdate) / 1000;

            // 计算这个时间段的速度
            const bytesIncrement = this.downloadedBytes - this.lastTotalBytes;
            const currentSpeed = bytesIncrement / timeDiff;

            // 更新显示
            $('#download_speed').text(`${this.formatBytes(currentSpeed)}/s`);

            // 更新基准值
            this.lastSpeedUpdate = now;
            this.lastTotalBytes = this.downloadedBytes;
        }, 1000);
    }

    checkDownloadCompletion(filename) {
        if (!this.chunks.every(chunk => chunk)) return;

        // 合并所有块并触发下载
        const blob = new Blob(this.chunks);
        const downloadUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        // 更新下载按钮状态
        $('#file_download_btn_fast')
            .removeClass('btn-azure')
            .addClass('btn-success')
            .html(app.languageData.file_btn_download_fast)
            .prop('disabled', false);

        this.cleanupMultiThreadDownload();
    }

    cleanupMultiThreadDownload() {
        this.multiThreadActive = false;
        this.threads.forEach(xhr => xhr && xhr.abort());
        $('#download_progress_container').hide();
        $('#download_progress_container_hr').hide();
        this.chunks = [];
        this.threads = [];
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    abortMultiThreadDownload() {
        this.cleanupMultiThreadDownload();
    }
}