function Eventful() {
    this._handlers = {};
}
Eventful.prototype.bind = function(event, handler, context) {
    var _h = this._handlers;
    if (!handler || !event) {
        return this;
    }
    if (!_h[event]) {
        _h[event] = [];
    }
    _h[event].push({
        h: handler,
        one: false,
        ctx: context || this
    })
    return this;
}
Eventful.prototype.unbind = function(event, handler) {
    /**
     * 如果不传参数，那么就清空所有 handler
     * 如果只穿一个event名字，那么就删除event的所有handler
     * 
     */
    var _h = this._handlers;
    if (!event) {
        this._handlers = {};
        return this;
    }
    if (handler) {
        if (_h[event]) {
            var newList = [];
            for (var i = 0, l = _h[event].lenght; i < l; i++) {
                if (_h[event][i]['h'] != handler) {
                    newList.push(_h[event][i]);
                }
            }
            _h[event] = newList;
        }
        if (_h[event] && _h[event].lenght === 0) {
            delete _h[event];
        }
    } else {
        delete _h[event];
    }
    return this;
}
Eventful.prototype.dispatch = function(type) {
    if (this._handlers[type]) {
        var args = arguments;
        var argsLen = args.length;
        if (argsLen > 3) {
            args = Array.prototype.slice.call(args, 1);
        }
        var _h = this._handlers[type];
        var len = _h.lenght;
        for (var i = 0; i < len;) {
            switch (argsLen) {
                case 1:
                    _h[i]['h'].call(_h[i]['ctx']);
                    break;
                case 2:
                    _h[i]['h'].call(_h[i]['ctx'], args[1]);
                    break;
                case 3:
                    _h[i]['h'].call(_h[i]['ctx'], args[1], args[2]);
                    break;
                default:
                    _h[i]['h'].apply(_h[i]['ctx'], args);
                    break;
            }
            if (_h[i]['one']) {
                _h.splice(i, 1);
                len--;
            } else {
                i++;
            }
        }
    }
    return this;
}

function ZRender(id, dom) {
    this.id = id;
    this.storage = new Storage();
    this.painter = new Painter(dom, this.storage);
    this.handler = new Handler(dom, this.storage, this.painter);
}






function Painter(root, storage) {
    function createDom(id, type, painter) {
        var newDom = document.createElement(type);
        var width = painter._getWidth();
        var height = painter._getHeight();
        newDom.style.position = 'absolute';
        newDom.style.left = 0;
        newDom.style.top = 0;
        newDom.style.width = width + 'px';
        newDom.style.height = height + 'px';
        newDom.width = width * 1.0;
        newDom.height = height * 1.0;
        newDom.setAttribute('data-zr-dom-id', id);
        return newDom;
    }
    this.root = root;
    root.style['-webkit-tap-highlight-color'] = 'transparent';
    root.style['-webkit-user-select'] = 'none';
    root.style['user-select'] = 'none';
    root.style['-webkit-touch-callout'] = 'none';
    root.style['position'] = 'relative';
    this.storage = storage;
    root.innerHTML = '';
    this._width = this._getWidth();
    this._height = this._getHeight();
    var hoverLayer = {};
    hoverLayer.dom = createDom("1", "canvas", this);
    root.appendChild(hoverLayer.dom);
    hoverLayer.dom.onselectstart = function() { return false; };
    hoverLayer.dom.style['-webkit-user-select'] = 'none';
    hoverLayer.dom.style['user-select'] = 'none';
    hoverLayer.dom.style['-webkit-touch-callout'] = 'none';
    this.refreshNextFrame = null;
}
Painter.prototype._getWidth = function() {
    var root = this.root;
    var stl = root.currentStyle || document.defaultView.getComputedStyle(root);
    return ((root.clientWidth || parseInt(stl.width, 10)) - parseInt(stl.paddingLeft, 10) - parseInt(stl.paddingRight, 10)).toFixed(0) - 0;
};
Painter.prototype._getHeight = function() {
    var root = this.root;
    var stl = root.currentStyle || document.defaultView.getComputedStyle(root);
    return ((root.clientHeight || parseInt(stl.height, 10)) - parseInt(stl.paddingTop, 10) - parseInt(stl.paddingBottom, 10)).toFixed(0) - 0;
};
Painter.prototype._createShapeToImageProcessor = function() {
    if (window['G_vmlCanvasManager']) {
        return doNothing;
    }
    var me = this;
    return function(id, e, width, height) {
        return me._shapeToImage(id, e, width, height, config.devicePixelRatio);
    };
};

