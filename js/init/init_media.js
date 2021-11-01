app.ready(() => {
    TL.ready(() => {
        $('title').attr('i18n', 'title_media');
        $('meta[name=description]').attr('i18n', 'des_media');
    });

    TL.ready(() => {
        TL.head_set();
        TL.media.video_list();
    });
});