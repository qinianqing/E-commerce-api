let express = require('express');
let router = express.Router();

let wallet = require('./routes/wallet');
let template = require('./routes/template');
let code = require('./routes/code');
let getCoupon = require('./routes/get');
let useCoupon = require('./routes/use');

// 路由分发
router.use('/code',code);// 优惠码接口
router.use('/template',template);// 优惠券模板接口
router.use('/wallet',wallet);// 券包接口
router.use('/get',getCoupon);// 用户领券接口
router.use('/use',useCoupon);// 用券接口

// health check
router.get('/health-check',function (req,res,next) {
    res.status(200).send('ok');
});

module.exports = router;