app.ready(
    () => {
        let lang = app.languageSetting;
        langset(lang);
        app.languageBuild();
        document.title = app.languageData.title_index;
        document.querySelector('meta[name=description]').setAttribute('content', app.languageData.des_index);
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
    document.querySelector('.selected_lang').innerHTML = span_lang;
    app.languageSet(lang);
}