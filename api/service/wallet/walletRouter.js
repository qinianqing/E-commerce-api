// 支付总路由

let express = require('express');
let router = express.Router();

// 引入处理路由
const userWallet = require('./routes/user');
const familyWallet = require('./routes/family');

// 路由分发
router.use('/user',userWallet);
router.use('/family',familyWallet);

// health check
router.get('/health-check',function (req,res,next) {
    res.status(200).send('ok');
});

module.exports = router;