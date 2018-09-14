// 支付总路由
let express = require('express');
let router = express.Router();

// 引入处理路由
const wxpay = require('./routes/wechat');

// 路由分发
// 微信支付
router.use('/wx',wxpay);

// health check
router.get('/health-check',function (req,res,next) {
    res.status(200).send('ok');
});

module.exports = router;