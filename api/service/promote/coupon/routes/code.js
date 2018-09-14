/*
*   优惠码
*
 */

const router = require('express').Router();

const CouponC = require('../models/Coupon-code');
const pushCoupon = require('../core/pushCoupon');

const { secret } = require('../config');

// 优惠码兑换成优惠券
// @param code
router.post('/exchange',function (req,res,next) {
    if (req.currentUser){
        if (req.body.code){
            let cC = new CouponC();
            cC.coupon_code = req.body.code;
            cC.getCodeDetail((err,data)=>{
                if (err){
                    res.send({
                        error_code:5003,
                        error_msg:err.message
                    })
                }else {
                    if (data.Items.length > 0){
                        let item = data.Items[0].attrs;
                        if (item.status === 'OK'){
                            let nowTime = new Date();
                            nowTime = nowTime.getTime();
                            if (item.activeAt === '-'){
                                item.activeAt = nowTime;
                            }else {
                                let aAt = new Date(item.activeAt);
                                item.activeAt = aAt.getTime();
                            }
                            let eAt = new Date(item.expiredAt);
                            item.expiredAt = eAt.getTime();
                            if (nowTime >= item.activeAt&&nowTime <item.expiredAt){
                                if (item.active_num >= item.num){
                                    // 超量
                                    res.send({
                                        error_code:5008,
                                        error_msg:'优惠码已被领完'
                                    });

                                    // 更新码状态
                                    cC.id = item.id;
                                    cC.createdAt = item.createdAt;
                                    cC.status = 'INVALID';
                                    cC.updateCouponCStatus((err)=>{
                                        if (err){
                                            console.error(err.message);
                                        }
                                    })
                                }else {
                                    // 可以正常创建
                                    pushCoupon(req.currentUser.user_id,item.coupon_id,(resp)=>{
                                        res.send(resp);
                                        if(resp.error_code === 0){
                                            if (item.num === item.active_num+1){
                                                cC.status = 'INVALID';
                                            }else {
                                                cC.status = 'OK';
                                            }
                                            cC.id = item.id;
                                            cC.createdAt = item.createdAt;
                                            cC.updateCouponConsumeNum((err)=>{
                                                if (err){
                                                    console.error(err.message);
                                                }
                                            })
                                        }
                                    })
                                }
                            }else if (nowTime < item.activeAt){
                                // 暂未激活
                                res.send({
                                    error_code:5006,
                                    error_msg:'优惠码暂不可用'
                                })
                            }else if (nowTime >= item.expiredAt){
                                // 超期失效
                                res.send({
                                    error_code:5007,
                                    error_msg:'优惠码已失效'
                                });

                                // 更新码状态
                                cC.id = item.id;
                                cC.createdAt = item.createdAt;
                                cC.status = 'INVALID';
                                cC.updateCouponCStatus((err)=>{
                                    if (err){
                                        console.error(err.message);
                                    }
                                })
                            }
                        }else {
                            res.send({
                                error_code:5005,
                                error_msg:'优惠码不可用'
                            })
                        }
                    }else {
                        res.send({
                            error_code:5004,
                            error_msg:'优惠码不正确'
                        })
                    }
                }
            })
        }else {
            res.send({
                error_code:5002,
                error_msg:'缺少优惠码'
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

// 以下为内部接口

// 新建优惠码
router.post('/create',function (req,res,next) {
    if(req.body.secret === secret){
        let p = req.body;

        if (p.coupon_code&&p.coupon_id&&p.status&&p.activeAt&&p.expiredAt&&p.num){
            let couponC = new CouponC();
            couponC.coupon_code = p.coupon_code;
            couponC.coupon_id = p.coupon_id;
            couponC.status = p.status;
            couponC.activeAt = p.activeAt;
            couponC.expiredAt = p.expiredAt;
            couponC.num = parseInt(Number(p.num));
            couponC.create((err)=>{
                if (err){
                    res.send({
                        error_code:5003,
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

// 编辑优惠码
router.post('/update',function (req,res,next) {
    if(req.body.secret === secret){
        let p = req.body;
        if (p.id&&p.createdAt){
            let couponC = new CouponC();
            couponC.id = p.id;
            couponC.createdAt = p.createdAt;
            couponC.getCouponC((err,data)=>{
                if (err){
                    res.send({
                        error_code:5004,
                        error_msg:err.message
                    })
                }else {
                    if (data){
                        let item = data.attrs;
                        if (p.coupon_code){
                            couponC.coupon_code = p.coupon_code;
                        }else {
                            couponC.coupon_code = item.coupon_code;
                        }
                        if (p.coupon_id){
                            couponC.coupon_id = p.coupon_id;
                        }else {
                            couponC.coupon_id = item.coupon_id;
                        }
                        if (p.status){
                            couponC.status = p.status;
                        }else {
                            couponC.status = item.status;
                        }
                        if (p.activeAt){
                            couponC.activeAt = p.activeAt;
                        }else {
                            couponC.activeAt = item.activeAt;
                        }
                        if (p.expiredAt){
                            couponC.expiredAt = p.expiredAt;
                        }else {
                            couponC.expiredAt = item.expiredAt;
                        }
                        if (p.num){
                            couponC.num = parseInt(Number(p.num));
                        }else {
                            couponC.num = parseInt(Number(item.num));
                        }
                        couponC.updateCouponc((err)=>{
                            if (err){
                                res.send({
                                    error_code:5003,
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
                            error_code:5004,
                            error_msg:'指定优惠码不存在'
                        })
                    }
                }
            });
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
// 优惠码列表
router.get('/list',function (req,res,next) {
    if(req.query.secret === secret){
        let couponC = new CouponC();
        // 对lastkey参数需要拼合处理last_key
        let last_key;
        if(req.query.id&&req.query.createdAt){
            last_key = {
                id:req.query.id,
                createdAt:req.query.createdAt
            }
        }
        couponC.queryCouponC((err,data)=>{
            if (err){
                res.send({
                    error_code:5002,
                    error_msg:err.message
                })
            }else {
                res.send(data)
            }
        },last_key)
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

// 删除优惠码
router.post('/delete',function (req,res,next) {
    if(req.body.secret === secret){
        let p = req.body;
        if (p.id&&p.createdAt){
            let couponC = new CouponC();
            couponC.id = p.id;
            couponC.createdAt = p.createdAt;
            couponC.deleteCode((err)=>{
                if(err){
                    res.send({
                        error_code:5003,
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