app.ready(() => {
    $('title').attr('i18n', 'title_file');
    $('meta[name=description]').attr('i18n', 'des_file');
    app.languageBuild();

    TL.ready(() => {
        TL.details_file();
        TL.head_set();
    })
});