app.ready(()=>{
    TL.language(app.language_setting);
    TL.language_data_init(app.language_data);
});

$('.tooltip').tooltipster({
    theme: 'tooltipster-noir'
});