// 本接口用于商品接口提供订阅支持
const Map = require('../models/Subscribe-spu-map');
const Wares = require('../models/Subscribe-wares');

module.exports = (p)=>{
    return new Promise((resolve,reject)=>{
        if (!p.spu_id){
            reject({
                error_code:1001,
                error_msg:'缺少spu_id'
            })
        }
        let map = new Map();
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
                // 查询商品信息并返回，这个应该是接口应该干的
                resolve({
                    error_code:0,
                    error_msg:'ok',
                    data:1
                })
            }
        })
    })
};