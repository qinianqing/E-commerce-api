const User = require('../models/User');

module.exports = (p)=>{
    if (!p.user_id){
        return p.callback({
            error_code:1001,
            error_msg:'需要user_id'
        })
    }
    let user = new User();
    user.user_id = p.user_id;
    user.getTargetUserCR((err,data)=>{
        if (err){
            return p.callback({
                error_code:1002,
                error_msg:err.message
            })
        }
        if (data === null){
            return p.callback({
                error_code:1003,
                error_msg:'错误user_id'
            })
        }else {
            p.callback({
                error_code:0,
                error_msg:'ok',
                data:data.attrs
            })
        }
    })
};