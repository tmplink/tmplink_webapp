app.ready( () => {
    TL.details_file();
});
app.ready(()=>{
    TL.head_set();
});
$('title').attr('i18n', 'title_file');
$('meta[name=description]').attr('i18n', 'des_file');