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
    user.getTargetUser((err,data) =>{
        if (err){
            p.callback({
                error_code:1002,
                error_msg:err.message
            })
        }else {
            // 遍历wa_form_id
            let formIDs = data.attrs.wa_form_id;
            let now = new Date();
            now = now.getTime();
            if (formIDs.length>0){
                let formIdList = [];
                let targetFormId = '';
                for (let i=0;i<formIDs.length;i++){
                    // 清理过期form_id
                    let expiredData = new Date(formIDs[i].expiredAt);
                    expiredData = expiredData.getTime();
                    if (expiredData > now){
                        // 时效
                        if (!targetFormId){
                            if (formIDs[i].quota>0){
                                targetFormId = formIDs[i].form_id;
                                if ((formIDs[i].quota-1) >0){
                                    let tItem = {
                                        form_id:formIDs[i].form_id,
                                        quota:formIDs[i].quota-1,
                                        expiredAt:formIDs[i].expiredAt
                                    };
                                    formIdList.push(tItem);
                                }
                            }
                        }else {
                            if (formIDs[i].quota>0){
                                formIdList.push(formIDs[i]);
                            }
                        }
                    }
                }
                p.callback({
                    error_code:0,
                    error_msg:'ok',
                    data:targetFormId
                });
                user.wa_form_id = formIdList;
                user.updateFormId((err)=>{
                    if(err){
                        console.error(err.message)
                    }
                })
            }else {
                res.send({
                    error_code:1003,
                    error_msg:'没有form_id'
                })
            }
        }
    })
};