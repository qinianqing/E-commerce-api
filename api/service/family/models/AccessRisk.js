// AccessRisk model

// author by Ziv
// TODO
// 1、上线前需求务必注释掉endpoint，不能设为空
// 2、注释掉createTable方法
//
// v0.1
// 2018-01-08

const { awsParams } = require('../config.js');

const dynogels = require('jinshi-dynogels');
const Joi = require('joi');
dynogels.AWS.config.update({
    accessKeyId:awsParams.accessKeyId,
    secretAccessKey:awsParams.secretAccessKey,
    region:awsParams.region,
    //endpoint:awsParams.dynamoEndpoint
});

//js_access_risk 商品最小单位表
const AccessRiskM = dynogels.define('js_access_risk', {
    hashKey: 'path',
    rangeKey:'object_id',
    timestamps: true,
    schema: {
        path:Joi.string(),
        user_id:Joi.string(),
        object_id:dynogels.types.uuid(),
        ip: Joi.string()
    }
});

/*
dynogels.createTables({
    'js_access_risk': {
        readCapacity: 10,
        writeCapacity: 10,
        streamSpecification: {
            streamEnabled: true,
            streamViewType: 'NEW_IMAGE'
        }
    }
}, err => {
    if (err) {
        console.log('Error creating tables', err);
    } else {
        console.log('table are now created and active');
    }
});
*/

class AccessRisk {
    get path() { return this._path; }
    set path(value) { this._path = value; }

    get user_id() { return this._user_id; }
    set user_id(value) { this._user_id = value; }

    get ip() { return this._ip; }
    set ip(value) { this._ip = value;}

    // 创建一条
    create(callback){
        AccessRiskM.create({
            path:this.path,
            user_id:this.user_id,
            ip:this.ip
        },(err)=>{
            callback(err)
        })
    }

    // 获取相同user_id在一段时间内的访问数量
    getAccessNumByUserid(b,e,callback){
        AccessRiskM.query(this.path)
            .filter('user_id').equals(this.user_id)
            .filter('createdAt').between(b,e)
            .select('COUNT')
            .exec((err,data)=>{
                callback(err,data)
            })
    }

    // 获取相同ip在一段时间内的访问数量
    getAccessNumByIp(b,e,callback){
        AccessRiskM.query(this.path)
            .filter('ip').equals(this.ip)
            .filter('createdAt').between(b,e)
            .select('COUNT')
            .exec((err,data)=>{
                callback(err,data)
            })
    }

    // 获取一定时间前的所有项目
    getAccessItems(p,callback){
        AccessRiskM.parallelScan(8)
            .where('createdAt').lte(p)
            .exec((err,data) => {
                callback(err,data)
            })
    }

    // 删除访问数据
    delete(callback){
        AccessRiskM.destroy({path:this.path,object_id:this.object_id},(err)=>{
            callback(err)
        })
    }
}

module.exports = AccessRisk;
