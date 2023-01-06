class profile {

    parent_op = null
    nickname = ''
    intro = ''
    avatar_id = ''
    avatar_url = '/img/ico/logo-256x256.png'
    publish = 'no'
    publish_status = false

    init(parent_op) {
        this.parent_op = parent_op;
    }

    init_details() {
        $.post(this.parent_op.api_user, {
            'action': 'pf_userinfo_get',
            'token': this.parent_op.api_token
        }, (rsp) => {
            if (rsp.status == 1) {
                this.publish = rsp.data.publish;
                this.publish_status = rsp.data.publish_status;
                this.nickname = rsp.data.nickname;
                this.intro = rsp.data.intro;
                this.avatar_id = rsp.data.avatar_id;
            }
            this.refresh();
        }, 'json');
    }

    refresh() {
        
        if(this.nickname===''){
            $('#user_saved_nickname').html(app.languageData.user_saved_title);
        }else{
            $('#user_saved_nickname').html(this.nickname);
        }
        if(this.intro===''){
            $('#user_saved_intro').html(app.languageData.user_saved_content);
        }else{
            $('#user_saved_intro').html(this.intro);
        }

        let avatarUrl = '';
        if(this.avatar_id){
            avatarUrl = `https://tmp-static.vx-cdn.com/static/avatar?id=${this.avatar_id}`;
        }else{
            avatarUrl = this.avatar_url;
        }
        //load avatar
        let avatar = new Image();
        avatar.src = avatarUrl;
        avatar.onload = () => {
            $('#user_saved_logo').html(`<img src="${avatarUrl}" class="img-circle" alt="User Image" style="width:64px;height:64px;border-radius: 12px;">`);
        }

        if (this.publish == 'yes') {
            $("#userinfo_set_publish").attr('checked', 'checked');
        } else {
            $("#userinfo_set_publish").removeAttr('checked');
        }
        this.userinfoStatus(this.publish_status);
    }

    avatarSet(logo) {
        $('.user_logo_postmsg').html(app.languageData.direct_user_logo_set_process);
        $('#user_set_upload_status').html('<i class="fa fa-spinner fa-spin text-blu"></i>');
        let xhr = new XMLHttpRequest();
        let formData = new FormData();
        formData.append('action', 'pf_avatar_set');
        formData.append('token', this.parent_op.api_token);
        formData.append('file', logo.files[0]);
        xhr.open('POST', this.parent_op.api_user, true);
        xhr.onload = (e) => {
            if (xhr.status == 200) {
                let rsp = JSON.parse(xhr.responseText);
                if (rsp.status == 1) {
                    $('.user_logo_postmsg').html(app.languageData.direct_user_logo_set_complete);
                }
                if (rsp.status == 0) {
                    $('.user_logo_postmsg').html(app.languageData.direct_user_logo_set_invalid);
                }
                if (rsp.status == 2) {
                    $('.user_logo_postmsg').html(app.languageData.direct_user_logo_set_size);
                }
            } else {
                $('.user_logo_postmsg').html(app.languageData.status_error_0);
            }
            $('#user_set_upload_status').html('<i class="fa fa-check text-green"></i>');
            this.init_details();
        }
        xhr.send(formData);
    }

    userinfoSet() {
        let userTitle = $('#userinfo_name_input').val();
        let userIntro = $('#userinfo_intro_input').val();
        if (userTitle == '' || userIntro == '') {
            alert(app.languageData.direct_brand_name_empty);
            return false;
        }
        $.post(this.parent_op.api_user, {
            'action': 'pf_userinfo_set',
            'token': this.parent_op.api_token,
            'nickname': userTitle,
            'intro': userIntro
        }, (rsp) => {
            if (rsp.status == 1) {
                $('.user_setting_status').html('<i class="fa fa-check text-green"></i>');
                // this.init_details();
            } else {
                $('.user_setting_status').html('<i class="fa fa-times text-red"></i>');
            }
            this.init_details();
        }, 'json');
    }

    userinfoReview() {
        $.post(this.parent_op.api_user, {
            'action': 'pf_userinfo_review',
            'token': this.parent_op.api_token
        }, (rsp) => {
            if (rsp.status == 1) {
                alert(app.languageData.user_review_status_1);
            }
            if (rsp.status == 2) {
                alert(app.languageData.user_review_status_2);
            }
            if (rsp.status == 0) {
                alert(app.languageData.user_review_status_0);
            }
            this.init_details();
        }, 'json');
    }

    setPublish() {
        let publish = ($('#userinfo_set_publish').is(':checked')) ? 'yes' : 'no';

        $.post(this.parent_op.api_user, {
            'action': 'pf_userinfo_publish_set',
            'token': this.parent_op.api_token,
            'status': publish
        });

    }

    userinfoStatus(status) {
        switch (status) {
            case 'ok':
                $('#user_status').html('<i class="mr-1 fa-tw fa-light fa-circle-check text-green"></i>'+app.languageData.brand_status_ok);
                break;
            case 'reject':
                $('#user_status').html('<i class="mr-1 fa-tw fa-light fa-times text-red"></i>'+app.languageData.brand_status_reject);
                break;
            case 'wait':
                $('#user_status').html('<i class="mr-1 fa-tw fa-light fa-timer text-blue"></i>'+app.languageData.brand_status_wait);
                break;
            case 'review':
                $('#user_status').html('<i class="mr-1 fa-tw  fa-light fa-circle-user text-blue"></i>'+app.languageData.brand_status_review);
                break;
        }
    }
}