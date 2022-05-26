app.ready(() => {
    TL.ready(() => {
        TL.mr_list();
        TL.head_set();
    });

    $('title').attr('i18n', 'title_meetingroom');
    $('meta[name=description]').attr('i18n', 'des_meetingroom');
    app.languageBuild();
});
