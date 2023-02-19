/**
 * ワークスペース、ルーム、ダイレクトモジュールの内容を扱うプログラムです。
 * @author CC2655
 * @version 1.0
 * @date 2022/12/23
 */

class dynamic {

    current = null
    mobileHeadInstalled = false

    route() {
        let url = location.href;
        let url_params = app.getUrlVars(window.location.href);
        let listview = url_params.listview;
        switch (listview) {
            case 'index':
                this.index();
                break;

            case 'preload':
                this.preload();
                break;

            case 'workspace':
                this.workspace();
                break;
            case 'room':
                this.room();
                break;
            case 'direct':
                this.direct();
                break;

            case 'login':
                this.login();
                break;
            case 'reg':
                this.reg();
                break;
            case 'reset':
                this.reset();
                break;

            case 'tos':
                this.tos();
                break;
            case 'privacy':
                this.privacy();
                break;

            default:
                listview = 'index';
                this.index();
                break;
        }

    }

    active(title) {
        $('.navbar-collapse').collapse('hide');
        // if(this.current!==title){
        //     $('#nav_'+this.current).removeClass('active');
        //     $('#nav_'+title).addClass('active');
        //     this.current=title;
        // }

        //ページスクロール時の自動読み込みをオフにする
        TL.dir_list_autoload_disabled();
        TL.navbar.enabled();
        TL.ready(() => {
            TL.head_set();
        });
        app.linkRebind();
        if(TL.isMobile()){
            TL.bg_remove();
            this.mobileHead();
        }
    }

    mobileHead() {
        //初始化
        var headerL = '.mobile-head-large-title';
        var headerT = '.mobile-head-top-title';
        $(headerL).show();
        $(headerT).hide();
        if (this.mobileHeadInstalled) {
            return;
        }else{
            this.mobileHeadInstalled = true;
        }
        window.addEventListener('scroll', function () {
            var headerL = '.mobile-head-large-title';
            var headerT = '.mobile-head-top-title';
            var scrollTop = document.documentElement.scrollTop;
            if (scrollTop >= 100) {
                //向下滑动后超过 100px
                $(headerT).show();
                $(headerL).hide();
            } else {
                //向上滑动后小于 100px
                $(headerT).hide();
                $(headerL).show();
            }
        });
    }

    ga(target) {
        gtag('config', 'UA-96864664-3', {
            'page_title': target,
            'page_location': location.href,
        });
    }


    preload() {

        TL.loading_box_on();
        TL.ready(
            () => {
                TL.loading_box_off();
                if (TL.logined == 0) {
                    //未登录，跳转到登录页
                    this.login();
                } else {
                    //已登录，进入 workspace
                    this.workspace();
                }
            }
        );
    }

    index() {
        $('#tmpui_body').css('opacity', '0');
        TL.ready(
            () => {
                if (TL.logined == 0) {
                    //未登录，跳转到登录页
                    this.ga('Index');
                    window.location.href = '/';
                } else {
                    //已登录，进入 workspace
                    this.workspace();
                    $('#tmpui_body').css('opacity', '1');
                }
            }
        );
    }

    workspace() {
        if (TL.isMobile()) {
            $('#home_view').html(app.getFile('/tpl/listview/mobile_workspace.html'));
        } else {
            $('#home_view').html(app.getFile('/tpl/listview/workspace.html'));
        }
        this.ga('Workspace');
        app.dynOpen('/app&listview=workspace');
        this.active('workspace');
        INIT_workspace();
        TL.navbar.model_workspace();
    }

    room() {
        if (TL.isMobile()) {
            $('#home_view').html(app.getFile('/tpl/listview/mobile_room.html'));
        } else {
            $('#home_view').html(app.getFile('/tpl/listview/room.html'));
        }
        this.ga('Desktop');
        // app.dynOpen('/app&listview=room');
        this.active('room');
        INIT_room();
        TL.navbar.model_desktop();
    }

    direct() {
        if (TL.isMobile()) {
            $('#home_view').html(app.getFile('/tpl/listview/mobile_direct.html'));
        } else {
            $('#home_view').html(app.getFile('/tpl/listview/direct.html'));
        }
        this.ga('Direct');
        app.dynOpen('/app&listview=direct');
        this.active('direct');
        TL.navbar.model_direct();
        INIT_direct();
    }

    login() {
        this.ga('Login');
        $('#home_view').html(app.getFile('/tpl/listview/login.html'));
        app.dynOpen('/app&listview=login');
        TL.navbar.disabled();
        INIT_login();
    }

    reg() {
        this.ga('Register');
        $('#home_view').html(app.getFile('/tpl/listview/reg.html'));
        app.dynOpen('/app&listview=reg');
        TL.navbar.disabled();
        INIT_reg();
    }

    reset() {
        this.ga('Reset');
        $('#home_view').html(app.getFile('/tpl/listview/reset.html'));
        app.dynOpen('/app&listview=reset');
        TL.navbar.model_direct();
        INIT_reset();
    }

    tos() {
        this.ga('Terms of Service');
        $('#home_view').html(app.getFile('/tpl/listview/tos.html'));
        app.dynOpen('/app&listview=tos');
        INIT_tos();
    }

    privacy() {
        this.ga('Privacy Policy');
        $('#home_view').html(app.getFile('/tpl/listview/privacy.html'));
        app.dynOpen('/app&listview=privacy');
        INIT_privacy();
    }

}