// 本接口用于为支付时wares信息支持
const Wares = require('../models/Subscribe-wares');

module.exports = (p)=>{
    return new Promise((resolve,reject)=>{
        if (!p.id){
            reject({
                error_code:1001,
                error_msg:'缺少ID'
            })
        }
        let ware = new Wares();
        if (p.id.split('#').length){
            ware.id = p.id.split('#')[0];
        }else {
            ware.id = p.id;
        }
        ware.getWare((err,data)=>{
            if (err){
                reject({
                    error_code:1002,
                    error_msg:err.message
                })
            }
            if (data === null){
                reject({
                    error_code:1003,
                    error_msg:'错误ID'
                })
            }else {
                resolve({
                    error_code:0,
                    error_msg:'ok',
                    data:data.attrs
                })
            }
        })
    })
};