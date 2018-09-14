let express = require('express');
let router = express.Router();

let collect = require('./collect/routes/collect');
let sub = require('./subscribe/routes/index');

// health check
router.get('/health-check',function (req,res,next) {
    res.status(200).send('ok');
});

// 路由分发
router.use('/collect',collect);// 商品收藏
router.use('/scene',sub);// 订阅购买


module.exports = router;
