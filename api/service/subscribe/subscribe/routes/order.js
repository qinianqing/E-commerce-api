const router = require('express').Router();

const {secret} = require('../../config');

const Order = require('../models/Subscribe-order');

// 取消订阅单
const getSubsWaresDetail = require('../interface/getSubsWaresDetail');
const freightUtil = require('../../../order/utils/utils');
const getProduct = require('../../../product/interface/getProduct');
router.post('/price',(req,res,next)=>{
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    if (!req.body.id || !req.body.province || !req.body.num){
        return res.send({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
    let id_0 = req.body.id.split('#')[0];// 第0级别ID，所属的订阅活动
    let id_1 = id_0+'#'+req.body.id.split('#')[1];// 第一级ID index，所属的SKU组合
    let handle = async ()=>{
        try {
            let num = parseInt(req.body.num);
            let wares = await getSubsWaresDetail({
                id: id_0
            });
            wares = wares.data.wares;
            // 确定具体是哪个商品组
            let ware_info;
            for (let i=0;i<wares.length;i++){
                if (id_1 === wares[i].id){
                    ware_info = wares[i];
                }
            }
            let freight = 0;
            // 计算邮费
            let skus = [];
            for (let i=0;i<ware_info.skus.length;i++){
                skus.push(ware_info.skus[i].sku_id);
            }
            let priceStatgy;
            for (let i=0;i<ware_info.price.length;i++){
                if (req.body.id === ware_info.price[i].id){
                    priceStatgy = ware_info.price[i];
                }
            }
            getProduct.get.skus({
                skus:skus,
                callback:(resp)=> {
                    if (resp.error_code) {
                        return res.send(resp);
                    }
                    // 运费计算
                    let weight = 0;
                    for (let i = 0; i < skus.length; i++) {
                        weight = weight + resp.data[i].weight * ware_info.skus[i].num;
                    }
                    freight = freightUtil.freight_cal_jd(weight / 1000, req.body.province) * num*priceStatgy.stages;
                    let vip_total = priceStatgy.vip_price*priceStatgy.stages*num;
                    let total = priceStatgy.price*priceStatgy.stages*num+freight;
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:{
                            freight:freight,
                            vip_total:vip_total,
                            total:total
                        }
                    })
                }
            })
        }catch (err){
            res.send(err)
        }
    };
    handle();
});

// 获得订单列表
router.get('/list',(req,res,next) => {
    if (req.currentUser){
        // 处理last_key
        if(req.query.last_key){
            req.query.last_key  = decodeURIComponent(req.query.last_key);
            req.query.last_key = JSON.parse(req.query.last_key);
        }
        let stauts = Number(req.query.status);
        // 0 进行中，1 已完成
        if(stauts === 0 || stauts === 1){
            let order = new Order();
            order.user_id = req.currentUser.user_id;
            // 待付款为DFK，待收货为DSH，全部订单为ALL
            order.getSubsOrderList(stauts,req.query.family_id,(err,data)=>{
                if (err){
                    res.send({
                        error_code:5003,
                        error_msg:err.message
                    })
                }else {
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:data
                    })
                }
            },req.query.last_key)
        }else {
            return res.send({
                error_code:5002,
                error_msg:'错误状态'
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
});

const User = require('../../../passport/models/User');
const Package = require('../models/Subscribe-package');

// 取消订阅单
router.post('/reverse',(req,res,next)=>{
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    if (!req.body.subs_order_id){
        return res.send({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
    let  order = new Order();
    order.user_id = req.currentUser.user_id;
    order.subs_order_id = req.body.subs_order_id;
    order.getSubsOrder((err,data)=>{
        if (err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        if (!data){
            return res.send({
                error_code:5004,
                error_msg:'错误订阅单号'
            })
        }
        // 执行退款逻辑
        data = data.attrs;
        if (data.status !== 0){
            return res.send({
                error_code:5000,
                error_msg:'该状态不允许取消订阅'
            })
        }
        let stages = data.stages;
        let already = 0;
        for(let i=0;i<data.sku_detail.length;i++){
            already = already + data.sku_detail[i].price * data.sku_detail[i].num;
        }
        already = already * data.exec_stages;
        let payB = data.actual_payment - already;
        if(payB<=0){
            payB = 0;
        }
        let id = data.subs_order_id;
        let cancelList = [];
        for (let i = data.exec_stages;i<data.weeks.length;i++){
            cancelList.push(data.weeks[i]);
        }
        // 返回到用户余额
        if (payB){
            let user = new User();
            user.user_id = req.currentUser.user_id;
            user.updateBalanceConsume(payB*-1,(err,data)=>{
                if (err){
                    return res.send({
                        error_code:5005,
                        error_msg:err.message
                    })
                }
                data = data.attrs;
                let balanceNew = data.balance;
                // 将全部邮包置为取消
                let pack = new Package();
                pack.subs_order_id = id;
                let n = 0;
                for (let i=0;i<cancelList.length;i++){
                    pack.week = cancelList[i];
                    pack.updateByReverse((err)=>{
                        n++;
                        if (n === cancelList.length){
                            // 更新订单
                            order.exec_stages = stages;
                            order.reverse_reason = req.body.reason;
                            order.reverseSubsOrder((err)=>{
                                if (err){
                                    return res.send({
                                        error_code:5006,
                                        error_msg:err.message
                                    });
                                }
                                res.send({
                                    error_code:0,
                                    error_msg:'ok'
                                })
                                // TODO 发送模板消息
                            })
                        }
                    })
                }
            })
        }else {
            // 将全部邮包置为取消
            let pack = new Package();
            pack.subs_order_id = id;
            let n = 0;
            for (let i=0;i<cancelList.length;i++){
                pack.week = cancelList[i];
                pack.updateByReverse((err)=>{
                    n++;
                    if (n === cancelList.length){
                        // 更新订单
                        order.exec_stages = stages;
                        order.reverse_reason = req.body.reason;
                        order.reverseSubsOrder((err)=>{
                            if (err){
                                return res.send({
                                    error_code:5006,
                                    error_msg:err.message
                                });
                            }
                            res.send({
                                error_code:0,
                                error_msg:'ok'
                            })
                            // TODO 发送模板消息
                        })
                    }
                })
            }
        }
    })
});


const getFamily = require('../../../family/interface/getFamily');
// 获得订阅订单详情
router.get('/',(req,res,next)=>{
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    if (!req.query.subs_order_id){
        return res.send({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
    let  order = new Order();
    order.user_id = req.currentUser.user_id;
    order.subs_order_id = req.query.subs_order_id;
    order.getSubsOrder((err,data)=>{
        if (err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        if (!data){
            return res.send({
                error_code:5004,
                error_msg:'错误订阅单号'
            })
        }
        // 获取家庭
        data = data.attrs;
        getFamily({
            user_id:req.currentUser.user_id,
            family_id:data.family_id,
            callback:(resp)=>{
                if (resp.error_code){
                    return res.send(resp)
                }
                data.family = resp.data;
                res.send({
                    error_code:0,
                    error_msg:'ok',
                    data:data
                })
            }
        })
    })
});


// 后台获得订阅订单详情
router.post('/update', (req, res, next) => {
    if (req.body.secret === secret) {
        let order = new Order();
        order.user_id = req.body.user_id;
        order.subs_order_id=req.body.subs_order_id;
        order.exec_stages=Number(req.body.exec_stages);
        order.update((err, data) => {
            if (err) {
                return res.send({
                    error_code: 5003,
                    error_msg: err.message
                })
            }
            if (!data) {
                return res.send({
                    error_code: 5004,
                    error_msg: '错误订阅单号'
                })
            }
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: data
            })
        })
    } else {
        res.send({
            error_code: 5001,
            error_msg: '无访问权限'
        })
    }
});

// 后台获得订阅订单详情
router.get('/erp-list', (req, res, next) => {
    if (req.query.secret === secret) {
        let order = new Order();
        order.user_id = req.query.user_id;
        order.subs_order_id = req.query.subs_order_id;
        order.getSubsOrder((err, data) => {
            if (err) {
                return res.send({
                    error_code: 5003,
                    error_msg: err.message
                })
            }
            if (!data) {
                return res.send({
                    error_code: 5004,
                    error_msg: '错误订阅单号'
                })
            }
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: data
            })
        })
    } else {
        res.send({
            error_code: 5001,
            error_msg: '无访问权限'
        })
    }
});
module.exports = router;