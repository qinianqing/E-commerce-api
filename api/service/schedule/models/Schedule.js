// Schedule model

// author by Ziv
// TODO
// 1、上线前需求务必注释掉endpoint，不能设为空
// 2、注释掉createTable方法
//
// 本数据库表用于计划任务

// v0.1
// 2018-01-02
const { env } = require('../../../config');

const { awsParams } = require('../../order/config.js');
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

//js_schedule 一系列商品表
const ScheduleM = dynogels.define('js_schedule',{
    hashKey: 'method',
    rangeKey:'object_id',
    timestamps: true,
    schema:{
        method:Joi.string(),
        object_id:Joi.string(),
        occur:Joi.string(),
        content:Joi.string(),
        status:Joi.number() // 2位处理完成，1为处理中，0为没处理
    }
});

// if (env === 'dev') {
//     dynogels.createTables({'js_schedule': { readCapacity: 1, writeCapacity: 1 }},(err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class Schedule {
    get method(){ return this._method;}
    set method(value) { this._method = value;}

    get object_id(){ return this._object_id;}
    set object_id(value) { this._object_id = value;}

    get occur(){ return this._occur;}
    set occur(value){ this._occur = value;}

    get content(){ return this._content;}
    set content(value){ this._content = value;}

    get status(){ return this._status;}
    set status(value){ this._status = value;}

    // 创建一条计划
    create(callback){
        ScheduleM.create({
            method:this.method,
            object_id:Date.now()+uuid().replace(/-/g, ''),
            occur:this.occur,
            content:this.content,
            status:0
        },(err,data)=>{
            callback(err,data)
        })
    }

    // var now = new Date().toISOString();
    // 传入的时间数据都是iso格式的字符串
    getSchedules(p,callback){
        ScheduleM.query(this.method)
            .filter('occur').lte(p)
            .filter('status').equals(0)
            .loadAll()
            .exec((err,data)=>{
                callback(err,data)
            })
    }

    getTargetSchedule(p,callback){
        ScheduleM.query(this.method)
            .filter('content').equals(p)
            .exec((err,data)=>{
                callback(err,data)
            })
    }

    // 取消计划处理
    cancelScheduleHandling(callback){
        ScheduleM.update({
            method:this.method,
            object_id:this.object_id,
            status:0
        },(err,data)=>{
            callback(err)
        })
    }

    // 将计划设置为处理中
    setScheduleHandling(callback){
        ScheduleM.update({
            method:this.method,
            object_id:this.object_id,
            status:1
        },(err,data)=>{
            callback(err)
        })
    }

    // 将计划设置为处理完成
    setScheduleFinish(callback){
        ScheduleM.update({
            method:this.method,
            object_id:this.object_id,
            status:2
        },(err,data)=>{
            callback(err)
        })
    }

    deleteItem(callback){
        ScheduleM.destroy({method:this.method,object_id:this.object_id},(err)=>{
            callback(err)
        })
    }
}

module.exports = Schedule;