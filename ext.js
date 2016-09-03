"use strict";
var ext;
(function () {
    if (Window.hasOwnProperty("browser")) {
        ext = browser;
        ext.app = chrome.app;
    } else {
        ext = chrome;
    }

    ext.ajax = function (url, args, method = "GET", header, type, cnt) {
        return new Promise(function (thn, cth) {
            method = method.toUpperCase();
            ext.ajax.host && (url = ext.ajax.host + url);
            //if(args&&(new Set(["PUT","POST"])).has(method)){
            if (args && (method == "PUT" || method == "POST")) {
                var mps = [];
                for (let i in args) {
                    args.hasOwnProperty(i) && mps.push(encodeURIComponent(i) + "=" + encodeURIComponent(x[i]));
                }
                mps.length && (url += "?" + mps.join("&"))
            }
            var xml = new XMLHttpRequest;

            xml.open(method, url);
            
            type && (xml.responseType = type);
            xml.timeout = 15000;
            xml.ontimeout = function () {
                xml.abort();
                ext.ajax(url, null, method, header, cnt)
            }
            if (header) {
                for (let i in header) {
                    xml.setRequestHeader(i, header[i])
                }
            }
            xml.onload = function () {
                if (xml.status >= 200 && xml.status < 300) {
                    thn(xml)
                } else {
                    xml.onerror();
                }
            }
            xml.onerror = function () {

                localStorage.setItem(
                    new Date().toJSON(),
                    JSON.stringify(
                        xml.status == 403
                            ? url
                            : (setTimeout(
                                function () { ext.ajax(url, null, method, header, type, cnt) },
                                ext.delay(1)
                            ),
                                xml.status)
                    )
                )
                //cth(xml)
            };
            xml.send(method == "GET" ? null : cnt || null);
        })
    };
    ext.delay = function (i) {
        i = i || ext.delay.d || 1;
        return (Math.random() + 1) * 1000 * i
    }
    ext.delay.d=60;
})()
