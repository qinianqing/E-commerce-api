// family总路由
const express = require('express');
const router = express.Router();

const family = require('./routes/family');
const member = require('./routes/member');

// health check
router.get('/health-check',function (req,res,next) {
    res.status(200).send('ok');
});

// 路由分发
router.use('/member',member);
router.use('/',family);


module.exports = router;