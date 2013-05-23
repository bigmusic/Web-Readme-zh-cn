/*!
 * Connect
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 *
 * 这个connect.js是整个框架的构建和初始化
 * 它的输出既是一个函数,也是一个对象(当然函数也是一个对象)
 * 函数最后会返回一个对象,和本身输出的这个对象
 * 有大部分相同的方法,比如proto里面的use等
 * 既可以用connect.proto.use,也可以app=connect()后用app.use
 */

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter
  , proto = require('./proto')
  , utils = require('./utils')
  , path = require('path')
  , basename = path.basename
  , fs = require('fs');

// node patches

require('./patch');

// expose createServer() as the module
// 将createServer函数export,用户就可以调用connect()
// 并返回一个函数对象

exports = module.exports = createServer;

/**
 * Framework version.
 */

exports.version = '2.7.10';

/**
 * Expose mime module.
 */

exports.mime = require('./middleware/static').mime;

/**
 * Expose the prototype.
 * 把proto输出到connect.proto
 */

exports.proto = proto;

/**
 * Auto-load middleware getters.
 * 初始化一个middleware属性为一个空对象
 */

exports.middleware = {};

/**
 * Expose utilities.
 * 输出utils工具集,让用户可以用到merge等等方法
 */

exports.utils = utils;

/**
 * Create a new connect server.
 * 当用户调用connect(),就返回一个函数对象
 * 合并proto.js里export的属性方法,和EventEmitter的prototype到这个对象
 * 包括use,set,handle等等和一切Node.js的事件对象原型中的属性方法
 *
 * @return {Function}
 * @api public
 */

function createServer() {
  
  //此为执行connect()返回的函数对象app,当原生http.createServer将其作为Callback调用时
  //会执行proto.js里面定义的handle方法,
  //同时http.createServer执行这个callback时会传入req,res,next参数
  function app(req, res, next){ app.handle(req, res, next); }  
  
  //合并proto.js里export的属性方法,和EventEmitter的prototype到app对象
  utils.merge(app, proto);
  utils.merge(app, EventEmitter.prototype);
  
  //初始化route为'/',stack为加载middleware的堆栈,初始化为一个数组,作为返回对象app的属性
  app.route = '/';
  app.stack = [];
  
  //如果运行connect()的时候有参数,就用use方法把所有参数引用的middleware放进app.stack
  //这种方式好像已经没人用了...
  for (var i = 0; i < arguments.length; ++i) {
    app.use(arguments[i]);
  }
  
  //最后返回整个初始化好的app
  return app;
};

/**
 * Support old `.createServer()` method.
 * 支持旧有的createServer()方法
 */

createServer.createServer = createServer;

/**
 * Auto-load bundled middleware with getters.
 * 自动读取middleware目录里面的所有js文件
 * 以文件的名字为属性名,分别export到connect这个对象
 * 比如读到session.js,
 * 就就有export.session,
 * 内容为require(session.js)
 * 用户就可以调用connect.session了
 */

fs.readdirSync(__dirname + '/middleware').forEach(function(filename){
  if (!/\.js$/.test(filename)) return;
  var name = basename(filename, '.js');
  function load(){ return require('./middleware/' + name); }
  exports.middleware.__defineGetter__(name, load);
  exports.__defineGetter__(name, load);
});
