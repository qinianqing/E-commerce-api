const router = require('express').Router();
const wxpay = require('../utils/wxpay');
const { validateSign } = require('../utils/wxpayUtils');
const uuid = require('uuid/v4');
const PayOrder = require('../models/PayOrder');

const getUser = require('../../passport/interface/getUserInfo');
const getUserCR = require('../../passport/interface/getUserInfoCR');
const getFamilyMsg = require('../../family/interface/getFamily');
const getFamilyMsgCR = require('../../family/interface/getFamilyCR');
const getOrder = require('../../order/interface/getOrder');
const getCoupon = require('../../promote/coupon/interface/getCoupon');

const addFormIdByPay = require('../../passport/interface/addFormIdByPay');

const payOrderCallback = require('../core/payOrderCallback');

const { wxpayParams,host } = require('../config');

// 格式化时间
const format = '___-_-_ _:_:__';
const formatTime = time =>
    new Date(
        time.split('')
            .map((value, index) => value + format[index])
            .join('').replace(/_/g, '')
    );

/*
*  支付订单
*
*  @params
*
 */

// 获取用户即时数据
let getUserCRFunc = (user_id)=>{
    return new Promise((resolve,reject)=>{
        getUserCR({
            user_id:user_id,
            callback:(resp)=>{
                if (resp.error_code){
                    reject(resp);
                }else {
                    resolve(resp.data);
                }
            }
        })
    })
};

// 获取家庭即时数据
let getFamilyCRFunc = (user_id,family_id)=>{
    return new Promise((resolve,reject)=>{
        getFamilyMsgCR({
            user_id:user_id,
            family_id:family_id,
            callback:(resp)=>{
                if (resp.error_code){
                    reject(resp);
                }else {
                    resolve(resp.data);
                }
            }
        })
    })
};

// 获取优惠券
let getCouponFunc = (user_id,code)=>{
    return new Promise((resolve,reject)=>{
        getCoupon({
            owner_id:user_id,
            code:code,
            type:0,
            callback:(resp)=>{
                if (resp.error_code){
                    reject(resp);
                }else {
                    resolve(resp.data);
                }
            }
        })
    })
};

// 获取免邮券
let getFscFunc = (family_id,code)=>{
    return new Promise((resolve,reject)=>{
        getCoupon({
            owner_id:family_id,
            code:code,
            type:1,
            callback:(resp)=>{
                if (resp.error_code){
                    reject(resp);
                }else {
                    resolve(resp.data);
                }
            }
        })
    })
};

