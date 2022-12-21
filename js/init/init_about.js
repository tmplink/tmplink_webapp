app.ready(() => {
    app.languageBuild();
    $('title').html(app.languageData.title_about);
    $('meta[name=description]').html(app.languageData.des_about);
});
