// BuyRecord model

// author by Ziv
// 1、上线前需求务必注释掉endpoint，不能设为空
// 2、注释掉createTable方法
//
// 本数据库表用于计划任务

// v0.1
// 2018-01-11
const { env } = require('../../../config');

const { awsParams } = require('../config.js');
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

//js_buy_record 一系列商品表
const BuyRecordM = dynogels.define('js_buy_record',{
    hashKey: 'user_id',
    rangeKey:'object_id',
    timestamps: true,
    schema:{
        user_id:Joi.string(),
        object_id:Joi.string(),
        family_id:Joi.string(),// 配送的家庭，没有为空
        week:Joi.string(),// 邮包周数，显示当周周一0点的timestamp
        sku_id:Joi.string(),
        spu_id:Joi.string(),
        spu_name:Joi.string(),
        sku_name:Joi.string(),
        cover:Joi.string(),
        parcel_id:Joi.string(),
        price:Joi.number(),// 订单单价
        num:Joi.number(),
        cashback:Joi.number(),
        participation:Joi.boolean(),// true参与周返现，false不参与周返现
        order_id:Joi.string(),
        status:Joi.number(), // 0正常、1退货
        eva_status:Joi.number(),// 评价,0未评价，1已评价
        comment_id:Joi.string() // 对应的评价ID
    },
    indexes:[
        { hashKey: 'user_id', rangeKey: 'eva_status', type: 'global', name: 'EvaStatusIndex' },
    ]
});

// if (env === 'dev') {
//     dynogels.createTables({'js_buy_record': { readCapacity: 1, writeCapacity: 1 }},(err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class BuyRecord {
    get user_id(){ return this._user_id;}
    set user_id(value) { this._user_id = value;}

    get object_id(){ return this._object_id;}
    set object_id(value){ this._object_id = value;}

    get family_id(){ return this._family_id;}
    set family_id(value){ this._family_id = value;}

    get week(){ return this._week;}
    set week(value){ this._week = value;}

    get sku_id(){ return this._sku_id;}
    set sku_id(value){ this._sku_id = value;}

    get spu_id(){ return this._spu_id;}
    set spu_id(value){ this._spu_id = value;}

    get spu_name(){ return this._spu_name;}
    set spu_name(value){ this._spu_name = value;}

    get sku_name(){ return this._sku_name;}
    set sku_name(value){ this._sku_name = value;}

    get cover(){ return this._cover;}
    set cover(value){ this._cover = value;}

    get price(){ return this._price;}
    set price(value){ this._price= value;}

    get num(){ return this._num;}
    set num(value){ this._num= value;}

    get cashback(){ return this._cashback;}
    set cashback(value){ this._cashback= value;}

    get participation(){ return this._participation;}
    set participation(value){ this._participation= value;}

    get order_id(){ return this._order_id;}
    set order_id(value){ this._order_id = value;}

    get parcel_id(){ return this._parcel_id;}
    set parcel_id(value){ this._parcel_id = value;}

    get status(){ return this._status;}
    set status(value){ this._status = value;}

    get eva_status(){ return this._eva_status;}
    set eva_status(value){ this._eva_status = value;}



    // 创建一条购买记录
    create(callback){
        BuyRecordM.create({
            user_id:this.user_id,
            object_id:Date.now()+uuid().replace(/-/g, ''),
            family_id:this.family_id,
            week:this.week,
            price:this.price,
            num:this.num,
            sku_id:this.sku_id,
            spu_id:this.spu_id,
            spu_name:this.spu_name,
            sku_name:this.sku_name,
            cover:this.cover,
            order_id:this.order_id,
            parcel_id:this.parcel_id,
            cashback:this.cashback,
            participation:this.participation,
            status:0,
            eva_status:0
        },(err,data)=>{
            callback(err,data)
        })
    }

    getTargetRecord(callback){
        BuyRecordM.get({
            user_id:this.user_id,
            object_id:this.object_id
        },(err,data)=>{
            callback(err,data);
        })
    }

    setRecordRefund(callback){
        BuyRecordM.update({
            user_id:this.user_id,
            object_id:this.object_id,
            status:1
        },(err,data)=>{
            callback(err)
        })
    }

    setRecordEva(callback){
        BuyRecordM.update({
            user_id:this.user_id,
            object_id:this.object_id,
            eva_status:1,
            comment_id:this.comment_id
        },(err,data)=>{
            callback(err)
        })
    }

    // 返回某一周所有支付未退货的购买记录
    getWeekRecords(callback){
            BuyRecordM.query(this.user_id)
                .filter('week').equals(this.week)
                .filter('status').equals(0)
                .loadAll()
                .exec((err,resp)=>{
                    callback(err,resp)
                })

    }

    // 返回某一周所有支付未退货的且参与总体返现的购物记录
    getWeekRecordsJoinTotalCB(callback){
        BuyRecordM.query(this.user_id)
            .filter('week').equals(this.week)
            .filter('status').equals(0)
            .filter('participation').equals(true)
            .loadAll()
            .exec((err,resp)=>{
                callback(err,resp)
            })
    }

    // 按hash返回某一周所有支付未退货并参与满额返现的购买记录
    getWeekRecordsByHash(p,callback){
        BuyRecordM.parallelScan(5)
            .where('user_id').beginsWith(p)
            .where('week').equals(this.week)
            .where('status').equals(0)
            .where('participation').equals(true)
            .loadAll()
            .exec((err,resp)=>{
                callback(err,resp)
            })

    }

    // 返回评论历史，用于列表操作
    getRecordList(callback,lastKey){
        if (lastKey){
            BuyRecordM.query(this.user_id)
                .usingIndex('EvaStatusIndex')
                .where('eva_status').equals(this.eva_status)
                .startKey(lastKey)
                .descending()
                .limit(20)
                .exec((err,resp) => {
                    callback(err,resp)
                })
        }else {
            BuyRecordM.query(this.user_id)
                .usingIndex('EvaStatusIndex')
                .where('eva_status').equals(this.eva_status)
                .descending()
                .limit(20)
                .exec((err,resp) => {
                    callback(err,resp)
                })
        }
    }


}

module.exports = BuyRecord;
