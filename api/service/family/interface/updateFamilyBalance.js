const Family = require('../models/Family');

module.exports = (p)=>{
    if (!p.user_id || !p.family_id){
        return p.callback({
            error_code:1001,
            error_msg:'需要user_id'
        })
    }
    if (p.consume>=0){
       
    }else{
        return p.callback({
            error_code:1001,
            error_msg:'需要数量'
        })
    }
    let family = new Family();
    family.user_id = p.user_id;
    family.family_id = p.family_id;
    family.updateBalanceConsume(p.consume,(err)=>{
        if (err){
            return p.callback({
                error_code:1002,
                error_msg:err.message
            })
        }
        p.callback({
            error_code:0,
            error_msg:'ok'
        })
    })
};