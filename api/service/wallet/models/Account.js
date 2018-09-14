// Account model

// author by Ziv
// TODO
// 1、上线前需求务必注释掉endpoint，不能设为空
// 2、注释掉createTable方法
//
// 本数据库表用于计划任务

// v0.1
// 2018-01-12
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

//js_account 一系列商品表
const AccountM = dynogels.define('js_account',{
    hashKey: 'owner_id',
    rangeKey:'object_id',
    timestamps: true,
    schema:{
        owner_id:Joi.string(),
        object_id:Joi.string(),// 唯一标记一条账目
        sku_id:Joi.string(),// 标明sku_id,可以不选
        type:Joi.number(),// 0,消费\1，返现\3，储值\4，退款
        status:Joi.number(),// 0，未结清，1，已结清，2，取消
        detail:Joi.string(),// 账目备注
        amount:Joi.number(),// 分
        order_id:Joi.string(),// 所归属的订单号
    },
    indexes: [
        { hashKey: 'owner_id', rangeKey: 'type', type: 'global', name: 'AccountTypeIndex' },
    ]
});

// if (env === 'dev') {
//     dynogels.createTables({'js_account': { readCapacity: 1, writeCapacity: 1 }},(err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class Account {
    get owner_id(){ return this._owner_id;}
    set owner_id(value) { this._owner_id = value;}

    get object_id(){ return this._object_id;}
    set object_id(value){ this._object_id = value;}

    get sku_id(){ return this._sku_id;}
    set sku_id(value){ this._sku_id = value;}

    get type(){ return this._type;}
    set type(value){ this._type = value;}

    get status(){ return this._status;}
    set status(value){ this._status = value;}

    get amount(){ return this._amount;}
    set amount(value){ this._amount = value;}

    get detail(){ return this._detail;}
    set detail(value){ this._detail = value;}

    get order_id(){ return this._order_id;}
    set order_id(value){ this._order_id = value;}

    // 创建一条账目
    create(callback){
        AccountM.create({
            owner_id:this.owner_id,
            object_id:Date.now()+uuid().replace(/-/g, ''),
            type:this.type,
            status:this.status,
            sku_id:this.sku_id || '-',
            detail:this.detail,
            order_id:this.order_id,
            amount:this.amount
        },(err,data)=>{
            callback(err,data)
        })
    }

    // 设置账目状态
    setAccountType(callback){
        AccountM.update({
            owner_id:this.owner_id,
            object_id:this.object_id,
            status:this.status
        },(err,data)=>{
            callback(err)
        })
    }

    // 设置账目状态
    setAccountStatus(callback){
        AccountM.update({
            owner_id:this.owner_id,
            object_id:this.object_id,
            status:this.status
        },(err,data)=>{
            callback(err)
        })
    }

    // 获取账目列表
    getAccountList(callback,lastKey){
        if (lastKey){
            AccountM.query(this.owner_id)
                .startKey(lastKey)
                .descending()
                .limit(20)
                .exec((err,resp) => {
                    callback(err,resp)
                })
        }else {
            AccountM.query(this.owner_id)
                .descending()
                .limit(20)
                .exec((err,resp) => {
                    callback(err,resp)
                })
        }
    }

    // 不分页获取账目所有信息
    getAccountListLoadAll(callback){
        AccountM.query(this.owner_id)
            .usingIndex('AccountTypeIndex')
            .where('type').equals(1)
            .filter('status').equals(0)
            .descending()
            .loadAll()
            .exec((err,resp) => {
                callback(err,resp)
            })
    }

    // 获取用列表账目列表
    getAccountListByType(callback,lastKey){
        if (lastKey){
            AccountM.query(this.owner_id)
                .usingIndex('AccountTypeIndex')
                .where('type').equals(1)
                .filter('status').equals(1)
                .startKey(lastKey)
                .descending()
                .limit(20)
                .exec((err,resp) => {
                    callback(err,resp)
                })
        }else {
            AccountM.query(this.owner_id)
                .usingIndex('AccountTypeIndex')
                .where('type').equals(1)
                .filter('status').equals(1)
                .descending()
                .limit(20)
                .exec((err,resp) => {
                    callback(err,resp)
                })
        }
    }

}

module.exports = Account;
