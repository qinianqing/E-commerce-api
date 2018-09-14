// Conpon Code Model
const { env } = require('../../../../config');

const {
    awsParams,
} = require('../config');

const dynogels = require('jinshi-dynogels');
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

const Joi = require('joi');

const CouponCM = dynogels.define('js_coupon_code',{
    hashKey: 'id',
    rangeKey:'createdAt',
    timestamps: true,
    schema:{
        id:Joi.string(),
        coupon_code:Joi.string(),
        coupon_id:Joi.string(),// 对应的券模板ID
        status:Joi.string(), // OK\INVALID
        activeAt:Joi.string(),// 激活时间，-为立刻激活
        expiredAt:Joi.string(),// 口令失效时间
        num:Joi.number(), // 码领券数量，-1为无限量状态
        active_num:Joi.number(), // 发生的激活的数量
    }
});

// if (env === 'dev') {
//     dynogels.createTables({'js_coupon_code': { readCapacity: 1, writeCapacity: 1 }},(err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class CouponC {
    get id() { return this._id; }
    set id(value) { this._id = value; }

    get coupon_code() { return this._coupon_code; }
    set coupon_code(value) { this._coupon_code = value; }

    get coupon_id() { return this._coupon_id; }
    set coupon_id(value) { this._coupon_id = value; }

    get status() { return this._status; }
    set status(value) { this._status = value; }

    get activeAt() { return this._activeAt; }
    set activeAt(value) { this._activeAt = value; }

    get expiredAt() { return this._expiredAt; }
    set expiredAt(value) { this._expiredAt = value; }

    get num() { return this._num; }
    set num(value) { this._num = value; }

    get active_num() { return this._active_num; }
    set active_num(value) { this._active_num = value; }

    // 创建新的优惠码
    create(callback){
        CouponCM.create({
            id:uuid().replace(/-/g, ''),
            coupon_code:this.coupon_code,
            coupon_id:this.coupon_id,// 对应的券模板ID
            status:this.status, // OK\INVALID
            activeAt:this.activeAt,// 激活时间戳
            expiredAt:this.expiredAt,// 口令失效时间戳
            num:this.num, // 发券数量，-1为无限量状态
            active_num:0, // 已激活数量
        },{overwrite : false},function (err,coupon){
            callback(err,coupon);
        })
    }

    // 获取指定码的信息
    getCouponC(callback){
        CouponCM.get({
            id:this.id,
            createdAt:this.createdAt
        },function (err,coupon) {
            callback(err,coupon)
        })
    }

    // 获取优惠码详情，通过query来实现
    getCouponCbyQuery(callback){
        CouponCM.query(this.id)
            .limit(1)
            .exec((err,coupon)=>{
                callback(err,coupon)
            })
    }

    // 查询优惠券码的信息，扫表实现
    getCodeDetail(callback){
        CouponCM.scan()
            .where('coupon_code').equals(this.coupon_code)
            .exec((err,coupon)=>{
                callback(err,coupon)
            })
    }

    // 获取优惠码列表
    queryCouponC(callback,lastKey){
        if (lastKey){
            CouponCM.scan()
                //.descending()
                .startKey(lastKey)
                .limit(20)
                .exec((err,coupon) => {
                    callback(err,coupon)
                })
        }else {
            CouponCM.scan()
                //.descending()
                .limit(20)
                .exec((err,coupon) => {
                    callback(err,coupon)
                })
        }
    }

    // 更新码状态
    updateCouponCStatus(callback){
        CouponCM.update({
            id:this.id,
            createdAt:this.createdAt,
            status:this.status
        },function (err,coupon){
            callback(err,coupon);
        })
    }

    // 码扩容
    updateCouponCNum(num,callback){
        CouponCM.update({
            id:this.id,
            createdAt:this.createdAt,
            num:{$add:num},
            status:this.status
        },function (err,coupon){
            callback(err,coupon);
        })
    }

    // 码消费增量
    updateCouponConsumeNum(callback){
        CouponCM.update({
            id:this.id,
            createdAt:this.createdAt,
            active_num:{$add:1},
            status:this.status
        },function (err,coupon){
            callback(err,coupon);
        })
    }

    // 更改优惠码信息
    updateCouponc(callback){
        CouponCM.update({
            id:this.id,
            createdAt:this.createdAt,
            coupon_code:this.coupon_code,
            coupon_id:this.coupon_id,// 对应的券模板ID
            status:this.status, // OK\INVALID
            activeAt:this.activeAt,// 激活时间戳
            expiredAt:this.expiredAt,// 口令失效时间
            num:this.num, // 发券数量，-1为无限量状态
        },function (err,coupon){
            callback(err,coupon);
        })
    }

    // 删除优惠码
    deleteCode(callback){
        CouponCM.destroy({
            id:this.id,
            createdAt:this.createdAt
        },function (err){
            callback(err);
        })
    }
}

module.exports = CouponC;