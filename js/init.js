app.ready(()=>{
    window.TL = new tmplink();
    TL.language(app.languageSetting);
    TL.language_data_init(app.languageData);
});

$('.tooltip').tooltipster({
    theme: 'tooltipster-noir'
});