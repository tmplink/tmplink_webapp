function INIT_notes() {
    TL.ready(() => {
        app.languageBuild();
        TL.notes.initPage();
        $('title').html(app.languageData.title_notes);
        $('meta[name=description]').html(app.languageData.des_notes);
    });
}