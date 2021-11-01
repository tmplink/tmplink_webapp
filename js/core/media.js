class media {

    parent = null
    allow_ext = ['mp4','m4v','rm','rmvb','webm','mkv','avi','ts']

    init(parent) {
        this.parent = parent;
    }

    is_allow(ext){
        return this.allow_ext.indexOf(ext) > -1;
    }

    video_add(ukey){
        this.parent.recaptcha_do('token_check', (captcha) => {
            $.post(this.parent.api_media, {
                action: 'video_add',
                captcha: captcha,
                token: this.parent.api_token,
                ukey: ukey
            }, (rsp) => {
                if(rsp.status==1){
                    alert(this.parent.languageData.status_ok);
                }
                if(rsp.status==2){
                    alert(this.parent.languageData.status_media_not_found);
                }
                if(rsp.status==3){
                    alert(this.parent.languageData.status_media_not_allow);
                }
                if(rsp.status==4){
                    alert(this.parent.languageData.status_media_added);
                }
            });
        });
    }

    video_list(){
        console.log(this.parent.api_token);
        $.post(this.parent.api_media, {
            action: 'video_list',
            token: this.parent.api_token
        }, (rsp) => {
            if(rsp.status==1){
                //处理界面
                let html = app.tpl('vedio_list_tpl', rsp.data);
                $('#vedio_list').html(html);
                this.parent.lazyload('.lazyload');
            }
        });
    }

    video_play(id){
        $.post(this.parent.api_media, {
            action: 'video_play',
            token: this.parent.api_token,
            id: id
        }, (rsp) => {
            if(rsp.status==1){
                //处理界面
                $('#video_preview_online_src').attr('src',rsp.data);
                //将页面滚动到最上层
                $('html,body').animate({scrollTop:0},1000);
                //取消静音
                $('#video_preview_online_src').prop('muted',false);
                //视频就绪时自动播放
                $('#video_preview_online_src').on('canplay',function(){
                    $('#video_preview_online_src').get(0).play();
                });
            }
        });
    }

    video_del(){
        
    }
}