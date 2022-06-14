class direct {

    parent_op = null
    domain = 0
    total_transfer = 0
    total_downloads = 0
    quota = 0
    set = false

    page_number = 0
    list_Data = []
    autoload = false

    init(parent_op) {
        this.parent_op = parent_op;
    }

    init_details(){
        if (this.parent_op.isLogin()===false) {
            return false;
        }
        $.post(this.parent_op.api_direct, {
            'action': 'details',
            'token': this.parent_op.api_token
        }, (rsp) => {
            this.domain = rsp.data.domain;
            this.quota = rsp.data.quota;
            this.total_downloads = rsp.data.total_downloads;
            this.total_transfer = rsp.data.total_transfer;
            this.set = 1;
        }, 'json');
    }

    /**
     * 初始化模块信息
     */
     prepare() {
        if(this.set===false){
            setTimeout(()=>{
                this.prepare();
            },1000);
        }
        let quota = bytetoconver(this.quota,true);
        let total_transfer = bytetoconver(this.total_transfer,true);


        if (this.domain == 0) {
            $('#direct_bind_domain').html(this.parent_op.languageData.direct_unbind_domain);
            $('#diredirect_bind_notice').html(this.parent_op.languageData.direct_unbind_notice);
        }else{
            $('#direct_bind_domain').html(this.domain);
            console.log(this.total_downloads);
            $('#diredirect_bind_notice').html(`${this.parent_op.languageData.direct_quota}：${quota}，${this.parent_op.languageData.direct_total_downloads}：${this.total_downloads}，${this.parent_op.languageData.direct_total_transfer}：${total_transfer}`);
        }
    }

    is_allow(){
        if(this.domain == 0){
            return false;
        }
        return true;
    }

    addLink(ukey){
        $.post(this.parent_op.api_direct, {
            'action': 'add_link',
            'ukey': ukey,
            'token': this.parent_op.api_token
        }, (rsp) => {
            if(rsp.status==1){
                //提示添加成功，并复制到剪贴板
                alert(this.parent_op.languageData.direct_add_link_success);
                console.log(`http://${this.domain}/${rsp.data}`);
                this.parent_op.copyToClip(`http://${this.domain}/${rsp.data}`);
            }else{
                alert(this.parent_op.languageData.status_error_0);
            }
        }, 'json');
    }

    /**
     * 初始化页面
     */
    filelist(page) {
        $('.no_files').fadeOut();
        $('.no_dir').fadeOut();
        $('.no_photos').fadeOut();
        //when page is 0,page will be init
        if (page == 0) {
            this.page_number = 0;
            $('#direct_filelist').html('');
            this.list_data = [];
        } else {
            this.page_number++;
        }
        if (localStorage.getItem('app_login') != 1) {
            this.logout();
            return false;
        }
        //if search
        let search = $('#direct_search').val();
        let total_size_text = bytetoconver(this.total_size);


        //获取排序
        let key = this.key_get();
        let sort_by = localStorage.getItem(key.sort_by);
        let sort_type = localStorage.getItem(key.sort_type);

        $('#filelist_refresh_icon').addClass('fa-spin');
        $('#filelist_refresh_icon').attr('disabled', true);
        this.parent_op.loading_box_on();
        let photo = 0;
        if (localStorage.getItem('app_direct_view') == 'photo') {
            photo = 1;
        }
        $.post(this.parent_op.api_direct, {
            action: 'filelist_page',
            page: this.page_number,
            token: this.parent_op.api_token,
            sort_type: sort_type,
            sort_by: sort_by,
            search: search
        }, (rsp) => {
            $('#filelist_refresh_icon').removeClass('fa-spin');
            $('#filelist_refresh_icon').removeAttr('disabled');
            if (rsp.status === 0) {
                if (page == 0) {
                    $('#direct_filelist').html('<div class="text-center"><i class="fa-fw fa-light fa-folder-open fa-4x"></i></div>');
                }
                this.autoload = false;
            } else {
                this.direct_view(rsp.data, page);
                this.autoload = true;
                for (let i in rsp.data) {
                    this.list_data[rsp.data[i].ukey] = rsp.data[i];
                }
            }
            $('#filelist').show();
            this.loading_box_off();
            //cancel
            if (rsp.status == 0 || rsp.data.length < 50) {
                this.dir_list_autoload_disabled();
            }
        });
    }

    direct_filelist_model(type) {
        switch (type) {
            case 'photo':
                localStorage.setItem('app_direct_view', 'photo');
                break;
            case 'list':
                localStorage.setItem('app_direct_view', 'list');
                break;
            default:
                localStorage.setItem('app_direct_view', 'list');
        }
        this.direct_filelist(0);
    }

    direct_view(data, page) {
        switch (localStorage.getItem('app_direct_view')) {
            case 'photo':
                this.direct_filelist_by_photo(data, page);
                break;
            case 'list':
                this.direct_filelist_by_list(data, page);
                break;
            default:
                this.direct_filelist_by_list(data, page);
        }
    }

    direct_filelist_by_list(data, page) {
        $('#ws_btn_file_list').addClass('bg-dark');
        if (page == 0 && data == false) {
            $('.no_files').show();
        }
        if (data.length == 0) {
            return false;
        }
        $('#direct_filelist').append(app.tpl('direct_filelist_list_tpl', data));
        $('.lefttime-remainder').each((i, e) => {
            let id = $(e).attr('id');
            let time = $(e).attr('data-tmplink-lefttime');
            this.parent_op.countTimeDown(id, time);
        });
        this.parent_op.btn_copy_bind();
        app.linkRebind();
    }

    key_get() {
        return {
            view: 'app_room_view_direct',
            sort_by: 'app_room_view_sort_by_direct',
            sort_type: 'app_room_view_sort_type_direct',
        }

    }

    list_autoload_enabled() {
        this.autoload = true;
        $(window).on("scroll", (event) => {
            if ($(event.currentTarget).scrollTop() + $(window).height() + 100 >= $(document).height() && $(event.currentTarget).scrollTop() > 100) {
                if (this.autoload == true) {
                    this.autoload = false;
                    this.filelist(1);
                }
            }
        });
    }

    list_autoload_disabled() {
        $(window).off("scroll");
    }

    /**
     * 设置域名
     */
    setDomain() {
        let domain = prompt(this.parent_op.languageData.direct_btn_bind_prompt_msg);
        //检查输入的是否是正确的域名
        if (domain == null) {
            return false;
        }
        $.post(this.parent_op.api_direct, {
            'action': 'direct_set_domain',
            'domain': domain,
            'token': this.parent_op.api_token
        }, (rsp) => {
            if (rsp.status == 1) {
                alert(this.parent_op.languageData.direct_btn_bind_prompt_ok);
                $('#direct_bind_domain').html(domain);
                $('#diredirect_bind_notice').html('');
            } else {
                alert(this.parent_op.languageData.direct_btn_bind_prompt_error);
            }
        }), 'json';
    }

    loading_box_on() {
        $('#loading_box').show();
    }

    loading_box_off() {
        $('#loading_box').fadeOut();
    }

}
