// ActiveCode Model
// ziv 2018-1-5
// v0.1 创建

const {
    awsParams,
} = require('../config');

const dynogels = require('jinshi-dynogels');

dynogels.AWS.config.update({
    accessKeyId:awsParams.accessKeyId,
    secretAccessKey:awsParams.secretAccessKey,
    region:awsParams.region,
    //endpoint:awsParams.dynamoEndpoint
});

const Joi = require('joi');

const ActiveCodeM = dynogels.define('js_active_code',{
    hashKey: 'active_code',
    timestamps: true,
    schema:{
        active_code:Joi.string(),    
        cyc:Joi.number(), // 周期
        batch:Joi.string(),// 激活码批次
        type:Joi.number(),// 位数
        status:Joi.string(),// OK、USED、CANCELED
        user_id:Joi.string(),
        ip:Joi.string(),//
        active_date:Joi.string(),
        purpose:Joi.string()// 标明用途
    }
});

/*
dynogels.createTables({'js_active_code': { readCapacity: 5, writeCapacity: 5 }},(err) => {
    if (err) {
        console.log('updating tables error', err);
    } else {
        console.log('table updated');
    }
})
*/

class ActiveCode {
    get active_code() { return this._active_code; }
    set active_code(value) { this._active_code = value; }

    get cyc() { return this._cyc; }
    set cyc(value) { this._cyc = value; }

    get batch() { return this._batch; }
    set batch(value) { this._batch = value; }

    get type() { return this._type; }
    set type(value) { this._type = value; }

    get status() { return this._status; }
    set status(value) { this._status = value; }

    get user_id() { return this._user_id; }
    set user_id(value) { this._user_id = value; }

    get ip() { return this._ip; }
    set ip(value) { this._ip = value; }

    get active_date() { return this._active_date; }
    set active_date(value) { this._active_date = value; }

    get purpose() { return this._purpose; }
    set purpose(value) { this._purpose = value; }

    /* 新建激活码 */
    create(callback){
        ActiveCodeM.create({
            active_code:this.active_code,
            cyc:this.cyc,
            batch:this.batch,
            type:this.type,
            status:'OK',
            purpose:this.purpose
        }, {overwrite : false},function (err,data){
            callback(err,data);
        })
    }

    /* 激活 */
    active(callback){
        ActiveCodeM.update({
            active_code:this.active_code,
            status:'USED',
            user_id:this.user_id,
            ip:this.ip,
            active_date:this.active_date
        },(err,data) => {
            callback(err,data);
        })
    }

    /* 取消一个激活码 */
    cancel(callback){
        ActiveCodeM.update({
            active_code:this.active_code,
            status:'CANCELED',
        },(err,data) => {
            callback(err,data);
        })
    }

    /* 获取所有激活码数 */
    getCodeNumber(callback){
        ActiveCodeM.parallelScan(5)
            .select('COUNT')
            .exec((err,count)=>{
                callback(err,count)
            })
    }

    /* 查询一个批次的所有激活码 */
    getBatchCode(callback){
        ActiveCodeM.parallelScan(5)
            .where('batch').equals(this.batch)
            .loadAll()
            .exec((err,data)=>{
                callback(err,data)
            });
    }
    /* 获取激活码详情 */
    getActiveCodeDetail(callback){
        ActiveCodeM.get({
            active_code:this.active_code
        },(err,data) => {
            callback(err,data)
        })
    }
}

module.exports = ActiveCode;