//;(function(){
var zQuery = (function(){
    var $,
        zquery = {},
        emptyArray = [],
        slice = emptyArray.slice,
        simpleSelectorRE = /^[\w-]*$/,
        uniq,
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
    function isDocument(obj){
        return obj != null && obj.nodeType == obj.DOCUMENT_NODE
    }
    function isWindow(obj) { return obj != null && obj == obj.window }
    function isObject(obj) { return type(obj) == "object" }
    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
    }
    function likeArray(obj) { return typeof obj.length == 'number' }
    //zquery.fragment = function(html, name, properties) {
    //    var dom, nodes, container
    //
    //    // A special case optimization for a single tag
    //    if (singleTagRE.test(html)){
    //        dom = $(document.createElement(RegExp.$1))
    //    }
    //
    //    if (!dom) {
    //        if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
    //        if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
    //        if (!(name in containers)) name = '*'
    //
    //        container = containers[name]
    //        container.innerHTML = '' + html
    //        dom = $.each(slice.call(container.childNodes), function(){
    //            container.removeChild(this)
    //        })
    //    }
    //
    //    if (isPlainObject(properties)) {
    //        nodes = $(dom)
    //        $.each(properties, function(key, value) {
    //            if (methodAttributes.indexOf(key) > -1) nodes[key](value)
    //            else nodes.attr(key, value)
    //        })
    //    }
    //
    //    return dom
    //};
    zquery.Z = function(dom, selector) {
        dom = dom || []
        dom.__proto__ = $.fn
        dom.selector = selector || ''
        return dom
    };

    zquery.init = function(selector, context) {
        var dom
        // If nothing given, return an empty zQuery collection
        if (!selector) return zquery.Z()
        // Optimize for string selectors
        else if (typeof selector == 'string') {
            //console.log(context)
            selector = selector.trim();
            //console.log(selector);
            // If there's a context, create a collection on that context first, and select
            // nodes from there
            if (context !== undefined) {
                return $(context).find(selector)
            }
            // If it's a CSS selector, use it to select nodes.
            else {
                dom = zquery.qsa(document, selector)
            }
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

    zquery.qsa = function(element, selector){
        var found,
            maybeID = selector[0] == '#',
            maybeClass = !maybeID && selector[0] == '.',
            nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
            isSimple = simpleSelectorRE.test(nameOnly);
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
    $.trim = function(str) {
        return str == null ? "" : String.prototype.trim.call(str)
    };
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
    function deserializeValue(value) {
        try {
            return value ?
            value == "true" ||
            ( value == "false" ? false :
                value == "null" ? null :
                    +value + "" == value ? +value :
                        /^[\[\{]/.test(value) ? $.parseJSON(value) :
                            value )
                : value
        } catch(e) {
            return value
        }
    }
    $.fn = {
        forEach: emptyArray.forEach,
        creatElem : function(elem){
            return document.createElement(elem);
        },
        each : function(callback){
            for(var i = 0; i<this.length ;i++){
                callback(this[i])
            }
        },
        after : function(elem){
            return this.each(function(index){
                index.insertAdjacentHTML('afterend', elem);
            });
        },
        before : function(elem){
            return this.each(function(index){
                index.insertAdjacentHTML('beforebegin', elem);
            });
        },
        prepend : function(elem){
            return this.each(function(index){
                index.insertAdjacentHTML('afterbegin', elem);
            });
        },
        append : function(elem){
            return this.each(function(index){
                index.insertAdjacentHTML('beforeend', elem);
            });
        },
        appendTo:function(parent){
            console.log(zquery.qsa(document, parent));
            return zquery.qsa(document, parent).each(function(p){
                console.log(p)
                //this.each(function(index){
                //    index.insertAdjacentHTML('beforeend', p);
                //});
            });
        },
        remove : function(elem){
            return this.each(function(index){
                index.parentNode.removeChild(window.$(elem));
            });
        },
        addClass : function(classname){
            return this.each(function(index){
                index.className += classname;
            });
        },
        removeClass : function(classname){
            return this.each(function(index){
                index.className.replace(/^classname/, '');
            });
        },
        attr : function(attr,val){
            if(!!val){
                return this.each(function(index){
                    index.setAttribute(attr,val);
                });
            }else{
                return this.each(function(index){
                    index.getAttribute(attr);
                });
            }
        },
        removeAttr : function(attr){
            return this.each(function(index){
                index.removeAttribute(attr);
            });
        },
        html : function(html){
            return this.each(function(index){
                index.innerHTML = html;
            });
        },
        text : function(text){
            //console.log(this.each());
            if(checkNavigator() !== "Firefox"){
                this.each(function(index){
                    index.innerText = text;
                });
            }else{
                this.each(function(index){
                    index.innerText = text;
                });
            }
            return this;
        },
        css: function (attr,val) {
            if(typeof attr !== "object" && !!val){
                this.each(function(index){
                    index.style[attr] = val;
                });
            }else if(typeof attr == "object" && typeof val == "undefined"){
                var cssstyle = "";
                for(v in attr){
                    cssstyle += v+":"+attr[v]+";";
                }
                this.each(function(index){
                    index.style.cssText = cssstyle;
                });
            }else{
                return;
            }
            return this;
        },
        find: function(selector){
            var result, $this = this
            if (!selector) result = $()
            else if (typeof selector == 'object')
                result = $(selector).filter(function(){
                    var node = this
                    return emptyArray.some.call($this, function(parent){
                        return $.contains(parent, node)
                    })
                })
            else if (this.length == 1) result = $(zquery.qsa(this[0], selector))
            else result = this.map(function(){ return zquery.qsa(this, selector) })
            return result
        }
    };
    //zquery.Z.prototype = $.fn;
    //
    //// Export internal API functions in the `$.zepto` namespace
    //zquery.uniq = uniq;
    //zquery.deserializeValue = deserializeValue;
    //$.zquery = zquery;

    return $;
})();
window.zQuery = zQuery;
window.$ === undefined && (window.$ = zQuery);

(function($){
    var ajaxOptions = {
        type:"post",
        url:"",
        data:null,
        resType:"json",
        callback:null
    }
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

//})();

/*
 zQuery.fn.extend({
 html:function(){}
 });
 */
//function getLocation(url){
//	var hash = url.hash,
//		href = url.href;
//	var index = href.indexOf(hash);
//	var newUrl = href.substring(0,index);
//	return newUrl;
//}