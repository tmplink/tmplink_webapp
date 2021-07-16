app.ready(() => {
    TL.room_filelist_autoload_enabled();
    TL.room_list(0);
});
app.onExit(() => {
    TL.room_filelist_autoload_disabled();
});
$('.nav_upload').attr('disabled', true);
$('title').attr('i18n', 'title_room');
$('meta[name=description]').attr('i18n', 'des_room');