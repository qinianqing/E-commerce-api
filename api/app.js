// 应用入口

let express = require('express');
let path = require('path');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

// 载入总路由
let mainRouter = require('./router');

let app = express();

// CORS跨域
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    if(req.method === "OPTIONS") {
        /*让options请求快速返回*/
        res.sendStatus(200);
    }
    else{
        next();
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 获取IP中间件
const requestIp = require('request-ip');
app.use(requestIp.mw({ attributeName : 'clientIPAddress' }));

// 通过passport，token解析服务
const verifyToken = require('./service/passport/interface/verifyToken');

let user_id = '-';
let req_ip = '';
// token校验中间件
app.use(function(req,res,next){
    // 获取token
    let token = req.header('x-access-token') || req.body.token || req.query.token;
    if(req.clientIPAddress === '::1'){
        req.clientIPAddress = '127.0.0.1';
        req_ip = req.clientIPAddress;
    }else {
        req_ip = req.clientIPAddress;
    }
    verifyToken(token,(resp)=>{
        if (resp.error_code === 0){
            req.currentUser = resp.data.user;
            user_id = req.currentUser.user_id;
        }
        next();
    });
});

// 设置日志
logger.token('user_id',()=>{
    return user_id;
});
logger.token('ip-address',()=>{
    return req_ip;
});
logger.format('api-log',':ip-address~:user_id~[:date[clf]]~:method~:url~HTTP/:http-version~:status~:response-time ms~:res[content-length]~:referrer~:user-agent');
// let dbStream = {
//     write: function(line){
//         // console.log('<<<',line);  // 推送日志数据到ES
//     }
// };
// app.use(logger('api-log', {stream: dbStream}));// 将日志推流
app.use(logger('api-log'));
// 请求转发至总路由
app.use('/', mainRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  //res.status(err.status || 500);
  res.sendStatus(err.status || 500);
  // res.render('error');
});

module.exports = app;
