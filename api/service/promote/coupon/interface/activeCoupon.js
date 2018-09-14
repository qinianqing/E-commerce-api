// 引入modules

const pushCoupon = require('../core/pushCoupon');

module.exports = {
    // 为用户激活免邮券
    freeShipCoupon:(p)=>{
        if (p.family_id&&p.weeks&&p.callback){
            pushCoupon(p.family_id,0,(resp)=>{
                p.callback(resp);
            },parseInt(p.weeks));
        }else{
            throw new Error('需要参数');
        }
    },
    coupon:(p)=>{

    }
};

