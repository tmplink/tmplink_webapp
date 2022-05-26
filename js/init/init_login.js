app.ready(() => {
    TL.ready(() => {
        $('title').attr('i18n', 'title_login');
        $('meta[name=description]').attr('i18n', 'des_login');
        app.languageBuild();
        if (TL.isLogin()) {
            app.open('/workspace');
        }
    });
});
