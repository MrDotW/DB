"use strict";

var clnStt = function (f) {//location.replace("https://www.douban.com/people/MrDoubleU/statuses?p=3")
    f = new Set(f);
    var divs = document.querySelectorAll(".stream-items .status-item");
    var l = divs.length;
    var n = 0, i = -1;
    var r = function () {
        if (++i < l) {
            var div = divs[i], v = div.querySelector("input");

            if ((!f || f.has(div.dataset.targetType)) && v) {
                ext.ajax(
                    "https://www.douban.com/j/status/delete",
                    null,
                    "post",
                    { "Content-Type": "application/x-www-form-urlencoded" },
                    null,
                    "sid=" + div.dataset.sid + "&ck=" + v.value
                ).then(function () {
                    setTimeout(r, ext.delay(1));
                })
            } else {
                n++;
                r()
            }
        } else {
            if (n < l) {
                location.reload()
            } else {
                n = parseInt(location.search.replace("?p=", ""), 10) || 0;
                n++;
                location.replace(location.origin + location.pathname + "?p=" + n)
            }
        }
    }
    r();
};

(function () {
    ext.delay.d = 2;
    ext.runtime.onMessage.addListener(function (msg) {
        switch (msg[0]) {
            case "cleanStatus":
                localStorage.setItem("cleanStatus", JSON.stringify([true, msg[1]]))
                clnStt(msg[1]);
                break;
            default: console.log(msg);
        }
    });
    var f = localStorage.getItem("cleanStatus");
    f && (f = JSON.parse(f)) && f[0] && clnStt(f[1]);
})();




