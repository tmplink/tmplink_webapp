$('title').attr('i18n', 'title_reg');
$('meta[name=description]').attr('i18n', 'des_reg');
if ($.cookie('app_login') == 1) {
    app.open('/workspace');
}