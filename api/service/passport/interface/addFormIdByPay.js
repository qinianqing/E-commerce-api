const User = require('../models/User');

module.exports = (p)=>{
    if (!p.user_id || !p.form_id || !p.expiredAt){
        return p.callback({
            error_code:1001,
            error_msg:'需要user_id'
        })
    }
    let user = new User();
    user.user_id = p.user_id;
    user.getTargetUser((err,data) =>{
        if (err){
            return p.callback({
                error_code:5003,
                error_msg:err.message
            })
        }else {
            data = data.attrs;
            let formItem = {
                form_id:p.form_id,
                quota:3,
                expiredAt:p.expiredAt
            };
            let items = [];
            if(data.wa_form_id){
                items = data.wa_form_id;
            }
            items.push(formItem);
            user.wa_form_id = items;
            user.updateFormId((err)=>{
                if (err){
                    p.callback({
                        error_code:5004,
                        error_msg:err.message
                    })
                }else {
                    p.callback({
                        error_code:0,
                        error_msg:'ok'
                    })
                }
            })
        }
    })
};