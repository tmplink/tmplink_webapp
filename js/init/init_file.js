app.ready(() => {

    //如果是移动设备，而当前页面不是移动端，跳转到移动端
    let params = app.getUrlVars(window.location.href);

    if (isMobileScreen()&&params.tmpui_page==='/file') {
        app.open('/mobile_file&ukey='+params.ukey);
        return;
    }

    app.languageBuild();
    $('title').html(app.languageData.title_file);
    $('meta[name=description]').html(app.languageData.des_file);

    TL.ready(() => {
        TL.details_file();
        TL.head_set();
    })
});