class tmplink {

    api_url = 'https://tmp-api.vx-cdn.com/api_v2'
    api_url_sec = 'https://tmplink-sec.vxtrans.com/api_v2'
    api_url_upload = this.api_url + '/file'
    api_file = this.api_url + '/file'
    api_pay = this.api_url + '/pay'
    api_user = this.api_url + '/user'
    api_direct = this.api_url + '/direct'
    api_media = this.api_url + '/media'
    api_mr = this.api_url + '/meetingroom'
    api_notes = this.api_url + '/notes'
    api_toks = this.api_url_sec + '/token'
    api_tokx = this.api_url + '/token'
    api_token = null
    site_domain = null
    isSponsor = false

    pageReady = false
    readyFunction = []
    bgLoaded = false

    logined = 0
    user_group = {}
    area_cn = false
    uid = 0
    email = null
    api_language = null
    currentLanguage = 'cn'
    mr_data = []
    room = []
    room_data = []
    list_data = []
    dir_tree = {}
    subroom_data = []
    download_queue = []
    download_queue_processing = false
    download_index = 0
    get_details_do = false
    countDownID = [];

    storage = 0
    storage_used = 0
    high_speed_channel = false

    page_number = 1
    autoload = false
    sort_by = 0
    sort_type = 0
    Selecter = null
    upload_model_selected_val = 0
    download_retry = 0
    download_retry_max = 10
    recaptcha_op = true
    recaptcha = '6LfqxcsUAAAAABAABxf4sIs8CnHLWZO4XDvRJyN5'
    recaptcha_actions = [
        "token", "download_req", "stream_req",
    ]

    bulkCopyStatus = false
    bulkCopyTmp = ''
    bulkCopyTimer = 0
    mybg_light = 0
    mybg_dark = 0
    mybg_light_key = 0
    mybg_dark_key = 0
    system_background = {
        'light': ['/img/bg/l-1.svg'],
        'dark': ['/img/bg/d-1.svg']
    }

