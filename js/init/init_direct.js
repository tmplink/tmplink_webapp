app.ready(() => {
    TL.ready(() => {
        TL.direct.list_autoload_enabled();
        TL.direct.filelist(0);
        TL.direct.prepare();
        $('title').attr('i18n', 'title_direct');
        $('meta[name=description]').attr('i18n', 'des_direct');
        app.languageBuild();
    });

    TL.ready(() => {
        TL.head_set();
    });
});

app.onExit(() => {
    TL.direct.list_autoload_disabled();
});