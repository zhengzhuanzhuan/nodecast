const express = require('express')
const artTemplate = require('express-art-template')
const config = require('./config')
const path = require('path')
const router = require('./router')
const bodyParser = require('body-parser')
const session = require('express-session')

const app = express()

// 开放静态资源
app.use('/public/', express.static(path.join(__dirname, './public/')))
app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')))

// 配置使用 art-template 模板引擎
app.engine('html', artTemplate)

// 配置 body-parser 解析表单 post 请求体
// 只要配置了该插件，则我们就可以在后续的请求处理函数中通过 req.body 来访问请求体数据
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// 该插件会为 req 请求对象添加一个成员：req.session 默认是一个对象
// Session 是为了解决 Cookie 的安全性不足而设计的一种方式
// Session 是基于 Cookie 实现的，没有 Cookie 就没有 Session
// 存 Session
//   req.session.xxx = xxx
// 取 Session
//   req.session.xxx
// 目前服务器只是内存存储 Session 数据，所以一旦服务器重启就会丢失 Session 数据
// 后面我们在把 Session 数据进行持久化存储，例如存储到 mysql 数据库中
app.use(session({
  // 配置加密字符串，它会在原有加密基础之上和这个字符串拼起来去加密
  // 目的是为了增加安全性，防止客户端恶意伪造
  secret: 'itcast',
  resave: false,
  saveUninitialized: true // 无论你是否使用 Session ，我都默认直接给你分配一把钥匙
}))

// HTTP 是无状态
// 服务器根本记不住谁是谁

// body-parser 的配置一定要在 app.use(router) 之前
// 加载使 router 生效
app.use(router)

app.listen(config.port, () => {
  console.log(`App is running at port ${config.port}.`)
  console.log(`  Please visit http://127.0.0.1:${config.port}/`)
})
