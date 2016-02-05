//;(function(){
var DOOM = (function(){
    var $,
        doom = {},
        emptyArray = [],
        slice = emptyArray.slice,
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        simpleSelectorRE = /^[\w-]*$/,
        class2type = {},
        toString = class2type.toString,
        isArray = Array.isArray || function(object){ return object instanceof Array };

    function type(obj) {
        return obj == null ? String(obj) :
        class2type[toString.call(obj)] || "object"
    }
    function isWindow(obj) { return obj != null && obj == obj.window }
    function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
    function isObject(obj) { return type(obj) == "object" }
    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
    }
    function likeArray(obj) { return typeof obj.length == 'number' }

    doom.Z = function(dom, selector) {
        //dom = nodeListToArr(dom) || [];
        //var len = dom.length;
        dom.__proto__ = $.fn;
        dom.selector = selector || '';
        //dom.length = len;
        return dom
    };
    doom.init = function(selector){
        var dom;
        // If nothing given, return an empty DOOM collection
        if (!selector){
            return doom.Z()
        }
        // Optimize for string selectors
        else if (typeof selector == 'string') {
            selector = selector.trim();
            // is thrown if the fragment doesn't begin with <
            if (selector[0] == '<' && fragmentRE.test(selector)){
                dom = [selector];
            }else {
                //dom = doom.qsa(document, selector);
                //var selectorType = 'querySelectorAll';
                //if(selector.indexOf(' ') === -1 && selector.indexOf('>') === -1){
                //    if (selector.indexOf('#') === 0){
                //        selectorType = 'getElementById';
                //        //selector = selector.substr(1, selector.length);
                //    }else if(selector.indexOf('.') === 0){
                //        selectorType = 'getElementsByClassName';
                //        //selector = selector.substr(1, selector.length);
                //    }else if(simpleSelectorRE.test(selector)){
					//	selectorType = 'getElementsByTagName';
					//}
                //}
                //console.log(selectorType+" "+selector);
                //dom = document[selectorType](selector);
                dom = doom.qsa(document,selector);
                //dom = dom.length?dom:[];
                //if(!dom[0]) dom = [dom];
            }
        }else if (typeof selector == 'object'){
            dom = [selector];
        }else{
            console.log(typeof selector);
        }
        // create a new DOOM collection from the nodes found
        return doom.Z(dom, selector)
    };

    $ = function(selector){
        return doom.init(selector)
    };

    doom.qsa = function(element, selector){
        var found,
            maybeID = selector[0] == '#',
            maybeClass = !maybeID && selector[0] == '.',
            nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
            isSimple = simpleSelectorRE.test(nameOnly)
        return (isDocument(element) && isSimple && maybeID) ?
            ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
            (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
                slice.call(
                    isSimple && !maybeID ?
                        maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
                            element.getElementsByTagName(selector) : // Or a tag
                        element.querySelectorAll(selector) // Or it's not simple, and we need to query all
                )
    };

    //nodeList to Array
    function nodeListToArr(anchors){
        var arr = new Array();
        for (var i = 0; i < anchors.length; i++) {
            var ele = anchors[i];
            arr.push(ele);
        }
        return arr
    }

    //extend
    function extend(target, source, deep) {
        var key;
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
     * doom's prototype
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
            this.each(function(elem){
                elem.insertAdjacentHTML('afterend', html);
            });
            return this;
        },
        before : function(html){
            this.each(function(elem){
                elem.insertAdjacentHTML('beforebegin', html);
            });
            return this;
        },
        prepend : function(html){
            this.each(function(elem){
                elem.insertAdjacentHTML('afterbegin', html);
            });
            return this;
        },
        append : function(html){
            console.log(this);
            this.each(function(elem){
                elem.insertAdjacentHTML('beforeend', html);
            });
            return this;
        },
        appendTo:function(parent){
            var that = this,
                $parent = $(parent);
            //console.log($("body"))
            $parent.each(function(p){
                that.each(function(elem){
                    p.insertAdjacentHTML('beforeend', elem);
                    //index.remove();
                });
            });
            return this;
        },
        remove : function(){
            this.each(function(elem){
                elem.parentNode.removeChild(elem);
            });
        },
        addClass : function(classname){
            console.log(this);
            var names = classname.split(" ");
            this.each(function(elem){
                //index.className +=(" "+classname);
                for(var i=0;i<names.length;i++){
                    elem.classList.add(names[i]);
                }
            });
            return this;
        },
        removeClass : function(classname){
            var names = classname.split(" ");
            this.each(function(elem){
                for(var i=0;i<names.length;i++){
                    elem.classList.remove(names[i]);
                }
            });
            return this;
        },
        toggleClass:function(classname){
            this.each(function(elem){
                elem.classList.toggle(classname);
            });
            return this;
        },
        hasClass:function(classname){
            this.each(function(elem){
                elem.classList.contains(classname);
            });
            return this;
        },
        attr : function(attr,val){
            if(!!val && typeof attr !== "object"){
                this.each(function(elem){
                    elem.setAttribute(attr,val);
                });
            }else if(typeof attr === "object" && typeof val === "undefined"){
                this.each(function(elem){
                    for( var v in attr){
                        elem.setAttribute(v,attr[v]);
                    }
                });
            }else{
                this.each(function(elem){
                    elem.getAttribute(attr);
                });
            }
            return this;
        },
        removeAttr : function(attr){
            this.each(function(elem){
                elem.removeAttribute(attr);
            });
            return this;
        },
        html : function(html){
            if(typeof html !== "undefined"){
                this.each(function(elem){
                    elem.innerHTML = html;
                });
                return this;
            }else{
                return this[0].innerHTML;
            }
        },
        text : function(text){
            var innerMethod = typeof (this[0].textContent === "string")?"textContent":"innerText";
            if(typeof text === "string"){
                this.each(function(elem){
                    elem[innerMethod] = text;
                });
                return this
            }else if(typeof text === "undefined"){
                var _text;
                this.each(function(elem){
                    _text = elem[innerMethod];
                });
                return _text;
            }
        },
        css: function (attr,val) {
            if(typeof attr !== "object" && !!val){
                this.each(function(elem){
                    elem.style[attr] = val;
                });
            }else if(typeof attr === "object" && typeof val === "undefined"){
                var cssstyle = "";
                for(var v in attr){
                    cssstyle += v+":"+attr[v]+";";
                }
                this.each(function(elem){
                    elem.style.cssText = cssstyle;
                });
            }
            return this;
        },
        on : function(event,handle){
            this.each(function(elem){
                elem.on(event,handle);
            });
            return this;
        },
        getData : function(attr){
            var val = [];
            this.each(function(elem){
                val.push(elem.dataset[attr]);
            });
            return val;
        },
        setData : function(attr,val){
            this.each(function(elem){
                elem.dataset[attr] = val;
            });
            return this
        },
        parent: function(){
            return $(this[0].parentNode);
        },
        children: function(el){
            var nodes = [],
                elements = nodeListToArr(this[0].childNodes);
            if(!!el){
                $.each(elements,function(i){
                    if (elements[i].nodeType == 1 && elements[i].tagName) nodes.push(elements[i])
                });
            }else{
                $.each(elements,function(i){
                    if (elements[i].nodeType == 1) nodes.push(elements[i])
                });
            }
            return doom.Z(nodes)
        },
        next: function(){
            return $(this[0].nextSibling);
        },
		height: function(){
			return this[0].clientHeight
		},
		width: function(){
			return this[0].clientWidth
        }
    };
    doom.Z.prototype = $.fn;
    //
    //// Export internal API functions in the `$.zepto` namespace
    //doom.uniq = uniq;
    //doom.deserializeValue = deserializeValue;
    //$.doom = doom;

    return $;
})();
window.DOOM = DOOM;
window.$ === undefined && (window.$ = DOOM);
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
var winSize = function(){
	var e = window,
		a = 'inner';
	if (!('innerWidth' in window )){
		a = 'client';
		e = document.documentElement || document.body;
	}
	return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
};

//ajax
(function($){
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
})(DOOM);

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
})(DOOM);

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

})(DOOM);