router.post('/order',function (req,res,next) {
    // 校验用户
    if (!req.currentUser) {
        return res.send({
            error_code:5002,
            error_msg:'no user'
        })
    }
    // 校验参数
    if(!req.body.order_id){
        return res.send({
            error_code:5001,
            error_msg:'缺少order_id'
        })
    }
    let user_id = req.currentUser.user_id;
    let params = req.body;
    // 查询订单信息，创建支付单时，唯一一次回调调用，其他都是async调用
    getOrder({
        user_id:user_id,
        order_id:params.order_id,
        callback:(resp)=>{
            if (resp.error_code){
                return res.send(resp);
            }
            let order = resp.data.order;
            let familyBalance = 0;// 家庭余额，默认为0
            let userBalance = 0; // 用户余额，默认为0
            let open_id = '';
            let goEn = async ()=>{
                try {
                    let vip = 0;
                    if (order.family_id !== "-"){
                        // 如果存在家庭，就查询家庭信息，确认家庭余额
                        let family = await getFamilyCRFunc(user_id,order.family_id);
                        familyBalance = family.balance;
                        vip = family.vip;
                        familyBalance = parseInt(familyBalance*100);
                    }
                    let user = await getUserCRFunc(user_id);
                    userBalance = user.balance;
                    userBalance = parseInt(userBalance*100);
                    open_id = user.wa_open_id;

                    // 查询优惠券信息，必要
                    let coupon_discount = 0;
                    if (order.coupon_code !== '-') {
                        let coupon = await getCouponFunc(user_id, order.coupon_code);
                        coupon_discount = parseInt(coupon.amount);
                    }
                    // 查询免邮券信息，必要
                    let fsc_discount = false;
                    if (order.free_ship_code!== '-'&&order.family_id !=='-') {
                        let coupon = await getFscFunc(order.family_id, order.free_ship_code);
                        if (coupon.status === 'OK') {
                            fsc_discount = true;
                        }
                    }
                    // 计算费用信息
                    let prop;
                    let allbalance = false;
                    let freightFee = order.freight;
                    if (typeof freightFee === 'number'){
                        freightFee = parseInt(freightFee);
                    }else {
                        freightFee = 1200;// 如果没有算出运费默认设定成起送运费
                    }
                    let freight_discount = 0;
                    // 判断运费抵扣额
                    // 判断商品总价是否超过99元
                    if (parseInt(order.goods_total)>9900){
                        freight_discount = freightFee;
                    }
                    if (fsc_discount){
                        if (freightFee > 1000){
                            freight_discount = 1000;
                        }else {
                            freight_discount = freightFee;
                        }
                    }
                    // 应付总金额
                    let payAmount = parseInt(order.goods_total)+freightFee-freight_discount-coupon_discount;
                    let actPay = payAmount;
                    let familyConsume = 0;
                    let userConsume = 0;
                    // 余额抵扣后实际支付额
                    if(familyBalance >= payAmount){
                        // 家庭余额可以抵扣
                        allbalance = true;
                        actPay = 1;
                        familyConsume = payAmount;
                    }else if ((familyBalance+userBalance) >= payAmount){
                        // 家庭+用户余额可以抵扣
                        // 优先抵扣家庭基金
                        allbalance = true;
                        actPay = 1;
                        familyConsume = familyBalance;
                        userConsume = payAmount - familyBalance-1;
                    }else if ((familyBalance+userBalance) < payAmount){
                        // 家庭+用户余额都不可以抵扣
                        allbalance = false;
                        actPay = payAmount - familyBalance -userBalance;
                        familyConsume = familyBalance;
                        userConsume = userBalance;
                    }
                    // user_id&order_id&actPay&payment&couponDiscount&freight_discount&familyConsume&userConsume
                    prop = user_id+'&'+params.order_id+'&'+actPay+'&'+payAmount+'&'+coupon_discount+'&'+freight_discount+'&'+familyConsume+'&'+userConsume+'&'+vip;
                    // 创建支付订单数据
                    if(req.clientIPAddress === '::1'){
                        req.clientIPAddress = '127.0.0.1'
                    }
                    const order_ = new PayOrder();
                    order_.amount = actPay;
                    order_.tradeId = uuid().replace(/-/g, '');
                    order_.wa_open_id = open_id;
                    order_.notify_url = host+'/pay/wx/order-callback';
                    order_.status = 'INIT';
                    order_.user_id = user_id;
                    order_.productDescription = '锦时';
                    order_.prop = prop;
                    order_.ip = req.clientIPAddress;
                    order_.tradeType = 'JSAPI';
                    order_.place().then(() => {
                        // 签名
                        const payload = {
                            appId: wxpayParams.WEIXIN_APPID,
                            timeStamp: String(Math.floor(Date.now() / 1000)),
                            package: `prepay_id=${order_.prepayId}`,
                            signType: 'MD5',
                            nonceStr: String(Math.random()),
                        };

                        payload.paySign = wxpay.sign(payload);

                        // prepay_id暂时不能发送模板消息
                        // addFormIdByPay({
                        //     user_id:user_id,
                        //     form_id:order_.prepayId,
                        //     expiredAt:Date.now()+7 * 1000 * 60 * 60 * 24,
                        //     callback:(resp)=>{
                        //         if (resp.error_code){
                        //             console.error(resp.error_msg);
                        //         }
                        //     }
                        // });
                        return res.send({
                            error_code:0,
                            error_msg:'ok',
                            data:{
                                payload:payload,
                                all_balance:allbalance
                            }
                        });
                    });
                }catch (err){
                    return res.send(err);
                }
            };
            goEn();
        }
    });
});

