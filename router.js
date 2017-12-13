// 0. 引入 express
const express = require('express')
const validator = require('validator')
const db = require('./db-helper')
const md5 = require('blueimp-md5')
const marked = require('marked')

// 1. 调用 express.Router() 方法，得到一个路由容器
const router = express.Router()

// 2. 为路由容器添加路由
router.get('/', (req, res) => {
  res.render('index.html', {
    user: req.session.user
  })
})

router.get('/login', (req, res) => {
  res.render('login.html')
})

router.get('/register', (req, res) => {
  res.render('register.html')
})

router.post('/register', (req, res) => {
  // 1. 获取表单数据
  //    配置 body-parser 来帮我们解析表单请求体数据
  // 2. 验证客户端数据
  //    基本的数据验证 使用一个第三方包：validator 辅助验证
  //    基本的业务验证
  //      邮箱是否重复
  //      昵称是否重复
  // 3. 存储到数据库
  // 4. 发送响应
  // console.log(req.body)
  const body = req.body
  if (!body.email || validator.isEmpty(body.email) || !validator.isEmail(body.email)) {
    return res.json({
      code: 400, // 客户端错误
      message: 'email invalid'
    })
  }

  if (!body.nickname || validator.isEmpty(body.nickname)) {
    return res.json({
      code: 400, // 客户端错误
      message: 'nickname invalid'
    })
  }

  if (!body.password || validator.isEmpty(body.password)) {
    return res.json({
      code: 400, // 客户端错误
      message: 'password invalid'
    })
  }

  // 验证邮箱是否已占用
  db.query('SELECT * FROM users WHERE email=?', [body.email], function (err, data) {
    if (err) {
      return console.log('操作失败')
    }
    // 有表示被已存在
    if (data[0]) {
      return res.json({
        code: 1,
        message: 'email already exists'
      })
    }

    // 验证昵称是否被占用
    db.query('SELECT * FROM users WHERE nickname=?', [body.nickname], function (err, data) {
      if (err) {
        return console.log('操作失败')
      }
      // 有表示被已存在
      if (data[0]) {
        return res.json({
          code: 2,
          message: 'nickname already exists'
        })
      }

      // 业务数据校验通过，创建用户
      db.query('INSERT INTO users SET ?', {
        email: body.email,
        password: md5(md5(body.password)), // md5 加密处理，Node 有个原生模块 crypto 可以用来处理加密
        nickname: body.nickname,
        avatar: 'avatar-max-img.png',
        createdAt: new Date, // 日期类型直接给一个日期对象，mysql 会帮你把日期对象转为日期格式字符串
        updatedAt: new Date
      }, function (err, data) {
        if (err) {
          return res.json({
            code: 500,
            message: `Server Error: ${err.message}`
          })
        }

        // 登陆成功之前，在 Session 中存储用户的登陆状态
        // req.session.user = true
        // 注册成功，把用户的完整信息存储到 Session 中
        db.query('SELECT * from users WHERE id=?', [data.insertId], function (err, ret) {
          if (err) {
            return res.json({
              code: 500,
              message: `Server Error: ${err.message}`
            })
          }
          req.session.user = ret[0]
          res.json({
            code: 0,
            message: 'ok'
          })
        })
      })
    })
  })
})

router.get('/logout', (req, res) => {
  // 清除用户的登陆状态
  // 清除 Session 即可
  delete req.session.user
  res.redirect('/login')
})

router.post('/login', (req, res) => {
  // 1. 接收表单数据
  // 2. 验证
  //    基本的数据校验
  //    业务数据校验
  // 3. 校验通过，就登陆
  //    校验失败，告诉用户
  const body = req.body
  const sqlStr = 'SELECT * FROM `users` WHERE `email`=? AND `password`=?'
  db.query(sqlStr, [body.email, md5(md5(body.password))], function (err, ret) {
    if (err) {
      return res.json({
        code: 500,
        message: err.message
      })
    }
    const user = ret[0]
    if (!user) {
      return res.json({
        code: 404,
        message: 'login failed'
      })
    }
    // 校验成功，记录登陆状态，告诉客户端登陆成功了
    req.session.user = user
    res.json({
      code: 0,
      message: 'ok'
    })
  })
})

