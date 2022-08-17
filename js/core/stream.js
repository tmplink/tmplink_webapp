class stream {

    parent = null;
    allow_ext = [];
    canplay_list = [
        ['video/mp4','mp4'],
        ['video/webm','webm'],
        ['video/ogg','ogg'],
        ['video/quicktime','mov'],
        ['video/3gpp','3gp'],
        ['video/mpeg','mpeg'],
    ];
    waitting_list = [];
    current_stream = 0;
    current_stream_wait = 0;

    init(parent) {
        this.parent = parent;
        this.checkCanPlay();
    }

    checkCanPlay(){
        let video = document.createElement('video');
        let canplay = '';
        for (let i in this.canplay_list) {
            canplay = video.canPlayType(this.canplay_list[i][0]);
            if (canplay==='probably'||canplay==='maybe') {
                this.allow_ext.push(this.canplay_list[i][1]);
            }
        }
    }

    allow(filename,owner) {
        if (this.parent.area_cn&&owner!==this.parent.uid) {
            return false;
        }
        
        if(this.allow_ext.length==0){
            return false;
        }

        for (let i in this.allow_ext) {
            let ext = filename.substring(filename.lastIndexOf('.') + 1, filename.length);
            if (ext.toLowerCase().indexOf(this.allow_ext[i]) > -1) {
                return true;
            }
        }
        return false;
    }

    
    request(ukey) {
        //未登录的情况下，跳转到登录界面
        if (this.parent.logined !== 1) {
            app.open('/login');
            return;
        }

        this.parent.recaptcha_do('stream_req', (recaptcha) => {
            $.post(this.parent.api_file, {
                action: 'stream_req',
                ukey: ukey,
                token: this.parent.api_token,
                captcha: recaptcha
            }, (req) => {
                if (req.status == 1) {
                    //播放地址参数需要 base64 编码
                    let player = 'https://player.5t-cdn.com/?stream=' + btoa(req.data);
                    this.play(player);
                } else {
                    alert('error');
                }
            }, 'json');
        });
    }

    //打开新标签页进行播放
    play(url){
        window.open(url);
    }
}