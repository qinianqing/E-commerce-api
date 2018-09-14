// 促销总路由

let express = require('express');
let router = express.Router();

// 引用
let coupon = require('./coupon/router');
let cbc = require('./cobranded/router');

// 分流
router.use('/coupon',coupon);
router.use('/cbc',cbc);

// health check
router.get('/health-check',function (req,res,next) {
    res.status(200).send('ok');
});

module.exports = router;