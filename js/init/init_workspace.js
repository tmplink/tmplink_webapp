function INIT_workspace() {
    TL.ready(() => {
        TL.workspace_filelist_autoload_enabled();
        TL.workspace_filelist(0);
        TL.workspace_navbar();
        app.languageBuild();
        $('title').html(app.languageData.title_workspace);
        $('meta[name=description]').html(app.languageData.des_workspace);
    });
}