let express = require('express');
let router = express.Router();

let cbc = require('./routes/coBrandedCard');

// 路由分发
router.use('/',cbc);// 联名卡接口

// health check
router.get('/health-check',function (req,res,next) {
    res.status(200).send('ok');
});

module.exports = router;