const Family = require('../models/Family');

module.exports = (p)=>{
    if (p.user_id&&p.family_id&&p.callback){
        let family = new Family();
        family.user_id = p.user_id;
        family.family_id = p.family_id;
        family.getOnesTargetFamily((err,data)=>{
            if (err){
                return p.callback({
                    error_code:1011,
                    error_msg:err.message
                })
            }
            if (data === null){
                return p.callback({
                    error_code:1012,
                    error_msg:'错误family_id'
                })
            }else {
                p.callback({
                    error_code:0,
                    error_msg:'ok',
                    data:data.attrs
                })
            }
        })
    }else{
        throw new Error('缺少参数');
    }
};