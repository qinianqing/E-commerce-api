const Account = require('../models/Account');

module.exports = (p)=>{
    if (!p.detail||!p.owner_id||!p.order_id){
        throw new Error('缺少必要参数');
    }
    let account = new Account();
    account.owner_id = p.owner_id;
    account.type = p.type;
    account.status = p.status;
    account.sku_id = p.sku_id;
    account.detail = p.detail;
    account.order_id = p.order_id;
    account.amount = p.amount;
    account.create((err,resp)=>{
        if (err){
            return p.callback({
                error_code:1001,
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