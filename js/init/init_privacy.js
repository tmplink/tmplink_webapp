app.ready(() => {
    app.languageBuild();
    $('title').html(app.languageData.title_privacy);
    $('meta[name=description]').html(app.languageData.des_privacy);
});
