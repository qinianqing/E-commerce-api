const CardWallet = require('../models/CardWallet');

module.exports = (p) =>{
    let cw = new CardWallet();
    if (p.user_id && p.card_type && p.card_id){

    }else {
        return p.callback({
            error_code:1101001,
            error_msg:'缺少参数'
        })
    }
    cw.user_id = p.user_id;
    cw.card_type = p.card_type;
    cw.card_id = p.card_id;
    cw.getOnesCardNum((err,data) => {
        if (err){
            return p.callback({
                error_code:1101002,
                error_msg:err.message
            })
        }
        return p.callback({
            error_code:0,
            error_msg:'ok',
            data:data.Count
        })
    })
};
