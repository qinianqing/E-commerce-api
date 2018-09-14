const { env } = require('../../../../config');

const { awsParams } = require('../../config.js');
const dynogels = require('jinshi-dynogels');
const Joi = require('joi');
const uuid = require('uuid/v4');

if (env === 'dev'){
    dynogels.AWS.config.update({
        accessKeyId:awsParams.accessKeyId,
        secretAccessKey:awsParams.secretAccessKey,
        region:'cn-north-1',
        // endpoint:awsParams.dynamoEndpoint
    });
}else {
    dynogels.AWS.config.update({
        accessKeyId:awsParams.accessKeyId,
        secretAccessKey:awsParams.secretAccessKey,
        region:awsParams.region,
        //endpoint:awsParams.dynamoEndpoint
    });
}

// 这个表的任务只有一个，查询关联的订阅商品列表
const SSMM = dynogels.define('js_subscribe_spu_map', {
    hashKey: 'spu_id',
    timestamps: true,
    schema: {
        spu_id: Joi.string(),// 分区键，spu_id
        subscribe_ids:Joi.array(),// 对应的订阅商品
    }
});

// if (env === 'dev') {
//     dynogels.createTables({'js_subscribe_spu_map': { readCapacity: 1, writeCapacity: 1 }},(err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class SSM {
    get spu_id() { return this._spu_id; }
    set spu_id(value) { this._spu_id = value; }

    get subscribe_ids(){ return this._subscribe_ids;}
    set subscribe_ids(value){ this._subscribe_ids = value;}

    // 创建一条hash
    create(callback) {
        SSMM.create({
            spu_id: this.spu_id,
            subscribe_ids:this.subscribe_ids,
        },{overwrite : false}, (err, data) => {
            callback(err, data)
        })
    }

    // 更新一条hash
    updateSpu2Subs(callback){
        SSMM.update({
            spu_id:this.spu_id,
            subscribe_ids:this.subscribe_ids,
        },(err,data)=>{
            callback(err);
        })
    }

    getSpu2Sub(callback){
        SSMM.get({spu_id:this.spu_id},(err,data)=>{
            callback(err,data)
        })
    }

    // 查询spu_id对应subscribe_id的hash
    querySpu2Subs(callback){
        SSMM.query(this.spu_id)
            .exec((err,data)=>{
                callback(err,data)
            })
    }

}
module.exports = SSM;
