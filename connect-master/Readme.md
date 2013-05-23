[![build status](https://secure.travis-ci.org/senchalabs/connect.png)](http://travis-ci.org/senchalabs/connect)
# Connect

  *这是一个在connect的master分支随便zip下来,自己新建的repo,意在翻译注解和架构Connect框架,此工作并非针对Connect源码*

  Connect is an extensible HTTP server framework for [node](http://nodejs.org), providing high performance "plugins" known as _middleware_.
  Connect是一个可扩展的Node.js HTTP服务器框架
  
 Connect is bundled with over _20_ commonly used middleware, including
 a logger, session support, cookie parser, and [more](http://senchalabs.github.com/connect). Be sure to view the 2.x [documentation](http://senchalabs.github.com/connect/).
 Connet拥有超过20个middleware(中间件)
 
```js
var connect = require('connect')
  , http = require('http');

var app = connect()
  .use(connect.favicon())
  .use(connect.logger('dev'))
  .use(connect.static('public'))
  .use(connect.directory('public'))
  .use(connect.cookieParser())
  .use(connect.session({ secret: 'my secret here' }))
  .use(function(req, res){
    res.end('Hello from Connect!\n');
  });

http.createServer(app).listen(3000);
```



Connect的框架架构,可简单归结为以下伪代码

```js
/*
 * 此为伪代码,建立一个http对象,调用createServer方法时会运行以参数传入的callback
 * 此callback是调用connect()返回的函数
*/
var connect,
    app,
    http={};
    
//http.createServer的伪代码
http.createServer = function(callback){
    var req,res,next;
    //req=some,res=some,next=some;
    callback(req,res,next);
};

//调用connect()返回函数传值给app
//调用createServer等待终端用户接入时,调用app函数,传入req,res,next
app=connect()
http.createServer(app);

//以下为connect框架思路的伪代码


//调用connect()返回app函数,当调用app时,实质上是运行proto.js里面的handle方法
//两个重要参数为route路由参数,stack则是储存中间件(middleware)的堆栈
//handle方法会遍历这个堆栈把中间件按顺序执行
connect = function(){
    function app(req, res, next){
        app.handle(req, res, next);
    };
    app.route = '/';
    app.stack = [];
    return app;
};


//把app.use的中间件按用户的代码逻辑顺序放进stack堆栈,
//如果调用app.use的时候有route参数,
//这个堆栈中的对象会有一个属性对应用户想用到的middleware
//此处为伪代码省去判断route的代码
connect.use = function(route, fn){
    this.stack.push({
        route: route,
        handle: fn
    });
    return this;
};


//此为实际调用app的内容,可观察connect函数返回的app对象
//    function app(req, res, next){
//        app.handle(req, res, next);
//    };
//调用app()时其实是在调用handle方法
//这个方法会遍历调用app.use()后stack堆栈中每一个用户用到的middleware
//按用户代码的逻辑顺序逐个运行
//所以http.createServer调用的Callback实际上最终是调用这个函数,以调用中间件
connect.handle = function(req, res, out){
    var stack = this.stack,
        index = 0;

//此处为伪代码,在index=0开始遍历stack[index]数组,
//layer.handle
    function next(err){
        var layer;
        layer = stack[index++];
        layer.handle(req, res, next);
    };
    next();
};
```














## Middleware

  - [csrf](http://www.senchalabs.org/connect/csrf.html)
  - [basicAuth](http://www.senchalabs.org/connect/basicAuth.html)
  - [bodyParser](http://www.senchalabs.org/connect/bodyParser.html)
  - [json](http://www.senchalabs.org/connect/json.html)
  - [multipart](http://www.senchalabs.org/connect/multipart.html)
  - [urlencoded](http://www.senchalabs.org/connect/urlencoded.html)
  - [cookieParser](http://www.senchalabs.org/connect/cookieParser.html)
  - [directory](http://www.senchalabs.org/connect/directory.html)
  - [compress](http://www.senchalabs.org/connect/compress.html)
  - [errorHandler](http://www.senchalabs.org/connect/errorHandler.html)
  - [favicon](http://www.senchalabs.org/connect/favicon.html)
  - [limit](http://www.senchalabs.org/connect/limit.html)
  - [logger](http://www.senchalabs.org/connect/logger.html)
  - [methodOverride](http://www.senchalabs.org/connect/methodOverride.html)
  - [query](http://www.senchalabs.org/connect/query.html)
  - [responseTime](http://www.senchalabs.org/connect/responseTime.html)
  - [session](http://www.senchalabs.org/connect/session.html)
  - [static](http://www.senchalabs.org/connect/static.html)
  - [staticCache](http://www.senchalabs.org/connect/staticCache.html)
  - [vhost](http://www.senchalabs.org/connect/vhost.html)
  - [subdomains](http://www.senchalabs.org/connect/subdomains.html)
  - [cookieSession](http://www.senchalabs.org/connect/cookieSession.html)

## Running Tests

first:

    $ npm install -d

then:

    $ make test

## Authors

 Below is the output from [git-summary](http://github.com/visionmedia/git-extras).


     project: connect
     commits: 2033
     active : 301 days
     files  : 171
     authors: 
      1414	Tj Holowaychuk          69.6%
       298	visionmedia             14.7%
       191	Tim Caswell             9.4%
        51	TJ Holowaychuk          2.5%
        10	Ryan Olds               0.5%
         8	Astro                   0.4%
         5	Nathan Rajlich          0.2%
         5	Jakub Nešetřil          0.2%
         3	Daniel Dickison         0.1%
         3	David Rio Deiros        0.1%
         3	Alexander Simmerl       0.1%
         3	Andreas Lind Petersen   0.1%
         2	Aaron Heckmann          0.1%
         2	Jacques Crocker         0.1%
         2	Fabian Jakobs           0.1%
         2	Brian J Brennan         0.1%
         2	Adam Malcontenti-Wilson 0.1%
         2	Glen Mailer             0.1%
         2	James Campos            0.1%
         1	Trent Mick              0.0%
         1	Troy Kruthoff           0.0%
         1	Wei Zhu                 0.0%
         1	comerc                  0.0%
         1	darobin                 0.0%
         1	nateps                  0.0%
         1	Marco Sanson            0.0%
         1	Arthur Taylor           0.0%
         1	Aseem Kishore           0.0%
         1	Bart Teeuwisse          0.0%
         1	Cameron Howey           0.0%
         1	Chad Weider             0.0%
         1	Craig Barnes            0.0%
         1	Eran Hammer-Lahav       0.0%
         1	Gregory McWhirter       0.0%
         1	Guillermo Rauch         0.0%
         1	Jae Kwon                0.0%
         1	Jakub Nesetril          0.0%
         1	Joshua Peek             0.0%
         1	Jxck                    0.0%
         1	AJ ONeal                0.0%
         1	Michael Hemesath        0.0%
         1	Morten Siebuhr          0.0%
         1	Samori Gorse            0.0%
         1	Tom Jensen              0.0%

## Node Compatibility

  Connect `< 1.x` is compatible with node 0.2.x


  Connect `1.x` is compatible with node 0.4.x


  Connect (_master_) `2.x` is compatible with node 0.6.x

## CLA

 [http://sencha.com/cla](http://sencha.com/cla)

## License

View the [LICENSE](https://github.com/senchalabs/connect/blob/master/LICENSE) file. The [Silk](http://www.famfamfam.com/lab/icons/silk/) icons used by the `directory` middleware created by/copyright of [FAMFAMFAM](http://www.famfamfam.com/).
