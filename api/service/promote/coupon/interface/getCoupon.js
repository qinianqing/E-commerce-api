// 引入modules
// 两个接口写的都不对，必须先pullCoupon中才行，数据库中的数据不是最新的

const Coupon = require('../models/Coupon-wallet');
const updateCoupons = require('../core/updateCoupon');

module.exports = (p)=>{
    if (p.owner_id&&p.code&&p.type>=0&&p.callback){
        updateCoupons({
            owner_id:p.owner_id,
            type:p.type,
            callback:(resp)=>{
                if (resp.error_code){
                    return p.callback(resp)
                }
                let coupon = new Coupon();
                coupon.owner_id = p.owner_id;
                coupon.code = p.code;
                coupon.queryCouponByCode((err,data)=>{
                    if (err){
                        return p.callback({
                            error_code:1010,
                            error_msg:err.message
                        })
                    }
                    if (data.Count > 1){
                        if(p.type){
                            // 免邮券
                            return p.callback({
                                error_code:1011,
                                error_msg:'免邮券码错误'
                            })
                        }else {
                            return p.callback({
                                error_code:1011,
                                error_msg:'优惠券码错误'
                            })
                        }
                    }
                    if(data.Count === 0){
                        if(p.type){
                            // 免邮券
                            return p.callback({
                                error_code:1012,
                                error_msg:'免邮券码错误'
                            })
                        }else {
                            return p.callback({
                                error_code:1012,
                                error_msg:'优惠券码错误'
                            })
                        }
                    }
                    if (data.Count === 1){
                        data = data.Items[0].attrs;
                        if (data.status === 'OK'){
                            if (data.order_id){
                                if(p.type){
                                    // 免邮券
                                    return p.callback({
                                        error_code:1013,
                                        error_msg:'免邮券已失效',
                                    })
                                }else {
                                    return p.callback({
                                        error_code:1013,
                                        error_msg:'优惠券已失效',
                                    })
                                }
                            }else {
                                return p.callback({
                                    error_code:0,
                                    error_msg:'ok',
                                    data:data
                                })
                            }
                        }else {
                            if(p.type){
                                // 免邮券
                                return p.callback({
                                    error_code:1014,
                                    error_msg:'免邮券已失效'
                                })
                            }else {
                                return p.callback({
                                    error_code:1014,
                                    error_msg:'优惠券已失效'
                                })
                            }
                        }
                    }
                })
            }
        });
    }else{
        throw new Error('需要参数');
    }
};