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
`dbs.sina.clean(string RegExp, ...index)`