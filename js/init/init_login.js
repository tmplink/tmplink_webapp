function INIT_login() {
    TL.ready(() => {
        app.languageBuild();
        $('title').html(app.languageData.title_login);
        $('meta[name=description]').html(app.languageData.des_login);

        //如果是从 menubarx 过来的应用，隐藏第三方登录
        let mx = localStorage.getItem('from_menubarx');
        if (mx) {
            $('#google_login').hide();
        }

        if (TL.isLogin()) {
            dynamicView.workspace();
        }
    });
}   