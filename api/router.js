let express = require('express');
let router = express.Router();

// 引入路由
let passport = require('./service/passport/passportRouter');// passport服务
let promote = require('./service/promote/promoteRouter');// promote服务
let pay = require('./service/pay/payRouter');// pay服务
let family = require('./service/family/familyRouter');// family服务
let order = require('./service/order/orderRouter');// order服务
let page = require('./service/page/pageRouter');// page服务
let search = require('./service/search/searchRouter');// search服务
let cart = require('./service/cart/cartRouter');// cart服务
let product = require('./service/product/productRouter');// product服务
let category = require('./service/category/categoryRouter');// category服务
let wallet = require('./service/wallet/walletRouter');// product服务
let eva = require('./service/evaluate/evaluateRouter');// evaluate服务
let sub = require('./service/subscribe/subcribeRouter');// 订阅购买和收藏服务
let wx = require('./service/wx/wxServiceRouter');// 微信通知等服务
let invite = require('./service/invite/inviteRouter');//邀请
// 路由分发
router.use('/passport',passport);
router.use('/promote',promote);
router.use('/pay',pay);
router.use('/family',family);
router.use('/order',order);
router.use('/page',page);
router.use('/search',search);
router.use('/cart',cart);
router.use('/product',product);
router.use('/category',category);
router.use('/wallet',wallet);
router.use('/evaluate',eva);
router.use('/subscribe',sub);
router.use('/wx',wx);
router.use('/wx/invite',invite);
// health check
router.get('/health-check',function (req,res,next) {
    res.status(200).send('ok');
});

module.exports = router;