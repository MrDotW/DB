# DB

## Config

* Data Fetch Frequency
`ext.delay.d=10`

## Weibo

1. Backup data  
`dbs.sina.init()`
2. Export data  
`dbs.sina.out(userID, string RegExp, ...index)`
3. Show image list  
`dbs.sina.img(userID, string RegExp, ...index)`
4. Clean Weibo  
must open [m.weibo.com](http://m.weibo.com) first  
`dbs.sina.clean(string RegExp, ...index)`
5. Clean comments  
must open [m.weibo.com](http://m.weibo.com) first   
`dbs.sina.clnCmts()`

## Douban

1. Clean blogs  
must open [我的广播](https://www.douban.com/people/${User}}/statuses) first  
`dbs.douban.clnSt(...types)`