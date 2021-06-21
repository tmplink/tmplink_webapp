/**
 * register
 */
function register_submit(sec) {
    var username = $('#username').val();
    var password = $('#password').val();
    var rpassword = $('#rpassword').val();
    var email = $('#email').val();
    var checkcode = $('#checkcode').val();
    var uuid = $('#uuid').val();
    var rctype = $('#rctype').val();
    var referer = $.cookie('referer');
    $('#reg_submit').addClass('disabled');
    $('#reg_submit').html('正在注册，请稍等...');
    $('#reg_msgbox').html('正在注册中');
    $.post($openapi + 'user', {token: $token, sec: sec, action: 'register', email: email, username: username, password: password, rpassword: rpassword, code: checkcode, r: uuid, rctype: rctype, referer: referer}, function (rsp) {
	if (rsp.status === 1) {
	    $('#reg_msgbox').html('账号注册成功，即将自动登陆。');
	    window.location.href = '/ai_auto_check';
	} else {
	    $('#reg_msgbox').removeClass('alert-info');
	    $('#reg_msgbox').addClass('alert-danger');
	    $('#reg_msgbox').html(rsp.data);
	    $('#reg_submit').html('提交注册');
	    $('#reg_submit').removeClass('disabled');
	}
    }, 'json');
}

function email_new_checkcode_send() {
    var email = $('#modal_email_new').val();
    email_new_checkcode_send_count();
    $('#modal_email_new_checkcode_msg').show();
    $('#modal_email_new_checkcode_msg').html('正在发送验证码..');
    $.post($openapi + 'user', {token: $token, action: 'new_checkcode_send', email: email}, function (rsp) {
	alert(rsp.data);
	if (rsp.status === 1) {
	    $('#modal_email_new_checkcode_msg').html('验证码已发送(如果未收到，则可能在垃圾箱中)');
	} else {
	    $('#modal_email_new_checkcode_msg').html(rsp.data);
	}
    }, 'json');
}

function email_new_checkcode_send_count() {
    if ($count === 0) {
	$('#modal_email_new_checkcode_send').addClass('disabled');
    }
    if ($count < 10) {
	$count++;
	$('#modal_email_new_checkcode_send').html('已处理，稍等' + (10 - $count) + '秒再次操作');
	setTimeout(email_new_checkcode_send_count, 1000);
    } else {
	$('#modal_email_new_checkcode_send').removeClass('disabled');
	$('#modal_email_new_checkcode_send').html('发送验证码');
	$count = 0;
    }
}