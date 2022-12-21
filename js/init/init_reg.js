function INIT_reg() {
    TL.ready(() => {
        app.languageBuild();
        $('title').html(app.languageData.title_reg);
        $('meta[name=description]').html(app.languageData.des_reg);
        if (TL.isLogin()) {
            dynamicView.workspace();
        }
    });
}