/*
* 订单支付回调
*
*  @params
 */

// 工作流：
/*
1、获取支付单信息
2、更新订单信息
3、删除订单取消计划
4、写入购买记录
5、记录消费流水
6、扣减余额
7、发送模板消息
 */
router.post('/order-callback', wxpay.useWXCallback((msg, req, res, next) => {
    validateSign(msg);

    res.success();

    const {
        result_code,
        err_code,
        err_code_des,
        out_trade_no,
        time_end,
        transaction_id,
        bank_type,
    } = msg;

    // 获取支付单信息
    let order = new PayOrder();
    let prepayId  = '';
    order.tradeId = out_trade_no;
    order.getPayOrder((err,data) => {
        if (err){
            console.error('5000',err.message)
        }else {
            data = data.attrs;
            prepayId = data.prepayId;
            let p = {};
            if (result_code === 'SUCCESS'){
                p.tradeId = out_trade_no;
                p.status = result_code;
                p.paidAt = String(formatTime(time_end));
                p.transactionId = transaction_id;
                p.bankType = bank_type;
            }else {
                p.tradeId = out_trade_no;
                p.status = result_code;
                p.errorCode = String(err_code);
                p.errorCodeDes = err_code_des;
            }
            order.tradeId = out_trade_no;
            // 更新支付单信息
            order.update(p,(err,pom) => {
                if (pom) {
                    pom = pom.attrs;
                    if(result_code === 'SUCCESS'){
                        payOrderCallback(pom);
                    }
                }
            })
        }
    })
}));

const getSubsWaresDetail = require('../../subscribe/subscribe/interface/getSubsWaresDetail');
const freightUtil = require('../../order/utils/utils');
const getProduct = require('../../product/interface/getProduct');
/*
 *  支持家庭余额支付，支持用户余额支付
 *  订阅订单支付
 *
 *  @params
 */
