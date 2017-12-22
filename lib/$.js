/**
 * https://github.com/wusfen/q.js
 * wushufen
 * 20171115
 * 20171117
 */
/**

$('selector')
    .each()
    .closest()
    .find()
    .delay()
    .addClass()
    .removeClass()
    .show(animateClass) // 可使用css3动画，比如使用 animate.css: .show('animated fadeIn')
    .hide(animateClass)
    .css()
    .on() // 使用代理实现，新添加的元素也能处理事件

 */
$ = function(selector) {
    if (!(this instanceof $)) {
        var els = new $
        els.selector = selector

        if (typeof selector == 'string') {
            var nodeList = document.querySelectorAll(selector)
            nodeList = els.slice.call(nodeList)
            els.splice.apply(els, [0, 0].concat(nodeList))
        } else {
            els.push(selector)
        }

        return els
    }
}
$.fn = $.prototype = []

$.fn.delay = function(time) {
    if (String(time).match('s')) {
        time = parseFloat(time) * 1000
    }
    this.delayTime = time + (this.delayTime || 0)
    return this
}
$.fn.each = function(cb) {
    var _this = this
    var deal = function() {
        for (var i = 0; i < _this.length; i++) {
            cb.call(_this[i], i, _this[i])
        }
        delete _this.delayTime
    }

    var delayTime = this.delayTime
    delayTime ? setTimeout(deal, delayTime) : deal()

    return this
}
$.fn.closest = function(selector) {
    var _els = $(selector)
    var els = new $
    this.each(function() {
        (function loop(node) {
            if (!node) return
            if (_els.indexOf(node) != -1) {
                els.push(node)
            } else {
                loop(node.parentNode)
            }
        })(this)
    })
    return els
}
$.fn.find = function(selector) {
    var _els = $(selector)
    var els = new $
    this.each(function() {
        (function loop(node) {
            var childNodes = node.childNodes
            for (var i = 0; i < childNodes.length; i++) {
                var node = childNodes[i]
                if (_els.indexOf(node) != -1) {
                    els.push(node)
                }
                loop(node)
            }
        })(this)
    })
    return els
}
$.fn.addClass = function(className) {
    var classNames = className.trim().split(/ +/)
    return this.each(function() {
        var classList = this.classList
        for (var i = 0; i < classNames.length; i++) {
            classList && classList.add(classNames[i])
        }
    })
}
$.fn.removeClass = function(className) {
    var classNames = className.trim().split(/ +/)
    return this.each(function() {
        var classList = this.classList
        for (var i = 0; i < classNames.length; i++) {
            classList && classList.remove(classNames[i])
        }
    })
}
$.fn.css = function(arg, val) {
    var item = this[0]
    if (!item) return

    if (val !== undefined) {
        var key = arg
        arg = {}, arg[key] = val
    }

    // set
    if (typeof arg == 'object') {
        return this.each(function() {
            var style = this.style
            for (var name in arg) {
                style['-webkit-' + name] = arg[name]
                style['-moz-' + name] = arg[name]
                style['-ms-' + name] = arg[name]
                style['-0-' + name] = arg[name]
                style[name] = arg[name]
            }
        })
    }
    // get
    else {
        var style = getComputedStyle(item, null)
        var value =
            style['-webkit-' + arg] ||
            style['-moz-' + arg] ||
            style['-ms-' + arg] ||
            style['-o-' + arg] ||
            style[arg]

        return arg ? value : style
    }

}
$.fn.show = function(className) {
    this.each(function() {
        $(this).css('display', '')
        if ($(this).css('display') == 'none') {
            $(this).css('display', 'block')
        }
    })
    if (className) {
        this.addClass(className)
            .delay(this.css('animation-duration'))
            .removeClass(className)
    }
    return this
}
$.fn.hide = function(className) {
    if (className) {
        this.addClass(className)
            .delay(this.css('animation-duration'))
            .removeClass(className)
    }
    return this.css('display', 'none')
}
$.fn.on = function(eventType, cb) {
    var _this = this
    document.addEventListener(eventType, function(e) {
        var el = $(e.target).closest(_this.selector)[0]
        if (el) {
            cb.call(el, e)
        }
    })
    return this
}