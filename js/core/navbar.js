class navbar {

    parent = null
    lightUpCurrent = 'workspace'

    init(parent) {
        this.parent = parent;
        //根据 tmpui_page 初始化底部导航栏
        let url = this.parent.get_url_params('tmpui_page');
        this.model_select(url.tmpui_page, false);
        this.enabledMobile();
        this.resetNavBar();
        //画面の幅や高さの変化を聞き分けて、下のナビゲーションバーを切り替えることができる
        window.addEventListener('resize', () => {
            this.resetNavBar();
        });
    }

    disabled() {
        $('.mainNav').addClass('dynViewDisabled');
    }

    enabled() {
        $('.mainNav').removeClass('dynViewDisabled');
    }

    enabledMobile() {
        if(isMobileScreen()){
            $('.nav-mobile').show();
            $('.nav-desktop').hide();
            if(isIosPwaMode()){
                $('.nav-mobile-pwa').show();
            }
        }else{
            $('.nav-desktop').show();
            $('.nav-mobile').hide(); 
        }
    }

    resetNavBar() {
        if (this.isTablet()) {
            $('.topnav').addClass('fixed-bottom');
            $('.topnav').addClass('nav-bottom-set');
            $('.topnav').addClass('nav-bottom-slideup');
            $('.topnav').removeClass('nav-top-set');
            $('.topnav').removeClass('nav-top-slidedown');
            $('.topnav').removeClass('fixed-top');
            $('.topnav-addon').addClass('dynViewDisabled');
        } else {
            $('.topnav').removeClass('fixed-bottom');
            $('.topnav').removeClass('nav-bottom-set');
            $('.topnav').removeClass('nav-bottom-slideup');
            $('.topnav').addClass('nav-top-set');
            $('.topnav').addClass('nav-top-slidedown');
            $('.topnav').addClass('fixed-top');
            $('.topnav-addon').removeClass('dynViewDisabled');
        }
    }

    isTablet() {
        let w = window.innerWidth;
        let h = window.innerHeight;
        if (h > w) {
            return true;
        } else {
            return false;
        }
    }

    isIPHONE() {
        return navigator.userAgent.match(/iPhone/i);
    }

    model_select(model, act) {
        switch (model) {
            case '/workspace':
                this.model_workspace(act);
                break;
            case '/dir':
                this.model_desktop(act);
                break;
            case '/room':
                this.model_desktop(act);
                break;
            case '/direct':
                this.model_direct(act);
                break;
            case '/notes':
                this.model_notes(act);
                break;

        }
    }

    navbar_lightup(name) {
        $('.topnav_' + this.lightUpCurrent).removeClass('text-azure');
        this.lightUpCurrent = name;
        $('.topnav_' + name).addClass('text-azure');
    }

    model_workspace(act) {
        $('#navbar_model_icon').attr('name', 'inbox-success');
        $('#navbar_model_text').html(app.languageData.navbar_workspace);
        $('#navbar_model_text').attr('i18n', 'navbar_workspace');
        if (act === true) {
            dynamicView.workspace();
        }
        this.navbar_lightup('workspace');
    }

    model_notes(act){
        $('#navbar_model_icon').attr('name', 'lock');
        $('#navbar_model_text').html(app.languageData.navbar_notes);
        $('#navbar_model_text').attr('i18n', 'navbar_notes');
        if (act === true) {
            dynamicView.notes();
        }
        this.navbar_lightup('notes');
    }

    model_desktop(act) {
        $('#navbar_model_icon').attr('name', 'folder-open-e1ad2j7l');
        $('#navbar_model_text').html(app.languageData.navbar_meetingroom);
        $('#navbar_model_text').attr('i18n', 'navbar_meetingroom');
        if (act === true) {
            app.open('/room&mrid=0');
        }
        this.navbar_lightup('desktop');
    }

    model_direct(act) {
        $('#navbar_model_icon').attr('name', 'share-nodes');
        $('#navbar_model_text').html(app.languageData.navbar_direct);
        $('#navbar_model_text').attr('i18n', 'navbar_direct');
        if (act === true) {
            app.open('/app&listview=direct');
        }
        this.navbar_lightup('direct');
    }
}
