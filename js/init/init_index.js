app.ready(
    () => {
        let lang = app.languageSetting;
        langset(lang);
        app.languageBuild();
        $('title').html(app.languageData.title_index);
        $('meta[name=description]').html(app.languageData.des_index);
    }
);

function langset(lang) {
    let span_lang = 'English';
    if (lang === 'en') {
        span_lang = 'English';
    }

    if (lang === 'cn') {
        span_lang = '简体中文';
    }

    if (lang === 'hk') {
        span_lang = '繁体中文';
    }

    if (lang === 'jp') {
        span_lang = '日本語';
    }
    $('.selected_lang').html(span_lang);
    app.languageSet(lang);
}