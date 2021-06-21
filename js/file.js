//start
var $openapi = '/openapi/v1';
var $ukey = getUKEY();
//query
domloader.onload(function () {
    $("[i18n]").i18n();
    $.post($openapi, {'ukey': $ukey, 'action': 'fileinfo'}, function (rsp) {
        if (rsp.status === 0) {
            $('#fileinfo').fadeIn();
            $('#filename').html(rsp.data.type);
            $('#filesize').html(rsp.data.size);
            $('#btn_download').attr('href', '/d/' + $ukey);
            $('#btn_copy').attr('data-clipboard-text', 'http://tmp.link/f/' + $ukey);
            $('#qr_code').attr('src', 'http://tmp.link/qr?code=' + $ukey);
            $('#report_ukey').val($ukey);
            clipboard = new Clipboard('.copybtn');
            clipboard.on('success', function (e) {
                $('.copybtn').html('<i class="fas fa-check-circle" aria-hidden="true"  style="font-size: 20px;"></i>');
            });
        } else {
            $('#loading').html('<i class="far fa-unlink fa-4x"></i>');
        }
    }, 'json');
});

function report() {
    var reason = $("input[name='Radios'][checked]").val();
    var ukey = $('#report_ukey').val();
    $.post($openapi, {'ukey': ukey, 'reason': reason, 'action': 'report'}, function (rsp) {
        alert(language.report_completed);
        window.location.reload();
    }, 'json');
}

function getUKEY() {
    var url = window.location.pathname;
    return url.substring(3);
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}