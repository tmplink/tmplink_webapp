/*!
 * jQuery i18n Plugin v1.0.0
 * https://github.com/ZOMAKE/jquery.i18n
 *
 * Copyright 2017 ZOMAKE,Inc.
 * Released under the Apache Licence 2.0
 */
var language = null;
(function ($) {
    $.fn.extend({
        i18n: function (options) {
            var defaults = {
                lang: "",
                defaultLang: "cn",
                filePath: "/json/",
                version : 0,
                filePrefix: "",
                fileSuffix: "",
                forever: true,
                callback: function () {}
            };
            
            var langs = navigator.language;
            defaults.defaultLang = 'en';
            if(langs==='zh-CN'||langs==='zh-SG'||langs==='zh'){
                defaults.defaultLang = 'cn';
            }

            if(langs==='zh-TW'||langs==='zh-HK'){
                defaults.defaultLang = 'hk';
            }

            if(langs==='ja'||langs==='ja-JP'){
                defaults.defaultLang = 'jp';
            }

            if(langs==='ru'||langs==='ru-MI'){
                defaults.defaultLang = 'ru';
            }

            if(langs==='ko'){
                defaults.defaultLang = 'kr';
            }

            if(langs==='ms'){
                defaults.defaultLang = 'my';
            }

            function getCookie(name) {
                var arr = document.cookie.split('; ');
                for (var i = 0; i < arr.length; i++) {
                    var arr1 = arr[i].split('=');
                    if (arr1[0] == name) {
                        return arr1[1];
                    }
                }
                return '';
            }
            ;

            function setCookie(name, value, myDay) {
                var oDate = new Date();
                oDate.setDate(oDate.getDate() + myDay);
                document.cookie = name + '=' + value + '; path=/; expires=' + oDate;
            }
            ;

            var options = $.extend(defaults, options);

            if (options.lang != null && options.lang != "") {
                if (options.forever) {
                    setCookie('i18n_lang', options.lang);
                    if(options.lang!=getCookie('i18n_lang')){
                        window.location.reload();
                    }
                } else {
                    $.removeCookie("i18n_lang");
                }
            } else {
                options.lang = defaults.defaultLang;
            }
            
            console.log('Language setting...'+options.lang);

            if (getCookie('i18n_lang') != "" && getCookie('i18n_lang') != "undefined" && getCookie('i18n_lang') != null) {
                //options.lang = getCookie('i18n_lang');
                defaults.defaultLang = getCookie('i18n_lang');
            } else if (options.lang == "" && defaults.defaultLang == "") {
                throw "defaultLang must not be null !";
            }

            options.lang = defaults.defaultLang;

            var span_lang = 'English';
            if(options.lang==='en'){
                span_lang = 'English';
            }

            if(options.lang==='cn'){
                span_lang = '简体中文';
            }

            if(options.lang==='hk'){
                span_lang = '繁体中文';
            }

            if(options.lang==='jp'){
                span_lang = '日本語';
            }

            if(options.lang==='ru'){
                span_lang = 'русский';
            }

            if(options.lang==='kr'){
                span_lang = '한국어';
            }

            if(options.lang==='my'){
                span_lang = 'Melayu';
            }
            $('#selected_lang').html(span_lang);
            

            var i = this;
            var v = Date.now();

            $.get(options.filePath + options.filePrefix + options.lang + options.fileSuffix + ".json?v=" + options.version,function (rsp) {
                var i18nLang = {};
                if (rsp != null) {
                    i18nLang = rsp;
                    language = rsp;
                }

                $(i).each(function (i) {
                    var i18nOnly = $(this).attr("i18n-only");
                    if ($(this).val() != null && $(this).val() != "") {
                        if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "value") {
                            $(this).val(i18nLang[$(this).attr("i18n")])
                        }
                    }
                    if ($(this).html() != null && $(this).html() != "") {
                        if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "html") {
                            $(this).html(i18nLang[$(this).attr("i18n")])
                        }
                    }
                    if ($(this).attr('placeholder') != null && $(this).attr('placeholder') != "") {
                        if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "placeholder") {
                            $(this).attr('placeholder', i18nLang[$(this).attr("i18n")])
                        }
                    }
                    if ($(this).attr('content') != null && $(this).attr('content') != "") {
                        if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "content") {
                            $(this).attr('content', i18nLang[$(this).attr("i18n")])
                        }
                    }
                });
                options.callback();
            },'json');
        }
    });
})(jQuery);