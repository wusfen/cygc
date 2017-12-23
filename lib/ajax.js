/**
 * wushufen 20171222
 * ajax
 */
;
(function() {
    function ajax(options) {
        if (!options.type) options.type = 'GET';
        if (options.async === undefined) options.async = true;
        if (!options.url) options.url = '';
        if (ajax.base && !ajax.base.match(/[/\\]$/)) ajax.base = ajax.base + '/';
        if (!options.url.match('://')) options.url = ajax.base + options.url;

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            // console.log(xhr.readyState, xhr.status, xhr.responseText);
            if (xhr.readyState == 4) {
                if (xhr.status == 0 || xhr.status == 200 || xhr.status == 304) {
                    var req = xhr.responseText;
                    try { req = JSON.parse(req); } catch (e) {}
                    options.success && options.success(req);
                } else {
                    if (options.error) {
                        options.error(xhr);
                    }else if(ajax.error){
                        ajax.error(xhr);
                    }
                }
            }
        };


        xhr.open(options.type, options.url, options.async);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.send();

        return xhr
    }
    ajax.base = '';

    ajax.post = function (options) {
        options.type = 'POST';
        return ajax(options)
    };
    ajax.get = function (options) {
        options.type = 'GET';
        return ajax(options)
    };

    // export
    if (typeof define != 'undefined' && (define.cmd || define.amd)) {
        define(function(require, exports, module) {
            return module.exports = ajax
        });
    } else
    if (typeof window != 'undefined') {
        window.ajax = ajax;
        if (typeof $ == 'undefined') {
            $ = {
                ajax: ajax
            };
        }
    }
})();