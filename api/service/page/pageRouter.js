// weapp页面总路由

const express = require('express');
const router = express.Router();

const rec = require('./routes/rec');
const banner = require('./routes/banner');

const wa_index = require('./routes/wa_index');

const guess = require('./routes/guess');
const qa = require('./routes/qa');
const hotSearch = require('./routes/hot-search');
const category = require('./routes/category');

// 路由分发
router.use('/wa/index',wa_index);

router.use('/wa/rec',rec);// 推荐
router.use('/wa/banner',banner);// banner
router.use('/wa/guess',guess);// 猜你喜欢
router.use('/wa/qa',qa);// QA
router.use('/wa/search',hotSearch); // 热搜
router.use('/wa/classify',category);// 分类


router.get('/health-check',function (req,res,next) {
    res.status(200).send('ok');
});

module.exports = router;