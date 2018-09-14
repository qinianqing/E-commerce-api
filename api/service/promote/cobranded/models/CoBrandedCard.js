// Conpon Template Model
const { env } = require('../../../../config');

const { awsParams } = require('../config');

const dynogels = require('jinshi-dynogels');

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

const CardM = dynogels.define('js_cobranded',{
    hashKey: 'id',
    timestamps: true,
    schema:{
        id:Joi.string(),
        status:Joi.number(), // 1 有效\0 无效
        expiredAt:Joi.number(),// 卡失效时间戳
        num:Joi.number(), // 发卡数量，-1为无限量，暂不支持-1
        limit:Joi.number(),// 一个用户限领几张
        active_num:Joi.number(), // 已激活数量

        days:Joi.number(), // 激活多少天会员期限
        fscs:Joi.number(), // 激活多少张免邮券
        coupons:Joi.array(), // 为用户激活的优惠券模板ID列表
        coupon_amount:Joi.number(), // 券包总价值

        name:Joi.string(),// 卡名称
        partner_id:Joi.string(),// 合作方ID
        remark:Joi.string(), // 卡备注

        cover:Joi.string(),// 联名卡图片
    }
});

// if (env === 'dev') {
//     dynogels.createTables({'js_coupon_template': { readCapacity: 1, writeCapacity: 1 }},(err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class Card {
    get id() { return this._id; }
    set id(value) { this._id = value; }

    get status() { return this._status; }
    set status(value) { this._status = value; }

    get expiredAt() { return this._expiredAt; }
    set expiredAt(value) { this._expiredAt = value; }

    get num() { return this._num; }
    set num(value) { this._num = value; }

    get limit() { return this._limit; }
    set limit(value) { this._limit = value; }

    get active_num() { return this._active_num; }
    set active_num(value) { this._active_num = value; }

    get days() { return this._days; }
    set days(value) { this._days = value; }

    get fscs() { return this._fscs; }
    set fscs(value) { this._fscs = value; }

    get coupons() { return this._coupons; }
    set coupons(value) { this._coupons = value; }

    get coupon_amount() { return this._coupon_amount; }
    set coupon_amount(value) { this._coupon_amount = value; }

    get name() { return this._name; }
    set name(value) { this._name = value; }

    get partner_id() { return this._partner_id; }
    set partner_id(value) { this._partner_id = value; }

    get remark() { return this._remark; }
    set remark(value) { this._remark = value; }

    get cover() { return this._cover; }
    set cover(value) { this._cover = value; }

    // 创建一个优惠券模板
    create(callback){
        CardM.create({
            id:String(Date.now()),
            status:1, // 1 有效\0 无效
            expiredAt:this.expiredAt,// 卡失效时间戳
            num: this.num, // 发卡数量，-1为无限量
            limit:this.limit || 1,// 一个用户限领几张
            active_num:0, // 已激活数量

            days:this.days, // 激活多少天会员期限
            fscs:this.fscs, // 激活多少张免邮券
            coupons:this.coupons, // 为用户激活的优惠券模板ID列表
            coupon_amount:this.coupon_amount, // 券包总价值

            name:this.name,// 卡名称
            partner_id:this.partner_id,// 合作方ID
            remark:this.remark, // 卡备注

            cover:Joi.string(),// 联名卡图片
        },{overwrite : false},function (err,data){
            callback(err,data);
        })
    }

    // 获取指定优惠券模板信息
    getCard(callback){
        CardM.get({
            id:this.id,
        },function (err,data) {
            callback(err,data)
        })
    }

    // 激活
    activeCall(callback){
        CardM.update({
            id:this.id,
            active_num:{$add:1}
        },function (err,data){
            callback(err,data);
        })
    }

}

module.exports = Card;