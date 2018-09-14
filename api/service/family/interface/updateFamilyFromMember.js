const Family = require('../models/Family');

module.exports = (p)=>{
    if (p.user_id&&p.family_id&&p.vip_expiredAt&&p.callback){
        let family = new Family();
        family.user_id = p.user_id;
        family.family_id = p.family_id;
        family.vip = 1;
        family.vip_expiredAt = p.vip_expiredAt;
        family.updateFamilyVipStatus((err,data)=>{
            if (err){
                return p.callback({
                    error_code:1011,
                    error_msg:err.message
                })
            }
            p.callback({
                error_code:0,
                error_msg:'ok',
                data:data.attrs
            })
        })
    }else{
        throw new Error('缺少参数');
    }
};