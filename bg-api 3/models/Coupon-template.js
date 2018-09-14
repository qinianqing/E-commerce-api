// Conpon Template Model
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
        region:awsParams.region,
        endpoint:awsParams.dynamoEndpoint
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

const CouponTM = dynogels.define('js_coupon_template',{
    hashKey: 'coupon_id',
    rangeKey:'createdAt',
    timestamps: true,
    schema:{
        coupon_id:Joi.string(),
        limit:Joi.number(),// 一个用户限领几张
        num:Joi.number(), // 发券数量，-1为无限量状态
        background:Joi.string(),
        active_num:Joi.number(), // 已激活数量
        mode:Joi.string(), // 券类型，RANDOM随机券，FIXED固定金额
        status:Joi.string(), // OK\EXHAUST\INVALID
        activeAt:Joi.string(),// -为领取时即生效，日期格式为激活时间
        expiredType:Joi.number(),// 券失效类型，0固定时间，1一段时间失效
        expiredInfo:Joi.string(),// 失效详情，8有效期为8天，Date，第二个为终止有效时间
        name:Joi.string(),// 券名称
        price:Joi.string(),// 券金额，单位元，字符串形式，注意转换，随机券为MONEY&MONEY，只能填整数，比如3&9，用户取券时会获得一张3到9元之间的优惠券
        condition:Joi.number(),// 券试用条件，0为任意条件，按实际付费计算，单位为元
        fit:Joi.array(),// 列表
        information:Joi.string() // 券信息
    }
});
//
// if (env === 'dev' || env === 'build') {
//     dynogels.createTables({'js_coupon_template': { readCapacity: 5, writeCapacity: 5 }},(err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class CouponT {
    get coupon_id() { return this._coupon_id; }
    set coupon_id(value) { this._coupon_id = value; }

    get limit() { return this._limit; }
    set limit(value) { this._limit = value; }

    get num() { return this._num; }
    set num(value) { this._num = value; }

    get active_num() { return this._active_num; }
    set active_num(value) { this._active_num = value; }

    get mode() { return this._mode; }
    set mode(value) { this._mode = value; }

    get status() { return this._status; }
    set status(value) { this._status = value; }

    get activeAt() { return this._activeAt; }
    set activeAt(value) { this._activeAt = value; }

    get expiredType() { return this._expiredType; }
    set expiredType(value) { this._expiredType = value; }

    get expiredInfo() { return this._expiredInfo; }
    set expiredInfo(value) { this._expiredInfo = value; }

    get name() { return this._name; }
    set name(value) { this._name = value; }

    get price() { return this._price; }
    set price(value) { this._price = value; }

    get condition() { return this._condition; }
    set condition(value) { this._condition = value; }

    get background() { return this._background; }
    set background(value) { this._background = value; }

    get fit() { return this._fit; }
    set fit(value) { this._fit = value; }

    get information() { return this._information; }
    set information(value) { this._information = value; }

    // 创建一个优惠券模板
    create(callback){
        CouponTM.create({
            coupon_id:uuid().replace(/-/g, ''),
            num:this.num,
            limit:this.limit,
            active_num:0,
            mode:this.mode,
            status:this.status,
            activeAt:this.activeAt,
            expiredType:this.expiredType,
            expiredInfo:this.expiredInfo,
            name:this.name,
            price:this.price,
            background:this.background,
            condition:this.condition,
            fit:this.fit,
            information:this.information
        },{overwrite : false},function (err,coupon){
            callback(err,coupon);
        })
    }

    // 获取指定优惠券模板信息
    getCouponT(callback){
        CouponTM.get({
            coupon_id:this.coupon_id,
            createdAt:this.createdAt
        },function (err,coupon) {
            callback(err,coupon)
        })
    }

    // 获取指定优惠券模板通过query方法，因为createdAt排序键的使用，这个是获取模板信息的主要方法
    getCouponTbyQuery(callback){
        CouponTM.query(this.coupon_id)
            .limit(1)
            .exec((err,coupon) => {
                callback(err,coupon)
            })
    }

    // 获取优惠券模板列表，按创建时间倒叙排列
    getCouponTList(callback,lastKey){
        if (lastKey){
            CouponTM.scan()
            //.descending()
                .startKey(lastKey)
                .limit(20)
                .exec((err,coupon) => {
                    callback(err,coupon)
                })
        }else {
            CouponTM.scan()
            //.descending()
                .limit(20)
                .exec((err,coupon) => {
                    callback(err,coupon)
                })
        }
    }

    // 检索优惠券，用于后台检索相应的优惠券模板条目
    queryCouponTDetail(param,callback){
        CouponTM.scan()
            .where('name').contains(param)
            .exec((err,coupon)=>{
                callback(err,coupon)
            })
    }

    // 更新优惠券模板状态
    updateCouponTStatus(callback){
        CouponTM.update({
            coupon_id:this.coupon_id,
            createdAt:this.createdAt,
            status:this.status
        },function (err,coupon){
            callback(err,coupon);
        })
    }

    // 优惠券扩容
    updateCouponTNum(num,callback){
        CouponTM.update({
            coupon_id:this.coupon_id,
            createdAt:this.createdAt,
            num:{$add:num},
            status:this.status
        },function (err,coupon){
            callback(err,coupon);
        })
    }

    // 优惠券消费数量
    updateCouponTConsumeNum(callback){
        CouponTM.update({
            coupon_id:this.coupon_id,
            createdAt:this.createdAt,
            active_num:{$add:1},
            status:this.status
        },function (err,coupon){
            callback(err,coupon);
        })
    }

    // 更新优惠券信息
    updateCouponT(callback){
        CouponTM.update({
            coupon_id:this.coupon_id,
            createdAt:this.createdAt,
            num:this.num,
            limit:this.limit,
            mode:this.mode,
            status:this.status,
            activeAt:this.activeAt,
            expiredType:this.expiredType,
            expiredInfo:this.expiredInfo,
            name:this.name,
            price:this.price,
            condition:this.condition,
            fit:this.fit,
            information:this.information
        },function (err,coupon){
            callback(err,coupon);
        })
    }
}

module.exports = CouponT;
