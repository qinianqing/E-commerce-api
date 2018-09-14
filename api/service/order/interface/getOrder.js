const Order = require('../models/Order');

module.exports = (p)=>{
    if (!p.order_id||!p.user_id||!p.callback){
        return p.callback({
            error_code:1001,
            error_msg:'缺少参数'
        })
    }
    let order = new Order();
    order.user_id = p.user_id;
    order.order_id = p.order_id;
    order.getOrder((err,order)=>{
        if (err){
            return p.callback({
                error_code:5003,
                error_msg:err.message
            });
        }else {
            if (order !== null){
                return p.callback({
                    error_code:0,
                    error_msg:'ok',
                    data:{
                        order:order.attrs
                    }
                });
            }else {
                return p.callback({
                    error_code:5004,
                    error_msg:'订单号错误'
                })
            }
        }
    })
};