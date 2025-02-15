app.ready(() => {

    if (isMobileScreen()) {
        $('#file-view').html(app.getFile('/tpl/file_mobile.html'));
    } else {
        $('#file-view').html(app.getFile('/tpl/file_desktop.html'));
    }

    app.languageBuild();
    $('title').html(app.languageData.title_file);
    $('meta[name=description]').html(app.languageData.des_file);

    TL.ready(() => {
        TL.file_details();
        TL.head_set();
    })
    
});