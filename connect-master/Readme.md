[![build status](https://secure.travis-ci.org/senchalabs/connect.png)](http://travis-ci.org/senchalabs/connect)
# Connect [源repo](https://github.com/senchalabs/connect)

  *这是一个在connect的master分支随便zip下来,自己新建的repo.*
  
  *意在翻译注解和学习架构Connect框架,此工作并非针对Connect源码*
  

  Connect is an extensible HTTP server framework for [node](http://nodejs.org), providing high performance "plugins" known as _middleware_.
  Connect是一个可扩展的Node.js HTTP服务器框架,提供高性能的插件,大家都称之为中间件 _middleware_.
  
  Connect is bundled with over _20_ commonly used middleware
  Connet拥有超过20个middleware(中间件)

  Be sure to view the 2.x [documentation](http://senchalabs.github.com/connect/).
  你可以到[这里](http://senchalabs.github.com/connect/)了解Connect 2.0的详情
 
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




#Connect的框架架构,可简单归结为以下伪代码

```js
/*
 * 此篇幅全部为伪代码
*/
var connect,
    app,
    http={};
      
//调用createServer方法时,会调用以参数传入的callback
//此callback为调用connect()返回的函数app()
http.createServer = function(callback){
    var req,res,next;
    //此处省去N行代码,好奇的自觉去看Node.js源码
    //doSomething with req/res/next
    callback(req,res,next); //可理解为app(req,res,next);
};

//调用connect()返回函数传值给app
//调用createServer等待终端用户接入时,调用app函数,
//以参数传入req,res,next
app=connect()
app.use(connect.session({
    secret:'session',
    cookie:{maxAge:year
}));
http.createServer(app);


/********注意Handle和handle的不同,源码都用handle,很混肴思路******************/
/********往下看会把proto.js里面的use和Handle简化成伪代码写出来***************/

//调用connect()返回app函数,当调用app()时,实质上是运行proto.js里面的Handle方法
//两个重要参数为route路由参数,stack则是储存中间件(middleware)的堆栈
//堆栈stack中存放的对象,分别有route和handle属性,这个handle存的是middleware
//而connect.Handle方法会遍历这个stack堆栈把中间件按顺序执行
connect = function(){
    function app(req, res, next){
        app.Handle(req, res, next);//其实是connect.Handle(req,res,next);
    };
    
    //这里很重要的是调用utils.merge把proto.js里export的use和Handle函数合并到
    //将要返回的app(),所以用户就可以调用app.use(),app()调用时可以调用app.Handle()
    utils.merge(app, proto);
    utils.merge(app, EventEmitter.prototype);
    app.route = '/'; //初始化route为'/'
    app.stack = [];  //初始化stack中间件堆栈为一个空数组
    return app;  //调用connect()返回app函数
};

/******************proto.js里面的伪代码简化:*****************************/
//  调用app.use()时,参数为中间件,如app.use(connect.session());
//     注意:这里app.use()的参数其实是connect中间件返回的函数对象
//          因为传入app.use的参数是connect.session()而非connect.session
//          所以app.use里的fn接收到的是return的sessionReturn,如下伪代码
//          connect.session = function(options){
//              var something etc.....
//              store.generate = function(req){...};
//              //doSomething
//
//              return function sessionReturn(req, res, next){...};
//          };
//        
//      所以调用connect.session()时传入如{secret:'session',cookie:{maxAge:year}}的参数,
//      可以经过中间件的逻辑代码处理后再利用闭包让返回的函数工作
//      实际Node.js调用的是sessionReturn()并在调用时传入req,res,next参数
//
//  use方法会按用户的代码逻辑顺序把中间件返回的函数逐个放进stack堆栈,
//  如果调用app.use的时候有route参数,
//  这个堆栈中的对象会有一个route属性对应用户想用到的路由和middleware
//  此处为伪代码省去判断route的代码
connect.use = function(route, fn){
    this.stack.push({ //把fn推如stack堆栈
        route: route,
        handle: fn //这个fn在这个例子里其实就是sessionReturn(req,res,next){...};
    });
    return this;//返回指针可以让.use链式调用,比如app.use(some()).use(other()).use(another())
};


//此为实际调用app的内容,可观察connect函数返回的app对象
//    function app(req, res, next){
//        app.Handle(req, res, next);
//    };
//调用app()时其实是在调用connect.Handle方法
//这个方法会遍历调用app.use()后stack堆栈中每一个用户用到的middleware
//按用户代码的逻辑顺序逐个运行
//所以http.createServer调用的Callback实际上最终是调用这个函数,以调用中间件
connect.Handle = function(req, res, out){
    var stack = this.stack,
        index = 0;

//此处为伪代码,在index=0开始遍历stack[index]数组,
//注意layer.handle,此handle非彼handle,这个handle是stack这个堆栈中的对象的方法
//我觉得这里用handle这个名字很容易混肴connect.handle,所以我把伪代码改了改
//用connect.Handle,注意这不是构造函数,只是为了区分
    function next(err){
        var layer;
        layer = stack[index++];
        layer.handle(req, res, next);
    };
    next();
};



/*
 *当然,connect.js会用require('fs'),把middleware目录里的中间件全部悉数export
 *如这里的代码,会export.session,所以可以调用connect.session()了
 *详细可查看lib/connect.js最后的几行fs.readdirSync()的源代码
 *注意这里用到的readdirSync是同步阻塞执行的,
 *所以connect=require('connect')的时候,middleware目录里的中间件都会export到connect
*/
```


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



## CLA

 [http://sencha.com/cla](http://sencha.com/cla)

## License

View the [LICENSE](https://github.com/senchalabs/connect/blob/master/LICENSE) file. The [Silk](http://www.famfamfam.com/lab/icons/silk/) icons used by the `directory` middleware created by/copyright of [FAMFAMFAM](http://www.famfamfam.com/).
