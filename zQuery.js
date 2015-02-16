//;(function(){
var zQuery = (function(){
    var $,
        zquery = {},
        emptyArray = [],
        slice = emptyArray.slice,
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        class2type = {},
        toString = class2type.toString,
        isArray = Array.isArray || function(object){ return object instanceof Array };

    function type(obj) {
        return obj == null ? String(obj) :
        class2type[toString.call(obj)] || "object"
    }
    function isWindow(obj) { return obj != null && obj == obj.window }
    function isObject(obj) { return type(obj) == "object" }
    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
    }
    function likeArray(obj) { return typeof obj.length == 'number' }

    zquery.Z = function(dom, selector) {
        dom = dom || [];
        dom.__proto__ = $.fn;
        dom.selector = selector || '';
        return dom
    };
    zquery.init = function(selector, context) {
        var dom;
        // If nothing given, return an empty zQuery collection
        if (!selector){
            return zquery.Z()
        }
        // Optimize for string selectors
        else if (typeof selector == 'string') {
            selector = selector.trim();
            // is thrown if the fragment doesn't begin with <
            if (selector[0] == '<' && fragmentRE.test(selector)){
                dom = [selector];
            }
            // If there's a context, create a collection on that context first, and select
            // nodes from there
            else if (context !== undefined) {
                return $(context+" "+selector)
            }
            // If it's a CSS selector, use it to select nodes.
            else {
                //dom = zquery.qsa(document, selector);
                var selectorType = 'querySelectorAll';
                if(selector.indexOf(' ') === -1 && selector.indexOf('>') === -1){
                    if (selector.indexOf('#') === 0){
                        selectorType = 'getElementById';
                        selector = selector.substr(1, selector.length);
                    }else if(selector.indexOf('.') === 0){
                        selectorType = 'getElementsByClassName';
                        selector = selector.substr(1, selector.length);
                    }
                    dom = document[selectorType](selector);
                }
                dom = dom.length?dom:[dom];
            }
        }else if (typeof selector == 'object') {
            dom = [selector];
        }else{
            console.log(typeof selector);
        }
        // create a new zQuery collection from the nodes found
        return zquery.Z(dom, selector)
    };

    $ = function(selector, context){
        return zquery.init(selector, context)
    };

    //extend
    function extend(target, source, deep) {
        for (key in source)
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key])){
                    target[key] = {}
                }
                if (isArray(source[key]) && !isArray(target[key])){
                    target[key] = []
                }
                extend(target[key], source[key], deep)
            }
            else if (source[key] !== undefined){
                target[key] = source[key]
            }
    }
    $.extend = function(target){
        var deep, args = slice.call(arguments, 1);
        if (typeof target == 'boolean') {
            deep = target;
            target = args.shift()
        }
        args.forEach(function(arg){ extend(target, arg, deep) });
        return target
    };

    /**
     * 去掉selector前后的空格
     * @param str
     * @returns {string}
     */
    $.trim = function(str) {
        return str == null ? "" : String.prototype.trim.call(str)
    };
    /**
     * each循环
     * @param elements
     * @param callback
     * @returns {*}
     */
    $.each = function(elements, callback){
        var i, key;
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++){
                if (callback.call(elements[i], i, elements[i]) === false) return elements
            }
        } else {
            for (key in elements){
                if (callback.call(elements[key], key, elements[key]) === false) return elements
            }
        }
        return elements
    };

    /**
     * zquery's prototype
     * @type {{forEach: Function, each: Function, after: Function, before: Function, prepend: Function, append: Function, appendTo: Function, remove: Function, addClass: Function, removeClass: Function, toggleClass: Function, hasClass: Function, attr: Function, removeAttr: Function, html: Function, text: Function, css: Function, find: Function, on: Function, getData: Function, setData: Function, hasElement: Function}}
     */
    $.fn = {
        forEach: emptyArray.forEach,
        each : function(callback){
            for(var i = 0; i<this.length ;i++){
                callback(this[i])
            }
        },
        after : function(html){
            this.each(function(index){
                index.insertAdjacentHTML('afterend', html);
            });
            return this;
        },
        before : function(html){
            this.each(function(index){
                index.insertAdjacentHTML('beforebegin', html);
            });
            return this;
        },
        prepend : function(html){
            this.each(function(index){
                index.insertAdjacentHTML('afterbegin', html);
            });
            return this;
        },
        append : function(html){
            this.each(function(index){
                index.insertAdjacentHTML('beforeend', html);
            });
            return this;
        },
        appendTo:function(parent){
            var that = this,
                $parent = $(parent);
            console.log($("body"))
            $parent.each(function(p){
                that.each(function(index){
                    p.insertAdjacentHTML('beforeend', index);
                    //index.remove();
                });
            });
            return this;
        },
        remove : function(){
            this.each(function(index){
                index.parentNode.removeChild(index);
            });
        },
        addClass : function(classname){
            var names = classname.split(" ");
            this.each(function(index){
                //index.className +=(" "+classname);
                for(var i=0;i<names.length;i++){
                    index.classList.add(names[i]);
                };
            });
            return this;
        },
        removeClass : function(classname){
            var names = classname.split(" ");
            this.each(function(index){
                for(var i=0;i<names.length;i++){
                    index.classList.remove(names[i]);
                };
            });
            return this;
        },
        toggleClass:function(classname){
            this.each(function(index){
                index.classList.toggle(classname);
            });
            return this;
        },
        hasClass:function(classname){
            this.each(function(index){
                index.classList.contains(classname);
            });
            return this;
        },
        attr : function(attr,val){
            if(!!val && typeof attr !== "object"){
                this.each(function(index){
                    index.setAttribute(attr,val);
                });
            }else if(typeof attr === "object" && typeof val === "undefined"){
                this.each(function(index){
                    for( v in attr){
                        index.setAttribute(v,attr[v]);
                    }
                });
            }else{
                this.each(function(index){
                    index.getAttribute(attr);
                });
            }
            return this;
        },
        removeAttr : function(attr){
            this.each(function(index){
                index.removeAttribute(attr);
            });
            return this;
        },
        html : function(html){
            if(typeof html !== "undefined"){
                this.each(function(index){
                    index.innerHTML = html;
                });
                return this;
            }else{
                var _html;
                this.each(function(index){
                    _html = index.innerHTML;
                });
                return _html;
            }

        },
        text : function(text){
            var innerMethod = typeof (this[0].textContent === "string")?"textContent":"innerText";
            if(typeof text === "string"){
                this.each(function(index){
                    index[innerMethod] = text;
                });
                return this
            }else if(typeof text === "undefined"){
                var _text;
                this.each(function(index){
                    _text = index[innerMethod];
                });
                return _text;
            }
        },
        css: function (attr,val) {
            if(typeof attr !== "object" && !!val){
                this.each(function(index){
                    index.style[attr] = val;
                });
            }else if(typeof attr === "object" && typeof val === "undefined"){
                var cssstyle = "";
                for(v in attr){
                    cssstyle += v+":"+attr[v]+";";
                }
                this.each(function(index){
                    index.style.cssText = cssstyle;
                });
            }
            return this;
        },
        on : function(event,handle){
            this.each(function(index){
                index.on(event,handle);
            });
            return this;
        },
        getData : function(attr){
            var val = [];
            this.each(function(index){
                val.push(index.dataset[attr]);
            });
            return val;
        },
        setData : function(attr,val){
            this.each(function(index){
                index.dataset[attr] = val;
            });
            return this
        },
        parent: function(){
            return $(this.parentNode);
        },
        next: function(){
            return $(this.nextSibling);
        }
    };
    zquery.Z.prototype = $.fn;
    //
    //// Export internal API functions in the `$.zepto` namespace
    //zquery.uniq = uniq;
    //zquery.deserializeValue = deserializeValue;
    //$.zquery = zquery;

    return $;
})();
window.zQuery = zQuery;
window.$ === undefined && (window.$ = zQuery);
//绑定事件
Element.prototype.on = Element.prototype.addEventListener;
Element.prototype.off = Element.prototype.removeEventListener;
NodeList.prototype.on = function (event, fn) {
    []['forEach'].call(this, function (el) {
        el.on(event, fn);
    });
    return this;
};
NodeList.prototype.trigger = function (event) {
    []['forEach'].call(this, function (el) {
        el['trigger'](event);
    });
    return this;
};
//ajax
;(function($){
    var ajaxOptions = {
        type:"post",
        url:"",
        data:null,
        resType:"json",
        success:function(result){},
        error:function(result){}
    };
    $.ajax = function (cfg) {
        var CFG = $.extend(ajaxOptions,cfg);
        var xhr = new XMLHttpRequest();
        if (typeof CFG.data === 'function'){
            CFG.callback = CFG.data;
            CFG.data = null;
        }
        xhr.open(CFG.type, CFG.url,true);
        var fd = new FormData();
        if (CFG.type === 'POST' && CFG.data) {
            for (var key in CFG.data){
                fd.append(key, JSON.stringify(CFG.data[key]));
            }
        }
        xhr.onload = function (e) {
            //var res = xhr.response;//JSON.parse(xhr.response)
            if (xhr.status == 200) {
                CFG.success(xhr.response);
            } else {
                CFG.error(xhr.response);
            }
        };
        xhr.send(CFG.data ? fd : null);
        return xhr;
    }
})(zQuery);