router.get('/topic/new', (req, res) => {
  // 该页面的访问必须具有登陆状态
  if (!req.session.user) {
    return res.redirect('/login')
  }
  const sqlStr = 'SELECT * FROM `topic_categories`'
  db.query(sqlStr, (err, ret) => {
    if (err) {
      return res.json({
        code: 500,
        err: err.message
      })
    }
    res.render('topic/new.html', {
      topicCategories: ret
    })
  })
})

router.post('/topic/new', (req, res) => {
  // 1. 接收表单数据
  // 2. 验证
  // 3. 保存
  // 4. 发送响应
  const body = req.body
  Object.assign(body, {
    userId: req.session.user.id,
    createdAt: new Date,
    updatedAt: new Date
  })
  const sqlStr = 'INSERT INTO topics SET ?'
  db.query(sqlStr, body, function (err, ret) {
    if (err) {
      return res.json({
        code: 500,
        message: err.message
      })
    }
    res.json({
      code: 0,
      message: 'ok',
      topicId: ret.insertId // 把刚刚创建的话题 id 发送给客户端，客户端去跳转到话题详情页
    })
  })
})

// /topic/* 都会被下面的路由给
// * 是动态的，我们这样设计的 url 非常的简洁
// 我希望得到这个 * 的具体内容，所以路由就可以这样来设计
// :id 就表示是动态的，任意的，id 只是起了一个名字，接下来我们就可以通过 req.params 来获取这个参数了
// /topic/a/b 必须是 /topic/a/b 严格匹配
// /topic/:id 必须是 /topic/*   模糊匹配
// /topic/:id/edit
router.get('/topic/:topicId', (req, res) => {
  const sqlStr = 'SELECT * FROM `topics` WHERE `id`=?'
  db.query(sqlStr, [req.params.topicId], function (err, ret) {
    if (err) {
      return res.json({
        code: 500,
        message: err.message
      })
    }
    const topic = ret[0]

    // 把话题的 markdown 格式内容转换为 html
    if (topic) {
      topic.content = marked(topic.content)
    }

    res.render('topic/show.html', {
      topic,
      user: req.session.user
    })
  })
})

// /topic/1/delete
router.get('/topic/:topicId/delete', (req, res) => {
  // 必须登陆了
  // 而且要删除的文章的作者必须是当前登陆用户
  const user = req.session.user
  const topicId = req.params.topicId

  // 如果没有登陆，不允许操作删除
  if (!user) {
    return res.json({
      code: 400,
      message: 'no authorize'
    })
  }

  db.query('SELECT * FROM `topics` WHERE `id`=?', [topicId], (err, ret) => {
    if (err) {
      return res.json({
        code: 500,
        message: err.message
      })
    }

    const topic = ret[0]

    // 如果被删除的资源已不存在
    if (!topic) {
      return res.json({
        code: 404,
        message: 'topic not exists'
      })
    }

    // 如果该资源作者不属于当前登陆用户
    if (topic.userId !== user.id) {
      return res.json({
        code: 400,
        message: 'no authorize'
      })
    }

    // 验证通过，执行删除
    db.query('DELETE FROM `topics` WHERE `id`=?', [req.params.topicId], (err, ret) => {
      if (err) {
        return res.json({
          code: 500,
          message: err.message
        })
      }
      res.redirect('/')
    })
  })
})

router.get('/topic/:topicId/edit', (req, res) => {
  db.query('SELECT * FROM `topic_categories`', (err, categories) => {
    if (err) {
      return res.json({
        code: 500,
        message: err.message
      })
    }
    db.query('SELECT * FROM `topics` WHERE `id`=?', [req.params.topicId], (err, ret) => {
      if (err) {
        return res.json({
          code: 500,
          message: err.message
        })
      }
      res.render('topic/edit.html', {
        user: req.session.user,
        topic: ret[0],
        categories
      })
    })
  })
})

// 3. 导出路由容器对象
//    然后在 app.js 中通过 app.use(router) 来使 router 生效
module.exports = router
