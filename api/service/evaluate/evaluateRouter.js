const express = require('express');
const router = express.Router();
// 引入路由
const eva = require('./routes/evaluate');

// 服务校验
router.get('/health-check', (req, res, next) => {
    res.send(200);
});

// 分流
// 转发内部接口流量
router.use('/',eva);

module.exports = router;