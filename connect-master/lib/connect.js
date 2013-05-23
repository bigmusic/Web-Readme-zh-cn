/*!
 * Connect
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
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
 */

exports.proto = proto;

/**
 * Auto-load middleware getters.
 */

exports.middleware = {};

/**
 * Expose utilities.
 */

exports.utils = utils;

/**
 * Create a new connect server.
 * 如果用户使用connect(),就返回一个函数
 * 这个函数对象的属性集合为proto.js和EventEmitter的prototype
 * 继承use,set,handle等等方法
 *
 * @return {Function}
 * @api public
 */

function createServer() {
  
  //此为执行connect()返回的函数对象,当原生http.createServer将其作为Callback调用时
  //会执行proto.js里面定义的handle方法
  function app(req, res, next){ app.handle(req, res, next); }  
  
  //合并proto.js输出的属性和方法和EventEmitter的prototype到app对象
  utils.merge(app, proto);
  utils.merge(app, EventEmitter.prototype);
  
  //初始化route为'/',stack为加载middlevare的堆栈,初始化为一个数组
  app.route = '/';
  app.stack = [];
  
  //如果运行connect()的时候有参数,就用use方法把所有参数引用的middlevare放进app.stack
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
 * 自动读取middlevare目录里面的所有js文件
 * 已文件的名字为属性名,分别输出的connect的主对象中
 * 比如读到session.js,
 * 就就有export.session,
 * 内容为require(session.js)
 */

fs.readdirSync(__dirname + '/middleware').forEach(function(filename){
  if (!/\.js$/.test(filename)) return;
  var name = basename(filename, '.js');
  function load(){ return require('./middleware/' + name); }
  exports.middleware.__defineGetter__(name, load);
  exports.__defineGetter__(name, load);
});
