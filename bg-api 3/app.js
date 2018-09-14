var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// 文件系统
var app = express();

// 路由
var ceRouter = require('./router');


// CORS
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");// TODO
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials",true); //带cookies
    res.header("X-Powered-By",' 3.2.1');

    if(req.method=="OPTIONS") res.sendStatus(200);/*让options请求快速返回*/
    else  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms  :res[content-length] ":referrer" ":user-agent"'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'bin')));

// 通过passport，token解析服务
const jwt = require('jsonwebtoken');
const tokenSecret = 'Jinshi-bgUser';
// token校验中间件
app.use(function(req,res,next){
    // 获取token
    let token = req.header('x-access-token') || req.body.token || req.query.token;
    jwt.verify(token,tokenSecret,(err,decoded)=>{
        // console.log(token,tokenSecret);
        // console.log('decoded:',decoded);
        if (err) {
            next();
        }else {
            req.currentUser = decoded;
            // console.log('kkk',req.currentUser)
            next();
        }
    });
});

//CMS分支路由，在不同的路由上链接不同的LeanCloud项目
app.use('/',ceRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('./common/error');
});

module.exports = app;
