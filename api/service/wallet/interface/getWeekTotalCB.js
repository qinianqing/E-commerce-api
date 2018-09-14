const BuyRecord = require('../../order/models/BuyRecord');
const func = require('../../cart/utils/utils');

module.exports = (p)=>{
    if (!p.week||!p.user_id){
        throw new Error('缺少必要参数');
    }
    let record = new BuyRecord();
    record.user_id = p.user_id;
    record.week = p.week;
    record.getWeekRecordsJoinTotalCB((err,resp)=>{
        if (err){
            return p.callback({
                error_code:1002,
                error_msg:err.message
            })
        }else {
            let total = 0;
            let items = resp.Items;
            for (let i=0;i<resp.Count;i++){
                total = total+ items[i].attrs.price*items[i].attrs.num;
            }
            total = Number(total.toFixed(2));
            let notice = func.discount_notice(total);
            p.callback({
                error_code:0,
                error_msg:'ok',
                data:{
                    consume:total,
                    notice:notice
                }
            })
        }
    })
};