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
        if(this.isMobile()){
            console.log('is mobile');
            $('.nav-mobile').show();
            $('.nav-desktop').hide();
        }else{
            console.log('is not mobile');
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

    isMobile() {
        return window.screen.width < 768;
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

        }
    }

    navbar_lightup(name) {
        $('.topnav_' + this.lightUpCurrent).removeClass('text-azure');
        this.lightUpCurrent = name;
        $('.topnav_' + name).addClass('text-azure');
    }

    model_workspace(act) {
        $('#navbar_model_icon').attr('class', 'fa-light fa-memo-pad fa-fw mx-auto');
        $('#navbar_model_text').html(app.languageData.navbar_workspace);
        if (act === true) {
            dynamicView.workspace();
        }
        this.navbar_lightup('workspace');
    }

    model_desktop(act) {
        $('#navbar_model_icon').attr('class', 'fa-light fa-cabinet-filing fa-fw mx-auto');
        $('#navbar_model_text').html(app.languageData.navbar_meetingroom);
        if (act === true) {
            app.open('/room&mrid=0');
        }
        this.navbar_lightup('desktop');
    }

    model_direct(act) {
        $('#navbar_model_icon').attr('class', 'fa-light fa-share-nodes fa-fw mx-auto');
        $('#navbar_model_text').html(app.languageData.navbar_direct);
        if (act === true) {
            app.open('/direct');
        }
        this.navbar_lightup('direct');
    }
}
