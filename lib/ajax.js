/**
 * wushufen 20171228
 * 
 */
/*

ajax.base = 'server/path'
url:[?&#]ajaxLocal

xhr = ajax({
    url: 'url',
    local: 'data/x.json',
    type: 'get',
    success: function(res){ // json auto parse
    
    },
    error: function(xhr){
    
    }
})

ajax.post(options)
ajax.get(options)

*/
;
(function() {
    function ajax(options) {

        // args
        if (!options.url) options.url = '';
        if (ajax.base && !ajax.base.match(/[/\\]$/)) ajax.base = ajax.base + '/';
        if (!options.url.match('://')) options.url = ajax.base + options.url;
        if (!options.type) options.type = 'GET';
        if (options.async === undefined) options.async = true;

        var xhr = new XMLHttpRequest();

        // handle
        xhr.onreadystatechange = function() {
            // console.log(xhr.readyState, xhr.status, xhr.responseText);
            if (xhr.readyState != 4) return;

            // success
            if (xhr.status == 0 || xhr.status == 200 || xhr.status == 304) {

                var req = xhr.responseText;
                try { req = JSON.parse(req) } catch (e) {};
                options.success && options.success(req);

            }
            // error
            else {

                if (options.error) {
                    options.error(xhr);
                } else if (ajax.error) {
                    ajax.error(xhr);
                }

            }
        };

        // data
        var searchArr = [];
        var data = options.data || {};
        data._t_ = new Date().getTime();
        for (var key in data) {
            searchArr.push(key + '=' + data[key]);
        }
        var searString = searchArr.join('&');

        // send
        xhr.open(
            options.type.toUpperCase(),
            location.href.match(/[?&#]ajaxLocal/i) && options.local ? options.local : options.url + '?' + searString,
            options.async
        );
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.send(searString);

        return xhr
    }

    ajax.base = '';

    ajax.post = function(options) {
        options.type = 'POST';
        return ajax(options)
    };
    ajax.get = function(options) {
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