/**
 * 复制内容到剪贴板的现代化实现
 * @param {string} content 要复制的文本内容
 * @returns {Promise<void>} 返回一个 Promise，复制成功时 resolve，失败时 reject
 */
async function copyToClip(content) {
    try {
        await navigator.clipboard.writeText(content);
    } catch (err) {
        throw new Error("Clipboard API not supported");
    }
}

/**
 * Adds dark mode styles to chart options with transparent background
 * @param {Object} options - Original chart options
 * @returns {Object} The modified options with theme styles
 */
function getChartThemeOptions(options) {
    // Detect dark mode
    const isDarkMode = 
        document.documentElement.classList.contains('dark') || 
        document.body.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches || 
        localStorage.getItem('theme') === 'dark';

    // Override styles
    return {
        ...options,
        chart: {
            ...options.chart,
            background: 'transparent',
            foreColor: isDarkMode ? '#e1e1e1' : '#304758',
            toolbar: {
                show: true
            }
        },
        grid: {
            ...options.grid,
            show: false
        },
        tooltip: {
            ...options.tooltip,
            theme: isDarkMode ? 'dark' : 'light'
        },
        dataLabels: {
            ...options.dataLabels,
            offsetY: -20,  // 恢复向上偏移
            style: {
                ...options.dataLabels?.style,
                colors: [isDarkMode ? '#e1e1e1' : '#304758']
            }
        },
        plotOptions: {
            ...options.plotOptions,
            bar: {
                ...options.plotOptions?.bar,
                columnWidth: '60%',
                borderRadius: 4
            }
        },
        yaxis: {
            ...options.yaxis,
            labels: {
                ...options.yaxis?.labels,
                style: {
                    colors: isDarkMode ? '#e1e1e1' : '#304758'
                }
            }
        },
        xaxis: {
            ...options.xaxis,
            labels: {
                ...options.xaxis?.labels,
                style: {
                    colors: isDarkMode ? '#e1e1e1' : '#304758'
                },
                offsetY: -10  // 保持 X 轴标签的上方偏移
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        }
    };
}

function getSortKeys() {
    let key = get_page_mrid();

    if (key === undefined) {
        key = 'workspace';
    }

    return {
        display: 'app_room_view_display_' + key,
        sort_by: 'app_room_view_sort_by_' + key,
        sort_type: 'app_room_view_sort_type_' + key,
    }

}

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
//支持四种语言：zh(简体中文), tw(繁體中文), jp(日本語), en(English)
function countDown(id, time, lang = 'en') {
    // console.log('countDown', id, time, lang);
    // 确保语言是支持的选项，否则默认为英语
    lang = ['en', 'cn', 'hk', 'jp'].includes(lang) ? lang : 'en';
    
    // 语言特定的文本配置
    const langConfig = {
        'en': {
            day: ' day',
            days: ' days',
            hour: ' hour',
            hours: ' hours',
            minute: ' minute',
            minutes: ' minutes',
            second: ' second',
            seconds: ' seconds',
            separator: ', ',
            and: ' and '
        },
        'cn': {
            day: '天',
            days: '天',
            hour: '小时',
            hours: '小时',
            minute: '分钟',
            minutes: '分钟',
            second: '秒',
            seconds: '秒',
            separator: '',
            and: ''
        },
        'hk': {
            day: '天',
            days: '天',
            hour: '小時',
            hours: '小時',
            minute: '分鐘',
            minutes: '分鐘',
            second: '秒',
            seconds: '秒',
            separator: '',
            and: ''
        },
        'jp': {
            day: '日',
            days: '日',
            hour: '時間',
            hours: '時間',
            minute: '分',
            minutes: '分',
            second: '秒',
            seconds: '秒',
            separator: '',
            and: ''
        }
    };
    
    const config = langConfig[lang];
    
    // 如果时间为0或负数，则相应处理
    if (time <= 0) {
        let dom = document.getElementById(id);
        if (dom === null) {
            return false;
        } else {
            dom.innerHTML = "0" + config.seconds;
            return false;
        }
    }
    
    // 计算时间组件
    let d = Math.floor(time / 86400);
    let left_time = time % 86400;
    
    let h = Math.floor(left_time / 3600);
    left_time = left_time % 3600;
    
    let m = Math.floor(left_time / 60);
    let s = left_time % 60;
    
    // 确定是否处于天级别
    const isDayLevel = d > 0;
    
    // 以自然语言格式化输出
    let parts = [];
    
    if (d > 0) {
        parts.push(d + (d === 1 && lang === 'en' ? config.day : config.days));
    }
    
    if (h > 0) {
        parts.push(h + (h === 1 && lang === 'en' ? config.hour : config.hours));
    }
    
    if (m > 0) {
        parts.push(m + (m === 1 && lang === 'en' ? config.minute : config.minutes));
    }
    
    // 只有在非天级别时才包含秒
    if (!isDayLevel && s > 0) {
        parts.push(s + (s === 1 && lang === 'en' ? config.second : config.seconds));
    }
    
    let output = '';
    
    if (parts.length === 0) {
        // 如果所有组件都为零
        output = "0" + (isDayLevel ? config.days : config.seconds);
    } else if (lang === 'en' && parts.length > 1) {
        // 英语格式：X, Y, and Z
        const lastPart = parts.pop();
        output = parts.join(config.separator) + config.and + lastPart;
    } else {
        // 其他语言：XYZ（无分隔符）或单个值
        output = parts.join(config.separator);
    }
    
    // 更新DOM
    let dom = document.getElementById(id);
    if (dom === null) {
        return false;
    } else {
        dom.innerHTML = output;
    }
    
    // 确定更新间隔和下一个时间值
    const updateInterval = isDayLevel ? 60000 : 1000;  // 天级别为1分钟，否则为1秒
    const decreaseAmount = isDayLevel ? 60 : 1;        // 天级别减少60秒，否则减少1秒
    
    // 安排下一次更新
    setTimeout(() => {
        countDown(id, time - decreaseAmount, lang);
    }, updateInterval);
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
