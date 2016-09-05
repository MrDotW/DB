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
            case "cleanCmts":
                ext.ajax("http://m.weibo.cn/msg/mycmts?subtype=myComent&format=cards&page=1").then(function (xml) {
                    xml = xml.response;
                    if (xml) {
                        var cln = function (p, k) {
                            (--p > ++k) && ext.ajax(`http://m.weibo.cn/msg/mycmts?subtype=myComent&format=cards&page=${k}`).then(function (xml) {
                                xml = xml.response;
                                if (xml) {
                                    xml = JSON.parse(xml)[0].card_group;
                                    var j = xml.length;
                                    if (j) {
                                        xml.forEach(function (d, i) {
                                            setTimeout(function () {
                                                ext.ajax(
                                                    "http://m.weibo.cn/commentDeal/cmtDel",
                                                    null,
                                                    "post",
                                                    { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
                                                    null,
                                                    "cmtId=" + d.id
                                                ).then(function () { --j || setTimeout(function () { cln(p, k) }, ext.delay(3)) })
                                            }, ext.delay(i));
                                        })
                                    } else {
                                        setTimeout(function () { cln(p, k) }, ext.delay(1))
                                    }
                                }
                            }, function (xml) { console.log(xml) }
                            )
                        }
                        cln(JSON.parse(xml)[0].maxPage, 1)
                    }
                });
                break;


            default: console.log(msg);
        }
    });
})();




