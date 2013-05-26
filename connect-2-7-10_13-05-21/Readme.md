[![build status](https://secure.travis-ci.org/senchalabs/connect.png)](http://travis-ci.org/senchalabs/connect)
# Connect [源repo](https://github.com/senchalabs/connect)

*这是一个在connect的master分支随便zip下来,自己新建的repo.*  
*意在翻译注解和学习架构Connect框架,此工作并非针对Connect源码*  

Connect is an extensible HTTP server framework for [node](http://nodejs.org), providing high performance "plugins" known as _middleware_.
### Connect是一个可扩展的[Node.js](http://nodejs.org) HTTP服务器框架,提供高性能的插件,大家都称之为中间件 _middleware_.  

Connect is bundled with over _20_ commonly used middleware.
### Connet拥有超过20个middleware(中间件)  

Be sure to view the 2.x [documentation](http://senchalabs.github.com/connect/).
### 你可以到[这里](http://senchalabs.github.com/connect/)了解Connect 2.0的详情  
  
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


#Connect的框架架构, 可简单归结为以下伪代码

**此篇幅全部为伪代码**

```js
var connect,
    app,
    http = {};
```
> 调用createServer方法时,Node.js会监听服务器端口,  
> 当客户端访问端口时,就会经过逻辑代码运算,最后调用Callback()  
> 调用时会传入req,res,next三个参数  

```js
//伪代码
http.createServer = function(callback){
    var req, res, next;
    //此处省去N行代码,好奇的自觉去看Node.js源码
    //doSomething with req/res/next
    callback(req, res, next); //可理解为app(req,res,next);
};
```

> 调用connect(),并取其返回值传给myApp  
> 注意,实际上connect是一个函数,返回的是另外一个函数  
> 详细往下看  

```js
myApp = connect()//其实就是返回connect内部的app
myApp.use(connect.session({
    secret: 'session',
    cookie: {maxAge: year
    }));
http.createServer(myApp);
```

**往下看的时候注意Handle和handle的不同,源码都用handle,很混肴思路**  

> 调用connect()返回的是connect作用域内的函数app,  
> 当调用createServer将myApp作为Callback调用时,  
> 实际上是调用connect()返回的app();  
> 而调用此app()实质上是调用proto.js里面的Handle方法  
> app.Handle是通过utils.merge(app, proto);作为方法合并进app的  
> 也就是说,createServer最终调用的是proto.js里的Handle方法!  
>   
> app的两个重要属性是route路由参数,stack则是储存中间件(middleware)的堆栈  
> 堆栈stack中存放若干对象,视乎用户使用myApp.use()的参数和次数还有顺序  
> 这些对象都有route和handle属性,这个stack.handle暂存的就是middleware  
> 而调用proto.Handle方法会遍历这个stack堆栈把中间件按顺序执行  

```js
connect = function(){
    function app(req, res, next){
        app.Handle(req, res, next);//其实是proto.Handle(req,res,next);
    };

    //这里很重要的是调用utils.merge把proto.js里的use和Handle方法合并到
    //app,返回app后其实就被myApp引用,
    //所以用户就可以调用myApp.use()
    utils.merge(app, proto);
    utils.merge(app, EventEmitter.prototype);
    app.route = '/'; //初始化route为'/'
    app.stack = [];  //初始化stack中间件堆栈为一个空数组
    return app;  //调用connect()是返回app函数
};
```

> **proto.js里面的伪代码简化:**  
> 通过utils.merge(app, proto);调用myApp.use其实就是调用proto.use  
> 调用myApp.use()时,参数为中间件,如myApp.use(connect.session());  
>  
> 注意:这里myApp.use()的参数其实是中间件返回的函数对象而非函数本身  
> 因为传入myApp.use的参数是connect.session()而非connect.session(没有括号)  
> 所以myApp.use里的fn接收到的是return的sessionReturn(没有括号)  
> 可以看作myApp.use(sessionReturn)==myApp.use(connect.session())  
>  
> 如下伪代码:  
> ```js
> connect.session = function(options){
>     var options.something etc.....
>     store.generate = function(req){...};
>     //define something
>     return function sessionReturn(req, res, next){
>         //doSomething with options
>         };
>     };
> ```
>
> 所以调用connect.session()时传入如{secret:'session',cookie:{maxAge:year}}的参数,  
> 经过中间件的逻辑代码处理后再利用闭包让返回的函数可以访问connect.session里的内容  
>  
> myApp.use方法会按用户的代码逻辑顺序把中间件返回的函数逐个放进stack堆栈,  
> 如果用户调用myApp.use的时候有route参数,这个堆栈中的对象会有一个route属性  
> 对应用户想用到的路由和middleware!  
> 此处为伪代码省去判断route的代码:

```js
proto.use = function(route, fn){
    this.stack.push({ //把fn放进stack堆栈
        route: route,
        handle: fn //fn在这个例子里其实就是sessionReturn
    });
    return this;//返回指针可以让.use链式调用,比如app.use(some()).use(other()).use(another())
};
```

*此为实际调用myApp()的内容,可观察connect函数返回的app对象*

```js
    function app(req, res, next){
        app.Handle(req, res, next);//proto.Handle(req,res,next);
    };
```

> 调用myApp()=app()时其实是在调用proto.Handle方法  
> 这个方法会遍历调用myApp.use()后stack堆栈中每一个用户用到的middleware  
> 按用户代码的逻辑顺序逐个运行  
> 所以http.createServer调用的Callback实际上最终是调用这个函数,以调用中间件  
> **我觉得这里用stack[index].handle很容易混肴proto.handle,所以我把伪代码改了**  
> **改用proto.Handle,注意这不是构造函数,只是为了区分**  
  
```js
proto.Handle = function(req, res, out){
    var stack = this.stack,
        index = 0;

    // 此处为伪代码,在index=0开始遍历stack[index]数组,
    //注意layer.handle,此handle非彼Handle,这个handle是数组堆栈stack中对象的方法,
    //这些对象储存对应的路由和中间件返回函数,
    //如在这个例子就是layer.handle=stack[index].handle=sessionReturn
    function next(err){
        var layer;
        layer = stack[index++];
        if(!layer)return someThing; //遍历完后跳出函数
        layer.handle(req, res, next);//这里可以之间看成sessionReturn(req,res,next);
    };
    next();//重新调用next()遍历堆栈stack
};
```


> 当然,connect.js会用require('fs'),把middleware目录里的中间件全部悉数export  
> 如这里的场景,有export.session,所以可以调用connect.session()了  
> 详细可查看lib/connect.js最后的几行fs.readdirSync()的源代码  
> 注意这里用到的readdirSync是同步阻塞执行的,  
> 所以connect=require('connect')的时候,middleware目录里的中间件都会export到connect  



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
