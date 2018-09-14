// 引入modules
const Coupon = require('../models/Coupon-wallet');
const updateCoupons = require('../core/updateCoupon');

module.exports = (p)=>{
    if (p.owner_id&&p.callback){
        updateCoupons({
            owner_id:p.owner_id,
            type:1,
            callback:(resp)=>{
                if (resp.error_code){
                    return p.callback(resp)
                }
                let coupon = new Coupon();
                coupon.owner_id = p.owner_id;
                coupon.getOnesCouponNumber(1,'OK',(err,data)=>{
                    if (err){
                        return p.callback({
                            error_code:1010,
                            error_msg:err.message
                        })
                    }
                    if (data.Count){
                        return p.callback({
                            error_code:0,
                            error_msg:'ok',
                            data:true
                        })
                    }else {
                        return p.callback({
                            error_code:0,
                            error_msg:'ok',
                            data:false
                        })
                    }
                })
            }
        })
    }else{
        throw new Error('需要参数');
    }
};