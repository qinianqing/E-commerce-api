const Collect = require('../models/Collect');

module.exports = (p)=>{
    if (!p.user_id||!p.goods_id||!p.callback){
        return p.callback({
            error_code:1001,
            error_msg:'缺少参数'
        })
    }
    let collect = new Collect();
    collect.user_id = p.user_id;
    collect.goods_id = p.goods_id;
    collect.getSomeOneWhetherCollect((err,collect)=> {
        if (err) {
            p.callback({
                error_code: 4003,
                error_msg: err.message
            })
        } else {
            if (collect.Count > 0) {
                p.callback({
                    error_code:0,
                    error_msg:'ok',
                    data:1,
                    collect_id:collect.Items[0].attrs.collect_id
                })
            }else {
                p.callback({
                    error_code:0,
                    error_msg:'ok',
                    data:0
                })
            }
        }
    })
};