app.ready(() => {
    TL.mr_list();
    $('title').attr('i18n', 'title_meetingrooom');
    $('meta[name=description]').attr('i18n', 'des_meetingroom');
}, 1000);