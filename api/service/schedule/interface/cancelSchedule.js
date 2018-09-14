const Schedule = require('../models/Schedule');

module.exports = (p)=>{
    if (!p.method||!p.content){
        return p.callback({
            error_code:1001,
            error_msg:'B缺少参数'
        })
    }
    let sche = new Schedule();
    sche.method = p.method;
    sche.getTargetSchedule(p.content,(err,data)=>{
        if (err){
            return p.callback({
                error_code:1002,
                error_msg:err.message
            })
        }
        if (data.Count !== 1){
            return p.callback({
                error_code:1004,
                error_msg:'schedule删除错误'
            })
        }
        data = data.Items[0].attrs;
        sche.object_id = data.object_id;
        sche.deleteItem((err)=>{
            if (err){
                return p.callback({
                    error_code:1003,
                    error_msg:err.message
                })
            }else {
                p.callback({
                    error_code:0,
                    error_msg:'ok'
                })
            }
        })
    })
};