router.post('/subscribe',function (req,res,next) {
    // 校验用户
    if (!req.currentUser) {
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    // 订阅id 省份 家庭ID 周数 件数
    // 订阅id包括了期数概念
    if(!req.body.id || !req.body.province || !req.body.family_id || !req.body.weeks || !req.body.num){
        return res.send({
            error_code:5002,
            error_msg:'缺少必要参数'
        })
    }
    if(req.body.id.split('#').length !== 3){
        return res.send({
            error_code:5002,
            error_msg:'错误ID'
        })
    }
    // req.body.id 是三级ID，包含所属的期数
    let id_0 = req.body.id.split('#')[0];// 第0级别ID，所属的订阅活动
    let id_1 = id_0+'#'+req.body.id.split('#')[1];// 第一级ID index，所属的SKU组合
    // 第一步获取订阅商品信息，并对价格等重要要素进行拆分
    let handle = async ()=>{
        try {
            let num = parseInt(req.body.num);
            let wares = await getSubsWaresDetail({
                id:id_0
            });
            wares = wares.data.wares;
            // 确定具体是哪个商品组
            let ware_info;
            for (let i=0;i<wares.length;i++){
                if (id_1 === wares[i].id){
                    ware_info = wares[i];
                }
            }
            // 确定具体价格策略
            let stages;
            let priceStatgy;
            for (let i=0;i<ware_info.price.length;i++){
                if (req.body.id === ware_info.price[i].id){
                    priceStatgy = ware_info.price[i];
                }
            }
            stages = priceStatgy.stages;
            if (req.body.weeks.length !== stages){
                return res.send({
                    error_code:5009,
                    error_msg:'传入weeks不正确'
                })
            }
            // 获取家庭
            let family = await getFamilyCRFunc(req.currentUser.user_id,req.body.family_id);
            let vip = family.vip;
            // 获取家庭余额
            let family_balance = family.balance;
            // 获取用户余额
            let user = await getUserCRFunc(req.currentUser.user_id);
            let user_balance = user.balance;
            let freight_discount = 0;
            let freight = 0;
            // 计算邮费
            let skus = [];
            for (let i=0;i<ware_info.skus.length;i++){
                skus.push(ware_info.skus[i].sku_id);
            }
            getProduct.get.skus({
                skus:skus,
                callback:(resp)=>{
                    if (resp.error_code){
                        return res.send(resp);
                    }
                    // 运费计算
                    let weight = 0;
                    for (let i=0;i<skus.length;i++) {
                        weight = weight + resp.data[i].weight*ware_info.skus[i].num;
                    }
                    freight = freightUtil.freight_cal_jd(weight/1000,req.body.province)*num*stages;
                    let price = 0;
                    if (vip === 1){
                        price = priceStatgy.vip_price*stages*num;
                        freight_discount = freight;
                    }else {
                        price = priceStatgy.price*stages*num;
                    }
                    // 以上钱的单位都为元
                    // 计算应付
                    let total = price+freight;// 应付总金额
                    let act_pay = 1; // 实际应支付金额，分
                    let family_balance_consume = 0;
                    let user_balance_consume = 0;
                    if (family_balance >= price){
                        // 家庭余额就可以抵扣
                        family_balance_consume = total-freight_discount-0.01;
                    }else if (user_balance+family_balance >= price) {
                        // 家庭余额加上用户余额可以抵扣
                        family_balance_consume = family_balance;
                        user_balance_consume = total-freight_discount-family_balance-0.01;
                    }else{
                        // 不能完全抵扣
                        family_balance_consume = family_balance;
                        user_balance_consume = user_balance;
                        act_pay = total-freight_discount-family_balance-user_balance;
                        act_pay = act_pay*100;
                    }
                    // 创建支付订单数据
                    if(req.clientIPAddress === '::1'){
                        req.clientIPAddress = '127.0.0.1'
                    }
                    // 把星期列表合成成字符串
                    let weeksS = '';
                    for (let i=0;i<stages;i++){
                        if (i === 0){
                            weeksS = req.body.weeks[i];
                        }else {
                            weeksS = weeksS + '#' + req.body.weeks[i];
                        }
                    }
                    // user_id family_id wares_id 总价 运费 运费折扣 家庭余额消耗 用户余额消耗 用户实际支付 周 num
                    let prop = req.currentUser.user_id+'&'+req.body.family_id+'&'+req.body.id+'&'+total+'&'+freight+'&'+freight_discount+'&'+family_balance_consume+'&'+user_balance_consume+'&'+act_pay/100+'&'+weeksS+'&'+vip+'&'+num;
                    // 创建支付单数据
                    const order = new PayOrder();
                    order.tradeId = uuid().replace(/-/g, '');
                    order.wa_open_id = user.wa_open_id;
                    order.notify_url = host+'/pay/wx/subscribe-callback';
                    order.status = 'INIT';
                    order.user_id = req.currentUser.user_id;
                    order.productDescription = '锦时订阅';
                    order.amount = act_pay;// 单价是分，获取当前零售价格，需要进行一步换算
                    order.prop = prop;
                    order.ip = req.clientIPAddress;
                    order.tradeType = 'JSAPI';

                    order.place().then(() => {
                        // 签名
                        const payload = {
                            appId: wxpayParams.WEIXIN_APPID,
                            timeStamp: String(Math.floor(Date.now() / 1000)),// 秒级时间戳
                            package: `prepay_id=${order.prepayId}`,
                            signType: 'MD5',
                            nonceStr: String(Math.random()),
                        };
                        payload.paySign = wxpay.sign(payload);

                        res.send({
                            error_code:0,
                            error_msg:'ok',
                            data:payload
                        });
                    });
                }
            });
        }catch (err){
            res.send(err)
        }
    };
    handle();
});

const paySubscribeCallback = require('../core/paySubscribeCallback');

/*
 * 会员业务支付成功回调
 *
 *  @params
 */
router.use('/subscribe-callback', wxpay.useWXCallback((msg, req, res, next) => {
    // 处理商户业务逻辑
    validateSign(msg);
    res.success();
    if (msg.result_code === 'SUCCESS') {
        paySubscribeCallback(msg);
    }
}));

/*
 *  不支持余额支付，只支持现金
 *  家庭会员卡支付
 *
 *  @params
 */
router.post('/member',function (req,res,next) {
    // 校验用户
    if (!req.currentUser) {
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    if(!req.body.family_id){
        return res.send({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
    let type = req.body.type;
    let invite = req.body.invite_user;
    if(type === 'y2' || type === 'q' || type === 'h' || type === 'y'|| type === 'm'){

    }else {
        return res.send({
            error_code:5003,
            error_msg:'type参数不正确'
        })
    }
    let price = 25200;
    switch (type){
        case 'y2':
            price = 432000;//1200
            break;
        case 'm':
            price = 3000;//3000
            break;
        case 'q':
            price = 8100;//3000
            break;
        case 'h':
            price = 14400;//5400
            break;
        case 'y':
            price = 25200;//9900
            break;
    }

    let params = req.body;
    let prop = params.family_id+'&&'+type+'&&'+price+'&&'+invite;

    getUser({
        user_id:req.currentUser.user_id,
        callback:(resp)=>{
            if(resp.error_code){
                return res.send(resp);
            }
            let data = resp.data;
            // 创建支付订单数据
            if(req.clientIPAddress === '::1'){
                req.clientIPAddress = '127.0.0.1'
            }
            // 创建支付单数据
            const order = new PayOrder();
            order.tradeId = uuid().replace(/-/g, '');
            order.wa_open_id = data.wa_open_id;
            order.notify_url = host+'/pay/wx/member-callback';
            order.status = 'INIT';
            order.user_id = req.currentUser.user_id;
            order.productDescription = '锦时家庭会员';
            order.amount = price;// 单价是分，获取当前零售价格，需要进行一步换算
            order.prop = prop;
            order.ip = req.clientIPAddress;
            order.tradeType = 'JSAPI';

            order.place().then(() => {
                // 签名
                const payload = {
                    appId: wxpayParams.WEIXIN_APPID,
                    timeStamp: String(Math.floor(Date.now() / 1000)),// 秒级时间戳
                    package: `prepay_id=${order.prepayId}`,
                    signType: 'MD5',
                    nonceStr: String(Math.random()),
                };
                payload.paySign = wxpay.sign(payload);

                res.send({
                    error_code:0,
                    error_msg:'ok',
                    data:payload
                });

                // prepay_id发送模板消息不成功
                // addFormIdByPay({
                //     user_id:req.currentUser.user_id,
                //     form_id:order.prepayId,
                //     expiredAt:Date.now()+7 * 1000 * 60 * 60 * 24,
                //     callback:(resp)=>{
                //         if (resp.error_code){
                //             console.error(resp.error_msg);
                //         }
                //     }
                // })
            });
        }
    })
});

const payMemberCallback = require('../core/payMemberCallback');

/*
 * 会员业务支付成功回调
 *
 *  @params
 */
router.use('/member-callback', wxpay.useWXCallback((msg, req, res, next) => {
    // 处理支付成功后的业务逻辑
    validateSign(msg);
    res.success();
    if (msg.result_code === 'SUCCESS') {
        payMemberCallback(msg);
    }
}));


module.exports = router;
