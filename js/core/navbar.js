class navbar {

    parent = null

    init(parent) {
        this.parent = parent;
        //根据 tmpui_page 初始化底部导航栏
        let url = this.parent.get_url_params('tmpui_page');
        this.model_select(url.tmpui_page, false);
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
            case '/media':
                this.model_media(act);
                break;
        }
    }

    model_workspace(act) {
        $('#navbar_model_icon').attr('class', 'far fa-file-search fa-fw mx-auto');
        $('#navbar_model_text').html(this.parent.languageData.navbar_workspace);
        if (act === true) {
            app.open('/workspace');
        }
    }

    model_desktop(act) {
        $('#navbar_model_icon').attr('class', 'fal fa-desktop-alt fa-fw mx-auto');
        $('#navbar_model_text').html(this.parent.languageData.navbar_meetingroom);
        if (act === true) {
            app.open('/dir');
        }
    }

    model_media(act) {
        $('#navbar_model_icon').attr('class', 'fal fa-video fa-fw mx-auto');
        $('#navbar_model_text').html(this.parent.languageData.navbar_media);
        if (act === true) {
            app.open('/media');
        }

    }
}
