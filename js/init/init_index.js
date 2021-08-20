
app.ready(() => {
    $('title').attr('i18n', 'title_index');
    $('meta[name=description]').attr('i18n', 'des_index');

    TL.ready(() => {
        TL.head_set();
    })
});