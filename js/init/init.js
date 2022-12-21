app.ready(()=>{
    window.TL = new tmplink();
    TL.ready(()=>{
        TL.language(app.languageSetting);
    });
});

$('.tooltip').tooltipster({
    theme: 'tooltipster-noir'
});