const Schedule = require('../models/Schedule');

module.exports = (p)=>{
    if (!p.method||!p.content){
        return p.callback({
            error_code:1001,
            error_msg:'缺少参数'
        })
    }
    let sche = new Schedule();
    sche.method = p.method;
    sche.content = p.content;

    sche.getTargetSchedule((err,data)=>{
        if (err){
            return p.callback({
                error_code:1002,
                error_msg:err.message
            })
        }else {
            p.callback({
                error_code:0,
                error_msg:'ok',
                data:data
            })
        }
    })
};