const mysql = require('mysql')
const config = require('./config')

// 当前的数据库连接操作方案：卸磨杀驴
exports.query = function () {
  const connection = mysql.createConnection(Object.assign(config.db, {}))  
  connection.connect()
  // 你调用 query 方法传递什么参数就会原样的传递给 connection.query 方法
  // 好处就是，当有一天 connection.query 方法参数形式改变了，我们这里的代码不用动
  // 只需要修改我们最终的调用的位置即可

  // ...变量 叫做展开操作符
  // 我们自己的 query 方法的参数会原封不动的继续传递给 connection.query 方法
  // 这里这样做的原因主要是 connection.query 方法的参数不固定
  connection.query(...arguments)
  // 关闭连接
  connection.end()
}

// 推荐的方案：连接池
// 提前创建好一些连接，放到一个池子中（容器）
