const BuyRecord = require('../models/BuyRecord');
const func = require('../utils/utils');

// 用于订阅商品

module.exports = (p)=>{
    if (!p.skuItems||!p.user_id||!p.order_id||!p.parcel_id ||!p.callback){
        return p.callback({
            error_code:1001,
            error_msg:'C缺少参数'
        })
    }
    let skuItems = p.skuItems;
    let record = new BuyRecord();
    let n = 0;
    for (let i=0;i<skuItems.length;i++) {
        record.user_id = p.user_id;
        record.week = func.cal_this_week_first_second(0);
        record.family_id = p.family_id;
        record.price = skuItems[i].price;
        record.num = skuItems[i].num;
        record.sku_id = skuItems[i].sku_id;
        record.spu_id = skuItems[i].sku_id.split('-')[0];
        record.spu_name = skuItems[i].goods_name;
        record.sku_name = skuItems[i].type_id;
        record.cover = skuItems[i].cover;
        record.order_id = p.order_id;
        record.parcel_id = p.parcel_id;
        record.cashback = 0;
        record.participation = false;

        record.create((err, data) => {
            n++;
            if(n === skuItems.length){
                return p.callback({
                    error_code:0,
                    error_msg:'ok'
                })
            }
        })
    }
};