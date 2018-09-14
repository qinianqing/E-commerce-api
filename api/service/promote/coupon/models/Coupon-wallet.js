// Conpon-wallet Model
const { env } = require('../../../../config');

const { awsParams } = require('../config');

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

const CouponItemM = dynogels.define('js_coupon_wallet',{
    hashKey: 'owner_id',
    rangeKey:'createdAt',
    timestamps: true,
    schema:{
        owner_id:Joi.string(),
        type:Joi.number(), // 0，代金券，1，免邮券
        code:Joi.string(), // 券码
        coupon_id:Joi.string(),// 券模板ID，免邮券没有
        status:Joi.string(), // OK\INVALID，总共就两种
        order_id:Joi.string(),// 使用该券的订单号，支付完成以后进行接口回调
        activeAt:Joi.string(),// 生效时间戳
        expiredAt:Joi.string(),// 券失效时间戳
        name:Joi.string(),// 券名称
        amount:Joi.number(),// 券金额，单位分
        price:Joi.number(),// 券金额，单位元
        condition:Joi.number(),// 券试用条件，0为任意条件，按实际付费计算
        fit:Joi.array(),// 列表
        information:Joi.string() // 券信息
    },
    /*
    indexes: [
        // 按券码查询优惠券
        { hashKey: 'code', type: 'global', name: 'codeIndex' }
    ]
    */
});

// if (env === 'dev') {
//     dynogels.createTables({'js_coupon_wallet': { readCapacity: 1, writeCapacity: 1 }},(err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class CouponItem {
    get owner_id() { return this._owner_id; }
    set owner_id(value) { this._owner_id = value; }

    get type() { return this._type; }
    set type(value) { this._type = value; }

    get code() { return this._code; }
    set code(value) { this._code = value; }

    get coupon_id() { return this._coupon_id; }
    set coupon_id(value) { this._coupon_id = value; }

    get status() { return this._status; }
    set status(value) { this._status = value; }

    get order_id() { return this._order_id; }
    set order_id(value) { this._order_id = value; }

    get activeAt() { return this._activeAt; }
    set activeAt(value) { this._activeAt = value; }

    get expiredAt() { return this._expiredAt; }
    set expiredAt(value) { this._expiredAt = value; }

    get name() { return this._name; }
    set name(value) { this._name = value; }

    get amount() { return this._amount; }
    set amount(value) { this._amount = value; }

    get price() { return this._price; }
    set price(value) { this._price = value; }

    get condition() { return this._condition; }
    set condition(value) { this._condition = value; }

    get fit() { return this._fit; }
    set fit(value) { this._fit = value; }

    get information() { return this._information; }
    set information(value) { this._information = value; }

    // 在某人的账户里创建一张优惠券
    create(callback){
        CouponItemM.create({
            owner_id:this.owner_id,
            type:this.type,
            code:uuid().replace(/-/g, ''),
            coupon_id:this.coupon_id,
            status:this.status,
            activeAt:String(this.activeAt),
            expiredAt:String(this.expiredAt),
            name:this.name,
            amount:this.amount,
            price:this.price,
            condition:this.condition,
            fit:this.fit,
            information:this.information
        },{overwrite : false},function (err,coupon){
            callback(err,coupon);
        })
    }

    // 获取某种状态的列表
    getOnesCouponNumber(type,status,callback){
        CouponItemM.query(this.owner_id)
            .filter('type').equals(type)
            .filter('status').equals(status)
            .select('COUNT')
            .exec((err,data)=>{
                callback(err,data)
            })
    }

    // 获取免邮券可用的数量
    getOnesFscValidNumber(callback){
        CouponItemM.query(this.owner_id)
            .filter('type').equals(1)
            .filter('order_id').exists(false) // 不存在订单ID
            .filter('expiredAt').gte(String(Date.now()))
            .select('COUNT')
            .exec((err,data)=>{
                callback(err,data)
            })
    }

    // 获取用户某种券的数量
    getOnesTargetCouponGetNum(callback){
        CouponItemM.query(this.owner_id)
            .filter('coupon_id').equals(this.coupon_id)
            // .select('COUNT')
            .exec((err,data)=>{
                callback(err,data)
            })
    }
     //得到某一用户同一天的某种券的数量
     getOnesTargetCouponGetNumS(callback){
        CouponItemM.query(this.owner_id)
            .filter('coupon_id').equals(this.coupon_id)
            .exec((err,data)=>{
                callback(err,data)
            })
    }
    //获得某一用户最后一张券
    getOnesTargetCouponGetLast(callback){
        CouponItemM.query(this.owner_id)
        .filter('coupon_id').equals(this.coupon_id)
        .descending()
        .exec((err,data)=>{
            callback(err,data)
        })
    }
    // 获取某个owner某种类型券的总数量
    getOnesTargetCouponNum(callback){
        CouponItemM.query(this.owner_id)
            .filter('type').equals(0)
            .filter('coupon_id').equals(this.coupon_id)
            .select('COUNT')
            .exec((err,data)=>{
                callback(err,data)
            })
    }

    // 获取某个owner全部的免邮券
    getOnesFSCs(callback){
        CouponItemM.query(this.owner_id)
            .filter('type').equals(1)
            .filter('status').equals(status)
            .select('COUNT')
            .exec((err,data)=>{
                callback(err,data)
            })
    }

    // 获取某个类型用户/家庭全部可用的优惠券列表，一次全部获取
    queryOnesCoupon(callback,type){
        CouponItemM.query(this.owner_id)
            .filter('type').equals(type)
            //.filter('status').equals('OK')
            //.descending()
            .loadAll()
            .exec((err,coupon) => {
                callback(err,coupon)
            })
    }

    // 消费一张优惠券
    consumeConpon(callback){
        CouponItemM.update({
            owner_id:this.owner_id,
            createdAt:this.createdAt,
            status:'INVALID',
            order_id:this.order_id
        },function (err,coupon){
            callback(err,coupon);
        })
    }

    // 更新一张优惠券状态
    updateCouponStatus(callback){
        CouponItemM.update({
            owner_id:this.owner_id,
            createdAt:this.createdAt,
            status:this.status
        },function (err){
            callback(err);
        })
    }

    // 查询一张优惠券
    queryCouponByCode(callback){
        CouponItemM.query(this.owner_id)
            .filter('code').equals(this.code)
            .consistentRead(true)
            .exec((err,data)=>{
                callback(err,data)
            })
    }
}

module.exports = CouponItem;