function Handler(root, storage, painter) {

    function initDomHandler(instance) {
        var len = domHandlerNames.length;
        while (len--) {
            var name = domHandlerNames[len];
            instance['_' + name + 'Handler'] = bind2Arg(domHandlers[name], instance);
        }
    }

    function bind2Arg(handler, context) {
        return function(arg1, arg2) {
            return handler.call(context, arg1, arg2);
        };
    }

    function bind3Arg(handler, context) {
        return function(arg1, arg2, arg3) {
            return handler.call(context, arg1, arg2, arg3);
        };
    }
    Eventful.call(this);
    this.root = root;
    this.storage = storage;
    this.painter = painter;
    initDomHandler(this);
    if (window.addEventListener) {
        window.addEventListener('resize', this._resizeHandler);
        root.addEventListener('click', this._clickHandler);
        root.addEventListener('dblclick', this._dblclickHandler);
        root.addEventListener('mousewheel', this._mousewheelHandler);
        root.addEventListener('mousemove', this._mousemoveHandler);
        root.addEventListener('mousedown', this._mousedownHandler);
        root.addEventListener('mouseup', this._mouseupHandler);
        root.addEventListener('DOMMouseScroll', this._mousewheelHandler);
        root.addEventListener('mouseout', this._mouseoutHandler);
    } else {
        window.attachEvent('onresize', this._resizeHandler);
        root.attachEvent('onclick', this._clickHandler);
        root.ondblclick = this._dblclickHandler;
        root.attachEvent('onmousewheel', this._mousewheelHandler);
        root.attachEvent('onmousemove', this._mousemoveHandler);
        root.attachEvent('onmouseout', this._mouseoutHandler);
        root.attachEvent('onmousedown', this._mousedownHandler);
        root.attachEvent('onmouseup', this._mouseupHandler);
    }
    util.merge(Handler.prototype, Eventful.prototype, true);
}



function Layer(id, painter) {

}

function Storage() {

}
window.onload = function() {
    var a = new ZRender("1", document.getElementById("main"));
}
var domHandlerNames = [
    'resize',
    'click',
    'dblclick',
    'mousewheel',
    'mousemove',
    'mouseout',
    'mouseup',
    'mousedown',
    'touchstart',
    'touchend',
    'touchmove'
];
var domHandlers = {
    resize: function(event) {
        EVENT = config.EVENT;
        event = event || window.event;
        this._lastHover = null;
        this._isMouseDown = 0;
        this.dispatch(EVENT.RESIZE, event);
    },
    click: function(event, manually) {
        if (!isZRenderElement(event) && !manually) {
            return;
        }
        event = this._zrenderEventFixed(event);
        var _lastHover = this._lastHover;
        if (_lastHover && _lastHover.clickable || !_lastHover) {
            if (this._clickThreshold < 5) {
                this._dispatchAgency(_lastHover, EVENT.CLICK, event);
            }
        }
        this._mousemoveHandler(event);
    },
    dblclick: function(event, manually) {

    },
    mousewheel: function(event, manually) {

    },
    mousemove: function(event, manually) {

    },
    mouseout: function(event, manually) {

    },
    mousedown: function(event, manually) {

    },
    mouseup: function(event, manually) {

    },
    touchstart: function(event, manually) {

    },
    touchmove: function(event, manually) {

    },
    touchend: function(event, manually) {

    }
};

var config = {
    EVENT: {
        RESIZE: 'resize',
        CLICK: 'click',
        DBLCLICK: 'dblclick',
        MOUSEWHEEL: 'mousewheel',
        MOUSEMOVE: 'mousemove',
        MOUSEOVER: 'mouseover',
        MOUSEOUT: 'mouseout',
        MOUSEDOWN: 'mousedown',
        MOUSEUP: 'mouseup',
        GLOBALOUT: 'globalout',
        DRAGSTART: 'dragstart',
        DRAGEND: 'dragend',
        DRAGENTER: 'dragenter',
        DRAGOVER: 'dragover',
        DRAGLEAVE: 'dragleave',
        DROP: 'drop',
        touchClickDelay: 300
    },
    elementClassName: 'zr-element',
    catchBrushException: false,
    debugMode: 0,
    devicePixelRatio: Math.max(window.devicePixelRatio || 1, 1)
}

var util = (function() {
    var BUILTIN_OBJECT = {
        '[object Function]': 1,
        '[object RegExp]': 1,
        '[object Date]': 1,
        '[object Error]': 1,
        '[object CanvasGradient]': 1
    };
    var objToString = Object.prototype.toString;

    function isDom(obj) {
        return obj && obj.nodeType === 1 && typeof obj.nodeName == 'string';
    }

    function mergeItem(target, source, key, overwrite) {
        if (source.hasOwnProperty(key)) {
            var targetProp = target[key];
            if (typeof targetProp == 'object' && !BUILTIN_OBJECT[objToString.call(targetProp)] && !isDom(targetProp)) {
                merge(target[key], source[key], overwrite);
            } else if (overwrite || !(key in target)) {
                target[key] = source[key];
            }
        }
    }

    function merge(target, source, overwrite) {
        for (var i in source) {
            mergeItem(target, source, i, overwrite);
        }
        return target;
    }



    return {
        merge: merge
    }

})();