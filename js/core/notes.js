class notes {
    parent_op = null
    key = null
    monitor = false
    notes = null
    current_id = 0
    current_title = ''
    current_content = ''

    init(parent_op) {
        this.parent_op = parent_op;
    }

    initPage() {
        //初始化界面
        $('#notes_list').hide();
        //初始化按钮
        $('#notes_reset_all').hide();
        //是否有设置密钥
        $('#notes_keyfail_alert').hide();
        $('#notes_keyinit_alert').hide();
        //初始化创建笔记的按钮
        $('.notes_ready_btn ').hide();
        this.key = localStorage.getItem('NotesKey');
        if (this.key === null) {
            //如果没有设置密钥，显示设置密钥的提示
            $('#notes_list').fadeIn();
            $('#notes_keyinit_alert').show();
        } else {
            //如果有设置密钥，则请求笔记列表
            this.list();
        }
        //初始化页面
        $('#notes').show();
        //设置 SVG
        $.trumbowyg.svgPath = '/plugin/trumbowyg/ui/icons.svg';
        //禁止使用自动保存
        // if (this.monitor === false) {
        //     this.monitor = true;
        //     setInterval(() => {
        //         this.autoPost();
        //     }, 10000);
        // }
        //修补UI，移动设备时，修正按钮高度
        $('.mobile-head-padding-large').css('padding-top', '160px');
    }

    cleanKey() {
        localStorage.removeItem('NotesKey');
    }

    open(id) {
        //在没有密钥的情况下，不允许打开编辑器
        if (this.key === null) {
            alert(app.languageData.notes_keyinit_alert);
            return false;
        }
        //如果有传入 ID，则查找 ID 对应的笔记，写入到编辑器
        if (id !== 0) {
            let note = this.getNotesById(id);
            $('#trumbowyg').trumbowyg();
            $('#trumbowyg').trumbowyg('html', this.de_content(note.content));
            $('#notes_editor_title').val(this.de_content(note.title));
        } else {
            $('#trumbowyg').trumbowyg();
            //清空编辑器
            $('#trumbowyg').trumbowyg('html', '');
            $('#notes_editor_title').val('');
        }
        $('#notesEditorModal').modal('show');
        this.current_id = id;
    }

    getNotesById(id) {
        for (let i = 0; i < this.notes.length; i++) {
            if (this.notes[i].id == id) {
                return this.notes[i];
            }
        }
        return false;
    }

    updateNotesListByID(id, title, content) {

        for (let i = 0; i < this.notes.length; i++) {
            if (this.notes[i].id == id) {
                this.notes[i].title = this.en_content(title);
                this.notes[i].content = this.en_content(content);
            }
        }

        let data = this.decode_list(this.notes);
        $('#notes_list').html(app.tpl('notes_list_tpl', data));
    }

    /**
     * 设置密钥
     * @returns {undefined}
     */
    keySet() {
        let new_key = $('#notes_editor_key_setting').val();
        if (new_key === '') {
            alert(app.languageData.error_notes_key_empty);
            return false;
        }
        // 存储密钥
        localStorage.setItem('NotesKey', new_key);
        this.key = new_key;

        //重置提示框
        $('#notes_keyfail_alert').hide();
        $('#notes_keyinit_alert').hide();

        //调用数据更新
        this.list();
    }

    keyReInit() {
        //是否设定新的密钥
        let new_key = $('#notes_editor_key_setting').val();
        if (new_key === '') {
            alert(app.languageData.error_notes_key_empty);
            return false;
        }
        // 存储密钥
        localStorage.setItem('NotesKey', new_key);
        this.key = new_key;

        $.post(this.parent_op.api_notes, {
            'action': 'reset',
            'token': this.parent_op.api_token
        }, (rsp) => {
            //显示没有日志的提示
            this.list();
        }, 'json');
    }

    autoPost() {
        let raw_title = $('#notes_editor_title').val();
        let raw_content = $('#trumbowyg').trumbowyg('html');

        // 如果没有设定标题，则把标题设置为 untitled
        if (raw_title === '') {
            raw_title = 'untitled';
        }

        //如果标题和内容没有变化，不需要提交
        if (raw_title === this.current_title && raw_content === this.current_content) {
            return false;
        }

        this.current_content = raw_content;
        this.current_title = raw_title;

        //加密数据
        let title = this.en_content(raw_title);
        let content = this.en_content(raw_content);

        $('#notes_editor_updating').show();
        $('#notes_editor_updated').hide();
        $.post(this.parent_op.api_notes, {
            'action': 'write',
            'token': this.parent_op.api_token,
            'id': this.current_id,
            'title': title,
            'tag': '0',
            'content': content
        }, (rsp) => {
            //status 1 新建笔记完成，返回 ID
            if (rsp.status == 1) {
                this.current_id = rsp.data;
                this.list();
            }
            //status 2 更新笔记完成
            if (rsp.status == 2) {
                //显示一些动画
                this.updateNotesListByID(this.current_id, raw_title, raw_content);
            }
            $('#notes_editor_updating').hide();
            $('#notes_editor_updated').show();
            setTimeout(() => {
                $('#notes_editor_updated').fadeOut();
            }, 2000);
        }, 'json');
    }

    list() {
        this.parent_op.loading_box_on();
        $('#notes_list').fadeIn();
        $('#notes_list_encrypt_error').hide();
        $('.no_notes').hide();
        $.post(this.parent_op.api_notes, {
            'action': 'list',
            'token': this.parent_op.api_token
        }, (rsp) => {
            //close loading box
            this.parent_op.loading_box_off();

            if (rsp.status == 0) {
                $('.no_notes').show();
                $('#notes_list').hide();
                $('.notes_ready_btn').show();
                return false;
            }

            //先尝试解密第一条数据
            let test = this.de_content(rsp.data[0].content);
            if (test === false) {

                //显示未能解密的数据条数
                $('#notes_keyinit_alert').hide();
                $('#notes_keyfail_alert').show();
                $('#notes_reset_all').show();
                return false;
            }else{
                $('#notes_keyinit_alert').hide();
                $('#notes_keyfail_alert').hide();
                $('#notes_reset_all').hide();
                $('.notes_ready_btn').show();
            }

            if (rsp.status == 1) {
                let data = this.decode_list(rsp.data);
                this.notes = data;
                $('.notes_ready_btn').show();
                $('#notes_list').html(app.tpl('notes_list_tpl', data));
            }

        }, 'json');
    }

    delete(id) {
        //确认
        if (this.parent_op.profile_confirm_delete_get()) {
            if (!confirm(app.languageData.confirm_delete)) {
                return false;
            }
        }
        $.post(this.parent_op.api_notes, {
            'action': 'delete',
            'token': this.parent_op.api_token,
            'id': id
        }, (rsp) => {
            if (rsp.status == 1) {
                this.list();
            }
        }, 'json');
    }

    decode_list(data) {
        for (let i = 0; i < data.length; i++) {
            let raw_title = stripTags(this.de_content(data[i].title));
            let row_content = stripTags(this.de_content(data[i].content));
            //如果 raw_title 超出 25 个字符，截取 25 个字符，超出的部分用 ... 代替
            if (raw_title.length > 25) {
                data[i].title_text = raw_title.substring(0, 25) + '...';
            } else {
                data[i].title_text = raw_title;
            }
            //如果 row_content 超出 100 个字符，截取 25 个字符，超出的部分用 ... 代替
            if (row_content.length > 100) {
                data[i].content_text = row_content.substring(0, 100) + '...';
            } else {
                data[i].content_text = row_content;
            }
        }
        return data;
    }

    en_content(text) {
        let data = {
            'content': text,
        };
        //格式化成字符串
        let content = JSON.stringify(data);
        return CryptoJS.AES.encrypt(content, this.key).toString();
    }

    de_content(text) {
        let content = null;
        //try to decrypt
        try {
            content = CryptoJS.AES.decrypt(text, this.key).toString(CryptoJS.enc.Utf8);
        } catch (e) {
            return false;
        }
        //捕获错误，失败返回false
        try {
            content = JSON.parse(content);
            if (content.content !== undefined) {
                return content.content;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }

}
