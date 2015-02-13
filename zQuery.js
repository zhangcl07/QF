//;(function(){
var zQuery = (function(){
    var $,
        zquery = {},
        emptyArray = [],
        slice = emptyArray.slice,
        filter = emptyArray.filter,
        simpleSelectorRE = /^[\w-]*$/,
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        //uniq,
        isArray = Array.isArray ||
            function(object){ return object instanceof Array };
    //function $(selector){
    //    var selectorType = 'querySelectorAll';
    //
    //    if (selector.indexOf('#') === 0) {
    //        selectorType = 'getElementById';
    //        selector = selector.substr(1, selector.length);
    //    }
    //    //console.log(typeof document[selectorType](selector));
    //    return document[selectorType](selector);
    //};
    //function isDocument(obj){
    //    return obj != null && obj.nodeType == obj.DOCUMENT_NODE
    //}
    function isWindow(obj) { return obj != null && obj == obj.window }
    function isObject(obj) { return type(obj) == "object" }
    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
    }
    function likeArray(obj) { return typeof obj.length == 'number' }
    function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }

    zquery.Z = function(dom, selector) {
        dom = dom || [];
        dom.__proto__ = $.fn;
        dom.selector = selector || '';
        return dom
    };
    zquery.init = function(selector, context) {
        var dom;
        // If nothing given, return an empty zQuery collection
        if (!selector) return zquery.Z()
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
                //dom = zquery.qsa(document, selector)
                dom = document.querySelectorAll(selector);
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
    function extend(target, source, deep) {
        for (key in source)
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key]))
                    target[key] = {}
                if (isArray(source[key]) && !isArray(target[key]))
                    target[key] = []
                extend(target[key], source[key], deep)
            }
            else if (source[key] !== undefined) target[key] = source[key]
    }
    $.extend = function(target){
        var deep, args = slice.call(arguments, 1)
        if (typeof target == 'boolean') {
            deep = target
            target = args.shift()
        }
        args.forEach(function(arg){ extend(target, arg, deep) })
        return target
    };

    /**
     * zquery.qsa可被querySelectorAll()代替 但效率会有点影响
     */
    //zquery.qsa = function(element, selector){
    //    var found,
    //        maybeID = selector[0] == '#',
    //        maybeClass = !maybeID && selector[0] == '.',
    //        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
    //        isSimple = simpleSelectorRE.test(nameOnly);
    //    return (isDocument(element) && isSimple && maybeID) ?
    //        ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
    //        (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
    //            slice.call(
    //                isSimple && !maybeID ?
    //                    maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
    //                        element.getElementsByTagName(selector) : // Or a tag
    //                    element.querySelectorAll(selector) // Or it's not simple, and we need to query all
    //            )
    //};
    /**
     * 去掉selector前后的空格
     * @param str
     * @returns {string}
     */
    //$.trim = function(str) {
    //    return str == null ? "" : String.prototype.trim.call(str)
    //};
    /**
     * each循环
     * @param elements
     * @param callback
     * @returns {*}
     */
    $.each = function(elements, callback){
        var i, key
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++)
                if (callback.call(elements[i], i, elements[i]) === false) return elements
        } else {
            for (key in elements)
                if (callback.call(elements[key], key, elements[key]) === false) return elements
        }
        return elements
    };
    /**
     * createElement
     * @param elem
     * @returns {HTMLElement}
     */
    $.createElem = function(elem){
        return document.createElement(elem);
    };

    $.map = function(elements, callback){
        var value, values = [], i, key
        if (likeArray(elements))
            for (i = 0; i < elements.length; i++) {
                value = callback(elements[i], i)
                if (value != null) values.push(value)
            }
        else
            for (key in elements) {
                value = callback(elements[key], key)
                if (value != null) values.push(value)
            }
        return flatten(values)
    }

    $.contains = document.documentElement.contains ?
        function(parent, node) {
            return parent !== node && parent.contains(node)
        } :
        function(parent, node) {
            while (node && (node = node.parentNode))
                if (node === parent) return true
            return false
        }
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
                //for(var i=0;i<elem.length;i++){
                //    index.insertAdjacentHTML('beforeend', elem[i].isContentEditable);
                //}
            });
            return this;
        },
        appendTo:function(parent){
            var that = this,
                $parent = $(parent);
            //console.log(document.querySelectorAll(parent));
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
        hasElement: function(child){
            var blen;
            this.each(function(index){
                blen = index.contains(child[0]);
            });
            return blen;
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
//绑定on事件
Element.prototype.on = Element.prototype.addEventListener;
//ajax
;(function($){
    var ajaxOptions = {
        type:"post",
        url:"",
        data:null,
        resType:"json",
        callback:null
    };
    $.ajax = function (cfg) {
        var CFG = $.extend(ajaxOptions,cfg);
        var xhr = new XMLHttpRequest();
        if (typeof CFG.data === 'function') {
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
            CFG.callback(xhr.response);
        };
        xhr.send(CFG.data ? fd : null);
        return xhr;
    }
})(zQuery);
/**
 * 测试某功能模块效率
 */
;(function($){
    $.testEffi = function (callback) {
        var startT = new Date().getTime();
        callback();
        var endT = new Date().getTime();
        console.log(endT-startT);
    }
})(zQuery);
//表单
;(function($){
    $.fn.serializeArray = function() {
        var name, type, result = [],
            add = function(value) {
                if (value.forEach) return value.forEach(add)
                result.push({ name: name, value: value })
            }
        if (this[0]) $.each(this[0].elements, function(_, field){
            type = field.type, name = field.name
            if (name && field.nodeName.toLowerCase() != 'fieldset' &&
                !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
                ((type != 'radio' && type != 'checkbox') || field.checked))
                add(field.value)
        })
        return result
    }

    $.fn.serialize = function(){
        var result = []
        this.serializeArray().forEach(function(elm){
            result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
        })
        return result.join('&')
    }

    //$.fn.submit = function(callback) {
    //    if (0 in arguments) this.bind('submit', callback)
    //    else if (this.length) {
    //        var event = $.Event('submit')
    //        this.eq(0).trigger(event)
    //        if (!event.isDefaultPrevented()) this.get(0).submit()
    //    }
    //    return this
    //}

})(zQuery);

//判断浏览器
window.checkNavigator = function () {
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
