const BuyRecord = require('../models/BuyRecord');
const func = require('../utils/utils');

module.exports = (p)=>{
    if (!p.skuItems||!p.user_id||!p.order_id||!p.parcel_id||!p.callback){
        return p.callback({
            error_code:1001,
            error_msg:'缺少参数'
        })
    }
    let skuItems = p.skuItems;
    let record = new BuyRecord();
    let n = 0;
    for (let i=0;i<skuItems.length;i++) {
        record.user_id = user_id;
        record.week = func.cal_this_week_first_second(0);
        record.price = skuItems[i].unit_price;
        record.num = skuItems[i].num;
        record.sku_id = skuItems[i].sku_id;
        record.spu_id = skuItems[i].spu_id;
        record.spu_name = skuItems[i].spu_name;
        record.sku_name = skuItems[i].sku_name;
        record.cover = skuItems[i].cover;
        record.order_id = p.order_id;
        record.parcel_id = p.parcel_id;
        record.cashback = skuItems[i].cashback;
        record.participation = skuItems[i].participation;

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