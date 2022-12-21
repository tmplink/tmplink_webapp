app.ready(() => {
    app.languageBuild();
    $('title').html(app.languageData.title_file);
    $('meta[name=description]').html(app.languageData.des_file);

    TL.ready(() => {
        TL.details_file();
        TL.head_set();
    })
});