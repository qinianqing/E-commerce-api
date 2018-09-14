// use coupon

const CouponI = require('../models/Coupon-wallet');

module.exports = {
    // 使用免邮券
    freeShipCoupon:(p)=>{
        if (p.family_id&&p.code&&p.order_id&&p.callback){
            // 查询code是否可以使用
            let couponI = new CouponI();
            couponI.owner_id = p.family_id;
            couponI.code = p.code;
            couponI.queryCouponByCode((err,data)=>{
                if (err){
                    p.callback({
                        error_code:1003,
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
                                    p.callback({
                                        error_code:1005,
                                        error_msg:err.message
                                    })
                                }else {
                                    p.callback({
                                        error_code:0,
                                        error_msg:'ok'
                                    })
                                }
                            })
                        }else {
                            p.callback({
                                error_code:1006,
                                error_msg:'免邮券不可用'
                            })
                        }
                    }else {
                        p.callback({
                            error_code:1004,
                            error_msg:'错误免邮券'
                        })
                    }
                }
            })
        }else{
            throw new Error('需要参数');
        }
    },
    // 使用代金券
    coupon:(p)=>{
        if (p.user_id&&p.code&&p.order_id&&p.callback){
            if (p.user_id&&p.code&&p.order_id) {
                // 查询code是否可以使用
                let couponI = new CouponI();
                couponI.owner_id = p.user_id;
                couponI.code = p.code;
                couponI.queryCouponByCode((err, data) => {
                    if (err) {
                        p.callback({
                            error_code: 1003,
                            error_msg: err.message
                        })
                    } else {
                        if (data.Count === 1) {
                            // 获取券详情
                            let resp = data.Items[0].attrs;
                            if (resp.status === 'OK') {
                                // 更新券状态
                                couponI.createdAt = resp.createdAt;
                                couponI.order_id = p.order_id;
                                couponI.consumeConpon((err) => {
                                    if (err) {
                                        p.callback({
                                            error_code: 1005,
                                            error_msg: err.message
                                        })
                                    } else {
                                        p.callback({
                                            error_code: 0,
                                            error_msg: 'ok'
                                        })
                                    }
                                })
                            } else {
                                p.callback({
                                    error_code: 1006,
                                    error_msg: '错误优惠券'
                                })
                            }
                        } else {
                            p.callback({
                                error_code: 1004,
                                error_msg: '错误优惠券'
                            })
                        }
                    }
                })
            }
        }else {
            throw new Error('需要参数');
        }
    }
};