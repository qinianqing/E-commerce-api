// cart总路由
const express = require('express');
const router = express.Router();

const cart = require('./routes/cart');
const check = require('./routes/checkPrice');

// health check
router.get('/health-check',function (req,res,next) {
    res.status(200).send('ok');
});

router.use('/check',check);
router.use('/',cart);

module.exports = router;