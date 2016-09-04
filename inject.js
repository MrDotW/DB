"use strict";


(function () {
    ext.runtime.onMessage.addListener(function (msg) {
        switch (msg[0]) {
            case "do":
                var id = localStorage.getItem("H5_UID");
                if (id) {
                    msg[0] = "cleanAll";
                    msg.push(id);
                    id && ext.runtime.sendMessage(msg);
                }
                break;
            case "cleanAll":
                msg[1] && msg[1].forEach(function (d, i) {// 
                    setTimeout(function () {
                        ext.ajax(
                            "http://m.weibo.cn/mblogDeal/delMyMblog",
                            null,
                            "post",
                            { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
                            null,
                            "id=" + d.id
                        ).then(m => console.log(m.response))
                    }, ext.delay(i / 12))
                })
                break;
            default: console.log(msg);
        }
    });
})();
