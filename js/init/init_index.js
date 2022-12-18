
app.ready(() => {
    $('title').attr('i18n', 'title_index');
    $('meta[name=description]').attr('i18n', 'des_index');
    app.languageBuild();

    TL.ready(() => {
        if(TL.isLogin()===true){
            app.open('/home&listview=workspace');
        }else{
            TL.head_set();
        }
    })
});