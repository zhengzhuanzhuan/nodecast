# nodecast

> 一个基于 Node.js + MySQL 开发的多人社区论坛

## 案例编写步骤

- git clone https://github.com/lipengzhou/nodecast.git
- npm install 安装依赖
- nodemon app.js 启动
- 提取 router.js
- 编写处理注册请求的路由
  + post /register
- 封装 db-helper.js
  + 提供一个 query 方法
  + Object.assign() 合并对象
  + apply
    * apply 必须指定上下文
    * 没有就给 null
    * 但是我们给了 null 发现破坏了 connection.query 方法内部的 this 指向
  + EcmaScript 6 中的数组展开语法 ...数（伪）组
    * 不需要指定 this
    * pure pure 的展开数组，不会改 this 指向
  + 一定要在每一次 query 方法内部都动态的买驴: `mysql.createConnection(Object.assign(config.db, {}))  `
- // 1. 获取表单数据
-    配置 body-parser 来帮我们解析表单请求体数据
- 2. 验证客户端数据
-    基本的数据验证 使用一个第三方包：validator 辅助验证
-    基本的业务验证
-      邮箱是否重复
-      昵称是否重复
- 3. 存储到数据库
- 4. 创建成功，存储用户登陆状态
    - 配置 express-session 在 Express 中使用 Session
- 5. 发送成功响应

## 需求分析

## 数据库设计

- users 用户表
- topics 话题表
- topic_cotegorries 话题分类表
- topic_comments 话题评论表

### users 用户表

| 字段 | 类型 | 长度 |   含义   | 是否为 null | 默认值 |      备注      |
|------|------|------|----------|-------------|--------|----------------|
| id   | int  |      | 唯一标识 | 否          |        | 主键，自动增长 |
|      | -    |      |          |             |        |                |

### topics 话题表

### topic_cotegorries 话题分类表

### topic_comments 话题评论表

## 路由设计

所谓的路由就是把不同请求分发的具体处理函数。

|    请求方法    |  请求路径 |     作用     | 查询参数 |          请求体           | 备注 |
|----------------|-----------|--------------|----------|---------------------------|------|
| GET            | /         | 渲染首页     |          |                           |      |
| GET            | /register | 渲染注册页面 |          |                           |      |
| POST           | /register | 处理注册请求 |          | email、nickname、password |      |
| GET            | /login    | 渲染登陆页面 |          |                           |      |
| POST           | /login    | 处理登陆请求 |          | email、password           |      |
| /topic/new     |           | 创建话题     |          |                           |      |
| /topic?id=xxxx |           | 查看话题     |          |                           |      |
|                |           | 修改话题     |          |                           |      |
|                |           | 删除话题     |          |                           |      |
|                |           | 搜索话题     |          |                           |      |
|                |           | 创建评论     |          |                           |      |
|                |           | 修改评论     |          |                           |      |
|                |           | 删除评论     |          |                           |      |
|                |           | 评论列表展示 |          |                           |      |
|                |           | 修改个人信息 |          |                           |      |
|                |           | 修改密码     |          |                           |      |
|                |           | 注销账户     |          |                           |      |
|                |           |              |          |                           |      |

```javascript
app.get('/', (req, res) => {
  
})

app.post('/', (req, res) => {
  
})

app.put('/', (req, res) => {
  
})

app.patch('/', (req, res) => {
  
})

app.delete('/', (req, res) => {
  
})
```

## 开始

### 导入数据表

把项目根目录下的 `nodecast.sql` 导入自己的数据库。

### 项目初始化

- 创建远程仓库
- 添加 .gitignore 文件
  + 设置忽略 node_modules、.idea
- 初始化 pacakge.josn
- 安装 express
- 创建 app.js 启动一个响应 hello world 的服务
- 创建 config.js 配置文件
  + 作用：把可能需要变化的数据存储到配置文件中
  + 随着业务功能的不断开发，配置文件会一段不断的增加内容

### 导入模板静态页

### 抽取路由模块
