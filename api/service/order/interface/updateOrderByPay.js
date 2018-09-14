const Order = require('../models/Order');
const uuid = require('uuid/v4');

module.exports = (p)=>{
    if (!p.order_id||!p.user_id||!p.callback||p.coupon_discount<0||p.freight_discount<0||p.payment<0||!p.pay_order_id||!p.paidAt||p.family_balance_consume<0||p.user_balance_consume<0||!p.actual_payment){
        return p.callback({
            error_code:1001,
            error_msg:'A缺少参数'
        })
    }

    let order = new Order();
    order.user_id = p.user_id;
    order.order_id = p.order_id;
    order.parcel_id = uuid();
    // 基本信息
    order.total = p.total;
    order.cashback = p.cashback;
    order.goods_total = p.goods_total;
    order.freight = p.freight;
    order.op = p.op;
    // 计算后
    order.coupon_discount = p.coupon_discount;
    order.freight_discount = p.freight_discount;
    order.express_brand = p.express_brand;
    order.payment = p.payment;
    order.items = p.items;
    order.pay_order_id = p.pay_order_id;
    order.paidAt = p.paidAt;
    order.discount = p.discount;
    order.family_balance_consume = p.family_balance_consume;
    order.user_balance_consume = p.user_balance_consume;
    order.actual_payment = p.actual_payment;

    order.updateAfterPay((err,order)=>{
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