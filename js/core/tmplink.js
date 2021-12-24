class tmplink {

    api_url = 'https://tun.tmp.link/api_v2'
    api_url_upload = this.api_url + '/file'
    api_file = this.api_url + '/file'
    api_user = this.api_url + '/user'
    api_media = this.api_url + '/media'
    api_mr = this.api_url + '/meetingroom'
    api_toks = this.api_url + '/token'
    api_token = null

    pageReady = false
    readyFunction = []


    logined = 0
    uid = 0
    email = null
    api_language = null
    languageData = {}
    mr_data = []
    room = []
    room_data = []
    list_data = []
    dir_tree = {}
    subroom_data = []
    recaptcha = '6LfqxcsUAAAAABAABxf4sIs8CnHLWZO4XDvRJyN5'
    download_queue = []
    download_queue_processing = false
    download_index = 0
    lazyLoadInstance = null
    get_details_do = false
    countDownID = [];

    storage = 0
    storage_used = 0
    high_speed_channel = false

    page_number = 1
    autoload = false
    sort_by = 0
    sort_type = 0
    single_file_size = 10 * 1024 * 1024 * 1024
    file_manager = null
    upload_model_selected_val = 0
    download_retry = 0
    download_retry_max = 10
    recaptcha_op = true

    constructor() {
        this.app_init();
        this.api_init();
        //初始化管理器
        this.file_manager = new tools_file_manager;
        this.media = new media;
        this.navbar = new navbar;
        this.uploader = new uploader;

        this.file_manager.init(this);
        this.media.init(this);
        this.uploader.init(this);

        //
        $('.workspace-navbar').hide();
        $('.workspace-nologin').hide();

        // this.navbar.init(this); //此函数需要等待语言包加载完毕才可执行

        this.upload_model_selected_val = localStorage.getItem('app_upload_model') === null ? 0 : localStorage.getItem('app_upload_model');

        var token = localStorage.getItem('app_token');
        this.recaptcha_do('token_check', (captcha) => {
            $.post(this.api_toks, {
                action: 'token_check',
                captcha: captcha,
                token: token
            }, (rsp) => {

                if (rsp.status == 3) {
                    let html = app.tpl('initFail', {});
                    $('#tmpui_body').html(html);
                    app.languageBuild();
                    return false;
                }

                if (rsp.status != 1) {
                    this.recaptcha_do('token_init', (captcha) => {
                        $.post(this.api_toks, {
                            action: 'token',
                            captcha: captcha,
                            token: token
                        }, (rsp) => {
                            this.api_token = rsp.data;
                            localStorage.setItem('app_token', rsp.data);
                            this.readyExec();
                            this.details_init();
                        });
                    });
                } else {
                    this.api_token = token;
                    this.readyExec();
                    this.details_init();
                }
            });
        });

        this.lazyLoadInstance = new LazyLoad({
            elements_selector: ".lazyload"
        });

        $(document).on({
            dragleave: function (e) {
                e.preventDefault();
            },
            drop: function (e) {
                e.preventDefault();
            },
            dragenter: function (e) {
                e.preventDefault();
            },
            dragover: function (e) {
                e.preventDefault();
            }
        });
    }

    ready(cb) {
        if (this.pageReady) {
            cb();
        } else {
            this.readyFunction.push(cb);
        }

    }

    readyExec() {
        this.pageReady = true;
        if (this.readyFunction.length !== 0) {
            for (let x in this.readyFunction) {
                this.readyFunction[x]();
            }
            this.readyFunction = [];
        }
    }

    languageData_init(lang) {
        this.languageData = lang;
        this.navbar.init(this);
    }

    bg_load() {
        // let url = get_url_params('tmpui_page');
        if (document.querySelector('#background_wrap_preload') == null) {
            
            //使用svg背景
            let svg = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgOTAwIDYwMCIgd2lkdGg9IjkwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbD0iI2JhY2RiYSIgZD0iTTAgMGg5MDB2NjAwSDB6Ii8+PHBhdGggZD0iTTAgNDAxbDIxLjUuMmMyMS41LjEgNjQuNS41IDEwNy4zIDUuOCA0Mi45IDUuMyA4NS41IDE1LjcgMTI4LjQgOS43IDQyLjgtNiA4NS44LTI4LjQgMTI4LjYtMjkuMiA0Mi45LS44IDg1LjUgMTkuOCAxMjguNCAyMS4zIDQyLjggMS41IDg1LjgtMTYuMSAxMjguNi0yNi41QzY4NS43IDM3MiA3MjguMyAzNjkgNzcxLjIgMzY1YzQyLjgtNCA4NS44LTkgMTA3LjMtMTEuNUw5MDAgMzUxdjI1MEgweiIgZmlsbD0iIzc3ZDc3ZSIvPjxwYXRoIGQ9Ik0wIDQwOGwyMS41IDEwLjVDNDMgNDI5IDg2IDQ1MCAxMjguOCA0NDguN2M0Mi45LTEuNCA4NS41LTI1IDEyOC40LTM3IDQyLjgtMTIgODUuOC0xMi40IDEyOC42LTIuNCA0Mi45IDEwIDg1LjUgMzAuNCAxMjguNCAzMC4yIDQyLjgtLjIgODUuOC0yMC44IDEyOC42LTI4LjMgNDIuOS03LjUgODUuNS0xLjkgMTI4LjQgNC42IDQyLjggNi41IDg1LjggMTMuOSAxMDcuMyAxNy41TDkwMCA0Mzd2MTY0SDB6IiBmaWxsPSIjNWViZTY3Ii8+PHBhdGggZD0iTTAgNDM3bDIxLjUgOS43YzIxLjUgOS42IDY0LjUgMjkgMTA3LjMgMzEuOCA0Mi45IDIuOCA4NS41LTEwLjggMTI4LjQtMTEuMyA0Mi44LS41IDg1LjggMTIuMSAxMjguNiAyMC4xIDQyLjkgOCA4NS41IDExLjQgMTI4LjQgMTIgNDIuOC43IDg1LjgtMS4zIDEyOC42LTQuNSA0Mi45LTMuMSA4NS41LTcuNSAxMjguNC03IDQyLjguNSA4NS44IDUuOSAxMDcuMyA4LjVMOTAwIDQ5OXYxMDJIMHoiIGZpbGw9IiM0NWE1NTAiLz48cGF0aCBkPSJNMCA1MjlsMjEuNS41YzIxLjUuNSA2NC41IDEuNSAxMDcuMy00LjIgNDIuOS01LjYgODUuNS0xOCAxMjguNC0yNC44IDQyLjgtNi44IDg1LjgtOC4yIDEyOC42LS43IDQyLjkgNy41IDg1LjUgMjMuOSAxMjguNCAyOS40IDQyLjggNS41IDg1LjguMSAxMjguNi02LjIgNDIuOS02LjMgODUuNS0xMy43IDEyOC40LTEzLjcgNDIuOCAwIDg1LjggNy40IDEwNy4zIDExTDkwMCA1MjR2NzdIMHoiIGZpbGw9IiMyYThkM2EiLz48cGF0aCBkPSJNMCA1NjZsMjEuNS02LjdjMjEuNS02LjYgNjQuNS0yMCAxMDcuMy0yMy44IDQyLjktMy44IDg1LjUgMS44IDEyOC40IDYgNDIuOCA0LjIgODUuOCA2LjggMTI4LjYgNC44IDQyLjktMiA4NS41LTguNiAxMjguNC01LjYgNDIuOCAzIDg1LjggMTUuNiAxMjguNiAxNi4xIDQyLjkuNSA4NS41LTExLjEgMTI4LjQtMTMuMSA0Mi44LTIgODUuOCA1LjYgMTA3LjMgOS41TDkwMCA1NTd2NDRIMHoiIGZpbGw9IiMwMDc1MjQiLz48L3N2Zz4=";
            $('body').append('<div id="background_wrap" style="z-index: -2;position: fixed;top: 0;left: 0;height: 100%;width: 100%;background-size: cover;background-repeat: no-repeat;background-attachment: scroll;background-image:url(\''+svg+'\');"></div>');
            
        }

    }

    lazyload(dom) {
        $(dom).each((i, e) => {
            let img = new Image();
            let url = $(e).attr('preload-src');
            if (url !== undefined) {
                img.src = url;
                img.onload = () => {
                    $(e).attr('src', img.src);
                }
            }

        });
    }

    app_init() {
        this.bg_load();
    }

    details_init() {
        var login = localStorage.getItem('app_login');
        if (login != null && login != 0) {
            this.logined = 1;
        } else {
            this.logined = 0;
        }
        this.get_details(() => {
            this.get_details_do = true;
            this.storage_status_update();
            this.head_set();
        });
    }

    head_set_refresh() {
        if (this.get_details_do) {
            this.head_set();
        }
    }

    isLogin() {
        if (localStorage.getItem('app_login') == 1) {
            return true;
        } else {
            return false;
        }
    }

    dir_tree_get() {
        $.post(this.api_mr, {
            action: 'get_dir_tree',
            token: this.api_token
        }, (rsp) => {
            if (rsp.status === 1) {
                this.dir_tree = rsp.data;
            } else {
                $('#mv_box_0').html(this.languageData.status_error_14);
            }
        });
    }

    dir_tree_display(parent) {
        for (let i in this.dir_tree) {
            if (this.dir_tree_have_children(this.dir_tree[i].id)) {
                this.dir_tree[i].children = true;
            } else {
                this.dir_tree[i].children = false;
            }
            if (this.dir_tree[i].parent == parent) {
                $('#mv_box_' + parent).append(app.tpl('mv_box_tpl', this.dir_tree[i]));
                $('#mv_box_' + parent).slideDown();
                $('#mv_select_box_' + parent).removeAttr('onclick');
            }
        }
    }

    dir_tree_have_children(parent) {
        for (let i in this.dir_tree) {
            if (this.dir_tree[i].parent == parent) {
                return true;
            }
        }
        return false;
    }

    move_to_dir(ukey, place) {
        let target = $("input[name='dir_tree']:checked").val();
        if (target === undefined) {
            alert(this.language_get.status_error_13);
            return false;
        }
        $.post(this.api_mr, {
            action: 'move_to_dir',
            token: this.api_token,
            ukey: ukey,
            mr_id: target
        }, (rsp) => {
            $('#movefileModal').modal('hide');
            if (place == 'workspace') {
                this.workspace_filelist(0);
            } else {
                this.mr_file_list(0);
            }
        });
    }

    get_file(code) {
        if (code.length !== 13) {
            this.alert(this.languageData.status_error_15);
            return false;
        }
        window.open('http://tmp.link/f/' + code);
    }

    loading_box_on() {
        $('#loading_box').show();
    }

    loading_box_off() {
        $('#loading_box').fadeOut();
    }

    recaptcha_do(type, cb) {
        // if (type !== 'init') {
        //     if (this.api_token === null) {
        //         setTimeout(() => {
        //             this.recaptcha_do(type, cb);
        //         }, 500);
        //         return false;
        //     } else {
        //         cb(Math.floor(Math.random() * 10));
        //         return true;
        //     }
        // }

        if (this.recaptcha_op) {
            if (typeof grecaptcha === 'object') {
                grecaptcha.ready(() => {
                    grecaptcha.execute(this.recaptcha, {
                        action: type
                    }).then((token) => {
                        cb(token);
                    });
                });
            } else {
                setTimeout(() => {
                    this.recaptcha_do(type, cb);
                }, 500);
            }
        } else {
            cb(this.randomString(64));
            return true;
        }
    }

    sort_show() {
        // $("#sort_by option[value='" + this.sort_by + "']").attr("selected", "selected");
        // $("#sort_type option[value='" + this.sort_type + "']").attr("selected", "selected");
        $('#sortModal').modal('show');
    }

    sort_confirm() {
        this.sort_by = $('#sort_by').val();
        this.sort_type = $('#sort_type').val();
        let key = this.room_key_get();
        localStorage.setItem(key.sort_by, this.sort_by);
        localStorage.setItem(key.sort_type, this.sort_type);

        if (get_page_mrid() !== undefined) {
            //刷新文件夹
            this.mr_file_list(0);
        } else {
            //刷新流
            this.workspace_filelist(0);
        }
        $('#sortModal').modal('hide');
    }

    head_set() {
        var login = localStorage.getItem('app_login');
        if (login != null && login != 0) {
            this.logined = 1;
            $('.workspace-navbar').show();
            $('.workspace-nologin').hide();
            $('#index_manager').fadeIn();
        } else {
            $('.workspace-navbar').hide();
            $('.workspace-nologin').show();
            $('#index_prepare').fadeIn();
        }

        $('.navbar_nloading').hide();
        $('.navbar_ready').show();
        //set process bar to 100%
        // setTimeout(() => {
        //     $('#index_userinfo_loading').fadeOut();
        // },1000);
    }

    open_manager(){
        $('#index_prepare').fadeOut();
        $('#index_manager').fadeIn();
    }

    get_details(cb) {
        $.post(this.api_user, {
            action: 'get_detail',
            token: this.api_token
        }, (rsp) => {
            if (rsp.status === 1) {
                localStorage.setItem('app_login', 1);
                this.logined = 1;
                this.storage_used = rsp.data.storage_used;
                this.storage = rsp.data.storage;
                this.high_speed_channel = rsp.data.highspeedchannel;
                this.profile_confirm_delete_set(rsp.data.pf_confirm_delete);
                localStorage.setItem('app_lang', rsp.data.lang);
                app.languageSet(rsp.data.lang);
                //console.log
                this.dir_tree_get();
                //激活标识
                if (this.high_speed_channel) {
                    $('.hs-enabled').show();
                } else {
                    $('.hs-disabled').show();
                }
            } else {
                $('.user-unlogin').show();
                localStorage.setItem('app_login', 0);
                this.logined = 0;
            }
            cb();
        });
    }

    password_reset_confim() {
        var password = $('#modal_password_reset').val();
        var rpassword = $('#modal_password_reset_re').val();
        if (password !== rpassword) {
            $("#notice_resetpassword").html(this.languageData.model_resetpassword_error_no_match);
            return false;
        }
        $("#notice_resetpassword").html(this.languageData.model_resetpassword_msg_processing);
        $("#modal_password_reset_btn").attr('disabled', true);
        $.post(this.api_user, {
            action: 'passwordreset',
            password: password,
            rpassword: rpassword,
            token: this.api_token
        }, (rsp) => {
            if (rsp.status === 1) {
                $("#notice_resetpassword").html(this.languageData.model_resetpassword_msg_processed);
                $("#modal_password_reset_btn").html(this.languageData.model_resetpassword_msg_processed);
            } else {
                $("#notice_resetpassword").html(this.languageData.model_resetpassword_error_fail);
                $("#modal_password_reset_btn").removeAttr('disabled');
            }
        });
    }

    email_change_confim() {
        var email = $('#email_new').val();
        var code = $('#checkcode').val();
        $("#notice_emailchange").html(this.languageData.model_email_change_msg_processing);
        $("#email_change_confim_btn").attr('disabled', true);
        $.post(this.api_user, {
            action: 'email_change',
            email: email,
            code: code,
            token: this.api_token
        }, (rsp) => {
            if (rsp.status === 1) {
                $("#notice_emailchange").html(this.languageData.model_email_change_msg_processed);
                $("#email_change_confim_btn").html(this.languageData.model_email_change_msg_processed);
            } else {
                $("#notice_emailchange").html(rsp.data);
                $("#email_change_confim_btn").removeAttr('disabled');
            }
        });
    }

    previewModel(ukey, name, id) {
        let url = 'https://getfile.tmp.link/img-' + ukey + '-0x0.jpg';
        $('#preview_img').attr('src', '/img/lazy.gif');
        $.get(url, () => {
            $('#preview_img').attr('src', url);
        });
        let lastukey = $('#btn_preview_download').attr('data-ukey');
        $('#preview_title').html(name);
        $('#btn_preview_download').removeClass('btn_download_' + lastukey);
        $('#preview_download_1').removeClass('download_progress_bar_' + lastukey);
        $('#preview_download_2').removeClass('download_progress_bar_set_' + lastukey);
        $('#btn_preview_download').addClass('btn_download_' + ukey);
        $('#preview_download_1').addClass('download_progress_bar_' + ukey);
        $('#preview_download_2').addClass('download_progress_bar_set_' + ukey);
        $('#btn_preview_download').attr('data-ukey', ukey);

        $('#btn_preview_download').removeAttr('disabled');
        $('#btn_preview_download').html(this.languageData.on_select_download);
        $('#btn_preview_download').attr('onclick', 'TL.download_file_btn(\'' + ukey + '\')');
        $('#btn_preview_remove').attr('onclick', "TL.workspace_del('" + ukey + "')");
        $('#previewModal').modal('show');
    }

    password_found() {
        this.recaptcha_do('init', (captcha) => {
            var email = $('#email_new').val();
            if (email === '') {
                return false;
            }
            $('#submit').attr('disabled', true);
            $('#msg_notice').show();
            $('#msg_notice').html(this.languageData.form_btn_processing);
            $.post(this.api_user, {
                action: 'passwordfound',
                token: this.api_token,
                email: email,
                captcha: captcha
            }, (rsp) => {
                if (rsp.status == 1) {
                    $('#msg_notice').fadeOut();
                    $('#submit').html(this.languageData.form_btn_processed);
                } else {
                    switch (rsp.status) {
                        case 13:
                            $('#msg_notice').html(this.languageData.status_13);
                            break;
                        case 14:
                            $('#msg_notice').html(this.languageData.status_14);
                            break;
                        default:
                            $('#msg_notice').html(this.languageData.status_unknow);
                    }
                    $('#submit').removeAttr('disabled');
                }
            }, 'json');
        });
    }

    workspace_navbar() {
        if (localStorage.getItem('app_login') == 1) {
            $('.workspace-navbar').show();
        }
    }

    workspace_add(id, ukey, animated) {
        $(id).attr('disabled', true);
        $.post(this.api_file, {
            action: 'add_to_workspace',
            token: this.api_token,
            ukey: ukey
        }, (rsp) => {
            if (animated === false) {
                return false;
            } else {
                $(id).html('<i class="fas fa-check-circle" aria-hidden="true"></i>');
            }
        }, 'json');
    }

    workspace_del(ukey, group_delete) {
        //如果是批量删除
        if (group_delete === true) {
            for (let i in ukey) {
                $('.file_unit_' + ukey[i]).hide();
            }
        } else {
            if (this.profile_confirm_delete_get()) {
                if (!confirm(this.languageData.confirm_delete)) {
                    return false;
                }
            }
            $('.file_unit_' + ukey).hide();
        }
        $.post(this.api_file, {
            action: 'remove_from_workspace',
            token: this.api_token,
            ukey: ukey
        }, 'json');
    }

    workspace_filelist_autoload_enabled() {
        this.autoload = true;
        $(window).on("scroll", (event) => {
            if ($(event.currentTarget).scrollTop() + $(window).height() + 100 >= $(document).height() && $(event.currentTarget).scrollTop() > 100) {
                if (this.autoload == true) {
                    this.autoload = false;
                    this.workspace_filelist(1);
                }
            }
        });
    }

    workspace_total() {
        $.post(this.api_file, {
            action: 'total',
            token: this.api_token
        }, (rsp) => {
            if (rsp.data.nums > 0) {
                let total_size_text = bytetoconver(rsp.data.size, true);
                $('#workspace_total').html(`${rsp.data.nums} ${this.languageData.total_units_of_file} , ${total_size_text}`);
            }
        }, 'json');
    }

    workspace_filelist_autoload_disabled() {
        $(window).off("scroll");
    }

    workspace_filelist(page) {
        $('.no_files').fadeOut();
        $('.no_photos').fadeOut();
        //when page is 0,page will be init
        if (page == 0) {
            this.page_number = 0;
            $('#workspace_filelist').html('');
            this.list_data = [];
        } else {
            this.page_number++;
        }
        if (localStorage.getItem('app_login') != 1) {
            this.logout();
            return false;
        }
        //if search
        let search = $('#workspace_search').val();
        let total_size_text = bytetoconver(this.total_size);

        //更新文件总数
        this.workspace_total();

        //获取排序
        let key = this.room_key_get();
        let sort_by = localStorage.getItem(key.sort_by);
        let sort_type = localStorage.getItem(key.sort_type);

        $('#filelist_refresh_icon').addClass('fa-spin');
        $('#filelist_refresh_icon').attr('disabled', true);
        this.loading_box_on();
        let photo = 0;
        if (localStorage.getItem('app_workspace_view') == 'photo') {
            photo = 1;
        }
        $.post(this.api_file, {
            action: 'workspace_filelist_page',
            page: this.page_number,
            token: this.api_token,
            sort_type: sort_type,
            sort_by: sort_by,
            photo: photo,
            search: search
        }, (rsp) => {
            $('#filelist_refresh_icon').removeClass('fa-spin');
            $('#filelist_refresh_icon').removeAttr('disabled');
            if (rsp.status === 0) {
                if (page == 0) {
                    $('#workspace_filelist').html('<div class="text-center"><i class="fa-fw fad fa-folder-open fa-4x"></i></div>');
                }
                this.autoload = false;
            } else {
                this.workspace_view(rsp.data, page);
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

    is_file_ok(ukey) {
        setTimeout(() => {
            $.post(this.api_file, {
                action: 'is_file_ok',
                token: this.api_token,
                ukey: ukey
            }, (rsp) => {
                if (rsp.status == 1) {
                    $(`.file_ok_${ukey}`).removeAttr('style');
                    $(`.file_relay_${ukey}`).attr('style', 'display: none !important;');
                } else {
                    this.is_file_ok(ukey);
                }
            }, 'json');
        }, 5000);
    }

    is_file_ok_check(data) {
        //prepare file is ok
        for (let i in data) {
            if (data[i].sync === 0) {
                $(`.file_relay_${data[i].ukey}`).attr('style', 'display: none !important;');
            } else {
                $(`.file_ok_${data[i].ukey}`).attr('style', 'display: none !important;');
                this.is_file_ok(data[i].ukey);
            }
        }
    }

    workspace_filelist_model(type) {
        switch (type) {
            case 'photo':
                localStorage.setItem('app_workspace_view', 'photo');
                break;
            case 'list':
                localStorage.setItem('app_workspace_view', 'list');
                break;
            default:
                localStorage.setItem('app_workspace_view', 'list');
        }
        this.workspace_filelist(0);
    }

    workspace_view(data, page) {
        switch (localStorage.getItem('app_workspace_view')) {
            case 'photo':
                this.workspace_filelist_by_photo(data, page);
                break;
            case 'list':
                this.workspace_filelist_by_list(data, page);
                break;
            default:
                this.workspace_filelist_by_list(data, page);
        }
        app.languageBuild();
    }

    workspace_btn_active_reset() {
        $('#ws_btn_file_list').removeClass('bg-dark');
        $('#ws_btn_file_grid').removeClass('bg-dark');
        $('#ws_btn_file_photo').removeClass('bg-dark');
    }

    workspace_filelist_by_photo(data, page) {
        this.workspace_btn_active_reset();
        $('#ws_btn_file_photo').addClass('bg-dark');
        if (page == 0 && data == false) {
            $('.no_photos').show();
        }
        if (data.length == 0) {
            return false;
        }
        if (page == 0) {
            $('#workspace_filelist').html('<div class="row" id="filelist_photo"></div>');
        }
        $('#workspace_filelist').append(app.tpl('workspace_filelist_photo_tpl', data));
        this.btn_copy_bind();
        this.is_file_ok_check(data);
        app.linkRebind();
        this.lazyLoadInstance.update();
    }

    workspace_filelist_by_list(data, page) {
        this.workspace_btn_active_reset();
        $('#ws_btn_file_list').addClass('bg-dark');
        if (page == 0 && data == false) {
            $('.no_files').show();
        }
        if (data.length == 0) {
            return false;
        }
        $('#workspace_filelist').append(app.tpl('workspace_filelist_list_tpl', data));
        $('.lefttime-remainder').each((i, e) => {
            let id = $(e).attr('id');
            let time = $(e).attr('data-tmplink-lefttime');
            this.countTimeDown(id, time);
        });
        this.btn_copy_bind();
        this.is_file_ok_check(data);
        app.linkRebind();
    }

    file_model_change(ukey, model) {
        this.loading_box_on();
        $.post(this.api_file, {
            action: 'change_model',
            ukey: ukey,
            //captcha: recaptcha,
            token: this.api_token,
            model: model
        }, (rsp) => {
            if (rsp.status === 1) {

                return true;
            }
            this.loading_box_off();
        }, 'json');
    }

    details_file() {
        if (this.isWeixin()) {
            // $('#file_messenger_icon').html('<i class="fad fa-download fa-fw fa-4x"></i>');
            // $('#file_messenger_msg').removeClass('display-4');
            // $('#file_messenger_msg').html('由于微信的限制，目前无法提供下载。请复制链接后，在外部浏览器打开进行下载。');
            // $('#file_messenger').show();

            // gtag('config', 'UA-96864664-3', {
            //     'page_title': 'D-weixinUnavailable',
            // });
            // return false;
            $('#wechat_notice').show();
        }

        this.loading_box_on();
        var params = get_url_params();
        if (params.ukey !== undefined) {
            $.post(this.api_file, {
                action: 'details',
                ukey: params.ukey,
                token: this.api_token
            }, (rsp) => {
                if (rsp.status === 1) {
                    gtag('config', 'UA-96864664-3', {
                        'page_title': 'D-' + rsp.data.name,
                    });
                    $('#file_box').show();
                    $('#filename').html(rsp.data.name);
                    $('#filesize').html(rsp.data.size);



                    $('#btn_add_to_workspace_mobile').on('click', () => {
                        if (this.logined == 1) {
                            this.workspace_add('#btn_add_to_workspace_mobile', params.ukey);
                        } else {
                            app.open('/login');
                        }
                    });


                    //更换图标
                    let icon = this.fileicon(rsp.data.type);
                    $('#file-icon').attr('class', 'fa-fw text-azure fa-3x ' + icon);

                    //更新title
                    document.title = rsp.data.name;

                    //更新喜欢
                    $('#likes').on('click', () => {
                        this.like_file(params.ukey);
                    });
                    $('#likes_count').html(rsp.data.like);

                    //剩余时间
                    if (rsp.data.model !== '99') {
                        $('#lefttime_show').show();
                        this.countTimeDown('lefttime', rsp.data.lefttime_s);
                    } else {
                        $('#lefttime_show').hide();
                    }
                    $('#report_ukey').html(params.ukey);
                    this.btn_copy_bind();
                    if (this.logined) {
                        $('.user-nologin').hide();
                        $('.user-login').show();
                    } else {
                        $('.user-nologin').show();
                        $('.user-login').hide();
                    }

                    $('#download_msg').html('<i class="fad fa-spinner-third fa-spin fa-fw"></i> '+this.languageData.status_file_1);
                    $('#download_msg').attr('class','badge badge-pill badge-info');

                    //请求下载地址
                    this.recaptcha_do('download_req', (recaptcha) => {
                        $.post(this.api_file, {
                            action: 'download_req',
                            ukey: params.ukey,
                            token: this.api_token,
                            captcha: recaptcha
                        }, (req) => {

                            gtag('config', 'UA-96864664-3', {
                                'page_title': 'Download-' + rsp.data.name,
                            });

                            if (req.status != 1) {
                                $('#download_msg').html('<i class="fas fa-exclamation-circle fa-fw"></i> '+this.languageData.status_file_2);
                                $('#download_msg').attr('class','badge badge-pill badge-danger');
                                $('#file_download_btn_1').hide();
                                $('#file_download_btn_2').hide();
                                $('#file_download_by_qrcode').hide();

                                return false;
                            }
                            let download_link = req.data;

                            //设定下载链接
                            let download_url = download_link;
                            let download_cmdurl = download_link;

                            //自动启动下载
                            window.location.href = download_url;
                            $('#download_msg').html('<i class="fas fa-check-circle fa-fw"></i> '+this.languageData.status_file_3);
                            $('#download_msg').attr('class','badge badge-pill badge-success');

                            //分享链接
                            let share_url = 'http://tmp.link/f/' + params.ukey;

                            //添加下载 src
                            $('.file_download_url').attr('href', download_url);

                            //QR Download
                            $('#qr_code_url').attr('src', this.api_url + '/qr?code=' + Base64.encode(download_link));

                            $('#btn_download').attr('x-href', download_url);
                            $('#btn_highdownload').attr('x-href', download_url);
                            $('.single_download_progress_bar').attr('data-href', download_url);
                            $('.single_download_progress_bar').attr('data-filename', rsp.data.name);

                            $('.btn_copy_downloadurl').attr('data-clipboard-text', download_url);
                            $('.btn_copy_downloadurl').attr('href', download_url);

                            $('.btn_copy_fileurl').attr('data-clipboard-text', share_url);
                            $('.file_ukey').attr('data-clipboard-text', params.ukey);
                            $('.btn_copy_downloadurl_for_other').attr('data-clipboard-text', download_cmdurl);
                            $('.btn_copy_downloadurl_for_curl').attr('data-clipboard-text', `curl -Lo "${rsp.data.name}" ${download_cmdurl}`);
                            $('.btn_copy_downloadurl_for_wget').attr('data-clipboard-text', `wget -O  "${rsp.data.name}" ${download_cmdurl}`);

                            //开始处理绑定的事件
                            //下载按钮绑定事件，触发下载
                            $('#file_download_btn').on('click', () => {
                                //触发下载
                                window.open(download_url, '_blank');
                                return true;
                            });

                            //扫码下载按钮绑定
                            $('#file_download_by_qrcode').on('click', () => {
                                $('#qrModal').modal('show');
                                return true;
                            });

                            //如果可以，加入到媒体库
                            if (this.media.is_allow(rsp.data.name)) {
                                //绑定按钮
                                $('#btn_add_to_media').show();
                                $('#btn_add_to_media').on('click', () => {
                                    if (this.logined == 1) {
                                        $('#menu_add_to_media_video').html(this.languageData.form_btn_processing);
                                        this.media.video_add(params.ukey, (status, text) => {
                                            if (status) {
                                                $('#btn_add_to_media_icon').removeClass('text-cyan');
                                                $('#btn_add_to_media_icon').addClass('text-red');
                                                $('#menu_add_to_media_video').html(text);
                                            } else {
                                                alert(text);
                                            }
                                            //remove event
                                            $('#btn_add_to_media').off('click');
                                        });
                                    }
                                });
                            }

                            //复制链接按钮绑定
                            $('#file_download_url_copy').on('click', () => {
                                //复制内容到剪贴板
                                navigator.clipboard.writeText(share_url);
                                $('#file_download_url_copy_icon').removeClass('text-cyan');
                                $('#file_download_url_copy_icon').addClass('text-success');
                                setTimeout(() => {
                                    $('#file_download_url_copy_icon').addClass('text-cyan');
                                    $('#file_download_url_copy_icon').removeClass('text-success');
                                }, 3000);
                                return true;
                            });

                            //复制提取码按钮绑定
                            $('#file_download_ukey_copy').on('click', () => {
                                //复制内容到剪贴板
                                navigator.clipboard.writeText(params.ukey);
                                $('#file_download_ukey_copy_icon').removeClass('text-cyan');
                                $('#file_download_ukey_copy_icon').addClass('text-success');
                                setTimeout(() => {
                                    $('#file_download_ukey_copy_icon').addClass('text-cyan');
                                    $('#file_download_ukey_copy_icon').removeClass('text-success');
                                }, 3000);
                                return true;
                            });

                            //添加到收藏按钮绑定
                            $('#btn_add_to_workspace').on('click', () => {
                                if (this.logined == 1) {
                                    $('#btn_add_to_workspace_icon').removeClass('text-cyan');
                                    $('#btn_add_to_workspace_icon').addClass('text-red');
                                    setTimeout(() => {
                                        $('#btn_add_to_workspace_icon').addClass('text-cyan');
                                        $('#btn_add_to_workspace_icon').removeClass('text-red');
                                    }, 3000);
                                    this.workspace_add('#btn_add_to_workspace', params.ukey, false);
                                } else {
                                    app.open('/login');
                                }
                            });

                            //下载提速按钮绑定
                            $('#btn_highdownload').on('click', () => {
                                if (this.logined == 1) {
                                    $('#upupModal').modal('show');
                                } else {
                                    app.open('/login');
                                }
                            });

                            //举报文件按钮绑定
                            $('#btn_report_file').on('click', () => {
                                if (this.logined == 1) {
                                    $('#reportModal').modal('show');
                                } else {
                                    app.open('/login');
                                }
                            });


                            //设置背景
                            //this.btn_copy_bind();
                            // if (rsp.data.type == 'jpg' || rsp.data.type == 'jpeg' || rsp.data.type == 'png' || rsp.data.type == 'gif') {
                            //     let img_url = 'https://getfile.tmp.link/img-' + params.ukey + '-0x0.jpg';
                            //     $('.img_great').attr('src', img_url);
                            //     //specail image model
                            //     let img = new Image();
                            //     img.src = img_url;
                            //     img.onload = () => {
                            //         if (img.height >= 1080 && img.width >= 1920) {
                            //             $('.img_great').fadeOut();
                            //             $('body').css('background-image', 'url(' + img_url + ')');
                            //             $('body').css('background-size', '100% auto');
                            //         }
                            //     }
                            // }
                            return true;
                        });
                    });

                    return true;
                }

                //file need to login
                if (rsp.status === 3) {
                    $('#file_messenger_icon').html('<i class="fas fa-robot fa-7x"></i>');
                    $('#file_messenger_msg').html(this.languageData.status_need_login);
                    $('#file_messenger_msg_login').show();
                    $('#file_messenger').show();
                    gtag('config', 'UA-96864664-3', {
                        'page_title': 'D-unLogin',
                    });
                    return false;
                }

                //file need to sync
                if (rsp.status === 2) {
                    $('#file_messenger_icon').html('<i class="fa-fw fas fa-spinner fa-spin fa-4x"></i>');
                    $('#file_messenger_msg').html(this.languageData.upload_sync_onprogress);
                    $('#file_messenger').show();
                    gtag('config', 'UA-96864664-3', {
                        'page_title': 'D-sync',
                    });
                    return false;
                }

                //file unavailable
                $('#file_messenger_icon').html('<i class="fas fa-folder-times  fa-4x"></i>');
                $('#file_messenger_msg').html(this.languageData.file_unavailable);
                $('#file_messenger').show();
                gtag('config', 'UA-96864664-3', {
                    'page_title': 'D-fileUnavailable',
                });
            }, 'json');
        } else {
            $('#file_unavailable').show();
        }
        this.loading_box_off();
    }

    like_file(ukey) {
        $.post(this.api_file, {
            action: 'like',
            ukey: ukey,
            token: this.api_token
        }, (rsp) => {
            let now = parseInt($('#likes_count').html());
            if (rsp.status == 1) {
                $('#likes_count').html(now + 1);
            } else {
                $('#likes_count').html(now - 1);
            }
        });
    }

    single_download_start(url, filename) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("progress", (evt) => {
            this.single_download_progress_on(evt, filename);
        }, false);
        xhr.addEventListener("error", (evt) => {
            if (this.download_retry < this.download_retry_max) {
                this.download_retry++;
                setTimeout(() => {
                    this.single_download_start(url, filename);
                }, 3000);
            } else {
                this.alert('下载发生错误，请重试。');
                this.single_download_reset();
                //reset download retry
                this.download_retry = 0;
            }
        }, false);
        xhr.addEventListener("timeout", (evt) => {
            if (this.download_retry < this.download_retry_max) {
                this.download_retry++;
                setTimeout(() => {
                    this.single_download_start(url, filename);
                }, 3000);
            } else {
                this.alert('下载发生错误，请重试。');
                this.single_download_reset();
                //reset download retry
                this.download_retry = 0;
            }
        }, false);
        xhr.addEventListener("abort", (evt) => {
            this.alert('下载中断，请重试。');
            this.single_download_reset();
        }, false);
        xhr.open("GET", url);
        xhr.onload = () => {
            this.single_download_complete(xhr, filename);
        };
        xhr.responseType = 'blob';
        xhr.send();
        $('.single_download_msg').html('准备中，正在开始下载...');
        $('.single_download_progress_bar').show();
        $('#btn_quick_download').attr('disabled', true);
    }

    single_download_complete(evt, filename) {
        this.download_retry = 0;
        let blob = new Blob([evt.response], {
            type: evt.response.type
        });
        //ie的下载
        if (window.navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            //非ie的下载
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(link.href);
        }
        //恢复进度条样式
        $('.single_download_msg').html('下载完成.');
        $('.single_download_progress_bar_set').removeClass('progress-bar-animated');
        $('.single_download_progress_bar_set').removeClass('progress-bar-striped');
        this.single_download_reset();
        this.download_queue_run();
    }

    single_download_progress_on(evt) {
        $('.single_download_msg').html('已下载... ' + bytetoconver(evt.loaded, true));
        $('.single_download_progress_bar_set').css('width', (evt.loaded / evt.total) * 100 + '%');
        $('.single_download_progress_bar_set').addClass('progress-bar-animated');
        $('.single_download_progress_bar_set').addClass('progress-bar-striped');
    }

    single_download_reset() {
        $('#btn_quick_download').removeAttr('disabled');
    }

    isWeixin() {
        var ua = navigator.userAgent.toLowerCase();
        return ua.match(/MicroMessenger/i) == "micromessenger";
    }

    isMobile() {
        if (/(iphone|ipad|ipod|ios|android)/i.test(navigator.userAgent.toLowerCase())) {
            return true;
        } else {
            return false;
        };
    }

    download_check() {
        // if (this.isWeixin()) {
        //     return false;
        // }
        // if (this.isMobile()) {
        //     return false;
        // }
    }

    download_queue_add(url, filename, ukey, filesize, filetype) {
        // if (this.isWeixin()) {
        //     this.alert(TL.languageData.file_not_allow_in_wechat);
        //     return false;
        // }
        // if (this.isMobile()) {
        //     window.open(url, '_blank');
        //     return false;
        // }
        this.download_queue[ukey] = [url, filename, ukey, ukey];
        // let html = app.tpl('download_list_tpl', {
        //     index: ukey,
        //     fname: filename,
        //     ftype: filetype,
        //     fsize_formated: filesize
        // });
        // $('#download_queue_list').prepend(html);
    }

    download_queue_del(index) {
        //$('#download_task_' + index).fadeOut();
        //移除下载，todo
        delete this.download_queue[index];
        this.download_queue_run();
    }

    download_queue_start() {
        this.download_queue_run();
    }

    download_queue_run() {
        if (this.download_queue_processing) {
            return false;
        }
        for (let x in this.download_queue) {
            let data = this.download_queue[x];
            if (data !== undefined) {
                console.log("Downloading:" + data[0]);
                this.download_queue_processing = true;
                this.download_queue_progress_start(data[0], data[1], data[2], data[3]);
                // $('#download_queue').show();
                return true;
            } else {
                // $('#download_queue').fadeOut();
                console.log('Queue out.');
            }
        }
        $('#download_queue').fadeOut();
    }

    download_queue_progress_start(url, filename, id, index) {
        $('.download_progress_bar_' + index).show();
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("progress", (evt) => {
            this.download_progress_on(evt, id, filename, index);
        }, false);
        xhr.addEventListener("load", (evt) => {
            delete this.download_queue[index];
            this.download_queue_start();
        }, false);
        xhr.addEventListener("timeout", (evt) => {
            if (this.download_retry < this.download_retry_max) {
                this.download_retry++;
                setTimeout(() => {
                    this.download_queue_progress_start(url, filename, id, index);
                }, 3000);
            } else {
                delete this.download_queue[index];
                this.download_queue_start();
                //reset download retry
                this.download_retry = 0;
            }
        }, false);
        xhr.addEventListener("error", (evt) => {
            if (this.download_retry < this.download_retry_max) {
                this.download_retry++;
                setTimeout(() => {
                    this.download_queue_progress_start(url, filename, id, index);
                }, 3000);
            } else {
                delete this.download_queue[index];
                this.download_queue_start();
                //reset download retry
                this.download_retry = 0;
            }
        }, false);
        xhr.addEventListener("abort", (evt) => {
            delete this.download_queue[index];
            this.download_queue_start();
        }, false);
        xhr.open("GET", url);
        xhr.onload = () => {
            this.download_queue_complete(xhr, filename, id, index);
        };
        xhr.responseType = 'blob';
        xhr.send();
    }

    download_queue_complete(evt, filename, id, index) {
        this.download_retry = 0;
        let blob = new Blob([evt.response], {
            type: evt.response.type
        });
        //ie的下载
        if (window.navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            //非ie的下载
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(link.href);
        }
        this.download_queue_processing = false;
        //关闭进度条
        //$('.download_progress_bar_' + index).hide();
        //恢复进度条样式
        $('.btn_download_' + index).removeAttr('disabled');
        $('.btn_download_' + index).html('<i class="fa-fw fad fa-download"></i>');

        delete this.download_queue[index];
        this.download_queue_run();
    }

    download_progress_on(evt, id, filename, index) {
        //$('#download_queue_' + id).html(TL.languageData.download_run + filename + ' (' + bytetoconver(evt.loaded, true) + ' / ' + bytetoconver(evt.total, true) + ')');
        $('.download_progress_bar_set_' + index).css('width', (evt.loaded / evt.total) * 100 + '%');
        if (evt.loaded == evt.total) {
            $('.download_progress_bar_' + index).fadeOut();
        }
    }

    download_file() {
        this.loading_box_on();
        // $('#btn_download').addClass('disabled');
        // $('#btn_download').html(this.languageData.file_btn_download_status0);
        $.post(this.api_file, {
            action: 'download_check',
            token: this.api_token
        }, (rsp) => {
            if (rsp.status == 1) {
                // location.href = $('#btn_download').attr('x-href');
                // $('#btn_download').html(this.languageData.file_btn_download_status2);
                this.single_download_start($('.single_download_progress_bar').attr('data-href'), $('.single_download_progress_bar').attr('data-filename'));
            } else {
                $('#btn_download').html(this.languageData.file_btn_download_status1);
            }
            // setTimeout(() => {
            //     $('#btn_download').removeClass('disabled');
            //     $('#btn_download').html(this.languageData.file_btn_download);
            // }, 3000);
            this.loading_box_off();
        }, 'json');
    }

    download_file_btn(i) {
        let ukey = this.list_data[i].ukey;
        let title = this.list_data[i].fname;
        let size = this.list_data[i].fsize_formated;
        let type = this.list_data[i].ftype;

        //新的方案
        $('.btn_download_' + ukey).attr('disabled', 'true');
        $('.btn_download_' + ukey).html('<i class="fa-fw fas fa-spinner fa-pulse"></i>');

        this.recaptcha_do('download_req_on_list', (recaptcha) => {
            $.post(this.api_file, {
                action: 'download_req',
                ukey: ukey,
                token: this.api_token,
                captcha: recaptcha
            }, (req) => {
                if (req.status == 1) {

                    gtag('config', 'UA-96864664-3', {
                        'page_title': 'Download-' + title,
                    });

                    this.download_queue_add(req.data, title, ukey, size, type);
                    this.download_queue_start();
                    return true;
                }
                if (req.status == 3) {
                    this.alert(this.languageData.status_need_login);
                    return false;
                }
                this.alert('发生了错误，请重试。');
                $('.btn_download_' + ukey).removeAttr('disabled');
                $('.btn_download_' + ukey).html('<i class="fa-fw fad fa-download"></i>');
            });
        });
    }

    download_file_url(i, cb) {
        let ukey = this.list_data[i].ukey;
        let title = this.list_data[i].fname;

        this.recaptcha_do('download_req_on_list', (recaptcha) => {
            $.post(this.api_file, {
                action: 'download_req',
                ukey: ukey,
                token: this.api_token,
                captcha: recaptcha
            }, (req) => {
                if (req.status == 1) {
                    gtag('config', 'UA-96864664-3', {
                        'page_title': 'Download-' + title,
                    });
                    cb(req.data);
                    return true;
                }
            });
        });
    }

    download_allfile_btn() {
        //未登录的用户暂时不支持全部下载功能
        if (!this.isLogin()) {
            this.alert(this.languageData.status_need_login);
            return false;
        }
        //在移动设备上无法使用全部下载功能
        let room_key = 'app_room_view_' + this.room.mr_id;
        // if (this.isMobile()) {
        //     this.alert(this.languageData.alert_no_support);
        //     return false;
        // }
        this.loading_box_on();
        let search = $('#room_search').val();
        var params = get_url_params();
        this.recaptcha_do('mr_addlist', (recaptcha) => {
            let photo = 0;
            if (localStorage.getItem(room_key) == 'photo') {
                photo = 1;
            }
            $.post(this.api_mr, {
                action: 'file_list_page',
                token: this.api_token,
                //captcha: recaptcha,
                page: 'all',
                photo: photo,
                mr_id: params.mrid,
                search: search
            }, (rsp) => {
                if (rsp.status != 0) {
                    this.autoload = true;
                    this.list_data = rsp.data;
                    //在下载全部文件之前，需要先刷新列表
                    this.mr_file_view(rsp.data, 0, params.mrid);
                    //关闭自动载入功能
                    this.dir_list_autoload_disabled();
                    //启动下载
                    for (let i in rsp.data) {
                        this.download_allfile_queue_add(() => {
                            this.download_file_btn(i);
                        });
                    }
                    this.download_allfile_queue_core();
                } else {
                    this.autoload = false;
                }
                this.loading_box_off();
            });
        });
    }

    download_allfile_queue = []
    download_allfile_queue_status = false

    download_allfile_queue_add(fn) {
        this.download_allfile_queue.push(fn);
        return true;
    }

    download_allfile_queue_core() {
        if (this.download_allfile_queue_status) {
            return true;
        }

        this.download_allfile_queue_status = true;
        if (this.download_allfile_queue.length > 0) {
            let fn = this.download_allfile_queue.shift();
            fn();
            setTimeout(() => {
                this.download_allfile_queue_status = false;
                this.download_allfile_queue_core();
            }, 1000);
        } else {
            this.download_allfile_queue_status = false;
        }
    }

    cli_uploader_generator2() {
        //如果有设定文件夹
        let mrid = get_page_mrid();
        console.log(mrid);
        let text_mr = '';
        if (mrid != undefined) {
            text_mr = `-F "mrid=${mrid}"`;
        }
        let model = localStorage.getItem('app_upload_model');

        let text_path = '-F "file=@ your file path (etc.. @/root/test.bin)"';
        let text_model = `-F "model=${model}"`;
        let text_token = `-F "token=${this.api_token}"`;

        let text = `curl -k ${text_path} ${text_token} ${text_model} ${text_mr} -X POST "https://connect.tmp.link/api_v2/cli_uploader"`;

        $('#cliuploader').show();
        $('#cliuploader_show').html(text);
        $('#cliuploader_copy').attr('data-clipboard-text', text);
        this.btn_copy_bind();
    }

    media_buy_modal(type) {
        if (this.logined === 0) {
            this.alert(this.languageData.status_need_login);
            return false;
        }

        //隐藏不同类型币种的价格列表
        $('.media_price_list').hide();
        //显示当前币种的价格列表
        $('#media_price_of_' + type).show();

        $('#mediaModal').modal('show');
    }


    storage_buy_modal(type) {
        if (this.logined === 0) {
            this.alert(this.languageData.status_need_login);
            return false;
        }

        //隐藏不同类型币种的价格列表
        $('.storage_price_list').hide();
        //显示当前币种的价格列表
        $('#storage_price_of_' + type).show();

        $('#storageModal').modal('show');
    }

    buy_select_open(type) {
        if (this.logined === 0) {
            this.alert(this.languageData.status_need_login);
            return false;
        }
        this.buy_type = type;
        $('#buySelectModal').modal('show');
    }

    bug_select(type) {
        this.buy_currency = type;
        $('#buySelectModal').modal('hide');
        setTimeout(() => {
            if (this.buy_type == 'hs') {
                this.hs_buy_modal(type);
            }
            if (this.buy_type == 'storage') {
                this.storage_buy_modal(type);
            }
            if (this.buy_type == 'media') {
                this.media_buy_modal(type);
            }
        }, 500);

    }

    hs_buy_modal(type) {
        if (this.logined === 0) {
            this.alert(this.languageData.status_need_login);
            return false;
        }

        //隐藏不同类型币种的价格列表
        $('.hs_price_list').hide();
        //显示当前币种的价格列表
        $('#hs_price_of_' + type).show();

        $('#highspeedModal').modal('show');
    }

    hs_download_file(filename) {
        if (this.logined === 0) {
            this.alert(this.languageData.status_need_login);
            return false;
        }
        $('#btn_highdownload').addClass('disabled');
        $('#btn_highdownload').html(this.languageData.file_btn_download_status0);
        $.post(this.api_file, {
            action: 'highspeed_check',
            token: this.api_token
        }, (rsp) => {
            if (rsp.status == 0) {
                $('#highspeedModal').modal('show');
                $('#btn_highdownload').removeClass('disabled');
                $('#btn_highdownload').html(this.languageData.file_btn_highdownload);
            } else {
                $.post(this.api_file, {
                    action: 'download_check',
                    token: this.api_token
                }, (rsp) => {
                    if (rsp.status == 1) {
                        // location.href = $('#btn_download').attr('x-href');
                        // $('#btn_highdownload').html(this.languageData.file_btn_download_status2);
                        this.single_download_start($('.single_download_progress_bar').attr('data-href'), $('.single_download_progress_bar').attr('data-filename'));
                    } else {
                        $('#btn_highdownload').html(this.languageData.file_btn_download_status1);
                    }
                    setTimeout(() => {
                        $('#btn_highdownload').removeClass('disabled');
                        $('#btn_highdownload').html(this.languageData.file_btn_highdownload);
                    }, 3000);
                }, 'json');
            }
        }, 'json');
    }

    hs_download_buy() {
        if (this.logined === 0) {
            this.alert(this.this.languageData.status_need_login);
            return false;
        }

        let price = 0;
        let time = $('#highspeed_time').val();
        let code = 'HS';

        if (this.buy_currency == 'cny') {
            code = 'HS';
            price = 6 * time;
        } else {
            code = 'HS-us';
            price = 1 * time;
        }

        if (this.buy_currency == 'cny') {
            window.open("https://pay.vezii.com/id4/pay_v2?price=" + price + "&token=" + this.api_token + "&prepare_code=" + code + "&prepare_type=addon&prepare_times=" + time, '_blank');
        } else {
            window.open('https://s12.tmp.link/payment/paypal/checkout_v2?price=' + price + '&token=' + this.api_token + '&prepare_type=addon&prepare_code=' + code + '&prepare_times=' + time, '_blank');
        }
    }

    storage_buy() {
        if (this.logined === 0) {
            this.alert(this.this.languageData.status_need_login);
            return false;
        }
        var price = 0;
        let code = 0;
        if (this.buy_currency == 'cny') {
            code = $('#storage_code_cny').val();
        } else {
            code = $('#storage_code_usd').val();
        }
        let time = $('#storage_time').val();
        switch (code) {
            case '256GB':
                price = 6 * time;
                break;
            case '1TB':
                price = 18 * time;
                break;

            case '256GB-us':
                price = 1 * time;
                break;
            case '1TB-us':
                price = 3 * time;
                break;
        }
        if (this.buy_currency == 'cny') {
            window.open("https://pay.vezii.com/id4/pay_v2?price=" + price + "&token=" + this.api_token + "&prepare_code=" + code + "&prepare_type=addon&prepare_times=" + time, '_blank');
        } else {
            window.open('https://s12.tmp.link/payment/paypal/checkout_v2?price=' + price + '&token=' + this.api_token + '&prepare_type=addon&prepare_code=' + code + '&prepare_times=' + time, '_blank');
        }
    }

    media_buy() {
        if (this.logined === 0) {
            this.alert(this.this.languageData.status_need_login);
            return false;
        }
        var price = 0;
        let code = 0;
        if (this.buy_currency == 'cny') {
            code = $('#media_code_cny').val();
        } else {
            code = $('#media_code_usd').val();
        }
        let time = $('#media_time').val();
        switch (code) {
            case 'MEDIA-V-P':
                price = 6 * time;
                break;
            case 'MEDIA-V-H':
                price = 18 * time;
                break;

            case 'MEDIA-V-P-us':
                price = 1 * time;
                break;
            case 'MEDIA-V-H-us':
                price = 3 * time;
                break;
        }
        if (this.buy_currency == 'cny') {
            window.open("https://pay.vezii.com/id4/pay_v2?price=" + price + "&token=" + this.api_token + "&prepare_code=" + code + "&prepare_type=addon&prepare_times=" + time, '_blank');
        } else {
            window.open('https://s12.tmp.link/payment/paypal/checkout_v2?price=' + price + '&token=' + this.api_token + '&prepare_type=addon&prepare_code=' + code + '&prepare_times=' + time, '_blank');
        }
    }

    orders_list() {
        $.post(this.api_user, {
            action: 'order_list',
            token: this.api_token,
            //captcha: recaptcha
        }, (rsp) => {
            if (rsp.data.service == 0) {
                $('#orders_addon_contents').html('<div class="text-center"><i class="fa-fw fad fa-folder-open fa-4x"></i></div>');
            } else {
                $('#orders_addon_contents').html('<div class="row" id="orders_services_contents"></div>');
                var service_list = rsp.data.service;
                var r = this.service_code(service_list);
                $('#order_list').html(app.tpl('order_list_tpl', r));
            }
            $('#orders_loader').fadeOut();
            $('#orders_loaded').show();
        }, 'json');
    }

    service_code(data) {
        var r = {};
        for (let i in data) {
            r[i] = {};
            r[i].name = '';
            r[i].des = '';
            r[i].icon = '';
            r[i].etime = data[i].etime;
            switch (data[i].code) {
                case 'hs':
                    r[i].name = this.languageData.service_code_hs;
                    r[i].des = this.languageData.service_code_hs_des;
                    r[i].icon = 'fas fa-rabbit-fast';
                    break;
                case 'storage':
                    r[i].name = this.languageData.service_code_storage + ' (' + bytetoconver(data[i].val, true) + ')';
                    r[i].des = this.languageData.service_code_storage_des;
                    r[i].icon = 'fad fa-box-heart';
                    break;
                case 'media-video':
                    r[i].name = this.languageData.service_code_media + ' (' + bytetoconver(data[i].val, true) + ')';
                    r[i].des = this.languageData.service_code_media_des;
                    r[i].icon = 'fal fa-video';
                    break;
            }
        }
        return r;
    }

    mr_file_addlist() {
        var params = get_url_params();
        $('#mrfile_add_list').html('<i class="fa-4x fa-fw fad fa-spinner-third fa-spin mx-auto"></i>');
        $.post(this.api_mr, {
            action: 'file_addlist',
            token: this.api_token,
            //captcha: recaptcha,
            mr_id: params.mrid
        }, (rsp) => {
            if (rsp.status == 0) {
                $('#mrfile_add_list').html('<div class="mx-auto"><i class="fa-fw fad fa-folder-open fa-4x"></i></div>');
            } else {
                $('#mrfile_add_list').html(app.tpl('mrfile_add_list_tpl', rsp.data));
            }
        });
    }

    mr_file_add(ukey) {
        var params = get_url_params();
        $('#btn-mraddlist-' + ukey).fadeOut(300);
        this.recaptcha_do('mr_add', (recaptcha) => {
            $.post(this.api_mr, {
                action: 'file_add',
                token: this.api_token,
                //captcha: recaptcha,
                mr_id: params.mrid,
                ukey: ukey
            }, (rsp) => {
                $('#mraddlist-' + ukey).fadeOut(500);
            });
        });
    }

    room_key_get() {
        let key = get_page_mrid();
        if (key == undefined) {
            key = 'workspace';
        }

        return {
            view: 'app_room_view_' + key,
            sort_by: 'app_room_view_sort_by_' + key,
            sort_type: 'app_room_view_sort_type_' + key,
        }

    }

    mr_file_list(page) {
        $('.no_files').fadeOut();
        $('.no_photos').fadeOut();

        let key = this.room_key_get();

        let room_sort_by = localStorage.getItem(key.sort_by);
        let room_sort_type = localStorage.getItem(key.sort_type);

        if (page == 0) {
            this.page_number = 0;
            $('#dir_list').html('');
            this.list_data = [];
        } else {
            this.page_number++;
        }

        //清空数据
        //$('#dir_list').html('');


        //如果是全页加载
        if (page === 'all') {
            this.page_number = 'all';
        }

        //初始化排序选项的状态
        $("#sort_by option[value='" + room_sort_by + "']").attr("selected", "selected");
        $("#sort_type option[value='" + room_sort_type + "']").attr("selected", "selected");

        //if search
        let search = $('#room_search').val();

        $('#dir_list_box').show();
        $('.mr_filelist_refresh_icon').addClass('fa-spin');
        $('.mr_filelist_refresh_icon').attr('disabled', true);
        this.loading_box_on();
        var params = get_url_params();
        this.recaptcha_do('mr_list', (recaptcha) => {
            let photo = 0;
            if (localStorage.getItem(key.view) == 'photo') {
                photo = 1;
            }
            $.post(this.api_mr, {
                action: 'file_list_page',
                token: this.api_token,
                //captcha: recaptcha,
                page: this.page_number,
                photo: photo,
                mr_id: params.mrid,
                sort_by: room_sort_by,
                sort_type: room_sort_type,
                search: search
            }, (rsp) => {
                $('.data_loading').hide();
                $('.mr_filelist_refresh_icon').removeClass('fa-spin');
                $('.mr_filelist_refresh_icon').removeAttr('disabled');
                this.mr_file_view(rsp.data, page, params.mrid);
                if (rsp.status != 0) {
                    this.autoload = true;
                    for (let i in rsp.data) {
                        this.list_data[rsp.data[i].ukey] = rsp.data[i];
                    }
                } else {
                    this.autoload = false;
                }

                //cancel
                if (rsp.status == 0 || rsp.data.length < 50) {
                    this.dir_list_autoload_disabled();
                }

                //如果是全页加载
                if (page === 'all') {
                    this.dir_list_autoload_disabled();
                    this.autoload = false;
                }

                this.loading_box_off();
            });
        });
    }

    room_performance_init(room_id) {
        let room_key_display = 'app_room_view_' + room_id;
        let storage_room_display = localStorage.getItem(room_key_display);
        let room_display = storage_room_display === null ? this.room.display : storage_room_display;
        localStorage.setItem(room_key_display, room_display);
        $("#pf_display option[value='" + this.room.display + "']").attr("selected", "selected");

        let room_key_sort_by = 'app_room_view_sort_by_' + room_id;
        let storage_room_sort_by = localStorage.getItem(room_key_sort_by);
        let room_sort_by = storage_room_sort_by === null ? this.room.sort_by : storage_room_sort_by;
        localStorage.setItem(room_key_sort_by, room_sort_by);
        $("#pf_sort_by option[value='" + this.room.sort_by + "']").attr("selected", "selected");

        let room_key_sort_type = 'app_room_view_sort_type_' + room_id;
        let storage_room_sort_type = localStorage.getItem(room_key_sort_type);
        let room_sort_type = storage_room_sort_type === null ? this.room.sort_type : storage_room_sort_type;
        localStorage.setItem(room_key_sort_type, room_sort_type);
        $("#pf_sort_type option[value='" + this.room.sort_type + "']").attr("selected", "selected");

        let room_key_allow_upload = 'app_room_view_allow_upload_' + room_id;
        let storage_room_allow_upload = localStorage.getItem(room_key_allow_upload);
        let room_allow_upload = storage_room_allow_upload === null ? this.room.allow_upload : storage_room_allow_upload;
        localStorage.setItem(room_key_allow_upload, room_allow_upload);
        if (storage_room_allow_upload == 'yes') {
            $('#pf_allow_upload').attr('checked', 'checked');
        }
    }

    room_performance_open() {
        $('#performanceModal').modal('show');
    }

    room_performance_post() {
        let pf_display = $('#pf_display').val();
        let pf_sort_by = $('#pf_sort_by').val();
        let pf_sort_type = $('#pf_sort_type').val();
        let pf_allow_upload = $('#pf_allow_upload').is(':checked') ? 'yes' : 'no';
        let mrid = this.room.mr_id;
        $.post(this.api_mr, {
            action: 'pf_set',
            token: this.api_token,
            pf_display: pf_display,
            sort_by: pf_sort_by,
            sort_type: pf_sort_type,
            pf_upload: pf_allow_upload,
            mr_id: mrid
        });
    }

    profile_confirm_delete_post() {
        let status = ($('#confirm_delete_status').is(':checked')) ? 'yes' : 'no';
        localStorage.setItem('user_profile_confirm_delete', status);
        $.post(this.api_user, {
            action: 'pf_confirm_delete_set',
            token: this.api_token,
            status: status
        });
    }

    profile_confirm_delete_set(status) {
        localStorage.setItem('user_profile_confirm_delete', status);
        if (status == 'yes') {
            $('#confirm_delete_status').attr('checked', 'checked');
        }
    }

    profile_confirm_delete_get() {
        let status = localStorage.getItem('user_profile_confirm_delete');
        if (status == 'yes') {
            return true;
        } else {
            return false;
        }
    }

    dir_list_model(type) {
        let room_key = 'app_room_view_' + this.room.mr_id;
        switch (type) {
            case 'photo':
                localStorage.setItem(room_key, 'photo');
                break;
            case 'list':
                localStorage.setItem(room_key, 'list');
                break;
            default:
                localStorage.setItem(room_key, 'list');
        }
        this.mr_file_list(0);
    }

    room_btn_active_reset() {
        $('#room_btn_file_list').removeClass('bg-dark');
        $('#room_btn_file_grid').removeClass('bg-dark');
        $('#room_btn_file_photo').removeClass('bg-dark');
    }

    dir_list_autoload_enabled() {
        this.autoload = true;
        $(window).on("scroll", (event) => {
            if ($(event.currentTarget).scrollTop() + $(window).height() + 100 >= $(document).height() && $(event.currentTarget).scrollTop() > 100) {
                if (this.autoload == true) {
                    this.autoload = false;
                    this.mr_file_list(1);
                }
            }
        });
    }

    dir_list_autoload_disabled() {
        $(window).off("scroll");
    }

    mr_file_by_list(data, page) {
        this.room_btn_active_reset();
        $('#room_btn_file_list').addClass('bg-dark');
        if (page == 0 || page == 'all') {
            $('#dir_list').html('');
            if (this.subroom_data.length != 0) {
                $('#dir_list').append(app.tpl('dir_list_tpl', this.subroom_data));
            }
            if (data === false && this.subroom_data == 0) {
                $('.no_files').show();
            }
        }
        if (data.length != 0) {
            $('#dir_list').append(app.tpl('dir_filelist_tpl', data));
        }
        $('.lefttime-remainder').each((i, e) => {
            let id = $(e).attr('id');
            let time = $(e).attr('data-tmplink-lefttime');
            this.countTimeDown(id, time);
        });
        this.btn_copy_bind();
        app.linkRebind();
    }

    mr_file_by_photo(data, page) {
        this.room_btn_active_reset();
        $('#room_btn_file_photo').addClass('bg-dark');
        if (page == 0 || page == 'all') {
            $('#dir_list').html('');
            if (this.subroom_data.length != 0) {
                $('#dir_list').append(app.tpl('dir_list_tpl', this.subroom_data));
            }
            if (data === false && this.subroom_data == 0) {
                $('.no_photos').show();
            }
        }
        if (data.length != 0) {
            $('#dir_list').append(app.tpl('dir_photolist_tpl', data));
        }
        this.btn_copy_bind();
        app.linkRebind();
        this.lazyLoadInstance.update();
    }

    mr_file_del(ukey) {
        var params = get_url_params();
        if (this.profile_confirm_delete_get()) {
            if (!confirm(this.languageData.confirm_delete)) {
                return false;
            }
        }
        $('.file_unit_' + ukey).hide();
        $.post(this.api_mr, {
            action: 'file_del',
            token: this.api_token,
            //captcha: recaptcha,
            mr_id: params.mrid,
            ukey: ukey
        }, () => {
            //this.mr_file_list();
        });
    }

    mr_add() {
        var name = $('#modal_meetingroom_create_name').val();
        var model = $('#modal_meetingroom_create_type').val();
        var mr_id = $('#mr_id').val();
        var parent = $('#mr_parent_id').val();
        var top = $('#mr_top_id').val();
        if (model == '' && name == '') {
            $('#notice_meetingroom_create').html(this.languageData.notice_meetingroom_status_mrcreat_fail);
            return false;
        }
        if (parent > 0) {
            model = 0;
        }
        $('#modal_meetingroom_create_btn').attr('disabled', true);
        $('#notice_meetingroom_create').html(this.languageData.notice_meetingroom_status_proccessing);
        this.recaptcha_do('mr_add', (recaptcha) => {
            $.post(this.api_mr, {
                action: 'create',
                token: this.api_token,
                //captcha: recaptcha,
                name: name,
                mr_id: mr_id,
                parent: parent,
                top: top,
                model: model
            }, (rsp) => {
                if (rsp.status == 1) {
                    $('#notice_meetingroom_create').html(this.languageData.notice_meetingroom_status_mrcreated);
                    this.room_list();
                    $('#mrCreaterModal').modal('hide');
                } else {
                    $('#notice_meetingroom_create').html(this.languageData.notice_meetingroom_status_mrcreat_fail);
                }
                setTimeout(() => {
                    $('#modal_meetingroom_create_btn').removeAttr('disabled');
                }, 2000);
            });
        });
    }

    mr_del(mrid) {
        if (this.profile_confirm_delete_get()) {
            if (!confirm(this.languageData.confirm_delete)) {
                return false;
            }
        }
        $('#meetingroom_id_' + mrid).fadeOut();
        $.post(this.api_mr, {
            action: 'delete',
            token: this.api_token,
            mr_id: mrid
        });
    }

    mr_exit(mrid) {
        $('#meetingroom_id_' + mrid).hide();
        $.post(this.api_mr, {
            action: 'exit',
            token: this.api_token,
            //captcha: recaptcha,
            mr_id: mrid
        });
    }

    mr_newname(mrid) {
        var newname = prompt(this.languageData.modal_meetingroom_newname, "");
        $.post(this.api_mr, {
            action: 'rename',
            token: this.api_token,
            name: newname,
            mr_id: mrid
        }, (rsp) => {
            this.room_list();
        });
    }

    file_rename(ukey, default_name) {
        var newname = prompt(this.languageData.modal_meetingroom_newname, default_name);
        if (newname == null || newname == "") {
            return false;
        }
        $.post(this.api_file, {
            action: 'rename',
            token: this.api_token,
            name: newname,
            ukey: ukey
        }, (rsp) => {
            //如果在 workspace 里面，则刷新
            if (get_page_mrid() == undefined) {
                this.workspace_filelist(0);
            } else {
                this.mr_file_list('all')
            }
        });
    }


    mr_list() {
        if (localStorage.getItem('app_login') != 1) {
            app.open('/login');
            return;
        }
        $('#mr_list_refresh_icon').html('<i class="fa-fw fad fa-spinner-third fa-spin"></i>');
        $('#mr_list_refresh_icon').attr('disabled', true);
        this.loading_box_on();
        $.post(this.api_mr, {
            action: 'list',
            token: this.api_token,
        }, (rsp) => {
            this.loading_box_off();
            if (rsp.status == 0) {
                $('#meetroom_list').html('<div class="mx-auto"><i class="fa-fw fad fa-folder-open fa-4x"></i></div>');
                $('#mr_list_refresh_icon').html('<i class="fa-fw fas fa-sync-alt"></i>');
                $('#mr_list_refresh_icon').removeAttr('disabled');
                return false;
            } else {
                $('#meetroom_list').html(app.tpl('dir_list_tpl', rsp.data));
                this.btn_copy_bind();
            }
            $('#mr_list_refresh_icon').html('<i class="fa-fw fas fa-sync-alt"></i>');
            $('#mr_list_refresh_icon').removeAttr('disabled');
            app.linkRebind();
        });
    }

    mr_file_view(data, page, room_id) {
        let room_key = 'app_room_view_' + room_id;
        switch (localStorage.getItem(room_key)) {
            case 'photo':
                this.mr_file_by_photo(data, page);
                break;
            case 'list':
                this.mr_file_by_list(data, page);
                break;
            default:
                this.mr_file_by_list(data, page);
        }
        this.is_file_ok_check(data);
        app.languageBuild();
    }

    room_total(mrid) {
        $('#room_total').html('');
        if(mrid==0){
            return false;
        }
        $.post(this.api_mr, {
            action: 'total', mr_id: mrid, token: this.api_token
        }, (rsp) => {
            if (rsp.data.nums > 0) {
                let total_size_text = bytetoconver(rsp.data.size, true);
                $('#room_total').html(`${rsp.data.nums} ${this.languageData.total_units_of_file} , ${total_size_text}`);
            }
        }, 'json');
    }

    room_list() {
        var params = get_url_params();
        $('#room_userlist').hide();
        $('.permission-room-file').hide();
        $('.permission-room-user').hide();
        $('.data_loading').show();
        //this.loading_box_on();
        //获取基本信息
        $.post(this.api_mr, {
            action: 'details',
            //captcha: recaptcha,
            token: this.api_token,
            mr_id: params.mrid
        }, (rsp) => {
            this.room_data = rsp.data;
            $('.data_loading').hide();
            this.loading_box_off();
            if (rsp.status === 0) {
                //会议室不存在了
                this.room.parent = 0;
                this.room.top = 0;
                this.room.ownner = 0;
                this.room.mr_id = 0;
                $('#file_messenger_icon').html('<i class="fas fa-folder-times  fa-4x"></i>');
                $('#file_messenger_msg').html(this.languageData.room_status_fail);
                $('#file_messenger').show();
                gtag('config', 'UA-96864664-3', {
                    'page_title': 'F-Unavailable',
                });
                return false;
            }
            //会议室不可用
            if (rsp.data.status == 'reported' && rsp.data.owner == 0) {
                this.room.parent = 0;
                this.room.top = 0;
                this.room.ownner = 0;
                this.room.mr_id = 0;
                $('#file_messenger_icon').html('<i class="fas fa-folder-times  fa-4x"></i>');
                $('#file_messenger_msg').html(this.languageData.room_status_fail);
                $('#file_messenger').show();
                gtag('config', 'UA-96864664-3', {
                    'page_title': 'F-Reported',
                });
                return false;
            }

            //room need to login
            if (rsp.status === 3) {
                $('#file_messenger_icon').html('<i class="fas fa-robot fa-7x"></i>');
                $('#file_messenger_msg').html(this.languageData.status_need_login);
                $('#file_messenger_msg_login').show();
                $('#file_messenger').show();
                gtag('config', 'UA-96864664-3', {
                    'page_title': 'F-unLogin',
                });
                return false;
            }
            gtag('config', 'UA-96864664-3', {
                'page_title': 'F-' + rsp.data.name,
            });

            //更新统计信息
            this.room_total(rsp.data.mr_id);
            this.room.parent = rsp.data.parent;
            this.room.top = rsp.data.top;
            this.room.owner = rsp.data.owner;
            this.room.mr_id = rsp.data.mr_id;
            this.room.display = rsp.data.display;
            this.room.sort_by = rsp.data.sort_by;
            this.room.sort_type = rsp.data.sort_type;
            this.room.status = rsp.data.status;
            this.room.allow_upload = rsp.data.allow_upload;
            this.room_performance_init(this.room.mr_id);

            //如果用户不是文件夹的拥有者，则显示出加入收藏夹的按钮
            if (this.room.owner == 0) {
                $('#room_btn_favorate').on('click', () => {
                    this.favorite_add(rsp.data.mr_id);
                });
                $('#room_btn_favorate').show();
            }

            //如果用户不是文件夹的拥有者，则显示举报按钮
            if (this.room.owner == 0) {
                $('#room_btn_report').show();
            }

            //如果这个文件夹有人收藏，则显示出收藏数量
            if (rsp.data.favorites > 0) {
                $('.fav-enabled').show();
                $('#favorite_count').html(rsp.data.favorites);
            }

            //如果文件夹不是用户的，则隐藏偏好设定
            if (this.room.owner == 0) {
                $('#room_btn_performance').hide();
            }

            $('#mr_copy').attr('data-clipboard-text', 'http://tmp.link/room/' + rsp.data.mr_id);
            $('.room_title').html(rsp.data.name);
            $('#dir_list').show();

            if (rsp.data.sub_rooms !== 0) {
                this.subroom_data = rsp.data.sub_rooms;
            } else {
                this.subroom_data = 0;
            }

            if (this.room.owner === 0) {
                $('.not_owner').hide();
            }

            this.btn_copy_bind();
            //this.mr_file_list(0);
            this.mr_file_list('all');

            //是否需要设置上级目录返回按钮
            if (this.room.top == 99) {
                $('.btn_for_sub').hide();
                $('.btn_for_desktop').show();
            } else {
                $('.btn_for_sub').show();
                $('.btn_for_desktop').hide();
            }
            $('#room_back_btn').html(app.tpl('room_back_btn_tpl', {}));
            $('#room_loading').hide();
            $('#room_loaded').show();
            app.linkRebind();
        });
    }

    favorite_add(mr_id) {
        if (!this.isLogin()) {
            app.open('/login');
            return false;
        }
        alert(this.languageData.favorite_add_success);
        $.post(this.api_mr, {
            action: 'favorite_add',
            token: this.api_token,
            mr_id: mr_id,
        });
    }

    favorite_del(mr_id) {
        $('#meetingroom_id_' + mr_id).hide();
        $.post(this.api_mr, {
            action: 'favorite_del',
            token: this.api_token,
            mr_id: mr_id,
        });
    }

    login() {
        var email = $('#email').val();
        var password = $('#password').val();
        $('#submit').attr('disabled', true);
        $('#msg_notice').show();
        $('#submit').html(this.languageData.form_btn_processing);
        $('#msg_notice').html(this.languageData.form_btn_processing);
        this.recaptcha_do('user_login', (recaptcha) => {
            if (email !== '' && password !== '') {
                $.post(this.api_user, {
                    action: 'login',
                    token: this.api_token,
                    captcha: recaptcha,
                    email: email,
                    password: password
                }, (rsp) => {
                    if (rsp.status == 1) {
                        $('#msg_notice').html(this.languageData.login_ok);
                        this.logined = 1;
                        this.get_details(() => {
                            localStorage.setItem('app_login', 1);
                            //如果当前页是首页，则刷新当前页面
                            let url = get_url_params();
                            if (url.tmpui_page === '/' || url.tmpui_page === undefined) {
                                window.location.reload();
                            } else {
                                window.history.back();
                            }
                            //app.open('/workspace');
                        });
                    } else {
                        $('#msg_notice').html(this.languageData.login_fail);
                        $('#submit').html(this.languageData.form_btn_login);
                        $('#submit').removeAttr('disabled');
                    }
                });
            }
        });
    }

    language(lang) {
        if (this.logined === 1) {
            $.post(this.api_user, {
                action: 'language',
                token: this.api_token,
                lang: lang
            });
        }
        var span_lang = 'English';
        if (lang === 'en') {
            span_lang = 'English';
        }

        if (lang === 'cn') {
            span_lang = '简体中文';
        }

        if (lang === 'hk') {
            span_lang = '繁体中文';
        }

        if (lang === 'jp') {
            span_lang = '日本語';
        }

        if (lang === 'ru') {
            span_lang = 'русский';
        }

        if (lang === 'kr') {
            span_lang = '한국어';
        }

        if (lang === 'my') {
            span_lang = 'Melayu';
        }
        $('.selected_lang').html(span_lang);
        app.languageSet(lang);
        //重新初始化导航，目前有一个小问题，无法刷新导航，暂时不管。
        //this.navbar.init(this);
        //console.log('navbar reinit');
    }

    logout() {
        localStorage.setItem('app_login', 0);
        this.uid = 0;
        this.logined = 0;
        this.storage_used = 0;
        this.storage = 0;
        app.open('/');
        $.post(this.api_user, {
            action: 'logout',
            token: this.api_token
        });
    }

    register() {
        var email = $('#email_new').val();
        var password = $('#password').val();
        var rpassword = $('#rpassword').val();
        var code = $('#checkcode').val();
        $('#msg_notice').show();
        $('#msg_notice').html(this.languageData.form_btn_processing);
        $('#submit').html(this.languageData.form_btn_login);
        $('#submit').attr('disabled', true);
        this.recaptcha_do('user_register', (recaptcha) => {
            $.post(this.api_user, {
                action: 'register',
                token: this.api_token,
                email: email,
                password: password,
                captcha: recaptcha,
                rpassword: rpassword,
                code: code
            }, (rsp) => {
                if (rsp.status === 1) {
                    $('#msg_notice').html(this.languageData.reg_finish);
                    $('#submit').html(this.languageData.reg_finish);
                    this.get_details(() => {
                        gtag('event', 'conversion', {
                            'send_to': 'AW-977119233/7Pa-CNH4qbkBEIHQ9tED'
                        });
                        setTimeout(() => {
                            app.open('/workspace');
                        }, 3000);
                    });
                } else {
                    $('#msg_notice').html(rsp.data);
                    $('#submit').html(this.languageData.form_btn_login);
                    $('#submit').removeAttr('disabled');
                }
            });
        });
    }

    cc_send() {
        var email = $('#email_new').val();
        $('#msg_notice').show();
        $('#msg_notice').html(this.languageData.form_btn_processing);
        $('#button-reg-checkcode').html(this.languageData.form_btn_processing);
        $('#button-reg-checkcode').attr('disabled', true);
        this.recaptcha_do('user_checkcode', (recaptcha) => {
            if (email !== '') {
                $.post(this.api_user, {
                    action: 'checkcode_send',
                    token: this.api_token,
                    captcha: recaptcha,
                    lang: app.languageGet(),
                    email: email
                }, (rsp) => {
                    if (rsp.status == 1) {
                        $('#msg_notice').html(this.languageData.form_checkcode_msg_sended);
                        $('#button-reg-checkcode').html(this.languageData.form_checkcode_sended);
                    } else {
                        $('#msg_notice').html(this.error_text(rsp.status));
                        $('#button-reg-checkcode').html(this.languageData.form_getcode);
                        $('#button-reg-checkcode').removeAttr('disabled');
                    }
                });
            }
        });
    }

    error_text(code) {
        let msg = this.languageData.status_error_0;
        switch (code) {
            case 9:
                msg = this.languageData.status_error_9;
                break;
            case 11:
                msg = this.languageData.status_error_11;
                break;
            case 10:
                msg = this.languageData.status_error_10;
                break;
        }
        return msg;
    }

    

    alert(content) {
        $("#alert-modal-content").html(content);
        $("#alertModal").modal('show');
    }

    report() {
        var ukey = $('#report_ukey').html();
        var reason = $('#report_model').val();
        $('#reportbtn').attr('disabled', true);
        $('#reportbtn').html(`<span class="text-red">${this.languageData.form_btn_processed}</span>`);
        $.post(this.api_file, {
            'action': 'report',
            'token': this.api_token,
            'reason': reason,
            'ukey': ukey
        }, (rsp) => {
            $('#reportbtn').html(this.languageData.form_btn_processed);
        }, 'json');
    }

    room_report() {
        var mr_id = this.room.mr_id;
        var reason = $('#room_report_model').val();
        $('#room_reportbtn').attr('disabled', true);
        $('#room_reportbtn').html(`<span class="text-red">${this.languageData.form_btn_processed}</span>`);
        $.post(this.api_mr, {
            'action': 'report',
            'token': this.api_token,
            'reason': reason,
            'mr_id': mr_id
        }, (rsp) => {
            $('#room_reportbtn').html(this.languageData.form_btn_processed);
        }, 'json');
    }

    find_file() {
        var ukey = $('#ukey').val();
        if (ukey !== '') {
            window.open('http://tmp.link/f/' + ukey);
        }
    }

    get_url_params() {
        var vars = [],
            hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }

    storage_status_update() {
        let data = {};
        data.storage_text = bytetoconver(this.storage, true);
        data.storage_used_text = bytetoconver(this.storage_used, true);
        data.percent = (this.storage_used / this.storage) * 100;
        $('#upload_storage_status').html(data.storage_used_text + ' | ' + data.storage_text);
        // $('#upload_storage_status').html(app.tpl('upload_storage_status_tpl', data));
    }

    btn_copy_bind() {
        var clipboard = new Clipboard('.btn_copy');
        clipboard.on('success', (e) => {
            let tmp = $(e.trigger).html();
            $(e.trigger).html('<i class="fas fa-check-circle fa-fw"></i>');
            setTimeout(() => {
                $(e.trigger).html(tmp);
            }, 3000);
        });
    }

    api_init() {
        $.post(this.api_url + '/init', (data) => {
            this.api_file = data + '/file';
            this.api_user = data + '/user';
            this.api_url_upload = data + '/file';
            this.api_mr = data + '/meetingroom';
        }, 'text');
        // $.post(this.api_url + '/init_uploader', (data) => {
        //     this.api_url_upload = data + '/file'
        // }, 'text');
    }

    fileicon(type) {
        var r = 'fad fa-file';
        switch (type) {
            case 'pdf':
                r = 'fad fa-file-pdf';
                break;

            case 'zip':
                r = 'fad fa-file-archive';
                break;
            case 'rar':
                r = 'fad fa-file-archive';
                break;
            case '7z':
                r = 'fad fa-file-archive';
                break;
            case 'gz':
                r = 'fad fa-file-archive';
                break;
            case 'tar':
                r = 'fad fa-file-archive';
                break;
            case 'msixbundle':
                r = 'fad fa-file-archive';
                break;

            case 'doc':
                r = 'fad fa-file-word';
                break;
            case 'wps':
                r = 'fad fa-file-word';
                break;
            case 'docx':
                r = 'fad fa-file-word';
                break;

            case 'c':
                r = 'fad fa-file-code';
                break;
            case 'go':
                r = 'fad fa-file-code';
                break;
            case 'cpp':
                r = 'fad fa-file-code';
                break;
            case 'php':
                r = 'fad fa-file-code';
                break;
            case 'java':
                r = 'fad fa-file-code';
                break;
            case 'js':
                r = 'fad fa-file-code';
                break;
            case 'vb':
                r = 'fad fa-file-code';
                break;
            case 'py':
                r = 'fad fa-file-code';
                break;
            case 'css':
                r = 'fad fa-file-code';
                break;
            case 'html':
                r = 'fad fa-file-code';
                break;
            case 'tar':
                r = 'fad fa-file-code';
                break;
            case 'asm':
                r = 'fad fa-file-code';
                break;

            case 'ogg':
                r = 'fad fa-file-music';
                break;
            case 'm4a':
                r = 'fad fa-file-music';
                break;
            case 'mp3':
                r = 'fad fa-file-music';
                break;
            case 'wav':
                r = 'fad fa-file-music';
                break;
            case 'weba':
                r = 'fad fa-file-music';
                break;

            case 'mp4':
                r = 'fad fa-file-video';
                break;
            case 'rm':
                r = 'fad fa-file-video';
                break;
            case 'rmvb':
                r = 'fad fa-file-video';
                break;
            case 'avi':
                r = 'fad fa-file-video';
                break;
            case 'mkv':
                r = 'fad fa-file-video';
                break;
            case 'webm':
                r = 'fad fa-file-video';
                break;
            case 'wmv':
                r = 'fad fa-file-video';
                break;
            case 'flv':
                r = 'fad fa-file-video';
                break;
            case 'mpg':
                r = 'fad fa-file-video';
                break;
            case 'mpeg':
                r = 'fad fa-file-video';
                break;
            case 'ts':
                r = 'fad fa-file-video';
                break;
            case 'mov':
                r = 'fad fa-file-video';
                break;
            case 'vob':
                r = 'fad fa-file-video';
                break;

            case 'png':
                r = 'fad fa-file-image';
                break;
            case 'gif':
                r = 'fad fa-file-image';
                break;
            case 'bmp':
                r = 'fad fa-file-image';
                break;
            case 'jpg':
                r = 'fad fa-file-image';
                break;
            case 'jpeg':
                r = 'fad fa-file-image';
                break;
            case 'webp':
                r = 'fad fa-file-image';
                break;

            case 'ppt':
                r = 'fad fa-file-powerpoint';
                break;
            case 'pptx':
                r = 'fad fa-file-powerpoint';
                break;

            case 'xls':
                r = 'fad fa-file-excel';
                break;
            case 'xlsx':
                r = 'fad fa-file-excel';
                break;
            case 'xlsm':
                r = 'fad fa-file-excel';
                break;

            case 'exe':
                r = 'fad fa-window';
                break;
            case 'bin':
                r = 'fad fa-window';
                break;
            case 'msi':
                r = 'fad fa-window';
                break;
            case 'bat':
                r = 'fad fa-window';
                break;
            case 'sh':
                r = 'fad fa-window';
                break;

            case 'rpm':
                r = 'fad fa-box-alt';
                break;
            case 'deb':
                r = 'fad fa-box-alt';
                break;
            case 'msi':
                r = 'fad fa-box-alt';
                break;
            case 'dmg':
                r = 'fad fa-box-alt';
                break;
            case 'apk':
                r = 'fad fa-box-alt';
                break;

            case 'torrent':
                r = 'fad fa-share-alt-square';
                break;

        }
        return r;
    }

    copyToClip(content) {
        var aux = document.createElement("textarea");
        aux.value = content;
        document.body.appendChild(aux);
        aux.select();
        document.execCommand("copy");
        document.body.removeChild(aux);
    }

    randomString(len) {
        len = len || 32;
        let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        let maxPos = $chars.length;
        let pwd = '';
        for (let i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }

    countTimeDown(id, time) {
        if (this.countDownID[id] === undefined) {
            //update dom
            let dom = document.getElementById(id);
            if (dom === null) {
                return false;
            } else {
                dom.innerHTML = this.leftTimeString(time);
                this.countDownID[id] = setInterval(() => {
                    if (time > 0) {
                        time--;
                        //update dom
                        let dom = document.getElementById(id);
                        if (dom === null) {
                            //todo
                            //this.countDownTime[id] = null;
                            //clearInterval(this.countDownID[id]);
                            return false;
                        } else {
                            dom.innerHTML = this.leftTimeString(time);
                        }
                    }
                }, 1000);
            }
        }
    }

    leftTimeString(time) {
        let now = time - 1;
        let left_time = now;

        let d = '';
        let h = '';
        let m = '';
        let s = '';

        if (now == 0) {
            return false;
        }

        if (now > 86400) {
            d = Math.floor(now / 86400);
            d = d + ':';
            left_time = left_time % 86400;
        }

        if (left_time > 3600) {
            h = Math.floor(left_time / 3600);
            h = h < 10 ? "0" + h : h;
            h = h === "0" ? "00" : h;
            h = h + ':';
            left_time = left_time % 3600;
        }

        if (left_time > 60) {
            m = Math.floor(left_time / 60);
            m = m < 10 ? "0" + m : m;
            m = m === "0" ? "00" : m;
            m = m + ':';
            left_time = left_time % 60;
        }

        if (left_time > 0) {
            s = left_time;
            s = s < 10 ? "0" + s : s;
            s = s === "0" ? "00" : s;
        }
        if (left_time === 0 && m !== '') {
            s = "00";
        }

        return d + h + m + s;
    }
}