const Map = require('../models/Subscribe-spu-map');

module.exports = {
    addId:(p)=>{
        return new Promise((resolve,reject)=>{
            if (!p.spu_id || !p.id){
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
                    // 创建一条新纪录
                    map.subscribe_ids = [p.id];
                    map.create((err,data)=>{

                    })
                }else {
                    // 查看有没有ID
                    data = data.attrs;
                    let n = 0;
                    for (let i=0;i<data.subscribe_ids.length;i++){
                        if (p.id === data.subscribe_ids[i]){
                            n++;
                            break;
                        }
                    }
                    // 不存在，加一个
                    if (!n){
                        data.subscribe_ids.push(p.id);
                        map.subscribe_ids = data.subscribe_ids;
                        map.updateSpu2Subs((err)=>{
                            if (err){
                                console.error(err.message)
                            }
                        })
                    }
                }
            })
        })
    },
    deleteId:(p)=>{
        return new Promise((resolve,reject)=>{
            if (!p.spu_id || !p.id){
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
                if (!data){
                    // 不做任何处理
                    resolve(1);
                }
                // 在spu_id下删除这个ID
                let ids = [];
                for (let i=0;i<data.subscribe_ids.length;i++){
                    if (p.id !== data.subscribe_ids[i]){
                        ids.push(data.subscribe_ids[i]);
                    }
                }
                map.subscribe_ids = ids;
                map.updateSpu2Subs((err)=>{
                    if (err){
                        console.error(err.message)
                    }
                })
            })
        })
    }
};