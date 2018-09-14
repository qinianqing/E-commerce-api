const Schedule = require('../models/Schedule');

module.exports = (method,object_id)=>{
    return new Promise((resove,reject)=>{
        if(method&&object_id){
            let schedule = new Schedule();
            schedule.method = method;
            schedule.object_id = object_id;
            schedule.setScheduleHandling((err)=>{
                if (err){
                    reject(err.message+object_id);
                }
                resove(1);
            })
        }else {
            reject('HADNLING传入参数错误');
        }
    })
};