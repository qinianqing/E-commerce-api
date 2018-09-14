// 后台用户表
// bg_user

// BGUserM model

// author by Ziv
//
// 1、上线前需求务必注释掉endpoint，不能设为空
// 2、注释掉createTable方法
//
// v0.1
// 2018-01-15

const { awsParams } = require('../config.js');
const dynogels = require('dynogels');
const Joi = require('joi');

dynogels.AWS.config.update({
    accessKeyId:awsParams.accessKeyId,
    secretAccessKey:awsParams.secretAccessKey,
    region:awsParams.region,
    //endpoint:awsParams.dynamodbEndpoint
})

const BGUserM = dynogels.define('bg_user',{
    hashKey: 'email',
    timestamps: true,
    schema:{
        email:Joi.string(),
        user_name:Joi.string(),// 唯一标记一条账目
        password:Joi.string(),// 0,消费\1，单品返现未到账\2，单品返现已到账\3,总额返现未到账\4、总额返现已到账\5，返现取消\6，支付会员费\7、储值\8、退款到账
        role:Joi.number() // 用户角色，0，超级管理员，1、仅限CMS，2、仅CRM，3、仅ERP，4，CMS+CRM，
    }
})

// dynogels.createTables({'js_be_user': { readCapacity: 5, writeCapacity: 5 }},(err) => {
//     if (err) {
//         console.log('updating tables error', err);
//     } else {
//         console.log('table updated');
// }
// })

class BEUser {
    get email(){ return this._email;}
    set email(value) { this._email = value;}

    get user_name(){ return this._user_name;}
    set user_name(value){ this._user_name = value;}

    get password(){ return this._password;}
    set password(value){ this._password = value;}

    get role(){ return this._role;}
    set role(value){ this._role = value;}

    // 创建一个用户
    create(callback){
        BGUserM.create({
            email:this.email,
            user_name:this.user_name,
            password:this.password,
            role:this.role
        },(err,data)=>{
            callback(err,data)
        })
    }

    getUser(callback){
        BGUserM.get({email:this.email},(err,data)=>{
            callback(err,data)
        })
    }

    /* 得到整张Category表 */
    getAllUser(callback){
        BGUserM
            .scan()
            .exec((err,data)=>{
                callback(err,data)
            })
    }

    update(param,callback){
        BGUserM.update(param,(err,data)=>{
            callback(err,data)
        })
    }
}

module.exports = BEUser;
