// order总路由
const express = require('express');
const router = express.Router();

// 引入处理路由
const order = require('./routes/order');
const reverse = require('./routes/reverse');

// health check
router.get('/health-check',function (req,res,next) {
    res.status(200).send('ok');
});

// 路由分发
router.use('/reverse',reverse);// 退货
router.use('/',order);// 订单

module.exports = router;