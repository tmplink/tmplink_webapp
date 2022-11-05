class direct {

    parent_op = null
    domain = 0
    total_transfer = 0
    total_downloads = 0
    protocol = 'http://'
    quota = 0
    allow_ext = ['mp4', 'm4v', 'webm', 'mov', 'ogg', 'mp3']
    set = false
    ssl = false

    sort_by = 0
    sort_type = 0

    page_number = 0
    list_Data = []
    autoload = false

    init(parent_op) {
        this.parent_op = parent_op;
        this.sortSettingsInit();
    }

    init_details(cb) {

        if (this.parent_op.isLogin() === false) {
            cb();
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
            this.ssl = rsp.data.ssl_status==='yes'?true:false;
            //如果domain是 *.5t-cdn.com 作为子域名，生成的链接则应该是 https://
            if (this.domain.indexOf('.5t-cdn.com') != -1) {
                this.protocol = 'https://';
                $('#direct_bind_ssl').html(this.parent_op.languageData.direct_ssl_enbaled);
            }else{
                $('#direct_bind_ssl').html(this.parent_op.languageData.direct_ssl_disabled);
            }
            if(this.ssl){
                $('#direct_bind_ssl').html(this.parent_op.languageData.direct_ssl_enbaled);
                $('#box_disable_ssl').show();
                this.protocol = 'https://';
            }else{
                $('#box_disable_ssl').hide();
                $('#direct_bind_ssl').html(this.parent_op.languageData.direct_ssl_disabled);
            }
            cb();
        }, 'json');
    }

    openDomainEditor(){
        if (this.parent_op.area_cn) {
            $('#tmplink_subdomain').hide();
        }
        $('#directEditDomainModal').modal('show');
    }

    is_allow_play(filename) {
        let ext = filename.split('.').pop();
        //if file can be paly and domain not be 5t-cdn.com
        // if (this.allow_ext.indexOf(ext) == -1 || this.domain.indexOf('.5t-cdn.com') != -1) {
        if (this.allow_ext.indexOf(ext) == -1) {
            return false;
        }
        return true;
    }

    /**
     * 初始化模块信息
     */
    prepare() {
        if (this.set === false) {
            setTimeout(() => {
                this.prepare();
            }, 1000);
        }
        let quota = bytetoconver(this.quota, true);
        let total_transfer = bytetoconver(this.total_transfer, true);


        if (this.domain != 0) {
            $('#direct_bind_domain_box').show();
            $('#direct_bind_domain').html(this.domain);
            $('#direct_bind_domain').attr('href',this.protocol+this.domain);
        }else{
            $('#direct_bind_domain_box').hide();
            $('.no_direct_domains').fadeIn();
        }

        $('#direct_quota').html(quota);
        $('#direct_total_transfer').html(total_transfer);
        $('#direct_total_downloads').html(this.total_downloads);
    }

    is_allow() {
        if (this.domain == 0) {
            return false;
        }
        return true;
    }

    genLinkDirect(dkey, filename) {
        let filename2 = encodeURI(filename);
        return { 
            download: `${this.protocol}${this.domain}/files/${dkey}/${filename2}`, 
            res: `${this.protocol}${this.domain}/res/${dkey}/${filename2}`, 
            play: `${this.protocol}${this.domain}/stream-${dkey}`
        };
    }

    addLink(ukey) {
        $.post(this.parent_op.api_direct, {
            'action': 'add_link',
            'ukey': ukey,
            'token': this.parent_op.api_token
        }, (rsp) => {
            if (rsp.status == 1) {
                //提示添加成功，并复制到剪贴板
                let files = rsp.data;
                $.notifi(this.parent_op.languageData.direct_add_link_success, "success");
                // this.parent_op.copyToClip(`${this.protocol}${this.domain}/files/${rsp.data}/${filename}`);
                this.parent_op.bulkCopy(null,this.genLinkDirect(files[0].dkey, files[0].name).download,false);
            } else {
                $.notifi(this.parent_op.languageData.status_error_0, "success");
            }
        }, 'json');
    }

    addLinks(ukeys) {
        $.post(this.parent_op.api_direct, {
            'action': 'add_link',
            'ukey': ukeys,
            'token': this.parent_op.api_token
        }, (rsp) => {
            if (rsp.status == 1) {
                //提示添加成功，并复制到剪贴板
                let files = rsp.data;
                $.notifi(this.parent_op.languageData.direct_add_link_success, "success");
                for(let i in files){
                    this.parent_op.bulkCopy(null,this.genLinkDirect(files[i].dkey, files[i].name).download,false);
                }
            } else {
                $.notifi(this.parent_op.languageData.status_error_0, "success");
            }
        }, 'json');
    }

    delLink(direct_key) {
        $.post(this.parent_op.api_direct, {
            'action': 'del_link',
            'direct_key': direct_key,
            'token': this.parent_op.api_token
        }, () => {
            $(`.file_unit_${direct_key}`).remove();
        }, 'json');
    }

    delLinks(direct_key) {
        if (direct_key.length === 0) {
            return false;
        }
        $.post(this.parent_op.api_direct, {
            'action': 'del_link',
            'direct_key': direct_key,
            'token': this.parent_op.api_token
        }, () => {
            for (let i = 0; i < direct_key.length; i++) {
                $(`.file_unit_${direct_key[i]}`).remove();
            }
        }, 'json');
    }

    /**
     * 初始化页面
     */
    filelist(page) {

        if (this.parent_op.logined != 1) {
            app.open('/login');
        }

        if(this.domain==0){
            $('#filelist').show();
            return false;
        }

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
        let key = this.keyGet();
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
                this.list_autoload_disabled();
            }
        });
    }

    dirRoomInit(){
        if (this.parent_op.isLogin() === false) {
            return false;
        }

        let mrid = this.parent_op.room.mr_id;
        $.post(this.parent_op.api_direct, {
            'action': 'dir_details',
            'mrid': mrid,
            'token': this.parent_op.api_token
        }, (rsp) => {
            if (rsp.status == 1) {
                this.dir_btn_status = true;
                this.dir_link = `${this.protocol}${this.domain}/dir/${rsp.data}`;
                this.dir_key = rsp.data;
                //操作按钮
                this.dirRoomPfBtnUpdate();
                //更新文件夹界面
                this.dirRoomUpdate();
            }
        }, 'json');
    }

    dirToggle() {
        let status = $('#pf_allow_direct').is(':checked') ? true : false;
        let post_params ={};

        if(status){
            post_params.action = 'add_dir';
            post_params.mrid = this.parent_op.room.mr_id;
        }else{
            post_params.action = 'del_dir';
            post_params.direct_key = this.dir_key;
        }
        post_params.token = this.parent_op.api_token;

        $.post(this.parent_op.api_direct,post_params, (rsp) => {
            if (rsp.status == 1) {
                if(status){
                    this.dir_btn_status = false;
                }else{
                    this.dir_btn_status = true;
                    this.dir_link = `${this.protocol}${this.domain}/dir/${rsp.data}`;
                }
                //操作按钮
                this.dirRoomPfBtnUpdate();
                //更新文件夹界面
                this.dirRoomUpdate();
            }
        }, 'json');
    }

    dirRoomUpdate(){
        if(this.dir_btn_status){
            $('#room_link').html(this.dir_link);
            $('#room_link').attr('href',this.dir_link);
            $('#room_link').show();
        }else{
            $('#room_link').hide();
        }
    }

    dirRoomPfBtnUpdate(){
        if(this.dir_btn_status){
            $('#pf_allow_direct').attr('checked', 'checked');
        }else{
            $('#pf_allow_direct').removeAttr('checked');
        }
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
        this.filelist(0);
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

        //为 data 增加直链单元
        for (let i = 0; i < data.length; i++) {
            let filename = encodeURIComponent(data[i].fname);
            data[i].direct_link = this.genLinkDirect(data[i].direct_key, filename).download;
            data[i].play_link = this.genLinkDirect(data[i].direct_key, filename).play;
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

    sortSettingsInit() {
        let key = this.keyGet();

        let storage_sort_by = localStorage.getItem(key.sort_by);
        let sort_by = storage_sort_by === null ? this.sort_by : storage_sort_by;
        localStorage.setItem(key.sort_by, sort_by);
        $("#direct_sort_by option[value='" + sort_by + "']").attr("selected", "selected");

        let storage_sort_type = localStorage.getItem(key.sort_type);
        let sort_type = storage_sort_type === null ? this.sort_type : storage_sort_type;
        localStorage.setItem(key.sort_type, sort_type);
        $("#direct_sort_type option[value='" + sort_type + "']").attr("selected", "selected");
    }

    sortSettings() {
        let key = this.keyGet();
        this.sort_by = $('#direct_sort_by').val();
        this.sort_type = $('#direct_sort_type').val();
        localStorage.setItem(key.sort_by, this.sort_by);
        localStorage.setItem(key.sort_type, this.sort_type);

        this.filelist(0);
        $('#directSortModal').modal('hide');
    }

    sortModal() {
        $('#directSortModal').modal('show');
    }

    keyGet() {
        return {
            view: 'app_direct_view',
            sort_by: 'app_direct_view_sort_by',
            sort_type: 'app_direct_view_sort_type',
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
     enableSSL() {
        this.loading_box_on();

        var ssl_cert = $('#set_ssl_cert').val()+"\n"+$('#set_ssl_cert_ca').val()+"\n"+$('#set_ssl_cert_chain').val();
        var ssl_key = $('#set_ssl_key').val();

        $.post(this.parent_op.api_direct, {
            'action': 'direct_set_ssl',
            'ssl_cert':ssl_cert, 'ssl_key':ssl_key,
            'token': this.parent_op.api_token
        }, (rsp) => {
            if (rsp.status == 1) {
                alert(this.parent_op.languageData.direct_msg_complete);
                this.init_details(()=>{
                    $('#directSSLModal').modal('hide');
                });
            } else {
                alert(this.parent_op.languageData.direct_msg_ssl_invalid);
            }
            this.loading_box_off();
        }), 'json';
    }

    disableSSL() {

        if(!confirm(this.parent_op.languageData.direct_msg_ssl_disable)){
            return false;
        }

        this.loading_box_on();

        $.post(this.parent_op.api_direct, {
            'action': 'direct_disable_ssl',
            'token': this.parent_op.api_token
        }, (rsp) => {
            alert(this.parent_op.languageData.direct_msg_complete);
            window.location.reload();
        }), 'json';
    }

    /**
     * 设置域名
     */
    setDomain() {
        this.loading_box_on();

        let domain = $('#direct-domain').val();
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
                $('#direct_bind_domain_box').show();
                $('#direct_bind_domain').html(domain);
                $('#direct_bind_domain').attr('href',this.protocol+domain);
                
                $('#diredirect_bind_notice').html('');
                window.location.reload();
            } else {
                $('#direct_bind_domain_box').hide();
                alert(this.parent_op.languageData.direct_btn_bind_prompt_error);
            }
            this.loading_box_off();
        }), 'json';
    }

    /**
     * 设置域名
     */
    getFreeQuotaOfSponsor() {
        this.loading_box_on();
        $.post(this.parent_op.api_pay, {
            'action': 'free_dq_get',
            'token': this.parent_op.api_token
        }, (rsp) => {
            switch (rsp.status) {
                case 1:
                    alert(this.parent_op.languageData.direct_sponsor_freee_quota_msg_1);
                    break;
                case 2:
                    alert(this.parent_op.languageData.direct_sponsor_freee_quota_msg_2);
                    break;
                case 3:
                    alert(this.parent_op.languageData.direct_sponsor_freee_quota_msg_3);
                    break;
                default:
                    alert(this.parent_op.languageData.status_error_0);
            }
            this.loading_box_off();
        }), 'json';
    }

    loading_box_on() {
        $('#loading_box').show();
    }

    loading_box_off() {
        $('#loading_box').fadeOut();
    }

}
