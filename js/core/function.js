function listDataPrepare(data) {
    let new_data = {};
    for (let i in data) {
        new_data[data[i].ukey] = data[i];
    }
    return new_data;
}

function debug(log) {
    if (true) {
        console.log(log);
    }
}

function isiPad() {
    return (/macintosh|mac os x/i.test(navigator.userAgent) && window.screen.height > window.screen.width && !navigator.userAgent.match(/(iPhone\sOS)\s([\d_]+)/)) || navigator.userAgent.match(/(iPad).*OS\s([\d_]+)/);
}

function isMobile() {
    if (/(iphone|ipad|ipod|ios|android)/i.test(navigator.userAgent.toLowerCase())) {
        return true;
    } else {
        return false;
    };
}

function isMobileScreen() {
    return window.screen.width < 675;
}

// 调整透明度：隐藏
function opacityHide(dom) {
    var obj = document.querySelector(dom);
    obj.style.opacity = 0;
    obj.style.filter = "alpha(opacity=0)";
}

// 调整透明度：显示
function opacityShow(dom) {
    var obj = document.querySelector(dom);
    obj.style.opacity = 1;
    obj.style.filter = "alpha(opacity=100)";
}

//if iphone or ipad
function is_iphone_or_ipad() {
    //如果是 macos 或者 windows 设备
    if ((navigator.userAgent.match(/Macintosh/i) && isiPad() === null) || navigator.userAgent.match(/Windows/i)) {
        return false;
    }

    //如果是 android 设备
    if (navigator.userAgent.match(/Android/i)) {
        $('#anyconnect_android_device').show();
        return false;
    }

    //如果是 iPhone
    if (navigator.userAgent.match(/iPhone/i)) {
        return true;
    }

    return true;
}

/**
 * 获取当前页面的 url
 * @returns {string}
 */
function getCurrentURL() {
    var url = window.location.href;
    return url;
}

//倒计时函数，将剩余的时间格式化成时分秒并写入到指定的 html 中
function countDown(id, time) {
    let now = time - 1;
    let left_time = now;

    let d = '';
    let h = '';
    let m = '';
    let s = '';

    if (now == 0) {
        return false;
    }

    if (now > 86400) {
        d = Math.floor(now / 86400);
        d = d + ':';
        left_time = left_time % 86400;
    }

    if (left_time > 3600) {
        h = Math.floor(left_time / 3600);
        h = h < 10 ? "0" + h : h;
        h = h === "0" ? "00" : h;
        h = h + ':';
        left_time = left_time % 3600;
    }

    if (left_time > 60) {
        m = Math.floor(left_time / 60);
        m = m < 10 ? "0" + m : m;
        m = m === "0" ? "00" : m;
        m = m + ':';
        left_time = left_time % 60;
    }

    if (left_time > 0) {
        s = left_time;
        s = s < 10 ? "0" + s : s;
        s = s === "0" ? "00" : s;
    }
    if (left_time === 0 && m !== '') {
        s = "00";
    }

    let dom = document.getElementById(id);
    if (dom === null) {
        return false;
    } else {
        dom.innerHTML = d + h + m + s;
    }

    if (now > 0) {
        setTimeout(() => {
            countDown(id, now);
        }, 1000);
    }
}

function bytetoconver(val, label) {

    //if undefined,return 0 B
    if (val === undefined) {
        return '0 B';
    }

    if (val < 1) {
        return '0 B';
    }

    var s = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    var e = Math.floor(Math.log(val) / Math.log(1024));
    var value = ((val / Math.pow(1024, Math.floor(e))).toFixed(2));
    e = (e < 0) ? (-e) : e;
    if (label) {
        value += ' ' + s[e];
    }
    return value;
}

function formatTime(s) {
    var day = Math.floor(s / (24 * 3600));
    var hour = Math.floor((s - day * 24 * 3600) / 3600);
    var minute = Math.floor((s - day * 24 * 3600 - hour * 3600) / 60);
    var second = s - day * 24 * 3600 - hour * 3600 - minute * 60;
    if (hour < 10) {
        hour = '0' + hour.toString();
    }
    if (minute < 10) {
        minute = '0' + minute.toString();
    }
    if (second < 10) {
        second = '0' + second.toString();
    }
    return hour + ":" + minute + ":" + second;
}

function get_url_params() {
    var vars = [],
        hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function get_page_mrid() {
    var params = get_url_params();
    return params.mrid;
}

function Base64Encode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

function Base64Decode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function isIosPwaMode() {
    // 检查是否运行在 Safari 浏览器中
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // 检查是否启用了 PWA 模式
    const isInStandaloneMode = ('standalone' in window.navigator) && window.navigator.standalone;

    // 返回结果，如果同时满足 Safari 浏览器和 PWA 模式，则说明当前网页在 iOS PWA 模式下运行
    return isSafari && isInStandaloneMode;
}


function stripTags(html) {
    //处理例外情况
    if (typeof html !== 'string') {
        return '';
    }

    //另外情况2，没有 replace 方法
    if (!html.replace) {
        return html;
    }

    // 剔除 HTML 标签
    const strippedHtml = html.replace(/(<([^>]+)>)/gi, '');
    // 剔除转义字符
    const strippedText = strippedHtml.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');

    return strippedText;
}
