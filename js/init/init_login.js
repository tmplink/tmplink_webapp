function INIT_login() {
    TL.ready(() => {
        app.languageBuild();
        $('title').html(app.languageData.title_login);
        $('meta[name=description]').html(app.languageData.des_login);
        if (TL.isLogin()) {
            dynamicView.workspace();
        }
    });
}   