(function($){
    /**
     * 测试某功能模块效率
     */
    $.testEffi = function (callback) {
        var startT = new Date().getTime();
        callback();
        var endT = new Date().getTime();
        console.log(endT-startT);
    }
    //判断浏览器
    $.checkNavigator = function () {
        if ((navigator.userAgent.indexOf('MSIE') >= 0) && (navigator.userAgent.indexOf('Opera') < 0)){
            return "IE";
        }else if (navigator.userAgent.indexOf('Firefox') >= 0){
            return "Firefox";
        }else if (navigator.userAgent.indexOf('Opera') >= 0){
            return "Opera";
        }else if(navigator.userAgent.indexOf('Chrome') >= 0){
            return "Chrome";
        }
    };
})(zQuery);
//表单
(function($){
    $.fn.serializeArray = function() {
        var name, type, result = [],
            add = function(value) {
                if (value.forEach){
                    return value.forEach(add)
                }
                result.push({ name: name, value: value })
            };
        if (this[0]){
            $.each(this[0].elements, function(_, field){
                type = field.type, name = field.name;
                if (name && field.nodeName.toLowerCase() != 'fieldset' &&
                    !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
                    ((type != 'radio' && type != 'checkbox') || field.checked)){
                    add(field.value)
                }
            })
        }
        return result
    };

    $.fn.serialize = function(){
        var result = [];
        this.serializeArray().forEach(function(elm){
            result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
        });
        return result.join('&')
    };

    //$.fn.submit = function(callback) {
    //    if (0 in arguments) this.bind('submit', callback)
    //    else if (this.length) {
    //        var event = $.Event('submit')
    //        this.eq(0).trigger(event)
    //        if (!event.isDefaultPrevented()) this.get(0).submit()
    //    }0000
    //    return this
    //}

})(zQuery);

