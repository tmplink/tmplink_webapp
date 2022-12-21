function INIT_direct() {
    TL.ready(() => {
        TL.direct.init_details();
        TL.direct.list_autoload_enabled();
        TL.direct.filelist(0);
        TL.direct.prepare();
        app.languageBuild();
        $('meta[name=description]').html(app.languageData.title_direct);
        $('title').html(app.languageData.title_direct);
    });
}
