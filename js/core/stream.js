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
    open_on_apps_ext = ['mp4','webm','ogg','mov','3gp','mpeg','mkv','rm','rmvb','avi','m4v','flv','wmv','mpv'];
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

    checkForOpenOnApps(filename,owner){
        if (owner!==this.parent.uid&&this.parent.sponsor===false) {
            return false;
        }
        for (let i in this.open_on_apps_ext) {
            let ext = filename.substring(filename.lastIndexOf('.') + 1, filename.length);
            if (ext.toLowerCase().indexOf(this.open_on_apps_ext[i]) > -1) {
                return true;
            }
        }
        return false;
    }

    allow(filename,owner) {
        if (owner!==this.parent.uid&&this.parent.sponsor===false) {
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

    
    request(ukey,app) {
        //未登录的情况下，跳转到登录界面
        if (this.parent.logined !== 1) {
            app.open('/&listview=login');
            return;
        }

        //显示载入动画
        $('#loading_box').fadeIn();
        this.parent.recaptcha_do('stream_req', (recaptcha) => {
            $.post(this.parent.api_file, {
                action: 'stream_req',
                ukey: ukey,
                token: this.parent.api_token,
                captcha: recaptcha
            }, (req) => {
                $('#loading_box').fadeOut();
                if (req.status == 1) {
                    // let player = 'http://play.5t-cdn.com/?stream=' + btoa(req.data);
                    this.playWith(req.data,app);
                } else {
                    alert('error');
                }
            }, 'json');
        });
    }

    playWith(url,app){
        switch(app){
            case 'vlc':
                this.openWithVLC(url);
                break;
            case 'iina':
                this.openWithIINA(url);
                break;
            case 'potplayer':
                this.openWithPotPlayer(url);
                break;
            case 'nplayer':
                this.openWithNplayer(url);
                break;
            default:
                this.play(url);
        }
    }

    openWithVLC(url){
        window.open(`vlc://${url}`);
    }

    openWithIINA(url){
        window.open(`iina://weblink?url=${url}`);
    }

    openWithPotPlayer(url){
        window.open(`potplayer://${url}`);
    }

    openWithNplayer(url){
        window.open(`nplayer-https://${url}`);
    }
    

    //打开新标签页进行播放
    play(url){
        let player = 'https://ix.ng-ccc.com/go.html?stream=' + btoa(url);
        window.open(player);
    }
}