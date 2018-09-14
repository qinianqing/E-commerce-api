// 引入modules
// 两个接口写的都不对，必须先pullCoupon中才行，数据库中的数据不是最新的

const Coupon = require('../models/Coupon-wallet');

module.exports = (p)=>{
    if (p.family_id&&p.callback){
        let coupon = new Coupon();
        coupon.owner_id = p.family_id;
        coupon.getOnesFscValidNumber((err,data)=>{
            if (err){
                return p.callback({
                    error_code:1010,
                    error_msg:err.message
                })
            }
            return p.callback({
                error_code:0,
                error_msg:'ok',
                data:data.Count
            })
        })
    }else{
        throw new Error('需要参数');
    }
};