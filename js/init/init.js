app.ready(()=>{
    window.TL = new tmplink();
    TL.language(app.languageSetting);
    TL.languageData_init(app.languageData);

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("/pwa_sw.js")
            .then(res => console.log("SW:ok"))
            .catch(err => console.log("SW:error", err));
    }
});

$('.tooltip').tooltipster({
    theme: 'tooltipster-noir'
});