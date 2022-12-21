function INIT_reset() {
    TL.ready(()=>{
        app.languageBuild();
        $('title').html(app.languageData.title_reset);
        $('meta[name=description]').html(app.languageData.des_reset);
        if (TL.isLogin()) {
            dynamicView.workspace();
        }    
    });
    
}