// 用券接口，内部调用

const router = require('express').Router();

const { secret } = require('../config');

const CouponI = require('../models/Coupon-wallet');
const CouponT = require('../models/Coupon-template');
const product = require('../../../product/interface/getProduct');

router.get('/fit-list',(req,res,next)=>{
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    if (!req.query.coupon_id){
        return res.send({
            error_code:5002,
            error_msg:'缺少coupon_id'
        })
    }
    let couponT = new CouponT();
    couponT.coupon_id = req.query.coupon_id;
    couponT.getCouponTbyQuery((err,data)=>{
        if (err){
            return res.send({
                error_code:5003,
                error_msg:'无调用权限'
            })
        }
        if (data.Count === 1){
            data = data.Items[0].attrs;
            let fit = data.fit;
            if (fit.length){
                if (fit[0] === '*'){
                    res.send({
                        error_code:0,
                        error_msg:'ok'
                    })
                }else {
                    let spus = [];
                    product.get.spusBrief({
                        spus:fit,
                        callback:(resp)=>{
                            if (resp.error_code){
                                return res.send(resp);
                            }
                            res.send({
                                error_code:0,
                                error_msg:'ok',
                                data:resp.data
                            })
                        }
                    })
                }
            }else {
                return res.send({
                    error_code:5005,
                    error_msg:'coupon错误'
                })
            }
        }else {
            return res.send({
                error_code:5004,
                error_msg:'错误coupon_id'
            })
        }
    })
});

// 内部接口调用，使用代金券
router.post('/free-ship-coupon',function (req,res,next) {
    if (req.body.secret === secret){
        let p = req.body;
        if (p.family_id&&p.code&&p.order_id){
            // 查询code是否可以使用
            let couponI = new CouponI();
            couponI.owner_id = p.family_id;
            couponI.code = p.code;
            couponI.queryCouponByCode((err,data)=>{
                if (err){
                    res.send({
                        error_code:5003,
                        error_msg:err.message
                    })
                }else {
                    if (data.Count === 1){
                        // 获取券详情
                        let resp = data.Items[0].attrs;
                        if (resp.status === 'OK'){
                            // 更新券状态
                            couponI.createdAt = resp.createdAt;
                            couponI.order_id = p.order_id;
                            couponI.consumeConpon((err)=>{
                                if (err){
                                    res.send({
                                        error_code:5005,
                                        error_msg:err.message
                                    })
                                }else {
                                    res.send({
                                        error_code:0,
                                        error_msg:'ok'
                                    })
                                }
                            })
                        }else {
                            res.send({
                                error_code:5006,
                                error_msg:'免邮券不可用'
                            })
                        }
                    }else {
                        res.send({
                            error_code:5004,
                            error_msg:'错误免邮券'
                        })
                    }
                }
            })
        }else {
            res.send({
                error_code:5002,
                error_msg:'缺少参数'
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

router.post('/coupon',function (req,res,next) {
    if (req.body.secret === secret){
        let p = req.body;
        if (p.user_id&&p.code&&p.order_id){
            // 查询code是否可以使用
            let couponI = new CouponI();
            couponI.owner_id = p.user_id;
            couponI.code = p.code;
            couponI.queryCouponByCode((err,data)=>{
                if (err){
                    res.send({
                        error_code:5003,
                        error_msg:err.message
                    })
                }else {
                    if (data.Count === 1){
                        // 获取券详情
                        let resp = data.Items[0].attrs;
                        if (resp.status === 'OK'){
                            // 更新券状态
                            couponI.createdAt = resp.createdAt;
                            couponI.order_id = p.order_id;
                            couponI.consumeConpon((err)=>{
                                if (err){
                                    res.send({
                                        error_code:5005,
                                        error_msg:err.message
                                    })
                                }else {
                                    res.send({
                                        error_code:0,
                                        error_msg:'ok'
                                    })
                                }
                            })
                        }else {
                            res.send({
                                error_code:5006,
                                error_msg:'错误优惠券'
                            })
                        }
                    }else {
                        res.send({
                            error_code:5004,
                            error_msg:'错误优惠券'
                        })
                    }
                }
            })
        }else {
            res.send({
                error_code:5002,
                error_msg:'缺少参数'
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

module.exports = router;
