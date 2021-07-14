app.ready( () => {
    TL.room_filelist_autoload_enabled();
    TL.room_list(0);
    $('.nav_upload').attr('disabled', true);
    $('title').attr('i18n', 'title_rooom');
    $('meta[name=description]').attr('i18n', 'des_room');
});
app.onExit( () => {
    TL.room_filelist_autoload_disabled();
});