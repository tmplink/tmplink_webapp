app.ready(()=>{
    window.TL = new tmplink();
    TL.language(app.languageSetting);
    TL.languageData_init(app.languageData);
});

$('.tooltip').tooltipster({
    theme: 'tooltipster-noir'
});