// invite总路由
const express = require('express');
const router = express.Router();

const invite = require('./routers/invite');


// health check
router.get('/health-check',function (req,res,next) {
    res.status(200).send('ok');
});

// 路由分发
router.use('/',invite);

module.exports = router;