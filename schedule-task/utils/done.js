const Schedule = require('../models/Schedule');


module.exports = (method,object_id)=>{
    return new Promise((resolve,reject) => {
        if (object_id&&method){
            let schedule = new Schedule();
            schedule.method = method;
            schedule.object_id = object_id;
            schedule.deleteItem((err)=>{
                if (err){
                    reject(err.message+object_id);
                }
                resolve(1);
            })
        }else {
            reject('DONE传入参数错误');
        }
    })
};