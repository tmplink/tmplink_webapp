/*!
* Tabler v1.0.0-alpha.22 (https://tabler.io)
* @version 1.0.0-alpha.22
* @link https://tabler.io
* Copyright 2018-2021 The Tabler Authors
* Copyright 2018-2021 codecalm.net Paweł Kuna
* Licensed under MIT (https://github.com/tabler/tabler/blob/master/LICENSE)
*/
!function(t) {
    "function" == typeof define && define.amd ? define(t) : t()
}(function() {
    "use strict";
    "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self && self;
    var t, e = (function(t, e) {
        !function(t, e) {
            var n, u, i = "function" == typeof Map ? new Map : (n = [],
            u = [],
            {
                has: function(t) {
                    return n.indexOf(t) > -1
                },
                get: function(t) {
                    return u[n.indexOf(t)]
                },
                set: function(t, e) {
                    -1 === n.indexOf(t) && (n.push(t),
                    u.push(e))
                },
                delete: function(t) {
                    var e = n.indexOf(t);
                    e > -1 && (n.splice(e, 1),
                    u.splice(e, 1))
                }
            }), r = function(t) {
                return new Event(t,{
                    bubbles: !0
                })
            };
            try {
                new Event("test")
            } catch (t) {
                r = function(t) {
                    var e = document.createEvent("Event");
                    return e.initEvent(t, !0, !1),
                    e
                }
            }
            function s(t) {
                if (t && t.nodeName && "TEXTAREA" === t.nodeName && !i.has(t)) {
                    var e = null
                      , n = null
                      , u = null
                      , s = function() {
                        t.clientWidth !== n && c()
                    }
                      , a = function(e) {
                        window.removeEventListener("resize", s, !1),
                        t.removeEventListener("input", c, !1),
                        t.removeEventListener("keyup", c, !1),
                        t.removeEventListener("autosize:destroy", a, !1),
                        t.removeEventListener("autosize:update", c, !1),
                        Object.keys(e).forEach(function(n) {
                            t.style[n] = e[n]
                        }),
                        i.delete(t)
                    }
                    .bind(t, {
                        height: t.style.height,
                        resize: t.style.resize,
                        overflowY: t.style.overflowY,
                        overflowX: t.style.overflowX,
                        wordWrap: t.style.wordWrap
                    });
                    t.addEventListener("autosize:destroy", a, !1),
                    "onpropertychange"in t && "oninput"in t && t.addEventListener("keyup", c, !1),
                    window.addEventListener("resize", s, !1),
                    t.addEventListener("input", c, !1),
                    t.addEventListener("autosize:update", c, !1),
                    t.style.overflowX = "hidden",
                    t.style.wordWrap = "break-word",
                    i.set(t, {
                        destroy: a,
                        update: c
                    }),
                    "vertical" === (o = window.getComputedStyle(t, null)).resize ? t.style.resize = "none" : "both" === o.resize && (t.style.resize = "horizontal"),
                    e = "content-box" === o.boxSizing ? -(parseFloat(o.paddingTop) + parseFloat(o.paddingBottom)) : parseFloat(o.borderTopWidth) + parseFloat(o.borderBottomWidth),
                    isNaN(e) && (e = 0),
                    c()
                }
                var o;
                function l(e) {
                    var n = t.style.width;
                    t.style.width = "0px",
                    t.offsetWidth,
                    t.style.width = n,
                    t.style.overflowY = e
                }
                function h() {
                    if (0 !== t.scrollHeight) {
                        var u = function(t) {
                            for (var e = []; t && t.parentNode && t.parentNode instanceof Element; )
                                t.parentNode.scrollTop && e.push({
                                    node: t.parentNode,
                                    scrollTop: t.parentNode.scrollTop
                                }),
                                t = t.parentNode;
                            return e
                        }(t)
                          , i = document.documentElement && document.documentElement.scrollTop;
                        t.style.height = "",
                        t.style.height = t.scrollHeight + e + "px",
                        n = t.clientWidth,
                        u.forEach(function(t) {
                            t.node.scrollTop = t.scrollTop
                        }),
                        i && (document.documentElement.scrollTop = i)
                    }
                }
                function c() {
                    h();
                    var e = Math.round(parseFloat(t.style.height))
                      , n = window.getComputedStyle(t, null)
                      , i = "content-box" === n.boxSizing ? Math.round(parseFloat(n.height)) : t.offsetHeight;
                    if (i < e ? "hidden" === n.overflowY && (l("scroll"),
                    h(),
                    i = "content-box" === n.boxSizing ? Math.round(parseFloat(window.getComputedStyle(t, null).height)) : t.offsetHeight) : "hidden" !== n.overflowY && (l("hidden"),
                    h(),
                    i = "content-box" === n.boxSizing ? Math.round(parseFloat(window.getComputedStyle(t, null).height)) : t.offsetHeight),
                    u !== i) {
                        u = i;
                        var s = r("autosize:resized");
                        try {
                            t.dispatchEvent(s)
                        } catch (t) {}
                    }
                }
            }
            function a(t) {
                var e = i.get(t);
                e && e.destroy()
            }
            function o(t) {
                var e = i.get(t);
                e && e.update()
            }
            var l = null;
            "undefined" == typeof window || "function" != typeof window.getComputedStyle ? ((l = function(t) {
                return t
            }
            ).destroy = function(t) {
                return t
            }
            ,
            l.update = function(t) {
                return t
            }
            ) : ((l = function(t, e) {
                return t && Array.prototype.forEach.call(t.length ? t : [t], function(t) {
                    return s(t)
                }),
                t
            }
            ).destroy = function(t) {
                return t && Array.prototype.forEach.call(t.length ? t : [t], a),
                t
            }
            ,
            l.update = function(t) {
                return t && Array.prototype.forEach.call(t.length ? t : [t], o),
                t
            }
            ),
            e.default = l,
            t.exports = e.default
        }(t, e)
    }(t = {
        exports: {}
    }, t.exports),
    t.exports), n = document.querySelectorAll('[data-bs-toggle="autosize"]');
    function u(t) {
        return (u = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t
        }
        : function(t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
        }
        )(t)
    }
    function i(t, e) {
        if (!(t instanceof e))
            throw new TypeError("Cannot call a class as a function")
    }
    function r(t, e) {
        for (var n = 0; n < e.length; n++) {
            var u = e[n];
            u.enumerable = u.enumerable || !1,
            u.configurable = !0,
            "value"in u && (u.writable = !0),
            Object.defineProperty(t, u.key, u)
        }
    }
    function s(t, e, n) {
        return e && r(t.prototype, e),
        n && r(t, n),
        t
    }
    function a(t, e) {
        if ("function" != typeof e && null !== e)
            throw new TypeError("Super expression must either be null or a function");
        t.prototype = Object.create(e && e.prototype, {
            constructor: {
                value: t,
                writable: !0,
                configurable: !0
            }
        }),
        e && l(t, e)
    }
    function o(t) {
        return (o = Object.setPrototypeOf ? Object.getPrototypeOf : function(t) {
            return t.__proto__ || Object.getPrototypeOf(t)
        }
        )(t)
    }
    function l(t, e) {
        return (l = Object.setPrototypeOf || function(t, e) {
            return t.__proto__ = e,
            t
        }
        )(t, e)
    }
    function h(t, e) {
        if (null == t)
            return {};
        var n, u, i = function(t, e) {
            if (null == t)
                return {};
            var n, u, i = {}, r = Object.keys(t);
            for (u = 0; u < r.length; u++)
                n = r[u],
                e.indexOf(n) >= 0 || (i[n] = t[n]);
            return i
        }(t, e);
        if (Object.getOwnPropertySymbols) {
            var r = Object.getOwnPropertySymbols(t);
            for (u = 0; u < r.length; u++)
                n = r[u],
                e.indexOf(n) >= 0 || Object.prototype.propertyIsEnumerable.call(t, n) && (i[n] = t[n])
        }
        return i
    }
    function c(t, e) {
        return !e || "object" != typeof e && "function" != typeof e ? function(t) {
            if (void 0 === t)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return t
        }(t) : e
    }
    function d(t, e) {
        for (; !Object.prototype.hasOwnProperty.call(t, e) && null !== (t = o(t)); )
            ;
        return t
    }
    function p(t, e, n) {
        return (p = "undefined" != typeof Reflect && Reflect.get ? Reflect.get : function(t, e, n) {
            var u = d(t, e);
            if (u) {
                var i = Object.getOwnPropertyDescriptor(u, e);
                return i.get ? i.get.call(n) : i.value
            }
        }
        )(t, e, n || t)
    }
    function f(t, e, n, u) {
        return (f = "undefined" != typeof Reflect && Reflect.set ? Reflect.set : function(t, e, n, u) {
            var i, r = d(t, e);
            if (r) {
                if ((i = Object.getOwnPropertyDescriptor(r, e)).set)
                    return i.set.call(u, n),
                    !0;
                if (!i.writable)
                    return !1
            }
            if (i = Object.getOwnPropertyDescriptor(u, e)) {
                if (!i.writable)
                    return !1;
                i.value = n,
                Object.defineProperty(u, e, i)
            } else
                !function(t, e, n) {
                    e in t ? Object.defineProperty(t, e, {
                        value: n,
                        enumerable: !0,
                        configurable: !0,
                        writable: !0
                    }) : t[e] = n
                }(u, e, n);
            return !0
        }
        )(t, e, n, u)
    }
    function v(t, e, n, u, i) {
        if (!f(t, e, n, u || t) && i)
            throw new Error("failed to set property");
        return n
    }
    function k(t, e) {
        return function(t) {
            if (Array.isArray(t))
                return t
        }(t) || function(t, e) {
            if (!(Symbol.iterator in Object(t) || "[object Arguments]" === Object.prototype.toString.call(t)))
                return;
            var n = []
              , u = !0
              , i = !1
              , r = void 0;
            try {
                for (var s, a = t[Symbol.iterator](); !(u = (s = a.next()).done) && (n.push(s.value),
                !e || n.length !== e); u = !0)
                    ;
            } catch (t) {
                i = !0,
                r = t
            } finally {
                try {
                    u || null == a.return || a.return()
                } finally {
                    if (i)
                        throw r
                }
            }
            return n
        }(t, e) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance")
        }()
    }
    function g(t) {
        return "string" == typeof t || t instanceof String
    }
    n.length && n.forEach(function(t) {
        e(t)
    });
    var m = {
        NONE: "NONE",
        LEFT: "LEFT",
        FORCE_LEFT: "FORCE_LEFT",
        RIGHT: "RIGHT",
        FORCE_RIGHT: "FORCE_RIGHT"
    };
    function y(t) {
        return t.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1")
    }
    var _ = function() {
        function t(e, n, u, r) {
            for (i(this, t),
            this.value = e,
            this.cursorPos = n,
            this.oldValue = u,
            this.oldSelection = r; this.value.slice(0, this.startChangePos) !== this.oldValue.slice(0, this.startChangePos); )
                --this.oldSelection.start
        }
        return s(t, [{
            key: "startChangePos",
            get: function() {
                return Math.min(this.cursorPos, this.oldSelection.start)
            }
        }, {
            key: "insertedCount",
            get: function() {
                return this.cursorPos - this.startChangePos
            }
        }, {
            key: "inserted",
            get: function() {
                return this.value.substr(this.startChangePos, this.insertedCount)
            }
        }, {
            key: "removedCount",
            get: function() {
                return Math.max(this.oldSelection.end - this.startChangePos || this.oldValue.length - this.value.length, 0)
            }
        }, {
            key: "removed",
            get: function() {
                return this.oldValue.substr(this.startChangePos, this.removedCount)
            }
        }, {
            key: "head",
            get: function() {
                return this.value.substring(0, this.startChangePos)
            }
        }, {
            key: "tail",
            get: function() {
                return this.value.substring(this.startChangePos + this.insertedCount)
            }
        }, {
            key: "removeDirection",
            get: function() {
                return !this.removedCount || this.insertedCount ? m.NONE : this.oldSelection.end === this.cursorPos || this.oldSelection.start === this.cursorPos ? m.RIGHT : m.LEFT
            }
        }]),
        t
    }()
      , A = function() {
        function t(e) {
            i(this, t),
            Object.assign(this, {
                inserted: "",
                rawInserted: "",
                skip: !1,
                tailShift: 0
            }, e)
        }
        return s(t, [{
            key: "aggregate",
            value: function(t) {
                return this.rawInserted += t.rawInserted,
                this.skip = this.skip || t.skip,
                this.inserted += t.inserted,
                this.tailShift += t.tailShift,
                this
            }
        }, {
            key: "offset",
            get: function() {
                return this.tailShift + this.inserted.length
            }
        }]),
        t
    }()
      , E = function() {
        function t() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : ""
              , n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0
              , u = arguments.length > 2 ? arguments[2] : void 0;
            i(this, t),
            this.value = e,
            this.from = n,
            this.stop = u
        }
        return s(t, [{
            key: "toString",
            value: function() {
                return this.value
            }
        }, {
            key: "extend",
            value: function(t) {
                this.value += String(t)
            }
        }, {
            key: "appendTo",
            value: function(t) {
                return t.append(this.toString(), {
                    tail: !0
                }).aggregate(t._appendPlaceholder())
            }
        }, {
            key: "shiftBefore",
            value: function(t) {
                if (this.from >= t || !this.value.length)
                    return "";
                var e = this.value[0];
                return this.value = this.value.slice(1),
                e
            }
        }, {
            key: "state",
            get: function() {
                return {
                    value: this.value,
                    from: this.from,
                    stop: this.stop
                }
            },
            set: function(t) {
                Object.assign(this, t)
            }
        }]),
        t
    }();
    function C(t) {
        var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
        return new C.InputMask(t,e)
    }
    var b = function() {
        function t(e) {
            i(this, t),
            this._value = "",
            this._update(Object.assign({}, t.DEFAULTS, {}, e)),
            this.isInitialized = !0
        }
        return s(t, [{
            key: "updateOptions",
            value: function(t) {
                Object.keys(t).length && this.withValueRefresh(this._update.bind(this, t))
            }
        }, {
            key: "_update",
            value: function(t) {
                Object.assign(this, t)
            }
        }, {
            key: "reset",
            value: function() {
                this._value = ""
            }
        }, {
            key: "resolve",
            value: function(t) {
                return this.reset(),
                this.append(t, {
                    input: !0
                }, ""),
                this.doCommit(),
                this.value
            }
        }, {
            key: "nearestInputPos",
            value: function(t, e) {
                return t
            }
        }, {
            key: "extractInput",
            value: function() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
                  , e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length;
                return this.value.slice(t, e)
            }
        }, {
            key: "extractTail",
            value: function() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
                  , e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length;
                return new E(this.extractInput(t, e),t)
            }
        }, {
            key: "appendTail",
            value: function(t) {
                return g(t) && (t = new E(String(t))),
                t.appendTo(this)
            }
        }, {
            key: "_appendCharRaw",
            value: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return (t = this.doPrepare(t, e)) ? (this._value += t,
                new A({
                    inserted: t,
                    rawInserted: t
                })) : new A
            }
        }, {
            key: "_appendChar",
            value: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
                  , n = arguments.length > 2 ? arguments[2] : void 0
                  , u = this.state
                  , i = this._appendCharRaw(t, e);
                if (i.inserted) {
                    var r, s = !1 !== this.doValidate(e);
                    if (s && null != n) {
                        var a = this.state;
                        this.overwrite && (r = n.state,
                        n.shiftBefore(this.value.length));
                        var o = this.appendTail(n);
                        (s = o.rawInserted === n.toString()) && o.inserted && (this.state = a)
                    }
                    s || (i = new A,
                    this.state = u,
                    n && r && (n.state = r))
                }
                return i
            }
        }, {
            key: "_appendPlaceholder",
            value: function() {
                return new A
            }
        }, {
            key: "append",
            value: function(t, e, n) {
                if (!g(t))
                    throw new Error("value should be string");
                var u = new A
                  , i = g(n) ? new E(String(n)) : n;
                e.tail && (e._beforeTailState = this.state);
                for (var r = 0; r < t.length; ++r)
                    u.aggregate(this._appendChar(t[r], e, i));
                return null != i && (u.tailShift += this.appendTail(i).tailShift),
                u
            }
        }, {
            key: "remove",
            value: function() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
                  , e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length;
                return this._value = this.value.slice(0, t) + this.value.slice(e),
                new A
            }
        }, {
            key: "withValueRefresh",
            value: function(t) {
                if (this._refreshing || !this.isInitialized)
                    return t();
                this._refreshing = !0;
                var e = this.rawInputValue
                  , n = this.value
                  , u = t();
                return this.rawInputValue = e,
                this.value !== n && 0 === n.indexOf(this.value) && this.append(n.slice(this.value.length), {}, ""),
                delete this._refreshing,
                u
            }
        }, {
            key: "runIsolated",
            value: function(t) {
                if (this._isolated || !this.isInitialized)
                    return t(this);
                this._isolated = !0;
                var e = this.state
                  , n = t(this);
                return this.state = e,
                delete this._isolated,
                n
            }
        }, {
            key: "doPrepare",
            value: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return this.prepare ? this.prepare(t, this, e) : t
            }
        }, {
            key: "doValidate",
            value: function(t) {
                return (!this.validate || this.validate(this.value, this, t)) && (!this.parent || this.parent.doValidate(t))
            }
        }, {
            key: "doCommit",
            value: function() {
                this.commit && this.commit(this.value, this)
            }
        }, {
            key: "doFormat",
            value: function(t) {
                return this.format ? this.format(t, this) : t
            }
        }, {
            key: "doParse",
            value: function(t) {
                return this.parse ? this.parse(t, this) : t
            }
        }, {
            key: "splice",
            value: function(t, e, n, u) {
                var i = t + e
                  , r = this.extractTail(i)
                  , s = this.nearestInputPos(t, u);
                return new A({
                    tailShift: s - t
                }).aggregate(this.remove(s)).aggregate(this.append(n, {
                    input: !0
                }, r))
            }
        }, {
            key: "state",
            get: function() {
                return {
                    _value: this.value
                }
            },
            set: function(t) {
                this._value = t._value
            }
        }, {
            key: "value",
            get: function() {
                return this._value
            },
            set: function(t) {
                this.resolve(t)
            }
        }, {
            key: "unmaskedValue",
            get: function() {
                return this.value
            },
            set: function(t) {
                this.reset(),
                this.append(t, {}, ""),
                this.doCommit()
            }
        }, {
            key: "typedValue",
            get: function() {
                return this.doParse(this.value)
            },
            set: function(t) {
                this.value = this.doFormat(t)
            }
        }, {
            key: "rawInputValue",
            get: function() {
                return this.extractInput(0, this.value.length, {
                    raw: !0
                })
            },
            set: function(t) {
                this.reset(),
                this.append(t, {
                    raw: !0
                }, ""),
                this.doCommit()
            }
        }, {
            key: "isComplete",
            get: function() {
                return !0
            }
        }]),
        t
    }();
    function F(t) {
        if (null == t)
            throw new Error("mask property should be defined");
        return t instanceof RegExp ? C.MaskedRegExp : g(t) ? C.MaskedPattern : t instanceof Date || t === Date ? C.MaskedDate : t instanceof Number || "number" == typeof t || t === Number ? C.MaskedNumber : Array.isArray(t) || t === Array ? C.MaskedDynamic : C.Masked && t.prototype instanceof C.Masked ? t : t instanceof Function ? C.MaskedFunction : t instanceof C.Masked ? t.constructor : (console.warn("Mask not found for mask", t),
        C.Masked)
    }
    function S(t) {
        if (C.Masked && t instanceof C.Masked)
            return t;
        var e = (t = Object.assign({}, t)).mask;
        if (C.Masked && e instanceof C.Masked)
            return e;
        var n = F(e);
        if (!n)
            throw new Error("Masked class is not found for provided mask, appropriate module needs to be import manually before creating mask.");
        return new n(t)
    }
    b.DEFAULTS = {
        format: function(t) {
            return t
        },
        parse: function(t) {
            return t
        }
    },
    C.Masked = b,
    C.createMask = S;
    var w = {
        0: /\d/,
        a: /[\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
        "*": /./
    }
      , D = function() {
        function t(e) {
            i(this, t);
            var n = e.mask
              , u = h(e, ["mask"]);
            this.masked = S({
                mask: n
            }),
            Object.assign(this, u)
        }
        return s(t, [{
            key: "reset",
            value: function() {
                this._isFilled = !1,
                this.masked.reset()
            }
        }, {
            key: "remove",
            value: function() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
                  , e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length;
                return 0 === t && e >= 1 ? (this._isFilled = !1,
                this.masked.remove(t, e)) : new A
            }
        }, {
            key: "_appendChar",
            value: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                if (this._isFilled)
                    return new A;
                var n = this.masked.state
                  , u = this.masked._appendChar(t, e);
                return u.inserted && !1 === this.doValidate(e) && (u.inserted = u.rawInserted = "",
                this.masked.state = n),
                u.inserted || this.isOptional || this.lazy || e.input || (u.inserted = this.placeholderChar),
                u.skip = !u.inserted && !this.isOptional,
                this._isFilled = Boolean(u.inserted),
                u
            }
        }, {
            key: "append",
            value: function() {
                var t;
                return (t = this.masked).append.apply(t, arguments)
            }
        }, {
            key: "_appendPlaceholder",
            value: function() {
                var t = new A;
                return this._isFilled || this.isOptional ? t : (this._isFilled = !0,
                t.inserted = this.placeholderChar,
                t)
            }
        }, {
            key: "extractTail",
            value: function() {
                var t;
                return (t = this.masked).extractTail.apply(t, arguments)
            }
        }, {
            key: "appendTail",
            value: function() {
                var t;
                return (t = this.masked).appendTail.apply(t, arguments)
            }
        }, {
            key: "extractInput",
            value: function() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
                  , e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length
                  , n = arguments.length > 2 ? arguments[2] : void 0;
                return this.masked.extractInput(t, e, n)
            }
        }, {
            key: "nearestInputPos",
            value: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : m.NONE
                  , n = this.value.length
                  , u = Math.min(Math.max(t, 0), n);
                switch (e) {
                case m.LEFT:
                case m.FORCE_LEFT:
                    return this.isComplete ? u : 0;
                case m.RIGHT:
                case m.FORCE_RIGHT:
                    return this.isComplete ? u : n;
                case m.NONE:
                default:
                    return u
                }
            }
        }, {
            key: "doValidate",
            value: function() {
                var t, e;
                return (t = this.masked).doValidate.apply(t, arguments) && (!this.parent || (e = this.parent).doValidate.apply(e, arguments))
            }
        }, {
            key: "doCommit",
            value: function() {
                this.masked.doCommit()
            }
        }, {
            key: "value",
            get: function() {
                return this.masked.value || (this._isFilled && !this.isOptional ? this.placeholderChar : "")
            }
        }, {
            key: "unmaskedValue",
            get: function() {
                return this.masked.unmaskedValue
            }
        }, {
            key: "isComplete",
            get: function() {
                return Boolean(this.masked.value) || this.isOptional
            }
        }, {
            key: "state",
            get: function() {
                return {
                    masked: this.masked.state,
                    _isFilled: this._isFilled
                }
            },
            set: function(t) {
                this.masked.state = t.masked,
                this._isFilled = t._isFilled
            }
        }]),
        t
    }()
      , B = function() {
        function t(e) {
            i(this, t),
            Object.assign(this, e),
            this._value = ""
        }
        return s(t, [{
            key: "reset",
            value: function() {
                this._isRawInput = !1,
                this._value = ""
            }
        }, {
            key: "remove",
            value: function() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
                  , e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this._value.length;
                return this._value = this._value.slice(0, t) + this._value.slice(e),
                this._value || (this._isRawInput = !1),
                new A
            }
        }, {
            key: "nearestInputPos",
            value: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : m.NONE
                  , n = this._value.length;
                switch (e) {
                case m.LEFT:
                case m.FORCE_LEFT:
                    return 0;
                case m.NONE:
                case m.RIGHT:
                case m.FORCE_RIGHT:
                default:
                    return n
                }
            }
        }, {
            key: "extractInput",
            value: function() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
                  , e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this._value.length;
                return (arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}).raw && this._isRawInput && this._value.slice(t, e) || ""
            }
        }, {
            key: "_appendChar",
            value: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
                  , n = new A;
                if (this._value)
                    return n;
                var u = this.char === t[0] && (this.isUnmasking || e.input || e.raw) && !e.tail;
                return u && (n.rawInserted = this.char),
                this._value = n.inserted = this.char,
                this._isRawInput = u && (e.raw || e.input),
                n
            }
        }, {
            key: "_appendPlaceholder",
            value: function() {
                var t = new A;
                return this._value ? t : (this._value = t.inserted = this.char,
                t)
            }
        }, {
            key: "extractTail",
            value: function() {
                return arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length,
                new E("")
            }
        }, {
            key: "appendTail",
            value: function(t) {
                return g(t) && (t = new E(String(t))),
                t.appendTo(this)
            }
        }, {
            key: "append",
            value: function(t, e, n) {
                var u = this._appendChar(t, e);
                return null != n && (u.tailShift += this.appendTail(n).tailShift),
                u
            }
        }, {
            key: "doCommit",
            value: function() {}
        }, {
            key: "value",
            get: function() {
                return this._value
            }
        }, {
            key: "unmaskedValue",
            get: function() {
                return this.isUnmasking ? this.value : ""
            }
        }, {
            key: "isComplete",
            get: function() {
                return !0
            }
        }, {
            key: "state",
            get: function() {
                return {
                    _value: this._value,
                    _isRawInput: this._isRawInput
                }
            },
            set: function(t) {
                Object.assign(this, t)
            }
        }]),
        t
    }()
      , x = function() {
        function t() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : []
              , n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
            i(this, t),
            this.chunks = e,
            this.from = n
        }
        return s(t, [{
            key: "toString",
            value: function() {
                return this.chunks.map(String).join("")
            }
        }, {
            key: "extend",
            value: function(e) {
                if (String(e)) {
                    g(e) && (e = new E(String(e)));
                    var n = this.chunks[this.chunks.length - 1]
                      , u = n && (n.stop === e.stop || null == e.stop) && e.from === n.from + n.toString().length;
                    if (e instanceof E)
                        u ? n.extend(e.toString()) : this.chunks.push(e);
                    else if (e instanceof t) {
                        if (null == e.stop)
                            for (var i; e.chunks.length && null == e.chunks[0].stop; )
                                (i = e.chunks.shift()).from += e.from,
                                this.extend(i);
                        e.toString() && (e.stop = e.blockIndex,
                        this.chunks.push(e))
                    }
                }
            }
        }, {
            key: "appendTo",
            value: function(e) {
                if (!(e instanceof C.MaskedPattern))
                    return new E(this.toString()).appendTo(e);
                for (var n = new A, u = 0; u < this.chunks.length && !n.skip; ++u) {
                    var i = this.chunks[u]
                      , r = e._mapPosToBlock(e.value.length)
                      , s = i.stop
                      , a = void 0;
                    if (null != s && (!r || r.index <= s) && ((i instanceof t || e._stops.indexOf(s) >= 0) && n.aggregate(e._appendPlaceholder(s)),
                    a = i instanceof t && e._blocks[s]),
                    a) {
                        var o = a.appendTail(i);
                        o.skip = !1,
                        n.aggregate(o),
                        e._value += o.inserted;
                        var l = i.toString().slice(o.rawInserted.length);
                        l && n.aggregate(e.append(l, {
                            tail: !0
                        }))
                    } else
                        n.aggregate(e.append(i.toString(), {
                            tail: !0
                        }))
                }
                return n
            }
        }, {
            key: "shiftBefore",
            value: function(t) {
                if (this.from >= t || !this.chunks.length)
                    return "";
                for (var e = t - this.from, n = 0; n < this.chunks.length; ) {
                    var u = this.chunks[n]
                      , i = u.shiftBefore(e);
                    if (u.toString()) {
                        if (!i)
                            break;
                        ++n
                    } else
                        this.chunks.splice(n, 1);
                    if (i)
                        return i
                }
                return ""
            }
        }, {
            key: "state",
            get: function() {
                return {
                    chunks: this.chunks.map(function(t) {
                        return t.state
                    }),
                    from: this.from,
                    stop: this.stop,
                    blockIndex: this.blockIndex
                }
            },
            set: function(e) {
                var n = e.chunks
                  , u = h(e, ["chunks"]);
                Object.assign(this, u),
                this.chunks = n.map(function(e) {
                    var n = "chunks"in e ? new t : new E;
                    return n.state = e,
                    n
                })
            }
        }]),
        t
    }()
      , T = function(t) {
        function e() {
            return i(this, e),
            c(this, o(e).apply(this, arguments))
        }
        return a(e, b),
        s(e, [{
            key: "_update",
            value: function(t) {
                t.mask && (t.validate = function(e) {
                    return e.search(t.mask) >= 0
                }
                ),
                p(o(e.prototype), "_update", this).call(this, t)
            }
        }]),
        e
    }();
    C.MaskedRegExp = T;
    var P = function(t) {
        function e() {
            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
            return i(this, e),
            t.definitions = Object.assign({}, w, t.definitions),
            c(this, o(e).call(this, Object.assign({}, e.DEFAULTS, {}, t)))
        }
        return a(e, b),
        s(e, [{
            key: "_update",
            value: function() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                t.definitions = Object.assign({}, this.definitions, t.definitions),
                p(o(e.prototype), "_update", this).call(this, t),
                this._rebuildMask()
            }
        }, {
            key: "_rebuildMask",
            value: function() {
                var t = this
                  , n = this.definitions;
                this._blocks = [],
                this._stops = [],
                this._maskedBlocks = {};
                var u = this.mask;
                if (u && n)
                    for (var i = !1, r = !1, s = 0; s < u.length; ++s) {
                        if (this.blocks)
                            if ("continue" === function() {
                                var e = u.slice(s)
                                  , n = Object.keys(t.blocks).filter(function(t) {
                                    return 0 === e.indexOf(t)
                                });
                                n.sort(function(t, e) {
                                    return e.length - t.length
                                });
                                var i = n[0];
                                if (i) {
                                    var r = S(Object.assign({
                                        parent: t,
                                        lazy: t.lazy,
                                        placeholderChar: t.placeholderChar,
                                        overwrite: t.overwrite
                                    }, t.blocks[i]));
                                    return r && (t._blocks.push(r),
                                    t._maskedBlocks[i] || (t._maskedBlocks[i] = []),
                                    t._maskedBlocks[i].push(t._blocks.length - 1)),
                                    s += i.length - 1,
                                    "continue"
                                }
                            }())
                                continue;
                        var a = u[s]
                          , o = a in n;
                        if (a !== e.STOP_CHAR)
                            if ("{" !== a && "}" !== a)
                                if ("[" !== a && "]" !== a) {
                                    if (a === e.ESCAPE_CHAR) {
                                        if (!(a = u[++s]))
                                            break;
                                        o = !1
                                    }
                                    var l = o ? new D({
                                        parent: this,
                                        lazy: this.lazy,
                                        placeholderChar: this.placeholderChar,
                                        mask: n[a],
                                        isOptional: r
                                    }) : new B({
                                        char: a,
                                        isUnmasking: i
                                    });
                                    this._blocks.push(l)
                                } else
                                    r = !r;
                            else
                                i = !i;
                        else
                            this._stops.push(this._blocks.length)
                    }
            }
        }, {
            key: "reset",
            value: function() {
                p(o(e.prototype), "reset", this).call(this),
                this._blocks.forEach(function(t) {
                    return t.reset()
                })
            }
        }, {
            key: "doCommit",
            value: function() {
                this._blocks.forEach(function(t) {
                    return t.doCommit()
                }),
                p(o(e.prototype), "doCommit", this).call(this)
            }
        }, {
            key: "appendTail",
            value: function(t) {
                return p(o(e.prototype), "appendTail", this).call(this, t).aggregate(this._appendPlaceholder())
            }
        }, {
            key: "_appendCharRaw",
            value: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                t = this.doPrepare(t, e);
                var n = this._mapPosToBlock(this.value.length)
                  , u = new A;
                if (!n)
                    return u;
                for (var i = n.index; ; ++i) {
                    var r = this._blocks[i];
                    if (!r)
                        break;
                    var s = r._appendChar(t, e)
                      , a = s.skip;
                    if (u.aggregate(s),
                    a || s.rawInserted)
                        break
                }
                return u
            }
        }, {
            key: "extractTail",
            value: function() {
                var t = this
                  , e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
                  , n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length
                  , u = new x;
                return e === n ? u : (this._forEachBlocksInRange(e, n, function(e, n, i, r) {
                    var s = e.extractTail(i, r);
                    s.stop = t._findStopBefore(n),
                    s.from = t._blockStartPos(n),
                    s instanceof x && (s.blockIndex = n),
                    u.extend(s)
                }),
                u)
            }
        }, {
            key: "extractInput",
            value: function() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
                  , e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length
                  , n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
                if (t === e)
                    return "";
                var u = "";
                return this._forEachBlocksInRange(t, e, function(t, e, i, r) {
                    u += t.extractInput(i, r, n)
                }),
                u
            }
        }, {
            key: "_findStopBefore",
            value: function(t) {
                for (var e, n = 0; n < this._stops.length; ++n) {
                    var u = this._stops[n];
                    if (!(u <= t))
                        break;
                    e = u
                }
                return e
            }
        }, {
            key: "_appendPlaceholder",
            value: function(t) {
                var e = this
                  , n = new A;
                if (this.lazy && null == t)
                    return n;
                var u = this._mapPosToBlock(this.value.length);
                if (!u)
                    return n;
                var i = u.index
                  , r = null != t ? t : this._blocks.length;
                return this._blocks.slice(i, r).forEach(function(u) {
                    if (!u.lazy || null != t) {
                        var i = null != u._blocks ? [u._blocks.length] : []
                          , r = u._appendPlaceholder.apply(u, i);
                        e._value += r.inserted,
                        n.aggregate(r)
                    }
                }),
                n
            }
        }, {
            key: "_mapPosToBlock",
            value: function(t) {
                for (var e = "", n = 0; n < this._blocks.length; ++n) {
                    var u = this._blocks[n]
                      , i = e.length;
                    if (t <= (e += u.value).length)
                        return {
                            index: n,
                            offset: t - i
                        }
                }
            }
        }, {
            key: "_blockStartPos",
            value: function(t) {
                return this._blocks.slice(0, t).reduce(function(t, e) {
                    return t + e.value.length
                }, 0)
            }
        }, {
            key: "_forEachBlocksInRange",
            value: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length
                  , n = arguments.length > 2 ? arguments[2] : void 0
                  , u = this._mapPosToBlock(t);
                if (u) {
                    var i = this._mapPosToBlock(e)
                      , r = i && u.index === i.index
                      , s = u.offset
                      , a = i && r ? i.offset : this._blocks[u.index].value.length;
                    if (n(this._blocks[u.index], u.index, s, a),
                    i && !r) {
                        for (var o = u.index + 1; o < i.index; ++o)
                            n(this._blocks[o], o, 0, this._blocks[o].value.length);
                        n(this._blocks[i.index], i.index, 0, i.offset)
                    }
                }
            }
        }, {
            key: "remove",
            value: function() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
                  , n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length
                  , u = p(o(e.prototype), "remove", this).call(this, t, n);
                return this._forEachBlocksInRange(t, n, function(t, e, n, i) {
                    u.aggregate(t.remove(n, i))
                }),
                u
            }
        }, {
            key: "nearestInputPos",
            value: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : m.NONE
                  , n = this._mapPosToBlock(t) || {
                    index: 0,
                    offset: 0
                }
                  , u = n.offset
                  , i = n.index
                  , r = this._blocks[i];
                if (!r)
                    return t;
                var s = u;
                0 !== s && s < r.value.length && (s = r.nearestInputPos(u, function(t) {
                    switch (t) {
                    case m.LEFT:
                        return m.FORCE_LEFT;
                    case m.RIGHT:
                        return m.FORCE_RIGHT;
                    default:
                        return t
                    }
                }(e)));
                var a = s === r.value.length;
                if (!(0 === s) && !a)
                    return this._blockStartPos(i) + s;
                var o = a ? i + 1 : i;
                if (e === m.NONE) {
                    if (o > 0) {
                        var l = o - 1
                          , h = this._blocks[l]
                          , c = h.nearestInputPos(0, m.NONE);
                        if (!h.value.length || c !== h.value.length)
                            return this._blockStartPos(o)
                    }
                    for (var d = o; d < this._blocks.length; ++d) {
                        var p = this._blocks[d]
                          , f = p.nearestInputPos(0, m.NONE);
                        if (!p.value.length || f !== p.value.length)
                            return this._blockStartPos(d) + f
                    }
                    for (var v = o - 1; v >= 0; --v) {
                        var k = this._blocks[v]
                          , g = k.nearestInputPos(0, m.NONE);
                        if (!k.value.length || g !== k.value.length)
                            return this._blockStartPos(v) + k.value.length
                    }
                    return t
                }
                if (e === m.LEFT || e === m.FORCE_LEFT) {
                    for (var y, _ = o; _ < this._blocks.length; ++_)
                        if (this._blocks[_].value) {
                            y = _;
                            break
                        }
                    if (null != y) {
                        var A = this._blocks[y]
                          , E = A.nearestInputPos(0, m.RIGHT);
                        if (0 === E && A.unmaskedValue.length)
                            return this._blockStartPos(y) + E
                    }
                    for (var C, b = -1, F = o - 1; F >= 0; --F) {
                        var S = this._blocks[F]
                          , w = S.nearestInputPos(S.value.length, m.FORCE_LEFT);
                        if (S.value && 0 === w || (C = F),
                        0 !== w) {
                            if (w !== S.value.length)
                                return this._blockStartPos(F) + w;
                            b = F;
                            break
                        }
                    }
                    if (e === m.LEFT)
                        for (var D = b + 1; D <= Math.min(o, this._blocks.length - 1); ++D) {
                            var B = this._blocks[D]
                              , x = B.nearestInputPos(0, m.NONE)
                              , T = this._blockStartPos(D) + x;
                            if (T > t)
                                break;
                            if (x !== B.value.length)
                                return T
                        }
                    if (b >= 0)
                        return this._blockStartPos(b) + this._blocks[b].value.length;
                    if (e === m.FORCE_LEFT || this.lazy && !this.extractInput() && !function(t) {
                        if (!t)
                            return !1;
                        var e = t.value;
                        return !e || t.nearestInputPos(0, m.NONE) !== e.length
                    }(this._blocks[o]))
                        return 0;
                    if (null != C)
                        return this._blockStartPos(C);
                    for (var P = o; P < this._blocks.length; ++P) {
                        var O = this._blocks[P]
                          , M = O.nearestInputPos(0, m.NONE);
                        if (!O.value.length || M !== O.value.length)
                            return this._blockStartPos(P) + M
                    }
                    return 0
                }
                if (e === m.RIGHT || e === m.FORCE_RIGHT) {
                    for (var I, R, V = o; V < this._blocks.length; ++V) {
                        var N = this._blocks[V]
                          , L = N.nearestInputPos(0, m.NONE);
                        if (L !== N.value.length) {
                            R = this._blockStartPos(V) + L,
                            I = V;
                            break
                        }
                    }
                    if (null != I && null != R) {
                        for (var j = I; j < this._blocks.length; ++j) {
                            var z = this._blocks[j]
                              , H = z.nearestInputPos(0, m.FORCE_RIGHT);
                            if (H !== z.value.length)
                                return this._blockStartPos(j) + H
                        }
                        return e === m.FORCE_RIGHT ? this.value.length : R
                    }
                    for (var U = Math.min(o, this._blocks.length - 1); U >= 0; --U) {
                        var G = this._blocks[U]
                          , Y = G.nearestInputPos(G.value.length, m.LEFT);
                        if (0 !== Y) {
                            var q = this._blockStartPos(U) + Y;
                            if (q >= t)
                                return q;
                            break
                        }
                    }
                }
                return t
            }
        }, {
            key: "maskedBlock",
            value: function(t) {
                return this.maskedBlocks(t)[0]
            }
        }, {
            key: "maskedBlocks",
            value: function(t) {
                var e = this
                  , n = this._maskedBlocks[t];
                return n ? n.map(function(t) {
                    return e._blocks[t]
                }) : []
            }
        }, {
            key: "state",
            get: function() {
                return Object.assign({}, p(o(e.prototype), "state", this), {
                    _blocks: this._blocks.map(function(t) {
                        return t.state
                    })
                })
            },
            set: function(t) {
                var n = t._blocks
                  , u = h(t, ["_blocks"]);
                this._blocks.forEach(function(t, e) {
                    return t.state = n[e]
                }),
                v(o(e.prototype), "state", u, this, !0)
            }
        }, {
            key: "isComplete",
            get: function() {
                return this._blocks.every(function(t) {
                    return t.isComplete
                })
            }
        }, {
            key: "unmaskedValue",
            get: function() {
                return this._blocks.reduce(function(t, e) {
                    return t + e.unmaskedValue
                }, "")
            },
            set: function(t) {
                v(o(e.prototype), "unmaskedValue", t, this, !0)
            }
        }, {
            key: "value",
            get: function() {
                return this._blocks.reduce(function(t, e) {
                    return t + e.value
                }, "")
            },
            set: function(t) {
                v(o(e.prototype), "value", t, this, !0)
            }
        }]),
        e
    }();
    P.DEFAULTS = {
        lazy: !0,
        placeholderChar: "_"
    },
    P.STOP_CHAR = "`",
    P.ESCAPE_CHAR = "\\",
    P.InputDefinition = D,
    P.FixedDefinition = B,
    C.MaskedPattern = P;
    var O = function(t) {
        function e() {
            return i(this, e),
            c(this, o(e).apply(this, arguments))
        }
        return a(e, P),
        s(e, [{
            key: "_update",
            value: function(t) {
                t = Object.assign({
                    to: this.to || 0,
                    from: this.from || 0
                }, t);
                var n = String(t.to).length;
                null != t.maxLength && (n = Math.max(n, t.maxLength)),
                t.maxLength = n;
                for (var u = String(t.from).padStart(n, "0"), i = String(t.to).padStart(n, "0"), r = 0; r < i.length && i[r] === u[r]; )
                    ++r;
                t.mask = i.slice(0, r).replace(/0/g, "\\0") + "0".repeat(n - r),
                p(o(e.prototype), "_update", this).call(this, t)
            }
        }, {
            key: "boundaries",
            value: function(t) {
                var e = ""
                  , n = ""
                  , u = k(t.match(/^(\D*)(\d*)(\D*)/) || [], 3)
                  , i = u[1]
                  , r = u[2];
                return r && (e = "0".repeat(i.length) + r,
                n = "9".repeat(i.length) + r),
                [e = e.padEnd(this.maxLength, "0"), n = n.padEnd(this.maxLength, "9")]
            }
        }, {
            key: "doPrepare",
            value: function(t) {
                var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                if (t = p(o(e.prototype), "doPrepare", this).call(this, t, n).replace(/\D/g, ""),
                !this.autofix)
                    return t;
                for (var u = String(this.from).padStart(this.maxLength, "0"), i = String(this.to).padStart(this.maxLength, "0"), r = this.value, s = "", a = 0; a < t.length; ++a) {
                    var l = r + s + t[a]
                      , h = k(this.boundaries(l), 2)
                      , c = h[0]
                      , d = h[1];
                    Number(d) < this.from ? s += u[l.length - 1] : Number(c) > this.to ? s += i[l.length - 1] : s += t[a]
                }
                return s
            }
        }, {
            key: "doValidate",
            value: function() {
                var t, n = this.value;
                if (-1 === n.search(/[^0]/) && n.length <= this._matchFrom)
                    return !0;
                for (var u = k(this.boundaries(n), 2), i = u[0], r = u[1], s = arguments.length, a = new Array(s), l = 0; l < s; l++)
                    a[l] = arguments[l];
                return this.from <= Number(r) && Number(i) <= this.to && (t = p(o(e.prototype), "doValidate", this)).call.apply(t, [this].concat(a))
            }
        }, {
            key: "_matchFrom",
            get: function() {
                return this.maxLength - String(this.from).length
            }
        }, {
            key: "isComplete",
            get: function() {
                return p(o(e.prototype), "isComplete", this) && Boolean(this.value)
            }
        }]),
        e
    }();
    C.MaskedRange = O;
    var M = function(t) {
        function e(t) {
            return i(this, e),
            c(this, o(e).call(this, Object.assign({}, e.DEFAULTS, {}, t)))
        }
        return a(e, P),
        s(e, [{
            key: "_update",
            value: function(t) {
                t.mask === Date && delete t.mask,
                t.pattern && (t.mask = t.pattern);
                var n = t.blocks;
                t.blocks = Object.assign({}, e.GET_DEFAULT_BLOCKS()),
                t.min && (t.blocks.Y.from = t.min.getFullYear()),
                t.max && (t.blocks.Y.to = t.max.getFullYear()),
                t.min && t.max && t.blocks.Y.from === t.blocks.Y.to && (t.blocks.m.from = t.min.getMonth() + 1,
                t.blocks.m.to = t.max.getMonth() + 1,
                t.blocks.m.from === t.blocks.m.to && (t.blocks.d.from = t.min.getDate(),
                t.blocks.d.to = t.max.getDate())),
                Object.assign(t.blocks, n),
                Object.keys(t.blocks).forEach(function(e) {
                    var n = t.blocks[e];
                    "autofix"in n || (n.autofix = t.autofix)
                }),
                p(o(e.prototype), "_update", this).call(this, t)
            }
        }, {
            key: "doValidate",
            value: function() {
                for (var t, n = this.date, u = arguments.length, i = new Array(u), r = 0; r < u; r++)
                    i[r] = arguments[r];
                return (t = p(o(e.prototype), "doValidate", this)).call.apply(t, [this].concat(i)) && (!this.isComplete || this.isDateExist(this.value) && null != n && (null == this.min || this.min <= n) && (null == this.max || n <= this.max))
            }
        }, {
            key: "isDateExist",
            value: function(t) {
                return this.format(this.parse(t, this), this).indexOf(t) >= 0
            }
        }, {
            key: "date",
            get: function() {
                return this.typedValue
            },
            set: function(t) {
                this.typedValue = t
            }
        }, {
            key: "typedValue",
            get: function() {
                return this.isComplete ? p(o(e.prototype), "typedValue", this) : null
            },
            set: function(t) {
                v(o(e.prototype), "typedValue", t, this, !0)
            }
        }]),
        e
    }();
    M.DEFAULTS = {
        pattern: "d{.}`m{.}`Y",
        format: function(t) {
            return [String(t.getDate()).padStart(2, "0"), String(t.getMonth() + 1).padStart(2, "0"), t.getFullYear()].join(".")
        },
        parse: function(t) {
            var e = k(t.split("."), 3)
              , n = e[0]
              , u = e[1]
              , i = e[2];
            return new Date(i,u - 1,n)
        }
    },
    M.GET_DEFAULT_BLOCKS = function() {
        return {
            d: {
                mask: O,
                from: 1,
                to: 31,
                maxLength: 2
            },
            m: {
                mask: O,
                from: 1,
                to: 12,
                maxLength: 2
            },
            Y: {
                mask: O,
                from: 1900,
                to: 9999
            }
        }
    }
    ,
    C.MaskedDate = M;
    var I = function() {
        function t() {
            i(this, t)
        }
        return s(t, [{
            key: "select",
            value: function(t, e) {
                if (null != t && null != e && (t !== this.selectionStart || e !== this.selectionEnd))
                    try {
                        this._unsafeSelect(t, e)
                    } catch (t) {}
            }
        }, {
            key: "_unsafeSelect",
            value: function(t, e) {}
        }, {
            key: "bindEvents",
            value: function(t) {}
        }, {
            key: "unbindEvents",
            value: function() {}
        }, {
            key: "selectionStart",
            get: function() {
                var t;
                try {
                    t = this._unsafeSelectionStart
                } catch (t) {}
                return null != t ? t : this.value.length
            }
        }, {
            key: "selectionEnd",
            get: function() {
                var t;
                try {
                    t = this._unsafeSelectionEnd
                } catch (t) {}
                return null != t ? t : this.value.length
            }
        }, {
            key: "isActive",
            get: function() {
                return !1
            }
        }]),
        t
    }();
    C.MaskElement = I;
    var R = function(t) {
        function e(t) {
            var n;
            return i(this, e),
            (n = c(this, o(e).call(this))).input = t,
            n._handlers = {},
            n
        }
        return a(e, I),
        s(e, [{
            key: "_unsafeSelect",
            value: function(t, e) {
                this.input.setSelectionRange(t, e)
            }
        }, {
            key: "bindEvents",
            value: function(t) {
                var n = this;
                Object.keys(t).forEach(function(u) {
                    return n._toggleEventHandler(e.EVENTS_MAP[u], t[u])
                })
            }
        }, {
            key: "unbindEvents",
            value: function() {
                var t = this;
                Object.keys(this._handlers).forEach(function(e) {
                    return t._toggleEventHandler(e)
                })
            }
        }, {
            key: "_toggleEventHandler",
            value: function(t, e) {
                this._handlers[t] && (this.input.removeEventListener(t, this._handlers[t]),
                delete this._handlers[t]),
                e && (this.input.addEventListener(t, e),
                this._handlers[t] = e)
            }
        }, {
            key: "rootElement",
            get: function() {
                return this.input.getRootNode ? this.input.getRootNode() : document
            }
        }, {
            key: "isActive",
            get: function() {
                return this.input === this.rootElement.activeElement
            }
        }, {
            key: "_unsafeSelectionStart",
            get: function() {
                return this.input.selectionStart
            }
        }, {
            key: "_unsafeSelectionEnd",
            get: function() {
                return this.input.selectionEnd
            }
        }, {
            key: "value",
            get: function() {
                return this.input.value
            },
            set: function(t) {
                this.input.value = t
            }
        }]),
        e
    }();
    R.EVENTS_MAP = {
        selectionChange: "keydown",
        input: "input",
        drop: "drop",
        click: "click",
        focus: "focus",
        commit: "blur"
    },
    C.HTMLMaskElement = R;
    var V = function(t) {
        function e() {
            return i(this, e),
            c(this, o(e).apply(this, arguments))
        }
        return a(e, R),
        s(e, [{
            key: "_unsafeSelect",
            value: function(t, e) {
                if (this.rootElement.createRange) {
                    var n = this.rootElement.createRange();
                    n.setStart(this.input.firstChild || this.input, t),
                    n.setEnd(this.input.lastChild || this.input, e);
                    var u = this.rootElement
                      , i = u.getSelection && u.getSelection();
                    i && (i.removeAllRanges(),
                    i.addRange(n))
                }
            }
        }, {
            key: "_unsafeSelectionStart",
            get: function() {
                var t = this.rootElement
                  , e = t.getSelection && t.getSelection();
                return e && e.anchorOffset
            }
        }, {
            key: "_unsafeSelectionEnd",
            get: function() {
                var t = this.rootElement
                  , e = t.getSelection && t.getSelection();
                return e && this._unsafeSelectionStart + String(e).length
            }
        }, {
            key: "value",
            get: function() {
                return this.input.textContent
            },
            set: function(t) {
                this.input.textContent = t
            }
        }]),
        e
    }();
    C.HTMLContenteditableMaskElement = V;
    var N = function() {
        function t(e, n) {
            i(this, t),
            this.el = e instanceof I ? e : e.isContentEditable && "INPUT" !== e.tagName && "TEXTAREA" !== e.tagName ? new V(e) : new R(e),
            this.masked = S(n),
            this._listeners = {},
            this._value = "",
            this._unmaskedValue = "",
            this._saveSelection = this._saveSelection.bind(this),
            this._onInput = this._onInput.bind(this),
            this._onChange = this._onChange.bind(this),
            this._onDrop = this._onDrop.bind(this),
            this._onFocus = this._onFocus.bind(this),
            this._onClick = this._onClick.bind(this),
            this.alignCursor = this.alignCursor.bind(this),
            this.alignCursorFriendly = this.alignCursorFriendly.bind(this),
            this._bindEvents(),
            this.updateValue(),
            this._onChange()
        }
        return s(t, [{
            key: "maskEquals",
            value: function(t) {
                return null == t || t === this.masked.mask || t === Date && this.masked instanceof M
            }
        }, {
            key: "_bindEvents",
            value: function() {
                this.el.bindEvents({
                    selectionChange: this._saveSelection,
                    input: this._onInput,
                    drop: this._onDrop,
                    click: this._onClick,
                    focus: this._onFocus,
                    commit: this._onChange
                })
            }
        }, {
            key: "_unbindEvents",
            value: function() {
                this.el && this.el.unbindEvents()
            }
        }, {
            key: "_fireEvent",
            value: function(t) {
                for (var e = arguments.length, n = new Array(e > 1 ? e - 1 : 0), u = 1; u < e; u++)
                    n[u - 1] = arguments[u];
                var i = this._listeners[t];
                i && i.forEach(function(t) {
                    return t.apply(void 0, n)
                })
            }
        }, {
            key: "_saveSelection",
            value: function() {
                this.value !== this.el.value && console.warn("Element value was changed outside of mask. Syncronize mask using `mask.updateValue()` to work properly."),
                this._selection = {
                    start: this.selectionStart,
                    end: this.cursorPos
                }
            }
        }, {
            key: "updateValue",
            value: function() {
                this.masked.value = this.el.value,
                this._value = this.masked.value
            }
        }, {
            key: "updateControl",
            value: function() {
                var t = this.masked.unmaskedValue
                  , e = this.masked.value
                  , n = this.unmaskedValue !== t || this.value !== e;
                this._unmaskedValue = t,
                this._value = e,
                this.el.value !== e && (this.el.value = e),
                n && this._fireChangeEvents()
            }
        }, {
            key: "updateOptions",
            value: function(t) {
                var e = t.mask
                  , n = h(t, ["mask"])
                  , i = !this.maskEquals(e)
                  , r = !function t(e, n) {
                    if (n === e)
                        return !0;
                    var i, r = Array.isArray(n), s = Array.isArray(e);
                    if (r && s) {
                        if (n.length != e.length)
                            return !1;
                        for (i = 0; i < n.length; i++)
                            if (!t(n[i], e[i]))
                                return !1;
                        return !0
                    }
                    if (r != s)
                        return !1;
                    if (n && e && "object" === u(n) && "object" === u(e)) {
                        var a = n instanceof Date
                          , o = e instanceof Date;
                        if (a && o)
                            return n.getTime() == e.getTime();
                        if (a != o)
                            return !1;
                        var l = n instanceof RegExp
                          , h = e instanceof RegExp;
                        if (l && h)
                            return n.toString() == e.toString();
                        if (l != h)
                            return !1;
                        var c = Object.keys(n);
                        for (i = 0; i < c.length; i++)
                            if (!Object.prototype.hasOwnProperty.call(e, c[i]))
                                return !1;
                        for (i = 0; i < c.length; i++)
                            if (!t(e[c[i]], n[c[i]]))
                                return !1;
                        return !0
                    }
                    return !(!n || !e || "function" != typeof n || "function" != typeof e) && n.toString() === e.toString()
                }(this.masked, n);
                i && (this.mask = e),
                r && this.masked.updateOptions(n),
                (i || r) && this.updateControl()
            }
        }, {
            key: "updateCursor",
            value: function(t) {
                null != t && (this.cursorPos = t,
                this._delayUpdateCursor(t))
            }
        }, {
            key: "_delayUpdateCursor",
            value: function(t) {
                var e = this;
                this._abortUpdateCursor(),
                this._changingCursorPos = t,
                this._cursorChanging = setTimeout(function() {
                    e.el && (e.cursorPos = e._changingCursorPos,
                    e._abortUpdateCursor())
                }, 10)
            }
        }, {
            key: "_fireChangeEvents",
            value: function() {
                this._fireEvent("accept", this._inputEvent),
                this.masked.isComplete && this._fireEvent("complete", this._inputEvent)
            }
        }, {
            key: "_abortUpdateCursor",
            value: function() {
                this._cursorChanging && (clearTimeout(this._cursorChanging),
                delete this._cursorChanging)
            }
        }, {
            key: "alignCursor",
            value: function() {
                this.cursorPos = this.masked.nearestInputPos(this.cursorPos, m.LEFT)
            }
        }, {
            key: "alignCursorFriendly",
            value: function() {
                this.selectionStart === this.cursorPos && this.alignCursor()
            }
        }, {
            key: "on",
            value: function(t, e) {
                return this._listeners[t] || (this._listeners[t] = []),
                this._listeners[t].push(e),
                this
            }
        }, {
            key: "off",
            value: function(t, e) {
                if (!this._listeners[t])
                    return this;
                if (!e)
                    return delete this._listeners[t],
                    this;
                var n = this._listeners[t].indexOf(e);
                return n >= 0 && this._listeners[t].splice(n, 1),
                this
            }
        }, {
            key: "_onInput",
            value: function(t) {
                if (this._inputEvent = t,
                this._abortUpdateCursor(),
                !this._selection)
                    return this.updateValue();
                var e = new _(this.el.value,this.cursorPos,this.value,this._selection)
                  , n = this.masked.rawInputValue
                  , u = this.masked.splice(e.startChangePos, e.removed.length, e.inserted, e.removeDirection).offset
                  , i = n === this.masked.rawInputValue ? e.removeDirection : m.NONE
                  , r = this.masked.nearestInputPos(e.startChangePos + u, i);
                this.updateControl(),
                this.updateCursor(r),
                delete this._inputEvent
            }
        }, {
            key: "_onChange",
            value: function() {
                this.value !== this.el.value && this.updateValue(),
                this.masked.doCommit(),
                this.updateControl(),
                this._saveSelection()
            }
        }, {
            key: "_onDrop",
            value: function(t) {
                t.preventDefault(),
                t.stopPropagation()
            }
        }, {
            key: "_onFocus",
            value: function(t) {
                this.alignCursorFriendly()
            }
        }, {
            key: "_onClick",
            value: function(t) {
                this.alignCursorFriendly()
            }
        }, {
            key: "destroy",
            value: function() {
                this._unbindEvents(),
                this._listeners.length = 0,
                delete this.el
            }
        }, {
            key: "mask",
            get: function() {
                return this.masked.mask
            },
            set: function(t) {
                if (!this.maskEquals(t))
                    if (t instanceof C.Masked || this.masked.constructor !== F(t)) {
                        var e = S({
                            mask: t
                        });
                        e.unmaskedValue = this.masked.unmaskedValue,
                        this.masked = e
                    } else
                        this.masked.updateOptions({
                            mask: t
                        })
            }
        }, {
            key: "value",
            get: function() {
                return this._value
            },
            set: function(t) {
                this.masked.value = t,
                this.updateControl(),
                this.alignCursor()
            }
        }, {
            key: "unmaskedValue",
            get: function() {
                return this._unmaskedValue
            },
            set: function(t) {
                this.masked.unmaskedValue = t,
                this.updateControl(),
                this.alignCursor()
            }
        }, {
            key: "typedValue",
            get: function() {
                return this.masked.typedValue
            },
            set: function(t) {
                this.masked.typedValue = t,
                this.updateControl(),
                this.alignCursor()
            }
        }, {
            key: "selectionStart",
            get: function() {
                return this._cursorChanging ? this._changingCursorPos : this.el.selectionStart
            }
        }, {
            key: "cursorPos",
            get: function() {
                return this._cursorChanging ? this._changingCursorPos : this.el.selectionEnd
            },
            set: function(t) {
                this.el && this.el.isActive && (this.el.select(t, t),
                this._saveSelection())
            }
        }]),
        t
    }();
    C.InputMask = N;
    var L = function(t) {
        function e() {
            return i(this, e),
            c(this, o(e).apply(this, arguments))
        }
        return a(e, P),
        s(e, [{
            key: "_update",
            value: function(t) {
                t.enum && (t.mask = "*".repeat(t.enum[0].length)),
                p(o(e.prototype), "_update", this).call(this, t)
            }
        }, {
            key: "doValidate",
            value: function() {
                for (var t, n = this, u = arguments.length, i = new Array(u), r = 0; r < u; r++)
                    i[r] = arguments[r];
                return this.enum.some(function(t) {
                    return t.indexOf(n.unmaskedValue) >= 0
                }) && (t = p(o(e.prototype), "doValidate", this)).call.apply(t, [this].concat(i))
            }
        }]),
        e
    }();
    C.MaskedEnum = L;
    var j = function(t) {
        function e(t) {
            return i(this, e),
            c(this, o(e).call(this, Object.assign({}, e.DEFAULTS, {}, t)))
        }
        return a(e, b),
        s(e, [{
            key: "_update",
            value: function(t) {
                p(o(e.prototype), "_update", this).call(this, t),
                this._updateRegExps()
            }
        }, {
            key: "_updateRegExps",
            value: function() {
                var t = "^" + (this.allowNegative ? "[+|\\-]?" : "")
                  , e = (this.scale ? "(" + y(this.radix) + "\\d{0," + this.scale + "})?" : "") + "$";
                this._numberRegExpInput = new RegExp(t + "(0|([1-9]+\\d*))?" + e),
                this._numberRegExp = new RegExp(t + "\\d*" + e),
                this._mapToRadixRegExp = new RegExp("[" + this.mapToRadix.map(y).join("") + "]","g"),
                this._thousandsSeparatorRegExp = new RegExp(y(this.thousandsSeparator),"g")
            }
        }, {
            key: "_removeThousandsSeparators",
            value: function(t) {
                return t.replace(this._thousandsSeparatorRegExp, "")
            }
        }, {
            key: "_insertThousandsSeparators",
            value: function(t) {
                var e = t.split(this.radix);
                return e[0] = e[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator),
                e.join(this.radix)
            }
        }, {
            key: "doPrepare",
            value: function(t) {
                for (var n, u = arguments.length, i = new Array(u > 1 ? u - 1 : 0), r = 1; r < u; r++)
                    i[r - 1] = arguments[r];
                return (n = p(o(e.prototype), "doPrepare", this)).call.apply(n, [this, this._removeThousandsSeparators(t.replace(this._mapToRadixRegExp, this.radix))].concat(i))
            }
        }, {
            key: "_separatorsCount",
            value: function(t) {
                for (var e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1], n = 0, u = 0; u < t; ++u)
                    this._value.indexOf(this.thousandsSeparator, u) === u && (++n,
                    e && (t += this.thousandsSeparator.length));
                return n
            }
        }, {
            key: "_separatorsCountFromSlice",
            value: function() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this._value;
                return this._separatorsCount(this._removeThousandsSeparators(t).length, !0)
            }
        }, {
            key: "extractInput",
            value: function() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
                  , n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length
                  , u = arguments.length > 2 ? arguments[2] : void 0
                  , i = k(this._adjustRangeWithSeparators(t, n), 2);
                return t = i[0],
                n = i[1],
                this._removeThousandsSeparators(p(o(e.prototype), "extractInput", this).call(this, t, n, u))
            }
        }, {
            key: "_appendCharRaw",
            value: function(t) {
                var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                if (!this.thousandsSeparator)
                    return p(o(e.prototype), "_appendCharRaw", this).call(this, t, n);
                var u = n.tail && n._beforeTailState ? n._beforeTailState._value : this._value
                  , i = this._separatorsCountFromSlice(u);
                this._value = this._removeThousandsSeparators(this.value);
                var r = p(o(e.prototype), "_appendCharRaw", this).call(this, t, n);
                this._value = this._insertThousandsSeparators(this._value);
                var s = n.tail && n._beforeTailState ? n._beforeTailState._value : this._value
                  , a = this._separatorsCountFromSlice(s);
                return r.tailShift += (a - i) * this.thousandsSeparator.length,
                r.skip = !r.rawInserted && t === this.thousandsSeparator,
                r
            }
        }, {
            key: "_findSeparatorAround",
            value: function(t) {
                if (this.thousandsSeparator) {
                    var e = t - this.thousandsSeparator.length + 1
                      , n = this.value.indexOf(this.thousandsSeparator, e);
                    if (n <= t)
                        return n
                }
                return -1
            }
        }, {
            key: "_adjustRangeWithSeparators",
            value: function(t, e) {
                var n = this._findSeparatorAround(t);
                n >= 0 && (t = n);
                var u = this._findSeparatorAround(e);
                return u >= 0 && (e = u + this.thousandsSeparator.length),
                [t, e]
            }
        }, {
            key: "remove",
            value: function() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0
                  , e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.value.length
                  , n = k(this._adjustRangeWithSeparators(t, e), 2);
                t = n[0],
                e = n[1];
                var u = this.value.slice(0, t)
                  , i = this.value.slice(e)
                  , r = this._separatorsCount(u.length);
                this._value = this._insertThousandsSeparators(this._removeThousandsSeparators(u + i));
                var s = this._separatorsCountFromSlice(u);
                return new A({
                    tailShift: (s - r) * this.thousandsSeparator.length
                })
            }
        }, {
            key: "nearestInputPos",
            value: function(t, e) {
                if (!this.thousandsSeparator)
                    return t;
                switch (e) {
                case m.NONE:
                case m.LEFT:
                case m.FORCE_LEFT:
                    var n = this._findSeparatorAround(t - 1);
                    if (n >= 0) {
                        var u = n + this.thousandsSeparator.length;
                        if (t < u || this.value.length <= u || e === m.FORCE_LEFT)
                            return n
                    }
                    break;
                case m.RIGHT:
                case m.FORCE_RIGHT:
                    var i = this._findSeparatorAround(t);
                    if (i >= 0)
                        return i + this.thousandsSeparator.length
                }
                return t
            }
        }, {
            key: "doValidate",
            value: function(t) {
                var n = (t.input ? this._numberRegExpInput : this._numberRegExp).test(this._removeThousandsSeparators(this.value));
                if (n) {
                    var u = this.number;
                    n = n && !isNaN(u) && (null == this.min || this.min >= 0 || this.min <= this.number) && (null == this.max || this.max <= 0 || this.number <= this.max)
                }
                return n && p(o(e.prototype), "doValidate", this).call(this, t)
            }
        }, {
            key: "doCommit",
            value: function() {
                if (this.value) {
                    var t = this.number
                      , n = t;
                    null != this.min && (n = Math.max(n, this.min)),
                    null != this.max && (n = Math.min(n, this.max)),
                    n !== t && (this.unmaskedValue = String(n));
                    var u = this.value;
                    this.normalizeZeros && (u = this._normalizeZeros(u)),
                    this.padFractionalZeros && (u = this._padFractionalZeros(u)),
                    this._value = u
                }
                p(o(e.prototype), "doCommit", this).call(this)
            }
        }, {
            key: "_normalizeZeros",
            value: function(t) {
                var e = this._removeThousandsSeparators(t).split(this.radix);
                return e[0] = e[0].replace(/^(\D*)(0*)(\d*)/, function(t, e, n, u) {
                    return e + u
                }),
                t.length && !/\d$/.test(e[0]) && (e[0] = e[0] + "0"),
                e.length > 1 && (e[1] = e[1].replace(/0*$/, ""),
                e[1].length || (e.length = 1)),
                this._insertThousandsSeparators(e.join(this.radix))
            }
        }, {
            key: "_padFractionalZeros",
            value: function(t) {
                if (!t)
                    return t;
                var e = t.split(this.radix);
                return e.length < 2 && e.push(""),
                e[1] = e[1].padEnd(this.scale, "0"),
                e.join(this.radix)
            }
        }, {
            key: "unmaskedValue",
            get: function() {
                return this._removeThousandsSeparators(this._normalizeZeros(this.value)).replace(this.radix, ".")
            },
            set: function(t) {
                v(o(e.prototype), "unmaskedValue", t.replace(".", this.radix), this, !0)
            }
        }, {
            key: "typedValue",
            get: function() {
                return Number(this.unmaskedValue)
            },
            set: function(t) {
                v(o(e.prototype), "unmaskedValue", String(t), this, !0)
            }
        }, {
            key: "number",
            get: function() {
                return this.typedValue
            },
            set: function(t) {
                this.typedValue = t
            }
        }, {
            key: "allowNegative",
            get: function() {
                return this.signed || null != this.min && this.min < 0 || null != this.max && this.max < 0
            }
        }]),
        e
    }();
    j.DEFAULTS = {
        radix: ",",
        thousandsSeparator: "",
        mapToRadix: ["."],
        scale: 2,
        signed: !1,
        normalizeZeros: !0,
        padFractionalZeros: !1
    },
    C.MaskedNumber = j;
    var z = function(t) {
        function e() {
            return i(this, e),
            c(this, o(e).apply(this, arguments))
        }
        return a(e, b),
        s(e, [{
            key: "_update",
            value: function(t) {
                t.mask && (t.validate = t.mask),
                p(o(e.prototype), "_update", this).call(this, t)
            }
        }]),
        e
    }();
    C.MaskedFunction = z;
    var H = function(t) {
        function e(t) {
            var n;
            return i(this, e),
            (n = c(this, o(e).call(this, Object.assign({}, e.DEFAULTS, {}, t)))).currentMask = null,
            n
        }
        return a(e, b),
        s(e, [{
            key: "_update",
            value: function(t) {
                p(o(e.prototype), "_update", this).call(this, t),
                "mask"in t && (this.compiledMasks = Array.isArray(t.mask) ? t.mask.map(function(t) {
                    return S(t)
                }) : [])
            }
        }, {
            key: "_appendCharRaw",
            value: function() {
                var t, e = this._applyDispatch.apply(this, arguments);
                this.currentMask && e.aggregate((t = this.currentMask)._appendChar.apply(t, arguments));
                return e
            }
        }, {
            key: "_applyDispatch",
            value: function() {
                var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : ""
                  , e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
                  , n = e.tail && null != e._beforeTailState ? e._beforeTailState._value : this.value
                  , u = this.rawInputValue
                  , i = e.tail && null != e._beforeTailState ? e._beforeTailState._rawInputValue : u
                  , r = u.slice(i.length)
                  , s = this.currentMask
                  , a = new A
                  , o = s && s.state;
                if (this.currentMask = this.doDispatch(t, Object.assign({}, e)),
                this.currentMask)
                    if (this.currentMask !== s) {
                        this.currentMask.reset();
                        var l = this.currentMask.append(i, {
                            raw: !0
                        });
                        a.tailShift = l.inserted.length - n.length,
                        r && (a.tailShift += this.currentMask.append(r, {
                            raw: !0,
                            tail: !0
                        }).tailShift)
                    } else
                        this.currentMask.state = o;
                return a
            }
        }, {
            key: "_appendPlaceholder",
            value: function() {
                var t = this._applyDispatch.apply(this, arguments);
                return this.currentMask && t.aggregate(this.currentMask._appendPlaceholder()),
                t
            }
        }, {
            key: "doDispatch",
            value: function(t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                return this.dispatch(t, this, e)
            }
        }, {
            key: "doValidate",
            value: function() {
                for (var t, n, u = arguments.length, i = new Array(u), r = 0; r < u; r++)
                    i[r] = arguments[r];
                return (t = p(o(e.prototype), "doValidate", this)).call.apply(t, [this].concat(i)) && (!this.currentMask || (n = this.currentMask).doValidate.apply(n, i))
            }
        }, {
            key: "reset",
            value: function() {
                this.currentMask && this.currentMask.reset(),
                this.compiledMasks.forEach(function(t) {
                    return t.reset()
                })
            }
        }, {
            key: "remove",
            value: function() {
                var t, e = new A;
                this.currentMask && e.aggregate((t = this.currentMask).remove.apply(t, arguments)).aggregate(this._applyDispatch());
                return e
            }
        }, {
            key: "extractInput",
            value: function() {
                var t;
                return this.currentMask ? (t = this.currentMask).extractInput.apply(t, arguments) : ""
            }
        }, {
            key: "extractTail",
            value: function() {
                for (var t, n, u = arguments.length, i = new Array(u), r = 0; r < u; r++)
                    i[r] = arguments[r];
                return this.currentMask ? (t = this.currentMask).extractTail.apply(t, i) : (n = p(o(e.prototype), "extractTail", this)).call.apply(n, [this].concat(i))
            }
        }, {
            key: "doCommit",
            value: function() {
                this.currentMask && this.currentMask.doCommit(),
                p(o(e.prototype), "doCommit", this).call(this)
            }
        }, {
            key: "nearestInputPos",
            value: function() {
                for (var t, n, u = arguments.length, i = new Array(u), r = 0; r < u; r++)
                    i[r] = arguments[r];
                return this.currentMask ? (t = this.currentMask).nearestInputPos.apply(t, i) : (n = p(o(e.prototype), "nearestInputPos", this)).call.apply(n, [this].concat(i))
            }
        }, {
            key: "value",
            get: function() {
                return this.currentMask ? this.currentMask.value : ""
            },
            set: function(t) {
                v(o(e.prototype), "value", t, this, !0)
            }
        }, {
            key: "unmaskedValue",
            get: function() {
                return this.currentMask ? this.currentMask.unmaskedValue : ""
            },
            set: function(t) {
                v(o(e.prototype), "unmaskedValue", t, this, !0)
            }
        }, {
            key: "typedValue",
            get: function() {
                return this.currentMask ? this.currentMask.typedValue : ""
            },
            set: function(t) {
                var e = String(t);
                this.currentMask && (this.currentMask.typedValue = t,
                e = this.currentMask.unmaskedValue),
                this.unmaskedValue = e
            }
        }, {
            key: "isComplete",
            get: function() {
                return !!this.currentMask && this.currentMask.isComplete
            }
        }, {
            key: "state",
            get: function() {
                return Object.assign({}, p(o(e.prototype), "state", this), {
                    _rawInputValue: this.rawInputValue,
                    compiledMasks: this.compiledMasks.map(function(t) {
                        return t.state
                    }),
                    currentMaskRef: this.currentMask,
                    currentMask: this.currentMask && this.currentMask.state
                })
            },
            set: function(t) {
                var n = t.compiledMasks
                  , u = t.currentMaskRef
                  , i = t.currentMask
                  , r = h(t, ["compiledMasks", "currentMaskRef", "currentMask"]);
                this.compiledMasks.forEach(function(t, e) {
                    return t.state = n[e]
                }),
                null != u && (this.currentMask = u,
                this.currentMask.state = i),
                v(o(e.prototype), "state", r, this, !0)
            }
        }, {
            key: "overwrite",
            get: function() {
                return this.currentMask ? this.currentMask.overwrite : p(o(e.prototype), "overwrite", this)
            },
            set: function(t) {
                console.warn('"overwrite" option is not available in dynamic mask, use this option in siblings')
            }
        }]),
        e
    }();
    H.DEFAULTS = {
        dispatch: function(t, e, n) {
            if (e.compiledMasks.length) {
                var u = e.rawInputValue
                  , i = e.compiledMasks.map(function(e, i) {
                    return e.reset(),
                    e.append(u, {
                        raw: !0
                    }),
                    e.append(t, n),
                    {
                        weight: e.rawInputValue.length,
                        index: i
                    }
                });
                return i.sort(function(t, e) {
                    return e.weight - t.weight
                }),
                e.compiledMasks[i[0].index]
            }
        }
    },
    C.MaskedDynamic = H;
    var U = {
        MASKED: "value",
        UNMASKED: "unmaskedValue",
        TYPED: "typedValue"
    };
    function G(t) {
        var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : U.MASKED
          , n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : U.MASKED
          , u = S(t);
        return function(t) {
            return u.runIsolated(function(u) {
                return u[e] = t,
                u[n]
            })
        }
    }
    C.PIPE_TYPE = U,
    C.createPipe = G,
    C.pipe = function(t) {
        for (var e = arguments.length, n = new Array(e > 1 ? e - 1 : 0), u = 1; u < e; u++)
            n[u - 1] = arguments[u];
        return G.apply(void 0, n)(t)
    }
    ;
    try {
        globalThis.IMask = C
    } catch (t) {}
    [].slice.call(document.querySelectorAll("[data-mask]")).map(function(t) {
        return new C(t,{
            mask: t.dataset.mask,
            lazy: "true" === t.dataset["mask-visible"]
        })
    });
    var Y = ".dropdown, .dropup, .dropend, .dropstart"
      , q = document.querySelectorAll(Y)
      , W = void 0;
    q.forEach(function(t) {
        t.addEventListener("mousedown", function(t) {
            t.stopPropagation(),
            t.target.dataset.bsToggle && "dropdown" === t.target.dataset.bsToggle && (W = t.currentTarget)
        }),
        t.addEventListener("hide.bs.dropdown", function(e) {
            e.stopPropagation();
            var n = W ? W.parentElement.closest(Y) : void 0;
            n && n === t && e.preventDefault(),
            W = void 0
        })
    }),
    [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(function(t) {
        var e, n, u = {
            delay: {
                show: 50,
                hide: 50
            },
            html: null !== (e = "true" === t.getAttribute("data-bs-html")) && void 0 !== e && e,
            placement: null !== (n = t.getAttribute("data-bs-placement")) && void 0 !== n ? n : "auto"
        };
        return new bootstrap.Tooltip(t,u)
    }),
    [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]')).map(function(t) {
        var e, n, u = {
            delay: {
                show: 50,
                hide: 50
            },
            html: null !== (e = "true" === t.getAttribute("data-bs-html")) && void 0 !== e && e,
            placement: null !== (n = t.getAttribute("data-bs-placement")) && void 0 !== n ? n : "auto"
        };
        return new bootstrap.Popover(t,u)
    }),
    [].slice.call(document.querySelectorAll('[data-bs-toggle="dropdown"]')).map(function(t) {
        return new bootstrap.Dropdown(t)
    }),
    [].slice.call(document.querySelectorAll('[data-bs-toggle="switch-icon"]')).map(function(t) {
        t.addEventListener("click", function(e) {
            e.stopPropagation(),
            t.classList.toggle("active")
        })
    }),
    [].slice.call(document.querySelectorAll('[data-bs-toggle="toast"]')).map(function(t) {
        return new bootstrap.Toast(t)
    })
});