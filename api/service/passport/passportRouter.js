// passport总路由

let express = require('express');
let router = express.Router();

let user = require('./routes/user');
// token校验接口停用
//let token = require('./routes/token');
let login = require('./routes/login');

// 路由分发
router.use('/user',user);// 用户接口
//router.use('/token',token);// token校验
router.use('/login',login);// 登录/登出

// health check
router.get('/health-check',function (req,res,next) {
    res.status(200).send('ok');
});

module.exports = router;