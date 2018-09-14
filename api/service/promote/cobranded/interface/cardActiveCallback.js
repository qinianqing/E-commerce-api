const CBC = require('../models/CoBrandedCard');
const CW = require('../models/CardWallet');

module.exports = (p) =>{
    let cbc = new CBC();
    if (p.id){

    }else {
        return p.callback({
            error_code:1103001,
            error_msg:'缺少参数'
        })
    }
    cbc.id = p.id;
    cbc.activeCall((err,data) => {
        if (err){
            return p.callback({
                error_code:1103002,
                error_msg:err.message
            })
        }
        let cw = new CW();
        cw.user_id = p.user_id;
        cw.family_id = p.family_id;
        cw.card_type = '1001'; // 1001，联名卡
        cw.card_id = p.id;// 卡ID
        cw.create((err,data)=>{
            if (err){
                return p.callback({
                    error_code:1103003,
                    error_msg:err.message
                })
            }
            p.callback({
                error_code:0,
                error_msg:'ok'
            });
        })
    })
};