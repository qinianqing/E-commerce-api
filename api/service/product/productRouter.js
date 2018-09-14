// product总路由

let express = require('express');
let router = express.Router();
// 引入路由
const product = require('./routes/product');
const inner = require('./routes/inner');
const brand = require('./routes/brand');
const space = require('./routes/space');
const member = require('./routes/member');
const group = require('./routes/group');

// 服务校验
router.get('/health-check', (req, res, next) => {
    res.send(200);
});

// 分流
// 转发内部接口流量
router.use('/sdk',inner);
router.use('/brand',brand);
router.use('/space',space);
router.use('/member',member);
router.use('/group',group);
router.use('/',product);

module.exports = router;