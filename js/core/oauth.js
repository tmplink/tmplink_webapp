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
        //发送请求获取google登录的url
        $.post(this.parent_op.api_user, {
            'action': 'oauth_google_login',
            'type': 'login', //登录google
            'lang': this.parent_op.currentLanguage, //语言
            'token': this.parent_op.api_token,
        }, (rsp) => {
            if (rsp.status == 1) {
                //如果请求成功，通过另外的小窗口打开google登录的url，然后启动监听进程
                let oauth = window.open(rsp.data, 'oauth2Popup', 'width=600,height=400');
                // 监听来自 popup 窗口的消息
                const messageHandler = (event) => {
                    if (event.origin === window.location.origin) {
                        // 处理令牌
                        this.google_login_callback();
                        // 移除事件
                        window.removeEventListener('message', messageHandler);
                    }
                };
                window.addEventListener('message', messageHandler);
            }
        }, 'json');
    }

    google_login_callback() {
        //发送请求获取google登录的状态
        $.post(this.parent_op.api_user, {
            'action': 'oauth_google_status',
            'token': this.parent_op.api_token,
        }, (rsp) => {
            //登录成功
            if (rsp.data == 'GOOGLE_LOGIN_SUCCESS' || rsp.data == 'GOOGLE_LOGIN_FAIL1') {
                //如果请求成功，进入主页
                $('#google_login_msg').html(app.languageData.login_ok);
                setTimeout(() => {
                    dynamicView.workspace();
                }, 1000);
            }

            //登录失败
            if (rsp.data == 'GOOGLE_LOGIN_FAIL2' || rsp.data == 'GOOGLE_LOGIN_FAIL3' || rsp.data == 'GOOGLE_LOGIN_FAIL4') {
                $('#google_login_msg').html(app.languageData.status_error_0);
                //启用按钮
                setTimeout(() => {
                    $('#google_login_msg').html('Login with Google');
                    $('#google_login').attr('disabled', false);
                }, 3000);
            }

            //登录中，重新监听
            if (rsp.data == 'GOOGLE_LOGIN_START') {
                //显示正在登录
                $('#google_login_msg').html(app.languageData.form_btn_processing);
                setTimeout(() => {
                    this.google_login_callback();
                }, 3000);
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
                $('#google_connect_msg').html('Google connected');
                //禁用按钮
                $('#google_connect').attr('disabled', true);
                $('#google_disconnect').attr('disabled', false);
                //显示解除绑定的连接
                $('#google_disconnect').show();
            } else {
                //失败，设定界面状态
                $('#google_connect_msg').html('Connect with Google');
                $('#google_connect').attr('disabled', false);
                $('#google_disconnect').attr('disabled', true);
            }
        }, 'json');
    }

    google_connect() {
        //禁用按钮
        $('#google_connect').attr('disabled', true);
        //发送请求获取google登录的url
        $.post(this.parent_op.api_user, {
            'action': 'oauth_google_login',
            'type': 'connect', //连接google
            'token': this.parent_op.api_token,
        }, (rsp) => {
            if (rsp.status == 1) {
                //如果请求成功，通过另外的小窗口打开google登录的url，然后启动监听进程
                window.open(rsp.data, '_blank', 'width=800,height=600');
                setTimeout(() => {
                    this.google_connect_callback();
                }, 3000);
            }
        }, 'json');
    }

    google_connect_callback() {
        //发送请求获取google登录的状态
        $.post(this.parent_op.api_user, {
            'action': 'oauth_google_status',
            'token': this.parent_op.api_token,
        }, (rsp) => {
            //成功
            if (rsp.data == 'GOOGLE_BIND_SUCCESS') {
                //绑定完成
                $('#google_connect_msg').html(app.languageData.login_ok);
                setTimeout(() => {
                    this.google_connect_status();
                }, 1000);
            }

            //失败
            if (rsp.data == 'GOOGLE_BIND_FAILED') {
                $('#google_connect_msg').html(app.languageData.status_error_0);
                //启用按钮
                setTimeout(() => {
                    $('#google_connect_msg').html('Connect with Google');
                    $('#google_connect').attr('disabled', false);
                }, 3000);
            }

            //进行中，重新监听
            if (rsp.data == 'GOOGLE_BIND_START') {
                //显示正在进行
                $('#google_connect_msg').html(app.languageData.form_btn_processing);
                setTimeout(() => {
                    this.google_connect_callback();
                }, 3000);
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