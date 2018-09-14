const Eva = require('../models/Evaluation');

module.exports = (p)=>{
    if (!p.goods_id||!p.callback){
        return p.callback({
            error_code:1001,
            error_msg:'缺少参数'
        })
    }
    let eva = new Eva();
    eva.goods_id = p.goods_id;
    eva.countGoodEvaNum((err,data)=> {
        if (err) {
            p.callback({
                error_code: 4003,
                error_msg: err.message
            })
        } else {
            p.callback({
                error_code:0,
                error_msg:'ok',
                data:data.Count
            })
        }
    })
};