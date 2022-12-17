function INIT_room(){
    TL.ready(() => {
        TL.head_set();
        TL.room_list(0);
        TL.dir_list_autoload_enabled();
        $('.nav_upload').attr('disabled', true);
        $('title').attr('i18n', 'title_room');
        $('meta[name=description]').attr('i18n', 'des_room');
        app.languageBuild();
    });
}