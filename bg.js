"use strict";
var ls = {//window.addEventListener("storage",function(e){console.log(e)},false)
    get: function (key) {
        key = localStorage.getItem(key);
        return key ? JSON.parse(key) : null;
    },
    si: function (k, v) {
        localStorage.setItem(k, JSON.stringify(v));
    },
    set: function (key, value) {
        switch (typeof key) {
            case "string":
                return value ? (ls.si(key, value), true) : false;
            case "object":
                for (let i in key) {
                    ls.si(i, key[i])
                };
                return true;
        }
    },
    put: function (key, value) {
        var d = ls.get(key);
        if (d) {
            for (let i in value) {
                d[i] = value[i]
            }
            value = d;
        }
        ls.si(key, value);
    }
};
var dbs = {
    sina: {
        key: "id",
        idx: [],//name nm unique
        init: function () {
            ls.get("sina") || ls.set("sina", {});
            ext.ajax("http://m.weibo.cn/home/me?format=cards").then(
                function (res) {
                    res = JSON.parse(res.response)[0].card_group[0].user;
                    iDB.init("sina", res.id, 1).then(function () {
                        var f = ls.get("sina")[res.id];
                        if (!f) {
                            f = {};
                            f[res.id] = [1, false, Math.ceil(res.mblogNum / 10)];
                            ls.put("sina", f);
                            f = f[res.id];
                        }
                        dbs.sina.get(res.id, f[0], f[2], f[1])

                    })
                },
                function (status) {
                    (status == 0) && ext.tabs.create({
                        url: "https://passport.weibo.cn/signin/welcome"
                    })
                })
        },
        format: function (dat, flag) {

            (flag !== false) && (dat = dat.mblog);

            var uid = dat.user.id,
                re = {
                    tim: dat.created_timestamp,
                    id: dat.id,
                    bid: dat.bid,
                    mid: dat.mid,
                    src: dat.source
                };
            dat.text && (re.txt = dat.text);
            dat.url_struct && (re.url = dat.url_struct.map(i => i.ori_url));
            dat.topic_struct && (re.tags = dat.topic_struct.map(i => i.topic_title));
            dat.pics && (re.pics = dat.pics.map(i => i.url.replace(/(^.*\/).*(\/.*$)/, "$1large$2")));
            dat.comments_count && (re.cmt_n = dat.comments_count);
            dat.like_count && (re.like = dat.like_count);
            dat.reposts_count && (re.rt_n = dat.reposts_count);

            flag !== false && re.cmt_n && dbs.sina.cmtget(uid, re.id)


            dat.retweeted_status && (re.rt = dbs.sina.format(dat.retweeted_status, false));

            if (flag === true) {
                iDB.put("sina", uid, re);
            } else {
                return re
            }
        },
        cmtget: function (uid, cid, page = 1, cmts = { id: uid, cmts: [] }) {
            var l = ls.get("sina_cmts") || {}, s = new Set(l[uid] || null);
            if (!s.has(cid)) {
                s.add(cid);
                l[uid] = Array.from(s);
                ls.set("sina_cmts", l);
            }


            ext.ajax(`http://m.weibo.cn/${uid}/${cid}/rcMod?format=cards&type=comment&hot=1&page=${page}`).then(
                function (xml) {
                    xml = JSON.parse(xml.response)[0];
                    if (xml.card_group) {

                        xml.card_group.forEach(function (i) {
                            var c = {
                                tim: new Date(i.created_at).getTime() / 1000,
                                src: i.source,
                                id: i.id,
                                usr: {
                                    id: i.user.id,
                                    name: i.user.screen_name
                                }
                            };
                            i.text && (c.txt = i.text);
                            i.reply_id && (c.re_id = i.reply_id);
                            i.reply_text && (c.re_txt = i.reply_text);
                            i.pic && (c.pic = i.pic.url);
                            i.like && (c.like = i.like_counts);
                            cmts.cmts.push(c);
                        });
                        if (xml.loadMore) {
                            (setTimeout(function () {
                                cmtget(uid, cid, ++page, cmts);
                            }, ext.delay(3)))
                        } else {
                            iDB.put("sina", uid, cmts);
                            var l = ls.get("sina_cmts") || {}, s = new Set(l[uid] || null);
                            if (s.has(cid)) {
                                s.delete(cid);
                                l[uid] = Array.from(s);
                                ls.set("sina_cmts", l);
                            }
                        }
                    }
                });

        },
        get: function (id, i = 1, k, flag) {
            var don = function () {
                if (flag || i >= k) {
                    t[id] = [1, true, k, new Date().getTime()];
                    ls.put("sina", t);
                } else {
                    ls.set(new Date().toJSON(), "DONE");
                    dbs.sina.get(id, i, k, flag);
                }
            };
            var mor = function () {
                t[id] = [++i, flag, k];
                ls.put("sina", t);
                (setTimeout(function () {
                    dbs.sina.get(id, i, k, flag);
                }, ext.delay(5)))
            };
            if (i > 0) {
                var t = {};
                ext.ajax(`http://m.weibo.cn/index/my?format=cards&page=${i}`).then(function (data) {
                    var j = 0;
                    data = JSON.parse(data.response);
                    while (data[j] && data[j].mod_type != "mod/pagelist") {
                        j++
                    }
                    data = data[j] ? data[j].card_group : null;
                    if (data) {
                        data = data.map(dbs.sina.format);
                        if (i < k && data.length < 10) {//
                            don();
                        } else if (flag) {//check data
                            iDB.get("sina", id, data[0].id).then(function (res) {
                                if (res[0]) {
                                    i && don()
                                } else {
                                    iDB.put("sina", id, data);
                                    mor()
                                }
                            });
                        } else {
                            iDB.put("sina", id, data);
                            mor();
                        }
                    } else {
                        don()
                    }
                })
            }
        },
        out: function (id) {
            var usr = ls.get("sina")[id];
            if (usr) {
                var dat = {
                    usr: [id, usr[2], new Date().toJSON()],
                    blogs: []
                };
                iDB.obj("sina", dat.usr[0], "readonly").then(function (obj) {
                    obj = obj.openCursor();
                    var nxt = function (evt) {
                        evt = evt.target.result;
                        if (evt) {
                            dat.blogs.push(evt.value);
                            evt.continue();
                            evt.onsuccess = nxt;
                        } else {
                            ext.tabs.create({
                                url: "data:application/json," + JSON.stringify(dat)
                            })
                        }
                    }
                    obj.onsuccess = nxt;

                })
            } else {
                console.log("Nothing...")
            }
        },
        clean: function () { }
    }
};
var iDB = {
    init: function (dbnm, tb, ver) {
        return new Promise(function (thn, cth) {
            var re = indexedDB.open(dbnm, ver || 1);
            re.onsuccess = function (evt) {
                thn(dbs[dbnm].re = evt.target.result);
            }
            re.onupgradeneeded = function (evt) {
                var tmp = dbs[dbnm];
                var db = evt.target.result;
                var obj = db.createObjectStore(tb, { keyPath: tmp.key });
                if (tmp.idx) {
                    for (let i of tmp.idx) {
                        obj.createIndex(i[0], i[1] || i[0], { unique: i[2] })
                    }
                }
            }
        });

    },
    d: function (data) {
        return Array.isArray(data) ? data : [data];
    },
    obj: function (dbnm, tb, method) {

        return new Promise(function (thn, cth) {
            if (dbs[dbnm].re) {
                thn(dbs[dbnm].re.transaction([tb], method).objectStore(tb));
            } else {
                iDB.init(dbnm, tb).then(re => thn(re.transaction([tb], method).objectStore(tb)));
            }
        })
    },
    add: function (dbnm, tb, data) {
        iDB.obj(dbnm, tb, "readwrite").then(obj => { for (let i of iDB.d(data)) { obj.add(i) } });
    },
    put: function (dbnm, tb, data) {
        iDB.obj(dbnm, tb, "readwrite").then(obj => {
            for (let i of iDB.d(data)) {
                obj.get(i[obj.keyPath]).onsuccess = function (evt) {
                    evt = evt.target.result;
                    if (evt) {
                        for (let j in evt) {
                            i[j] = evt[j]
                        }
                    }
                    obj.put(i);
                }
            }
        });
    },
    del: function (dbnm, tb, keys) {
        iDB.obj(dbnm, tb, "readwrite").then(obj => { for (let i of iDB.d(data)) { obj.delete(i) } });
    },
    get: function (dbnm, tb, keys) {
        return new Promise(function (thn, cth) {
            iDB.obj(dbnm, tb, "readonly").then(obj => {
                var res = {}, l;
                if (Array.isArray(keys)) {
                    l = keys.length;
                } else {
                    l = 1;
                    keys = [keys];
                }
                var n = 0;

                for (let i in keys) {
                    obj.get(keys[i]).onsuccess = function (evt) {
                        res[i] = evt.target.result;
                        if (++n == l) {
                            thn(res)
                        }
                    }
                }
            })

        })

    }
};

(function () {


})();