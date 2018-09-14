const Family = require('../models/Family');

module.exports = (p)=>{
    if (p.user_id&&p.callback){
        let family = new Family();
        family.user_id = p.user_id;
        family.getOnesFamilies((err,data)=>{
            if (err){
                return p.callback({
                    error_code:1011,
                    error_msg:err.message
                })
            }
            p.callback({
                error_code:0,
                error_msg:'ok',
                data:data
            })
        })
    }else{
        throw new Error('缺少参数');
    }
};