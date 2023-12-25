function INIT_direct() {
    TL.ready(() => {
        //判断是否登录
        if (TL.isLogin() === false) {
            //跳转到登录页面
            app.open('/app&listview=login');
            return;
        }
        TL.direct.init_details(()=>{
            TL.direct.list_autoload_enabled();
            TL.direct.filelist(0);
            TL.direct.room_list();
            TL.direct.prepare();
        });
        app.languageBuild();
        $('meta[name=description]').html(app.languageData.title_direct);
        $('title').html(app.languageData.title_direct);
    });
}
