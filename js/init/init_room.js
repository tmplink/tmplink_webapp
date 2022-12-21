function INIT_room(){
    TL.ready(() => {
        TL.room_list(0);
        TL.dir_list_autoload_enabled();
        $('.nav_upload').attr('disabled', true);
        app.languageBuild();
        $('title').html( app.languageData.title_room);
        $('meta[name=description]').html(app.languageData.des_room);
    });
}