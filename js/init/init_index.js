function INIT_index() {
    app.languageBuild();
    $('title').html(app.languageData.title_index);
    $('meta[name=description]').html(app.languageData.des_index);

    if (TL.isLogin() === true) {
        dynamicView.workspace();
    }
}