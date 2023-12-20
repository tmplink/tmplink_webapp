setThemeColor();
app.ready(
    () => {
        let lang = app.languageSetting;
        langset(lang);
        app.languageBuild();
        document.title = app.languageData.title_index;
        document.querySelector('meta[name=description]').setAttribute('content', app.languageData.des_index);
        autoLogin();

        //添加监听，页面向下滚动超过 300px 时，隐藏 #translater-btn
        window.addEventListener('scroll', function () {
            let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            if (scrollTop > 300) {
                document.getElementById('translater-btn').style.display = 'none';
            } else {
                document.getElementById('translater-btn').style.display = 'block';
            }
        }, false);
    }
);

function langset(lang) {
    let span_lang = 'English';
    if (lang === 'en') {
        span_lang = 'English';
    }

    if (lang === 'cn') {
        span_lang = '简体中文';
    }

    if (lang === 'hk') {
        span_lang = '繁体中文';
    }

    if (lang === 'jp') {
        span_lang = '日本語';
    }
    document.querySelector('.selected_lang').innerHTML = span_lang;
    app.languageSet(lang);
}

function Login(){
    let url = '/?tmpui_page=/app&listview=preload';
    location.href = url;
}


async function autoLogin() {
    const api_url = 'https://tmp-api.vx-cdn.com/api_v2/user';
    const api_token = localStorage.getItem('app_token');

    //show loading spinner
    document.querySelector('#index_start').innerHTML = '<img src="/img/loading.svg" height="67" />';

    if (api_token !== null) {
        const form = new FormData();
        form.append('action', 'get_detail');
        form.append('token', api_token);
        
        try {
            const response = await fetch(api_url, {
                method: 'POST',
                body: form
            });

            if (response.ok) {
                const responseData = await response.json();
                if (responseData.status === 1) {
                    document.querySelector('#index_start').innerHTML = '<img src="/img/circle-check-regular.svg" height="67" style="padding:10px;"/>';
                    setTimeout(() => {
                        Login();
                    }, 1000);
                } else {
                    showBtn();
                }
            } else {
                showBtn();
            }
        } catch (error) {
            console.error('请求出错：', error);
            showBtn();
        }
    }else{
        showBtn();
    }
}

function showBtn(){
    document.querySelector('#index_start').innerHTML = `<a href="javascript:;" class="btn-get-started scrollto" onclick="Login()">${app.languageData.i2023_new_index_getting_start}</a>`;
}

// 如果是夜间模式，修改主题色为黑色
function setThemeColor() {
    if (matchNightModel()) {
        let tc = document.querySelector('meta[name="theme-color"]');
        if (tc !== null) {
            tc.setAttribute('content', '#000');
        }
    } else {
        let tc = document.querySelector('meta[name="theme-color"]');
        if (tc !== null) {
            tc.setAttribute('content', '#fff');
        }
    }
}

function matchNightModel() {
    let media = window.matchMedia('(prefers-color-scheme: dark)');
    return media.matches;
}