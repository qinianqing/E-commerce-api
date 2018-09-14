const Collect = require('../models/Collect');

module.exports = (p)=>{
    if (!p.user_id||!p.callback){
        return p.callback({
            error_code:1001,
            error_msg:'缺少参数'
        })
    }
    let collect = new Collect();
    collect.user_id = p.user_id;
    collect.getCollectList((err,collect)=> {
        if (err) {
            p.callback({
                error_code: 4003,
                error_msg: err.message
            })
        } else {
            let collectlist = [];
            if (collect.Count > 0) {
                for (let i = 0; i < collect.Count; i++) {
                    collectlist.push(collect.Items[0].attrs)
                }
            }
            p.callback({
                error_code:0,
                error_msg:'ok',
                data:collectlist
            });
        }
    })
};