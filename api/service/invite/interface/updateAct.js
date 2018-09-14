const Act = require('../models/Act');
module.exports = (p) => {
    if (!p.user_id ||p.order_id) {
        return p.callback({
            error_code: 4001,
            error_msg: '缺少参数'
        })
    }
   let act = new Act();
    act.order_id = p.order_id;
    act.user_id = p.user_id;
    act.update((err,data)=>{
        if(err){
           return p.callback({
               error_code:4002,
               error_msg:err.message
           })
        }else{
        return p.callback({
            error_code:0,
            error_msg:'ok',
            data:data 
        })
        }
    })

}