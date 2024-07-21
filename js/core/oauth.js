class oauth {
    parent_op = null

    init(parent_op) {
        this.parent_op = parent_op;
    }

    init_details() {
        if (this.parent_op.isLogin === false) {
            return;
        }
        //初始化google登录状态
        this.google_connect_status();
    }

    google_login() {
        //禁用按钮
        $('#google_login').attr('disabled', true);
        let oauth = window.open('', '_blank');
        //发送请求获取google登录的url
        $.post(this.parent_op.api_user, {
            'action': 'oauth_google_login',
            'type': 'login', //登录google
            'lang': this.parent_op.currentLanguage, //语言
            'token': this.parent_op.api_token,
        }, (rsp) => {
            if (rsp.status == 1) {
                oauth.location = rsp.data;
                // 处理令牌
                this.google_login_callback();
            }
        }, 'json');
    }

    google_login_callback() {
        //显示正在登录
        $('#google_login_msg').html(app.languageData.oauth_btn_processing);
        //发送请求获取google登录的状态
        $.post(this.parent_op.api_user, {
            'action': 'oauth_google_status',
            'token': this.parent_op.api_token,
        }, (rsp) => {
            //登录成功
            if (rsp.data == 'GOOGLE_LOGIN_SUCCESS' || rsp.data == 'GOOGLE_LOGIN_FAIL1') {
                //如果请求成功，进入主页
                $('#google_login_msg').html(app.languageData.oauth_btn_complete);
                setTimeout(() => {
                    dynamicView.workspace();
                }, 1000);
            }

            //登录失败
            if (rsp.data == 'GOOGLE_LOGIN_FAIL2' || rsp.data == 'GOOGLE_LOGIN_FAIL3' || rsp.data == 'GOOGLE_LOGIN_FAIL4') {
                $('#google_login_msg').html(app.languageData.status_error_0);
                //启用按钮
                setTimeout(() => {
                    $('#google_login_msg').html(app.languageData.oauth_google_btn_login);
                    $('#google_login').attr('disabled', false);
                }, 1000);
            }

            //登录中，重新监听
            if (rsp.data == 'GOOGLE_LOGIN_START') {
                //显示正在登录
                $('#google_login_msg').html(app.languageData.oauth_btn_processing);
                setTimeout(() => {
                    this.google_login_callback();
                }, 1000);
            }
        }, 'json');
    }

    google_connect_status() {
        $('#google_disconnect').hide();
        //发送请求获取google登录的状态
        $.post(this.parent_op.api_user, {
            'action': 'oauth_google_is_connected',
            'token': this.parent_op.api_token,
        }, (rsp) => {
            //成功
            if (rsp.status == 1) {
                //绑定完成，设定界面状态
                $('#google_connect_msg').html(app.languageData.oauth_btn_google_connected);
                //禁用按钮
                $('#google_connect').attr('disabled', true);
                $('#google_disconnect').attr('disabled', false);
                //显示解除绑定的连接
                $('#google_disconnect').show();
            } else {
                //失败，设定界面状态
                $('#google_connect_msg').html(app.languageData.oauth_btn_google_connect);
                $('#google_connect').attr('disabled', false);
                $('#google_disconnect').attr('disabled', true);
            }
        }, 'json');
    }

    google_connect() {
        //禁用按钮
        $('#google_connect').attr('disabled', true);
        let oauth = window.open('', '_blank');
        //发送请求获取google登录的url
        $.post(this.parent_op.api_user, {
            'action': 'oauth_google_login',
            'type': 'connect', //连接google
            'token': this.parent_op.api_token,
        }, (rsp) => {
            if (rsp.status == 1) {
                //如果请求成功，通过另外的小窗口打开google登录的url，然后启动监听进程
                oauth.location = rsp.data;
                this.google_connect_callback();
            }
        }, 'json');
    }

    google_connect_callback() {
        //显示正在进行
        $('#google_connect_msg').html(app.languageData.form_btn_processing);
        //发送请求获取google登录的状态
        $.post(this.parent_op.api_user, {
            'action': 'oauth_google_status',
            'token': this.parent_op.api_token,
        }, (rsp) => {
            //成功
            if (rsp.data == 'GOOGLE_BIND_SUCCESS') {
                //绑定完成
                $('#google_connect_msg').html(app.languageData.oauth_btn_complete);
                setTimeout(() => {
                    this.google_connect_status();
                }, 2000);
            }

            //失败
            if (rsp.data == 'GOOGLE_BIND_FAILED') {
                $('#google_connect_msg').html(app.languageData.status_error_0);
                //启用按钮
                setTimeout(() => {
                    $('#google_connect_msg').html(app.languageData.oauth_btn_google_connect);
                    $('#google_connect').attr('disabled', false);
                }, 3000);
            }

            //进行中，重新监听
            if (rsp.data == 'GOOGLE_BIND_START') {
                //显示正在进行
                $('#google_connect_msg').html(app.languageData.oauth_btn_processing);
                setTimeout(() => {
                    this.google_connect_callback();
                }, 2000);
            }
        }, 'json');
    }

    google_disconnect() {
        //禁用按钮
        $('#google_disconnect').attr('disabled', true);
        //发送请求获取google登录的url
        $.post(this.parent_op.api_user, {
            'action': 'oauth_google_disconnect',
            'token': this.parent_op.api_token,
        }, (rsp) => {
            this.google_connect_status();
        }, 'json');
    }
}