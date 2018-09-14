const Order = require('../models/Order');
const uuid = require('uuid/v4');

module.exports = (p)=>{
    let order = new Order();

    order.createBySplit(p,(err,order)=>{
        if (err){
            return p.callback({
                error_code:5003,
                error_msg:err.message
            });
        }else {
            if (order){
                return p.callback({
                    error_code:0,
                    error_msg:'ok',
                    data:order
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