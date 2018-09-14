const Invite = require('../models/Invite');
module.exports = (p) => {
    if (!p.object_id || !p.user_id || !p.invite_user || !p.invite_number || !p.nvite_history) {
        return p.callback({
            error_code: 'invite_4001',
            error_msg: '缺少参数'
        })
    }
   let invite = new Invite();
    invite.object_id = p.object_id;
    invite.user_id = p.user_id;
    invite.invite_user = p.invite_user;
    invite.invite_num = p.invite_num;
    invite.invite_history = p.invite_history;
    invite.create((err,data)=>{
        if(err){
           return p.callback({
               error_code:'invite_4002',
               error_msg:err.message
           })
        }else{
        return p.callback({
            error_code:'0',
            error_msg:'ok',
            data:data 
        })
        }
    })

}