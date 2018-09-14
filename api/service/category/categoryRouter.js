// category总路由

const express = require('express');
const router = express.Router();

// health check
router.get('/health-check',function (req,res,next) {
    res.status(200).send('ok');
});

//引入商品详情页的路由
const category = require('./routes/category');

router.use('/',category);

module.exports = router;