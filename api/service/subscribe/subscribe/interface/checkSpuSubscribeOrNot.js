// 本接口用于商品接口提供订阅支持
const Map = require('../models/Subscribe-spu-map');

module.exports = (p)=>{
    return new Promise((resolve,reject)=>{
        if (!p.spu_id){
            reject({
                error_code:1001,
                error_msg:'缺少spu_id'
            })
        }
        let map = new Map();
        map.spu_id = p.spu_id;
        map.getSpu2Sub((err,data)=>{
            if (err){
                reject({
                    error_code:1002,
                    error_msg:err.message
                })
            }

            if (data === null){
                resolve({
                    error_code:0,
                    error_msg:'ok',
                    data:0
                })
            }else {
                resolve({
                    error_code:0,
                    error_msg:'ok',
                    data:data.attrs.subscribe_ids.length
                })
            }
        })
    })
};