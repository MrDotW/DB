
window.onload = setTimeout(function () {
  ext.runtime.sendMessage(["cleanWeiboCmts"])
}, 3000);

ext.runtime.onMessage.addListener(function (msg) {
  if (msg[0] == "cleanAll") {
    var i = document.querySelectorAll("a.page.S_txt1");
    i = parseInt(i[i.length - 2].innerText);
    var p = location.search ? location.search.replace(/.+?(\d+)/, "$1") : 1
    if (p <= i) {
      var as = document.querySelectorAll("a[action-type=delComment]");
      var l = as.length;
      i = 0;
      var del = function (a) {
        a.click();
        setTimeout(function () { document.querySelector("a.W_btn_a.btn_34px").click() }, 500)
        setTimeout(function () { (++i < l) && del(as[i]) }, 600)
      }
      if (l) {
        del(as[i]);
        setTimeout(function () { location.replace(`http://weibo.com/comment/outbox?page=${p}`) }, 1100 * l + 2000)
      } else {
        p++;
        location.replace(`http://weibo.com/comment/outbox?page=${p}`)
      }
    }
  }
})