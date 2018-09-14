const CBC = require('../models/CoBrandedCard');

module.exports = (p) =>{
    let cbc = new CBC();
    if (p.id){

    }else {
        return p.callback({
            error_code:1102001,
            error_msg:'缺少参数'
        })
    }
    cbc.id = p.id;
    cbc.getCard((err,data) => {
        if (err){
            return p.callback({
                error_code:1102002,
                error_msg:err.message
            })
        }
        if (data === null){
            return p.callback({
                error_code:1102003,
                error_msg:'错误id'
            })
        }
        return p.callback({
            error_code:0,
            error_msg:'ok',
            data:data.attrs
        })
    })
};