    constructor() {
        this.setArea();
        this.setDomain();
        // this.api_init();
        this.bg_init();
        this.setThemeColor();

        //初始化管理器
        this.Selecter = new BoxSelecter;
        this.media = new media;
        this.navbar = new navbar;
        this.uploader = new uploader;
        this.giftcard = new giftcard;
        this.direct = new direct;
        this.stream = new stream;
        this.profile = new profile;
        this.buy = new buy;
        this.notes = new notes;

        this.stream.init(this);
        this.giftcard.init(this);
        this.Selecter.init(this);
        this.media.init(this);
        this.direct.init(this);
        this.uploader.init(this);
        this.profile.init(this);
        this.buy.init(this);
        this.notes.init(this);

        //
        $('.workspace-navbar').hide();
        $('.workspace-nologin').hide();

        //初始化 return_page
        let return_page = localStorage.getItem('return_page');
        if (return_page === null) {
            localStorage.setItem('return_page', '0');
        }

        // this.navbar.init(this); //此函数需要等待语言包加载完毕才可执行

        this.upload_model_selected_val = localStorage.getItem('app_upload_model') === null ? 0 : localStorage.getItem('app_upload_model');

        let token = localStorage.getItem('app_token');
        $.post(this.api_tokx, {
            action: 'token_check',
            token: token
        }, (rsp) => {

            if (rsp.status == 3) {
                let html = app.tpl('initFail', {});
                $('#tmpui_body').html(html);
                app.languageBuild();
                return false;
            }

            if (rsp.status != 1) {
                this.recaptcha_do('token', (captcha) => {
                    $.post(this.api_tokx, {
                        action: 'token',
                        captcha: captcha,
                        token: token
                    }, (rsp) => {
                        this.api_token = rsp.data;
                        localStorage.setItem('app_token', rsp.data);
                        this.details_init();
                    });
                });
            } else {
                this.api_token = token;
                this.details_init();
            }
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

    matchNightModel() {
        let media = window.matchMedia('(prefers-color-scheme: dark)');
        return media.matches;
    }

    matchNightModelListener(cb) {
        let media = window.matchMedia('(prefers-color-scheme: dark)');
        let callback = (e) => {
            let prefersDarkMode = e.matches;
            this.setThemeColor();
            cb(prefersDarkMode);
        };
        if (typeof media.addEventListener === 'function') {
            media.addEventListener('change', callback);
        }
    }

    // 如果是夜间模式，修改主题色为黑色
    setThemeColor() {
        if (this.matchNightModel()) {
            $('meta[name="theme-color"]').attr('content', '#000');
        } else {
            $('meta[name="theme-color"]').attr('content', '#fff');
        }
    }

    ga(title) {
        if (this.api_token == null) {
            setTimeout(() => {
                this.ga(title);
            }, 3000);
            return false;
        }
        $.post(this.api_user, {
            action: 'event_ui',
            token: this.api_token,
            title: title,
            path: location.pathname + location.search,
        });
    }

    setDomain() {
        //获取当前域名
        this.site_domain = window.location.hostname == 'ttttt.link' ? 'ttttt.link' : 'tmp.link';
        if (this.site_domain === 'tmp.link') {
            $('.logo').attr('src', '/img/logo/2.png');
            $('#head_logo').html('tmp.link');
        } else {
            $('.logo').attr('src', '/img/logo/logo2.svg');
            $('#head_logo').html('ttttt.link');
        }
    }

    setBtnForSponsor() {
        $('.btn-upload').removeClass('btn-primary');
        $('.btn-upload').addClass('btn-red');
    }

    setArea(cb) {
        $.post(this.api_tokx, {
            action: 'set_area',
        }, (rsp) => {
            if (rsp.data === 1) {
                this.area_cn = true;
                //当为中国大陆地区时，检查主机名是否为ttttt.link，如果不是则跳转到ttttt.link
                // if (window.location.hostname !== 'ttttt.link' && window.location.hostname !== '127.0.0.1') {
                //     //如果有参数
                //     let params = '';
                //     if (window.location.search !== '') {
                //         params = window.location.search;
                //     }
                //     window.location.href = 'https://ttttt.link' + params;
                // }
                // $('.btn_play').hide();
            } else {
                this.area_cn = false;
            }
            if (cb !== undefined && typeof cb === 'function') {
                cb();
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

    bg_init() {
        if (document.querySelector('#background_wrap') == null) {
            $('body').append('<div id="background_wrap" style="z-index: -2;position: fixed;top: 0;left: 0;height: 100%;width: 100%;"></div>');
            $('body').append(`<div id="background_wrap_img" style="z-index: -1;position: fixed;top: 0;left: 0;height: 100%;display:none;width: 100%;"></div>`);
        }
    }

    bg_remove() {
        $('#background_wrap').remove();
        $('#background_wrap_img').remove();
    }

    bg_load() {
        if (this.bgLoaded === false) {
            let night = this.matchNightModel();
            this.bgLoadImg1(night);
            this.matchNightModelListener((night) => {
                this.bgLoadImg1(night);
            });
        }
        this.bgLoaded = true;
    }

    bgLoadImg1(night) {

        let imgSource = this.system_background;
        //随机选择一张图片
        let img_light = imgSource['light'][Math.floor(Math.random() * imgSource['light'].length)];
        let img_dark = imgSource['dark'][Math.floor(Math.random() * imgSource['dark'].length)];
        let imgSrc = '';
        let imgSrcLight = '';
        let imgSrcDark = '';

        if (night) {
            $('#background_wrap').css('background-color', '#6a6868');
        } else {
            $('#background_wrap').css('background-color', '#ffffff');
        }

        if (this.mybg_dark !== 0) {
            imgSrcDark = this.mybg_dark;
            $('.pf_bg_dark_set').show();
        } else {
            imgSrcDark = img_dark;
            $('.pf_bg_dark_set').hide();
        }

        if (this.mybg_light !== 0) {
            imgSrcLight = this.mybg_light;
            $('.pf_bg_light_set').show();
        } else {
            imgSrcLight = img_light;
            $('.pf_bg_light_set').hide();
        }

        if (night) {
            imgSrc = imgSrcDark;
        } else {
            imgSrc = imgSrcLight;
        }

        $('.pf_bg_light').attr('src', imgSrcLight);
        $('.pf_bg_dark').attr('src', imgSrcDark);

        $('.pf_bg_dark').attr('src', this.system_background.dark[0]);
        $('#background_wrap_img').removeClass('anime-fadein');
        $('#background_wrap_img').css('display', 'none');
        $.get(imgSrc, () => {
            $('#background_wrap_img').css('background', `url("${imgSrc}") no-repeat center`);
            $('#background_wrap_img').css('background-size', 'cover');
            $('#background_wrap_img').addClass('anime-fadein');
            $('#background_wrap_img').css('display', '');
        });
    }

    bgLoadCSS(night) {
        // $('#background_wrap_img').hide();
        $('#background_wrap_img').css('background-size', 'cover');
        $('#background_wrap_img').css('background-image', `url("/img/bg/cool-background.svg")`);
        // if (night) {
        //     $('#background_wrap_img').css('background',``);
        // } else {
        //     $('#background_wrap_img').css('background',``);
        // }
        $('#background_wrap_img').show();
    }

    bgLoadVideo(night) {
        let videoSrc = '';
        if (night) {
            videoSrc = '/video/bg_night.mp4';
        } else {
            videoSrc = '/video/bg.mp4';
        }

        //如果在首页，载入视频
        let url = get_url_params('tmpui_page');
        let page = url.tmpui_page;
        if (page === '/' || page === undefined || isMobileScreen() === false) {
            let video = `<video muted id="bg_Video" style="height:auto;width:auto;min-height:100%;min-width:100%"><source src="${videoSrc}" type="video/mp4"></video>`;
            $('body').append(`<div id="background_wrap_video" style="z-index: -1;position: fixed;top: 0;left: 0;height: 100%;display:none;width: 100%;">${video}</div>`);
            $('#background_wrap').hide();
            let v = document.getElementById('bg_Video');
            v.addEventListener('canplay', () => {
                $('#background_wrap_video').fadeIn();
                v.play();
            });
        } else {
            $('#background_wrap_video').remove();
            $('#background_wrap').show();
        }
    }

    bgVideoChange(night) {
        let videoSrc = '';
        if (night) {
            videoSrc = '/video/bg_night.mp4';
        } else {
            videoSrc = '/video/bg.mp4';
        }

        //如果在首页，载入视频
        let url = get_url_params('tmpui_page');
        let page = url.tmpui_page;
        if (page === '/' || page === undefined || isMobileScreen() === false) {
            $('#background_wrap_video').fadeOut();
            $('#bg_Video').attr('src', videoSrc);
            let v = document.getElementById('bg_Video');
            v.addEventListener('canplay', () => {
                $('#background_wrap_video').fadeIn();
                v.play();
            });
        } else {
            $('#background_wrap_video').remove();
            $('#background_wrap').show();
        }
    }

    lazyload(dom) {
        $(dom).each((i, e) => {
            let img = new Image();
            let url = $(e).attr('data-src');
            if (url !== undefined) {
                img.src = url;
                img.onload = () => {
                    $(e).attr('src', img.src);
                }
            }
        });
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
            this.bg_load();
            //如果是赞助者，激活特定按钮的颜色
            if (this.sponsor) {
                this.isSponsor = true;
                this.setBtnForSponsor();
            }
            //初始化直链
            this.direct.init_details(() => {
                this.readyExec();
            });
            //初始化用户个性化信息
            this.profile.init_details();
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
                $('#mv_box_0').html(app.languageData.status_error_14);
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
            this.alert(app.languageData.status_error_15);
            return false;
        }
        window.location.href = 'https://' + this.site_domain + '/f/' + code;
    }

    loading_box_on() {
        $('#loading_box').show();
    }

    loading_box_off() {
        $('#loading_box').fadeOut();
    }

    recaptcha_do(type, cb) {
        if (this.recaptcha_op && this.recaptchaCheckAction(type)) {
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
            $.post(this.api_tokx, {
                action: 'challenge',
            }, (rsp) => {
                cb(rsp.data);
            });
        }
    }

    recaptchaCheckAction(action) {
        for (let i in this.recaptcha_actions) {
            if (this.recaptcha_actions[i] == action) {
                return true;
            }
        }
        return false
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

        $('#index_lang').fadeIn();
        $('.navbar_ready').show();

        if (this.sponsor) {
            $('.show_for_sponsor').show();
        } else {
            $('.show_for_sponsor').hide();
            $('.to_be_sponsor').show();
        }
        //set process bar to 100%
        // setTimeout(() => {
        //     $('#index_userinfo_loading').fadeOut();
        // },1000);
        if (this.isMacOS() && !this.isMenubarX()) {
            $('.showOpenInMenubarX').show();
        }
    }

    open_manager() {
        $('#index_prepare').fadeOut();
        $('#index_manager').fadeIn();
    }

    get_details(cb) {
        //获取当前
        let url = get_url_params('tmpui_page');
        let page = url.tmpui_page;

        $.post(this.api_user, {
            action: 'get_detail',
            token: this.api_token
        }, (rsp) => {

            if (rsp.status === 1) {
                localStorage.setItem('app_login', 1);
                this.logined = 1;
                this.uid = rsp.data.uid;
                this.storage_used = rsp.data.storage_used;
                this.storage = rsp.data.storage;
                this.private_storage_used = rsp.data.private_storage_used;
                this.high_speed_channel = rsp.data.highspeed;
                this.sponsor = rsp.data.sponsor;
                this.sponsor_time = rsp.data.sponsor_time;
                this.user_acv = rsp.data.acv;
                this.user_group = rsp.data.group;

                this.user_join = rsp.data.join;
                this.user_total_files = rsp.data.total_files;
                this.user_total_filesize = bytetoconver(rsp.data.total_filesize, true);
                this.user_total_upload = bytetoconver(rsp.data.total_upload, true);
                this.user_acv_dq = bytetoconver(rsp.data.acv_dq * 1024 * 1024, true);
                this.user_acv_storage = bytetoconver(this.user_acv * 16 * 1024 * 1024, true);


                localStorage.setItem('app_lang', rsp.data.lang);

                this.mybg_light = rsp.data.pf_mybg_light;
                this.mybg_dark = rsp.data.pf_mybg_dark;
                this.mybg_light_key = rsp.data.pf_mybg_light_key;
                this.mybg_dark_key = rsp.data.pf_mybg_dark_key;

                app.languageSet(rsp.data.lang);
                //文件下载页，不执行这个操作
                if (page != '/file') {
                    this.profile_confirm_delete_set(rsp.data.pf_confirm_delete);
                    this.profile_bulk_copy_set(rsp.data.pf_bulk_copy);
                    this.dir_tree_get();
                    //更新到 myModal
                    $('.user_rank').html(this.uid);
                    $('.user_storage').html(bytetoconver(this.storage_used) + '/' + bytetoconver(this.storage));
                    $('.user_acv').html(this.user_acv);
                    $('.user_acv_dq').html(this.user_acv_dq);
                    $('.user_acv_storage').html(this.user_acv_storage);
                    $('.user_join').html(this.user_join);
                    $('.user_total_files').html(this.user_total_files);
                    $('.user_total_filesize').html(this.user_total_filesize);
                    $('.user_total_upload').html(this.user_total_upload);
                    if (this.sponsor) {
                        $('.user_sponsor_time').html(this.sponsor_time);
                    }
                }
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

    myBgPfReset() {
        this.loading_box_on();
        $.post(this.api_user, {
            action: 'pf_mybg_reset',
            token: this.api_token
        }, (rsp) => {
            if (rsp.status === 1) {
                this.mybg_light = 0;
                this.mybg_dark = 0;
                this.mybg_light_key = 0;
                this.mybg_dark_key = 0;
                this.bgLoadImg1();
            } else {
                alert(app.languageData.status_error_0);
            }
            this.loading_box_off();
        });
    }

    password_reset_confim() {
        var password = $('#modal_password_reset').val();
        var rpassword = $('#modal_password_reset_re').val();
        if (password !== rpassword) {
            $("#notice_resetpassword").html(app.languageData.model_resetpassword_error_no_match);
            return false;
        }
        $("#notice_resetpassword").html(app.languageData.model_resetpassword_msg_processing);
        $("#modal_password_reset_btn").attr('disabled', true);
        $.post(this.api_user, {
            action: 'passwordreset',
            password: password,
            rpassword: rpassword,
            token: this.api_token
        }, (rsp) => {
            if (rsp.status === 1) {
                $("#notice_resetpassword").html(app.languageData.model_resetpassword_msg_processed);
                $("#modal_password_reset_btn").html(app.languageData.model_resetpassword_msg_processed);
            } else {
                $("#notice_resetpassword").html(app.languageData.model_resetpassword_error_fail);
                $("#modal_password_reset_btn").removeAttr('disabled');
            }
        });
    }

    email_change_confim() {
        var email = $('#email_new').val();
        var code = $('#checkcode').val();
        $("#notice_emailchange").html(app.languageData.model_email_change_msg_processing);
        $("#email_change_confim_btn").attr('disabled', true);
        $.post(this.api_user, {
            action: 'email_change',
            email: email,
            code: code,
            token: this.api_token
        }, (rsp) => {
            if (rsp.status === 1) {
                $("#notice_emailchange").html(app.languageData.model_email_change_msg_processed);
                $("#email_change_confim_btn").html(app.languageData.model_email_change_msg_processed);
            } else {
                $("#notice_emailchange").html(rsp.data);
                $("#email_change_confim_btn").removeAttr('disabled');
            }
        });
    }

    previewModel(ukey, name, id) {
        let url = 'https://tmp-static.vx-cdn.com/img-' + ukey + '-0x0.jpg';
        $('#preview_img_loader').show();
        $('#preview_img').hide();
        $.get(url, () => {
            $('#preview_img_loader').hide();
            $('#preview_img').attr('src', url);
            $('#preview_img').show();
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
        $('#btn_preview_download').html(app.languageData.on_select_download);
        $('#btn_preview_download').attr('onclick', 'TL.download_direct(\'' + ukey + '\')');
        $('#btn_preview_remove').attr('onclick', "TL.workspace_del('" + ukey + "')");
        $('#previewModal').modal('show');
    }

    password_found() {
        this.recaptcha_do('passwordfound', (captcha) => {
            var email = $('#email_new').val();
            if (email === '') {
                return false;
            }
            $('#submit').attr('disabled', true);
            $('#msg_notice').show();
            $('#msg_notice').html(app.languageData.form_btn_processing);
            $.post(this.api_user, {
                action: 'passwordfound',
                token: this.api_token,
                email: email,
                captcha: captcha
            }, (rsp) => {
                if (rsp.status == 1) {
                    $('#msg_notice').fadeOut();
                    $('#submit').html(app.languageData.form_btn_processed);
                } else {
                    switch (rsp.status) {
                        case 13:
                            $('#msg_notice').html(app.languageData.status_13);
                            break;
                        case 14:
                            $('#msg_notice').html(app.languageData.status_14);
                            break;
                        default:
                            $('#msg_notice').html(app.languageData.status_unknow);
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
                if (!confirm(app.languageData.confirm_delete)) {
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
                $('#workspace_total').html(`${rsp.data.nums} ${app.languageData.total_units_of_file} , ${total_size_text}`);
            }
        }, 'json');
    }

    workspace_filelist_autoload_disabled() {
        $(window).off("scroll");
    }

    workspace_filelist(page) {
        $('.no_files').fadeOut();
        $('.no_dir').fadeOut();
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
                    $('#workspace_filelist').html('<div class="text-center"><iconpark-icon name="folder-open" class="fa-fw fa-4x"></iconpark-icon></div>');
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
    }

    workspace_btn_active_reset() {
        $('#ws_btn_file_list').removeClass('text-blue');
        $('#ws_btn_file_grid').removeClass('text-blue');
        $('#ws_btn_file_photo').removeClass('text-blue');
    }

    workspace_filelist_by_photo(data, page) {
        this.workspace_btn_active_reset();
        $('#ws_btn_file_photo').addClass('text-blue');
        if (page == 0 && data == false) {
            $('.no_photos').show();
        }
        if (data.length == 0) {
            return false;
        }
        if (page == 0) {
            $('#workspace_filelist').html('<div class="row" id="filelist_photo"></div>');
        }
        $('#filelist_photo').append(app.tpl('workspace_filelist_photo_tpl', data));
        this.btn_copy_bind();
        this.is_file_ok_check(data);
        app.linkRebind();
        this.lazyload('.lazyload');
    }

    workspace_filelist_by_list(data, page) {
        this.workspace_btn_active_reset();
        $('#ws_btn_file_list').addClass('text-blue');
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
            $('#file_messenger_icon').html('<iconpark-icon name="cloud-arrow-down" class="fa-fw fa-4x"></iconpark-icon>');
            $('#file_messenger_msg').removeClass('display-4');
            $('#file_messenger_msg').html('请复制链接后，在外部浏览器打开进行下载。');
            $('#file_messenger').show();
            this.ga('weixinUnavailable');
            return false;
            $('#wechat_notice').show();
        }

        // this.loading_box_on();

        // opacityShow('#download_msg');
        var params = get_url_params();
        var fileinfo = null;
        if (params.ukey !== undefined) {
            $.post(this.api_file, {
                action: 'details',
                ukey: params.ukey,
                token: this.api_token
            }, (rsp) => {

                //更新 Logo
                $('#top_loggo').attr('src', '/img/ico/logo-new.svg');

                if (rsp.status === 1) {
                    //隐藏信息提示窗口
                    $('#file_messenger').hide();
                    //
                    this.ga('D-' + rsp.data.name);
                    fileinfo = rsp.data;
                    $('#file_box').show();
                    $('#filename').html(rsp.data.name);
                    $('#filesize').html(rsp.data.size);

                    $('#btn_add_to_workspace_mobile').on('click', () => {
                        if (this.logined == 1) {
                            this.workspace_add('#btn_add_to_workspace_mobile', params.ukey);
                            $('#btn_add_to_workspace_mobile').html('<iconpark-icon name="circle-check" class="fa-fw mx-auto my-auto mb-2text-green fa-3x"></iconpark-icon>');
                            gtag("event", "login");
                        } else {
                            app.open('/app&listview=login');
                        }
                    });

                    //如果设置了个性化图标
                    if (rsp.data.ui_publish === 'yes' && rsp.data.ui_publish_status === 'ok' && rsp.data.ui_pro === 'yes') {
                        $('.userinfo_avatar').show();
                        let avatarURL = `https://tmp-static.vx-cdn.com/static/avatar?id=${rsp.data.ui_avatar_id}`;
                        let img = new Image();
                        img.src = avatarURL;
                        img.onload = () => {
                            $('.userinfo_avatar_img').attr('src', avatarURL);
                        }
                    }

                    //设定分享者信息
                    if (rsp.data.ui_publish === 'yes' && rsp.data.ui_publish_status === 'ok') {
                        if (rsp.data.ui_pro === 'yes') {
                            $('.userinfo_pro').show();
                        } else {
                            $('.userinfo_sd').show();
                        }
                        $('.userinfo').show();
                        $('.userinfo_nickname').html(rsp.data.ui_nickname);
                    }

                    //更换图标
                    let icon = this.fileicon(rsp.data.type);
                    $('#file-icon').attr('name', icon);

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

                    $('#download_msg').html('<iconpark-icon name="loader" class="fa-fw fa-spin"></iconpark-icon> ');

                    //请求下载地址
                    this.recaptcha_do('download_req', (recaptcha) => {
                        $.post(this.api_file, {
                            action: 'download_req',
                            ukey: params.ukey,
                            token: this.api_token,
                            captcha: recaptcha
                        }, (req) => {
                            this.ga('D-' + rsp.data.name);
                            if (req.status != 1) {
                                $('#download_msg').html('<iconpark-icon name="circle-exclamation" class="fa-fw"></iconpark-icon> ');
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
                            // window.location.href = download_url;
                            // $('#download_msg').attr('class', 'badge badge-pill badge-success');
                            // $('#download_msg').fadeOut();

                            opacityHide('#download_msg');

                            //分享链接
                            let share_url = 'https://' + this.site_domain + '/f/' + params.ukey;

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
                                window.location.href = download_url;
                                //添加按钮按下反馈
                                opacityShow('#download_msg');
                                $('#download_msg').html('<iconpark-icon name="loader" class="fa-fw fa-spin"></iconpark-icon> ');
                                //3秒后解除
                                setTimeout(() => {
                                    // $('#download_msg').fadeOut();
                                    opacityHide('#download_msg');
                                }, 3000);
                                return true;
                            });

                            // 移动设备上的按钮反馈
                            $('#file_download_url').on('click', () => {
                                //添加按钮按下反馈
                                opacityShow('#download_msg');
                                // $('#download_msg').fadeIn();
                                $('#download_msg').html('<iconpark-icon name="loader" class="fa-fw fa-spin"></iconpark-icon> ');
                                //3秒后解除
                                setTimeout(() => {
                                    // $('#download_msg').fadeOut();
                                    opacityHide('#download_msg');
                                }, 3000);
                                return true;
                            });

                            //扫码下载按钮绑定
                            $('#file_download_by_qrcode').on('click', () => {
                                $('#qrModal').modal('show');
                                return true;
                            });

                            //如果可以，显示播放按钮
                            if (this.stream.allow(rsp.data.name, fileinfo.owner) || this.stream.checkForOpenOnApps(rsp.data.name, fileinfo.owner)) {
                                $('.btn_play').show();
                                if (this.stream.allow(rsp.data.name, fileinfo.owner)) {
                                    $('.play_on_browser').attr('onclick', `TL.stream.request('${params.ukey}','web')`);
                                    $('.play_on_browser').show();
                                }
                                if (this.stream.checkForOpenOnApps(rsp.data.name, fileinfo.owner)) {
                                    $('.play_on_potplayer').attr('onclick', `TL.stream.request('${params.ukey}','potplayer')`);
                                    $('.play_on_potplayer').show();
                                    $('.play_on_iina').attr('onclick', `TL.stream.request('${params.ukey}','iina')`);
                                    $('.play_on_iina').show();
                                    $('.play_on_nplayer').attr('onclick', `TL.stream.request('${params.ukey}','nplayer')`);
                                    $('.play_on_nplayer').show();
                                    $('.play_copy_url').attr('onclick', `TL.stream.request('${params.ukey}','copy')`);
                                    $('.play_copy_url').show();
                                }
                                //隐藏一个按钮，使排位保持平衡
                                $('#btn_highdownload').hide();
                            }

                            //复制链接按钮绑定
                            $('#file_download_url_copy').on('click', () => {
                                //复制内容到剪贴板
                                navigator.clipboard.writeText(share_url);
                                $('#file_download_url_copy_icon').html('<iconpark-icon name="circle-check" class="fa-fw mx-auto my-auto mb-2text-green fa-3x"></iconpark-icon>');
                                setTimeout(() => {
                                    $('#file_download_url_copy_icon').html('<iconpark-icon name="share-all" class="fa-fw mx-auto my-auto mb-2 fa-3x text-cyan"></iconpark-icon>');
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
                                    //更换图标为完成的标志
                                    $('#btn_add_to_workspace_icon').html('<iconpark-icon name="circle-check" class="fa-fw mx-auto my-auto mb-2 text-green fa-3x"></iconpark-icon>');
                                    this.workspace_add('#btn_add_to_workspace', params.ukey, false);
                                    //移除监听
                                    $('#btn_add_to_workspace').off('click');
                                } else {
                                    //设定登录后跳转的页面
                                    localStorage.setItem('return_page', getCurrentURL());
                                    app.open('/app&listview=login');
                                }
                            });

                            //下载提速按钮绑定
                            $('#btn_highdownload').on('click', () => {
                                $('#upupModal').modal('show');
                            });

                            //举报文件按钮绑定
                            $('#btn_report_file').on('click', () => {
                                $('#reportModal').modal('show');
                            });


                            //设置背景
                            //this.btn_copy_bind();
                            // if (rsp.data.type == 'jpg' || rsp.data.type == 'jpeg' || rsp.data.type == 'png' || rsp.data.type == 'gif') {
                            //     let img_url = 'https://static.ttttt.link/img-' + params.ukey + '-0x0.jpg';
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

                            $('#file_loading').fadeOut(100);
                            $('#file_op').fadeIn(300);

                            return true;
                        });
                    });

                    return true;
                }

                //file need to login
                if (rsp.status === 3) {
                    $('#file_messenger_icon').html('<iconpark-icon name="shield-keyhole" class="fa-fw fa-7x"></iconpark-icon>');
                    $('#file_messenger_msg').html(app.languageData.status_need_login);
                    $('#file_messenger_msg_login').show();
                    $('#file_messenger').show();
                    this.ga(`Any-[${params.ukey}]`);
                    //设定登录后跳转的页面
                    localStorage.setItem('return_page', getCurrentURL());
                    return false;
                }

                //file need to sync
                if (rsp.status === 2) {
                    $('#file_messenger_icon').html('<img src="/img/loading.svg" height="80"  />');
                    $('#file_messenger_msg').html(app.languageData.upload_sync_onprogress);
                    $('#file_messenger').show();
                    this.ga(`Sync-[${params.ukey}]`);
                    setTimeout(() => {
                        this.details_file();
                    }, 60000);
                    return false;
                }

                //file unavailable in china
                if (rsp.status === 4) {
                    $('#file_messenger_icon').html('<iconpark-icon name="earth-asia" class="fa-fw fa-7x"></iconpark-icon>');
                    $('#file_messenger_msg').html(app.languageData.status_area);
                    $('#file_messenger').show();
                    this.ga(`Area-[${params.ukey}]`);
                    return false;
                }

                //file is private
                if (rsp.status === 5) {
                    $('#file_messenger_icon').html('<iconpark-icon name="lock" class="fa-fw fa-7x"></iconpark-icon>');
                    $('#file_messenger_msg').html(app.languageData.file_private);
                    $('#file_messenger').show();
                    this.ga(`Private-[${params.ukey}]`);
                    return false;
                }

                //file unavailable
                $('#file_messenger_icon').html('<iconpark-icon name="folder-xmark" class="fa-fw fa-4x"></iconpark-icon>');
                $('#file_messenger_msg').html(app.languageData.file_unavailable);
                $('#file_messenger').show();
                this.ga(`Unavailable-[${params.ukey}]`);
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

    isMenubarX() {
        var ua = navigator.userAgent.toLowerCase();
        return ua.match(/MicroMessenger/i) == "menubarx";
    }

    isMacOS() {
        var ua = navigator.userAgent.toLowerCase();
        return ua.match(/Macintosh/i) == "macintosh";
    }

    openInMenubarXofIndex() {
        this.openInMenubarX('https://' + this.site_domain);
    }

    openInMenubarXofFile() {
        let params = get_url_params();
        this.openInMenubarX(`https://${this.site_domain}/f/${params.ukey}`);
    }

    openInMenubarX(link) {
        let openlink = `https://menubarx.app/open/?xurl=${link}&xwidth=375&xheight=677&xbar=0`;
        window.location.href = openlink;
    }

    download_check() {
        // if (this.isWeixin()) {
        //     return false;
        // }
        // if (isMobileScreen()) {
        //     return false;
        // }
    }

    download_queue_add(url, filename, ukey, filesize, filetype) {
        this.download_queue[ukey] = [url, filename, ukey, ukey];
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
                return true;
            } else {
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
        $('.btn_download_' + index).html('<iconpark-icon name="cloud-arrow-down" class="fa-fw"></iconpark-icon>');

        delete this.download_queue[index];
        this.download_queue_run();
    }

    download_progress_on(evt, id, filename, index) {
        //$('#download_queue_' + id).html(app.languageData.download_run + filename + ' (' + bytetoconver(evt.loaded, true) + ' / ' + bytetoconver(evt.total, true) + ')');
        $('.download_progress_bar_set_' + index).css('width', (evt.loaded / evt.total) * 100 + '%');
        if (evt.loaded == evt.total) {
            $('.download_progress_bar_' + index).fadeOut();
        }
    }

    download_file() {
        this.loading_box_on();
        // $('#btn_download').addClass('disabled');
        // $('#btn_download').html(app.languageData.file_btn_download_status0);
        $.post(this.api_file, {
            action: 'download_check',
            token: this.api_token
        }, (rsp) => {
            if (rsp.status == 1) {
                // location.href = $('#btn_download').attr('x-href');
                // $('#btn_download').html(app.languageData.file_btn_download_status2);
                this.single_download_start($('.single_download_progress_bar').attr('data-href'), $('.single_download_progress_bar').attr('data-filename'));
            } else {
                $('#btn_download').html(app.languageData.file_btn_download_status1);
            }
            // setTimeout(() => {
            //     $('#btn_download').removeClass('disabled');
            //     $('#btn_download').html(app.languageData.file_btn_download);
            // }, 3000);
            this.loading_box_off();
        }, 'json');
    }

    download_direct(i) {
        let ukey = this.list_data[i].ukey;
        let title = this.list_data[i].fname;
        let size = this.list_data[i].fsize_formated;
        let type = this.list_data[i].ftype;

        this.recaptcha_do('download_req', (recaptcha) => {
            $.post(this.api_file, {
                action: 'download_req',
                ukey: ukey,
                token: this.api_token,
                captcha: recaptcha
            }, (req) => {
                if (req.status == 1) {
                    $.notifi(`${app.languageData.on_select_download} : ${title}`, "success");
                    window.location.href = req.data;
                    this.ga('Download-' + title);
                    return true;
                }
                if (req.status == 3) {
                    this.alert(app.languageData.status_need_login);
                    return false;
                }
            });
        });
    }

    download_file_btn(i) {
        let ukey = this.list_data[i].ukey;
        let title = this.list_data[i].fname;
        let size = this.list_data[i].fsize_formated;
        let type = this.list_data[i].ftype;

        //新的方案
        $('.btn_download_' + ukey).attr('disabled', 'true');
        $('.btn_download_' + ukey).html('<iconpark-icon name="loader" class="fa-fw fa-spin"></iconpark-icon>');

        this.recaptcha_do('download_req', (recaptcha) => {
            $.post(this.api_file, {
                action: 'download_req',
                ukey: ukey,
                token: this.api_token,
                captcha: recaptcha
            }, (req) => {
                if (req.status == 1) {

                    //如果不是在 ipad 或者 iphone 上
                    if (is_iphone_or_ipad() == false) {
                        //开始下载
                        this.download_queue_add(req.data, title, ukey, size, type);
                        this.download_queue_start();
                    } else {
                        //使用 href 提供下载
                        location.href = req.data;
                    }
                    this.ga('Download-' + title);

                    //使用 href 提供下载
                    // location.href = req.data;
                    // $('.btn_download_' + ukey).removeAttr('disabled');
                    // $('.btn_download_' + ukey).html('<iconpark-icon name="cloud-arrow-down" class="fa-fw"></iconpark-icon>');
                    return true;
                }
                if (req.status == 3) {
                    this.alert(app.languageData.status_need_login);
                    return false;
                }
                this.alert('发生了错误，请重试。');
                $('.btn_download_' + ukey).removeAttr('disabled');
                $('.btn_download_' + ukey).html('<iconpark-icon name="cloud-arrow-down" class="fa-fw"></iconpark-icon>');
            });
        });
    }

    download_file_url(i, cb) {
        let ukey = this.list_data[i].ukey;
        let title = this.list_data[i].fname;

        this.recaptcha_do('download_req', (recaptcha) => {
            $.post(this.api_file, {
                action: 'download_req',
                ukey: ukey,
                token: this.api_token,
                captcha: recaptcha
            }, (req) => {
                if (req.status == 1) {
                    this.ga('Download-' + title);
                    cb(req.data);
                    return true;
                }
            });
        });
    }

    download_allfile_btn() {
        //未登录的用户暂时不支持全部下载功能
        if (!this.isLogin()) {
            this.alert(app.languageData.status_need_login);
            return false;
        }
        //在移动设备上无法使用全部下载功能
        let room_key = 'app_room_view_' + this.room.mr_id;
        // if (isMobileScreen()) {
        //     this.alert(app.languageData.alert_no_support);
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
        let text_mr = '';
        if (mrid != undefined) {
            text_mr = `-F "mrid=${mrid}"`;
        }
        let model = localStorage.getItem('app_upload_model');

        let text_path = '-F "file=@ your file path (etc.. @/root/test.bin)"';
        let text_model = `-F "model=${model}"`;
        let text_token = `-F "token=${this.api_token}"`;

        let text = `curl -k ${text_path} ${text_token} ${text_model} ${text_mr} -X POST "https://tmp-cli.vx-cdn.com/app/upload_cli"`;

        $('#cliuploader').show();
        $('#cliuploader_show').html(text);
        $('#cliuploader_copy').attr('data-clipboard-text', text);
        this.btn_copy_bind();
    }

    media_buy_modal(type) {
        if (this.logined === 0) {
            this.alert(app.languageData.status_need_login);
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
            this.alert(app.languageData.status_need_login);
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
            this.alert(app.languageData.status_need_login);
            return false;
        }
        this.buy_type = type;

        $('#shopModal').modal('hide');
        setTimeout(() => {
            $('#buySelectModal').modal('show');
        }, 500);

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
            if (this.buy_type == 'direct') {
                this.direct_buy_modal(type);
            }
        }, 500);

    }

    hs_buy_modal(type) {
        if (this.logined === 0) {
            this.alert(app.languageData.status_need_login);
            return false;
        }

        //隐藏不同类型币种的价格列表
        $('.hs_price_list').hide();
        //显示当前币种的价格列表
        $('#hs_price_of_' + type).show();

        $('#highspeedModal').modal('show');
    }

    direct_buy_modal(type) {
        if (this.logined === 0) {
            this.alert(app.languageData.status_need_login);
            return false;
        }

        //隐藏不同类型币种的价格列表
        $('.direct_quota_price_list').hide();
        //显示当前币种的价格列表
        $('#direct_quota_opt_' + type).show();

        $('#directQuotaModal').modal('show');
    }

    hs_download_file(filename) {
        if (this.logined === 0) {
            this.alert(app.languageData.status_need_login);
            return false;
        }
        $('#btn_highdownload').addClass('disabled');
        $('#btn_highdownload').html(app.languageData.file_btn_download_status0);
        $.post(this.api_file, {
            action: 'highspeed_check',
            token: this.api_token
        }, (rsp) => {
            if (rsp.status == 0) {
                $('#highspeedModal').modal('show');
                $('#btn_highdownload').removeClass('disabled');
                $('#btn_highdownload').html(app.languageData.file_btn_highdownload);
            } else {
                $.post(this.api_file, {
                    action: 'download_check',
                    token: this.api_token
                }, (rsp) => {
                    if (rsp.status == 1) {
                        // location.href = $('#btn_download').attr('x-href');
                        // $('#btn_highdownload').html(app.languageData.file_btn_download_status2);
                        this.single_download_start($('.single_download_progress_bar').attr('data-href'), $('.single_download_progress_bar').attr('data-filename'));
                    } else {
                        $('#btn_highdownload').html(app.languageData.file_btn_download_status1);
                    }
                    setTimeout(() => {
                        $('#btn_highdownload').removeClass('disabled');
                        $('#btn_highdownload').html(app.languageData.file_btn_highdownload);
                    }, 3000);
                }, 'json');
            }
        }, 'json');
    }

    direct_quota_buy() {
        if (this.logined === 0) {
            this.alert(this.app.languageData.status_need_login);
            return false;
        }

        let price = 0;
        let time = 1;
        let code = 0;

        if (this.buy_currency == 'cny') {
            code = $('#dq_code_cny').val();
            price = $("#dq_code_cny option:selected").attr('data-price');
        } else {
            code = $('#dq_code_usd').val();
            price = $("#dq_code_usd option:selected").attr('data-price');
        }

        if (this.buy_currency == 'cny') {
            window.location.href = "https://pay.vezii.com/id4/pay_v2?price=" + price + "&token=" + this.api_token + "&prepare_code=" + code + "&prepare_type=direct&prepare_times=" + time;
        } else {
            window.location.href = 'https://s12.tmp.link/payment/paypal/checkout_v2?price=' + price + '&token=' + this.api_token + '&prepare_type=direct&prepare_code=' + code + '&prepare_times=' + time;
        }
    }

    hs_download_buy() {
        if (this.logined === 0) {
            this.alert(this.app.languageData.status_need_login);
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
            window.location.href = "https://pay.vezii.com/id4/pay_v2?price=" + price + "&token=" + this.api_token + "&prepare_code=" + code + "&prepare_type=addon&prepare_times=" + time;
        } else {
            window.location.href = 'https://s12.tmp.link/payment/paypal/checkout_v2?price=' + price + '&token=' + this.api_token + '&prepare_type=addon&prepare_code=' + code + '&prepare_times=' + time;
        }
    }

    storage_buy() {
        if (this.logined === 0) {
            this.alert(this.app.languageData.status_need_login);
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
            window.location.href = "https://pay.vezii.com/id4/pay_v2?price=" + price + "&token=" + this.api_token + "&prepare_code=" + code + "&prepare_type=addon&prepare_times=" + time;
        } else {
            window.location.href = 'https://s12.tmp.link/payment/paypal/checkout_v2?price=' + price + '&token=' + this.api_token + '&prepare_type=addon&prepare_code=' + code + '&prepare_times=' + time;
        }
    }

    media_buy() {
        if (this.logined === 0) {
            this.alert(this.app.languageData.status_need_login);
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
            window.location.href = "https://pay.vezii.com/id4/pay_v2?price=" + price + "&token=" + this.api_token + "&prepare_code=" + code + "&prepare_type=addon&prepare_times=" + time;
        } else {
            window.location.href = 'https://s12.tmp.link/payment/paypal/checkout_v2?price=' + price + '&token=' + this.api_token + '&prepare_type=addon&prepare_code=' + code + '&prepare_times=' + time;
        }
    }

    orders_list() {
        $.post(this.api_user, {
            action: 'order_list',
            token: this.api_token,
            //captcha: recaptcha
        }, (rsp) => {
            if (rsp.data.service == 0) {
                $('#orders_addon_contents').html('<div class="text-center"><iconpark-icon name="folder-open" class="fa-fw fa-4x"></iconpark-icon></div>');
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
                    r[i].name = app.languageData.service_code_hs;
                    r[i].des = app.languageData.service_code_hs_des;
                    r[i].icon = 'heart-circle-check';
                    break;
                case 'storage':
                    r[i].name = app.languageData.service_code_storage + ' (' + bytetoconver(data[i].val, true) + ')';
                    r[i].des = app.languageData.service_code_storage_des;
                    r[i].icon = 'album-circle-plus';
                    break;
                case 'media-video':
                    r[i].name = app.languageData.service_code_media + ' (' + bytetoconver(data[i].val, true) + ')';
                    r[i].des = app.languageData.service_code_media_des;
                    r[i].icon = 'circle-video';
                    break;
            }
        }
        return r;
    }

    mr_file_addlist() {
        var params = get_url_params();
        $('#mrfile_add_list').html('<img src="/img/loading.svg"  />');
        $.post(this.api_mr, {
            action: 'file_addlist',
            token: this.api_token,
            //captcha: recaptcha,
            mr_id: params.mrid
        }, (rsp) => {
            if (rsp.status == 0) {
                $('#mrfile_add_list').html('<div class="mx-auto"><iconpark-icon name="folder-open" class="fa-fw fa-4x"></iconpark-icon></div>');
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
        $('.no_dir').fadeOut();
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

        // let room_key_allow_upload = 'app_room_view_allow_upload_' + room_id;
        // let storage_room_allow_upload = localStorage.getItem(room_key_allow_upload);
        // let room_allow_upload = storage_room_allow_upload === null ? this.room.allow_upload : storage_room_allow_upload;
        // localStorage.setItem(room_key_allow_upload, room_allow_upload);
        // if (storage_room_allow_upload == 'yes') {
        //     $('#pf_allow_upload').attr('checked', 'checked');
        // } else {
        //     $('#pf_allow_upload').removeAttr('checked');
        // }
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

    pf_mybg_set(type, ukey) {
        this.loading_box_on();
        $.post(this.api_user, {
            action: 'pf_mybg_set',
            token: this.api_token,
            type: type,
            ukey: ukey
        }, (rsp) => {
            if (rsp.status == 1) {
                $.notifi(app.languageData.mybg_set_ok, "success");
                this.get_details(() => {
                    let night = this.matchNightModel();
                    this.bgLoadImg1(night);
                });
            } else {
                $.notifi(app.languageData.mybg_set_error, "error");
            }
            this.loading_box_off();
        });
    }

    profile_bulk_copy_post() {
        let status = ($('#bulk_copy_status').is(':checked')) ? 'yes' : 'no';
        localStorage.setItem('user_profile_bulk_copy', status);
        $.post(this.api_user, {
            action: 'pf_bulk_copy_set',
            token: this.api_token,
            status: status
        });
    }

    profile_bulk_copy_set(status) {
        localStorage.setItem('user_profile_bulk_copy', status);
        if (status == 'yes') {
            $('#bulk_copy_status').prop('checked', true);
            this.bulkCopyStatus = true;
        }
    }

    profile_bulk_copy_get() {
        let status = localStorage.getItem('user_profile_bulk_copy');
        if (status == 'yes') {
            return true;
        } else {
            return false;
        }
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
            $('#confirm_delete_status').prop('checked', true);
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
        $('#room_btn_file_list').removeClass('text-blue');
        $('#room_btn_file_grid').removeClass('text-blue');
        $('#room_btn_file_photo').removeClass('text-blue');
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
        let url_params = this.get_url_params();
        this.room_btn_active_reset();
        $('#room_btn_file_list').addClass('text-blue');
        if (page == 0 || page == 'all') {
            $('#dir_list').html('');
            if (this.subroom_data.length != 0) {
                $('#dir_list').append(app.tpl('dir_list_tpl', this.subroom_data));
            }
            if (data === false && this.subroom_data == 0 && url_params.mrid != 0) {
                $('.no_files').show();
            }
            if (data === false && this.subroom_data == 0 && url_params.mrid == '0') {
                $('.no_dir').show();
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
        $('#room_btn_file_photo').addClass('text-blue');
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
        this.lazyload('.lazyload');
    }

    mr_file_del(ukey) {
        var params = get_url_params();
        if (this.profile_confirm_delete_get()) {
            if (!confirm(app.languageData.confirm_delete)) {
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
            $('#notice_meetingroom_create').html(app.languageData.notice_meetingroom_status_mrcreat_fail);
            return false;
        }
        if (parent > 0) {
            model = 0;
        }
        $('#modal_meetingroom_create_btn').attr('disabled', true);
        $('#notice_meetingroom_create').html(app.languageData.notice_meetingroom_status_proccessing);
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
                    $('#notice_meetingroom_create').html(app.languageData.notice_meetingroom_status_mrcreated);
                    this.room_list();
                    $('#mrCreaterModal').modal('hide');
                } else {
                    $('#notice_meetingroom_create').html(app.languageData.notice_meetingroom_status_mrcreat_fail);
                }
                setTimeout(() => {
                    $('#modal_meetingroom_create_btn').removeAttr('disabled');
                }, 2000);
            });
        });
    }

    mr_del(mrid) {
        if (this.profile_confirm_delete_get()) {
            if (!confirm(app.languageData.confirm_delete)) {
                return false;
            }
        }
        $('#meetingroom_id_' + mrid).fadeOut();
        $.post(this.api_mr, {
            action: 'delete',
            token: this.api_token,
            mr_id: mrid
        }, () => {
            this.room_list();
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
        var newname = prompt(app.languageData.modal_meetingroom_newname, "");
        if (newname === null) {
            return false;
        }
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
        var newname = prompt(app.languageData.modal_meetingroom_newname, default_name);
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
            app.open('/app&listview=login');
            return;
        }
        $('#mr_list_refresh_icon').html('<img src="/img/loading.svg" height="19" />');
        $('#mr_list_refresh_icon').attr('disabled', true);
        this.loading_box_on();
        $.post(this.api_mr, {
            action: 'list',
            token: this.api_token,
        }, (rsp) => {
            this.loading_box_off();
            if (rsp.status == 0) {
                $('#meetroom_list').html('<div class="mx-auto"><iconpark-icon name="folder-open" class="fa-fw fa-4x"></iconpark-icon></div>');
                $('#mr_list_refresh_icon').html('<iconpark-icon name="rotate" class="fa-fw“></iconpark-icon>');
                $('#mr_list_refresh_icon').removeAttr('disabled');
                return false;
            } else {
                $('#meetroom_list').html(app.tpl('dir_list_tpl', rsp.data));
                this.btn_copy_bind();
            }
            $('#mr_list_refresh_icon').html('<iconpark-icon name="rotate" class="fa-fw“></iconpark-icon>');
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
    }

    room_total(mrid) {
        $('.room_subinfo').hide();
        $('#room_total').html('');
        if (mrid == 0) {
            return false;
        }
        $.post(this.api_mr, {
            action: 'total', mr_id: mrid, token: this.api_token
        }, (rsp) => {
            if (rsp.data.nums > 0) {
                $('.room_subinfo').show();
                let total_size_text = bytetoconver(rsp.data.size, true);
                $('#room_total').html(`${rsp.data.nums} ${app.languageData.total_units_of_file} , ${total_size_text}`);
                this.room_mobile_topabr_fixed(mr_id);
            }
        }, 'json');
    }

    room_list() {
        var params = get_url_params();
        $('#room_userlist').hide();
        $('.permission-room-file').hide();
        $('.permission-room-user').hide();
        $('.data_loading').show();
        //清理数据
        $('#dir_list').html('');
        $('#room_direct_model').hide();
        $('.room_subinfo').hide();
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
                $('#file_messenger_icon').html('<iconpark-icon name="folder-xmark" class="fa-fw fa-4x"></iconpark-icon>');
                $('#file_messenger_msg').html(app.languageData.room_status_fail);
                $('#file_messenger').show();
                $('#room_loaded').html('');
                $('#room_loaded').hide();
                this.ga('Room-Unavailable');
                return false;
            }
            //会议室不可用
            if (rsp.data.status == 'reported' && rsp.data.owner == 0) {
                this.room.parent = 0;
                this.room.top = 0;
                this.room.ownner = 0;
                this.room.mr_id = 0;
                $('#file_messenger_icon').html('<iconpark-icon name="folder-xmark" class="fa-fw fa-4x"></iconpark-icon>');
                $('#file_messenger_msg').html(app.languageData.room_status_fail);
                $('#file_messenger').show();
                $('#room_loaded').html('');
                $('#room_loaded').hide();
                this.ga('Room-Reported');
                return false;
            }

            //room need to login
            if (rsp.status === 3) {
                $('#file_messenger_icon').html('<iconpark-icon name="user-robot" class="fa-fw fa-7x"></iconpark-icon>');
                $('#file_messenger_msg').html(app.languageData.status_need_login);
                $('#file_messenger_msg_login').show();
                $('#file_messenger').show();
                $('#room_loaded').html('');
                $('#room_loaded').hide();
                this.ga('Room-Need-Login');
                return false;
            }
            this.ga('Room-' + rsp.data.name);
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
            this.room.img_link = rsp.data.img_link;
            this.room.model = rsp.data.model;
            this.room.ui_avatar_id = rsp.data.ui_avatar_id;
            this.room.ui_publish = rsp.data.ui_publish;
            this.room.ui_publish_status = rsp.data.ui_publish_status;
            this.room.ui_nickname = rsp.data.ui_nickname;
            this.room.ui_intro = rsp.data.ui_intro;
            this.room.ui_pro = rsp.data.ui_pro;
            this.room_performance_init(this.room.mr_id);

            //如果用户是拥有者，显示直链相关的信息，并初始化
            if (this.room.owner == 1) {
                this.direct.dirRoomInit();
                $('.room_direct_model').show();
            } else {
                $('.room_direct_model').hide();
            }

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
                $('.room_btn_performance').hide();
            }

            //如果文件夹有设置图片
            if (this.room.img_link != '0') {
                //设置占位图
                $('.room_img').attr('src', '/img/loading.svg');
                //先请求图片，就绪后再显示
                let img = new Image();
                img.src = this.room.img_link;
                img.onload = () => {
                    $('.room_img').attr('src', this.room.img_link);
                }
                $('.room_img').show();
            } else {
                $('.room_img').hide();
            }

            //如果是私有文件夹
            if (this.room.model == 'private') {
                $('.in-private-dir').hide();
            } else {
                $('.in-private-dir').show();
            }

            //如果文件夹允许其他人上传文件
            if (this.room.allow_upload == 'yes') {
                $('#pf_allow_upload').prop('checked', true);

            } else {
                $('#pf_allow_upload').prop('checked', false);
            }

            //如果有设定个性化设置
            if (this.room.ui_publish === 'yes' && this.room.ui_publish_status === 'ok') {
                if (this.room.ui_pro === 'yes') {
                    $('.userinfo_pro').show();
                } else {
                    $('.userinfo_sd').show();
                }
                $('.userinfo').show();
                $('.userinfo_nickname').html(`${this.room.ui_nickname}`);
            }


            $('#mr_copy').attr('data-clipboard-text', 'https://' + this.site_domain + '/room/' + rsp.data.mr_id);
            $('.room_title').html(rsp.data.name);
            $('#dir_list').show();

            if (rsp.data.sub_rooms !== 0) {
                this.subroom_data = rsp.data.sub_rooms;
            } else {
                this.subroom_data = 0;
            }

            this.btn_copy_bind();
            this.mr_file_list('all');

            //是否需要设置上级目录返回按钮
            if (this.room.top == 99) {
                $('.btn_for_sub').hide();
                $('.btn_for_desktop').show();
            } else {
                $('.btn_for_sub').show();
                $('.btn_for_desktop').hide();
            }

            //如果不是拥有者
            if (this.room.owner === 0) {
                $('.not_owner').hide();
            }

            if (isMobileScreen()) {
                this.room_mobile_prepare();
            } else {
                $('#room_back_btn').html(app.tpl('room_back_btn_tpl', {}));
            }

            $('#room_loading').hide();
            $('#room_loaded').show();
            
            //如果用户是赞助者
            if (this.isSponsor == true) {
                this.setBtnForSponsor();
            }
            //重新设定网页标题
            document.title = rsp.data.name;
            app.linkRebind();
        });
    }

    room_mobile_prepare() {
        let mrid = this.room.mr_id === undefined ? 0 : this.room.mr_id;
        if (mrid !== 0) {
            let back_btn = `<a href="/app&listview=room&mrid=${TL.room.parent}" tmpui-action="TL.room_list()" class="text-azure mt-1 btn_for_sub"><iconpark-icon name="left-c" class="fa-fw fa-2x"></iconpark-icon></a>`;
            $('#room_back').html(back_btn);
        } else {
            $('#room_back').html('');
        }

        $('.btn_upload').attr('onclick', `TL.uploader.open('${mrid}')`);

        $('#mr_id').val(mrid);
        $('#mr_parent_id').val(this.room.parent);
        $('#mr_top_id').val(this.room.top);

        app.linkRebind();
        this.room_mobile_topabr_fixed(mrid);
    }

    room_mobile_topabr_fixed(mrid) {
        if (mrid === 0) {
            $('.mobile-head-padding-large').css('padding-top', '80px');
            $('.btn_mobile_top').hide();
            $('.btn_mobile_sub').show();
        } else {
            $('.btn_mobile_top').show();
            $('.btn_mobile_sub').hide();
            //根据 room_subinfo 的显示状态来设定 padding-top 的值
            if ($('.room_subinfo').css('display') === 'none') {
                $('.mobile-head-padding-large').css('padding-top', '150px');
            } else {
                $('.mobile-head-padding-large').css('padding-top', '170px');
            }
        }
    }

    favorite_add(mr_id) {
        if (!this.isLogin()) {
            app.open('/app&listview=login');
            return false;
        }
        alert(app.languageData.favorite_add_success);
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
        $('#submit').html(app.languageData.form_btn_processing);
        $('#msg_notice').html(app.languageData.form_btn_processing);
        this.recaptcha_do('login', (recaptcha) => {
            if (email !== '' && password !== '') {
                $.post(this.api_user, {
                    action: 'login',
                    token: this.api_token,
                    captcha: recaptcha,
                    email: email,
                    password: password
                }, (rsp) => {
                    if (rsp.status == 1) {
                        $('#msg_notice').html(app.languageData.login_ok);
                        this.logined = 1;
                        this.get_details(() => {
                            localStorage.setItem('app_login', 1);
                            //如果当前页是首页，则刷新当前页面
                            // let url = get_url_params();
                            // if (url.tmpui_page === '/' || url.tmpui_page === undefined) {
                            //     window.location.reload();
                            // } else {
                            //     window.history.back();
                            // }
                            //登陆后更新一下用户信息
                            this.profile.init_details();
                            this.storage_status_update();
                            //如果有设置 return_page，则跳转到 return_page
                            let return_page = localStorage.getItem('return_page');
                            if (return_page !== '0') {
                                location.href = return_page;
                                localStorage.setItem('return_page', 0);
                            } else {
                                dynamicView.workspace();
                            }
                        });
                    } else {
                        $('#msg_notice').html(app.languageData.login_fail);
                        $('#submit').html(app.languageData.form_btn_login);
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
        this.currentLanguage = lang;
        this.languageBtnSet();
        app.languageSet(lang);
        //重新初始化导航，目前有一个小问题，无法刷新导航，暂时不管。
        this.navbar.init(this);
        //console.log('navbar reinit');
    }

    languageBtnSet() {
        let lang = this.currentLanguage;
        let span_lang = 'English';
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
        $('.selected_lang').html(span_lang);
    }

    logout() {
        localStorage.setItem('app_login', 0);
        this.uid = 0;
        this.logined = 0;
        this.storage_used = 0;
        this.storage = 0;
        this.notes.cleanKey();
        $.post(this.api_user, {
            action: 'logout',
            token: this.api_token
        }, () => {
            window.location.href = '/';
        });
    }

    register() {
        var email = $('#email_new').val();
        var password = $('#password').val();
        var rpassword = $('#rpassword').val();
        var code = $('#checkcode').val();
        $('#msg_notice').show();
        $('#msg_notice').html(app.languageData.form_btn_processing);
        $('#submit').html(app.languageData.form_btn_login);
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
                    $('#msg_notice').html(app.languageData.reg_finish);
                    $('#submit').html(app.languageData.reg_finish);
                    this.get_details(() => {
                        setTimeout(() => {
                            dynamicView.workspace();
                        }, 3000);
                    });
                    gtag("event", "sign_up");
                } else {
                    $('#msg_notice').html(rsp.data);
                    $('#submit').html(app.languageData.form_btn_login);
                    $('#submit').removeAttr('disabled');
                }
            });
        });
    }

    cc_send() {
        var email = $('#email_new').val();
        $('#msg_notice').show();
        $('#msg_notice').html(app.languageData.form_btn_processing);
        $('#button-reg-checkcode').html(app.languageData.form_btn_processing);
        $('#button-reg-checkcode').attr('disabled', true);
        this.recaptcha_do('checkcode_send', (recaptcha) => {
            if (email !== '') {
                $.post(this.api_user, {
                    action: 'checkcode_send',
                    token: this.api_token,
                    captcha: recaptcha,
                    lang: app.languageGet(),
                    email: email
                }, (rsp) => {
                    if (rsp.status == 1) {
                        $('#msg_notice').html(app.languageData.form_checkcode_msg_sended);
                        $('#button-reg-checkcode').html(app.languageData.form_checkcode_sended);
                    } else {
                        $('#msg_notice').html(this.error_text(rsp.status));
                        $('#button-reg-checkcode').html(app.languageData.form_getcode);
                        $('#button-reg-checkcode').removeAttr('disabled');
                    }
                });
            }
        });
    }

    error_text(code) {
        let msg = app.languageData.status_error_0;
        switch (code) {
            case 9:
                msg = app.languageData.status_error_9;
                break;
            case 11:
                msg = app.languageData.status_error_11;
                break;
            case 10:
                msg = app.languageData.status_error_10;
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
        $('#reportbtn').html(`<span class="text-red">${app.languageData.form_btn_processed}</span>`);
        $.post(this.api_file, {
            'action': 'report',
            'token': this.api_token,
            'reason': reason,
            'ukey': ukey
        }, (rsp) => {
            $('#reportbtn').html(app.languageData.form_btn_processed);
        }, 'json');
    }

    room_report() {
        var mr_id = this.room.mr_id;
        var reason = $('#room_report_model').val();
        $('#room_reportbtn').attr('disabled', true);
        $('#room_reportbtn').html(`<span class="text-red">${app.languageData.form_btn_processed}</span>`);
        $.post(this.api_mr, {
            'action': 'report',
            'token': this.api_token,
            'reason': reason,
            'mr_id': mr_id
        }, (rsp) => {
            $('#room_reportbtn').html(app.languageData.form_btn_processed);
        }, 'json');
    }

    find_file() {
        var ukey = $('#ukey').val();
        if (ukey !== '') {
            window.location.href = 'https://' + this.site_domain + '/f/' + ukey;
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
        data.private_storage_used_text = bytetoconver(this.private_storage_used, true);
        data.private_storage_used_percent = (this.private_storage_used / this.storage) * 100;
        data.percent = (this.storage_used / this.storage) * 100;
        $('#upload_storage_status').html(data.private_storage_used_text + ' | ' + data.storage_text);
        $('.user_storage_used').html(data.storage_used_text);
        $('.user_storage_total').html(data.storage_text);
        $('.private_storage_used').html(data.private_storage_used_text);
        $('.private_storage_used_percent').css('width', data.private_storage_used_percent + '%');
        // $('#upload_storage_status').html(app.tpl('upload_storage_status_tpl', data));
    }

    btn_copy_bind() {
        var clipboard = new Clipboard('.btn_copy');
        clipboard.on('success', (e) => {
            let tmp = $(e.trigger).html();
            $(e.trigger).html(app.languageData.copied);
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
        var r = 'file-lines';
        switch (type) {
            case 'pdf':
                r = 'file-pdf';
                break;
            case 'zip':
                r = 'file-zipper';
                break;
            case 'rar':
                r = 'file-zipper';
                break;
            case '7z':
                r = 'file-zipper';
                break;
            case 'gz':
                r = 'file-zipper';
                break;
            case 'tar':
                r = 'file-zipper';
                break;
            case 'msixbundle':
                r = 'file-zipper';
                break;

            case 'doc':
                r = 'file-word';
                break;
            case 'wps':
                r = 'file-word';
                break;
            case 'docx':
                r = 'file-word';
                break;

            case 'c':
                r = 'file-code';
                break;
            case 'go':
                r = 'file-code';
                break;
            case 'cpp':
                r = 'file-code';
                break;
            case 'php':
                r = 'file-code';
                break;
            case 'java':
                r = 'file-code';
                break;
            case 'js':
                r = 'file-code';
                break;
            case 'vb':
                r = 'file-code';
                break;
            case 'py':
                r = 'file-code';
                break;
            case 'css':
                r = 'file-code';
                break;
            case 'html':
                r = 'file-code';
                break;
            case 'tar':
                r = 'file-code';
                break;
            case 'asm':
                r = 'file-code';
                break;

            case 'ogg':
                r = 'file-music';
                break;
            case 'm4a':
                r = 'file-music';
                break;
            case 'mp3':
                r = 'file-music';
                break;
            case 'wav':
                r = 'file-music';
                break;
            case 'weba':
                r = 'file-music';
                break;
            case 'mp4':
                r = 'file-video';
                break;
            case 'rm':
                r = 'file-video';
                break;
            case 'rmvb':
                r = 'file-video';
                break;
            case 'avi':
                r = 'file-video';
                break;
            case 'mkv':
                r = 'file-video';
                break;
            case 'webm':
                r = 'file-video';
                break;
            case 'wmv':
                r = 'file-video';
                break;
            case 'flv':
                r = 'file-video';
                break;
            case 'mpg':
                r = 'file-video';
                break;
            case 'mpeg':
                r = 'file-video';
                break;
            case 'ts':
                r = 'file-video';
                break;
            case 'mov':
                r = 'file-video';
                break;
            case 'vob':
                r = 'file-video';
                break;

            case 'png':
                r = 'file-image';
                break;
            case 'gif':
                r = 'file-image';
                break;
            case 'bmp':
                r = 'file-image';
                break;
            case 'jpg':
                r = 'file-image';
                break;
            case 'jpeg':
                r = 'file-image';
                break;
            case 'webp':
                r = 'file-image';
                break;

            case 'ppt':
                r = 'file-powerpoint';
                break;
            case 'pptx':
                r = 'file-powerpoint';
                break;

            case 'xls':
                r = 'file-excel';
                break;
            case 'xlsx':
                r = 'file-excel';
                break;
            case 'xlsm':
                r = 'file-excel';
                break;

            case 'exe':
                r = 'window';
                break;
            case 'bin':
                r = 'window';
                break;
            case 'msi':
                r = 'window';
                break;
            case 'bat':
                r = 'window';
                break;
            case 'sh':
                r = 'window';
                break;

            case 'rpm':
                r = 'cube';
                break;
            case 'deb':
                r = 'cube';
                break;
            case 'msi':
                r = 'cube';
                break;
            case 'dmg':
                r = 'cube';
                break;
            case 'apk':
                r = 'cube';
                break;

            case 'torrent':
                r = 'acorn';
                break;

        }
        return r;
    }

    bulkCopy(dom, content, base64) {

        //如果传递进来的内容是 base64 编码的内容，先解码
        if (base64 === true) {
            content = Base64Decode(content);
        }

        if (dom !== null) {
            let tmp = $(dom).html();
            $(dom).html('<iconpark-icon name="circle-check" class="fa-fw"></iconpark-icon>');
            setTimeout(() => {
                $(dom).html(tmp);
            }, 3000);
        }


        if (this.profile_bulk_copy_get()) {
            //如果启用了批量复制，检查目前是否处于定时器状态
            if (this.bulkCopyTimer !== 0) {
                //处于定时器状态，先取消。
                clearTimeout(this.bulkCopyTimer);
                this.bulkCopyTimer = 0;
            } else {
                $.notifi(app.languageData.notify_bulk_copy_start, "success");
            }

            //将内容写入到缓存并复制到剪贴板
            this.bulkCopyTmp += content + " \n";
            this.copyToClip(this.bulkCopyTmp);
            //设置一个10秒缓存器
            this.bulkCopyTimer = setTimeout(() => {
                this.bulkCopyTimer = 0;
                this.bulkCopyTmp = '';
                $.notifi(app.languageData.notify_bulk_copy_finish, "success");
            }, 10000);

        } else {
            //直接复制
            $.notifi(app.languageData.copied, "success",);
            this.copyToClip(content);
        }
    }

    directCopy(dom, content, base64) {

        //如果传递进来的内容是 base64 编码的内容，先解码
        if (base64 === true) {
            content = Base64Decode(content);
        }

        if (dom !== null) {
            let tmp = $(dom).html();
            $(dom).html('<iconpark-icon name="circle-check" class="fa-fw"></iconpark-icon>');
            setTimeout(() => {
                $(dom).html(tmp);
            }, 3000);
        }

        //直接复制
        $.notifi(app.languageData.copied, "success",);
        this.copyToClip(content);
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