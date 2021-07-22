app.ready(() => {
    TL.mr_list();
}, 1000);
app.ready(()=>{
    TL.head_set();
});
$('title').attr('i18n', 'title_meetingroom');
$('meta[name=description]').attr('i18n', 'des_meetingroom');