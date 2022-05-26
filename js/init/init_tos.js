app.ready(() => {
    $('title').attr('i18n', 'title_tos');
    $('meta[name=description]').attr('i18n', 'des_tos');
    app.languageBuild();
});