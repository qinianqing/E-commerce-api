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
    user.updateMemberTried((err)=>{
        if (err){
            return p.callback({
                error_code:1002,
                error_msg:err.message
            })
        }else {
            p.callback({
                error_code:0,
                error_msg:'ok'
            })
        }
    })
};