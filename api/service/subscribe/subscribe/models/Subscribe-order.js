const {env} = require('../../../../config');

const {awsParams} = require('../../config.js');
const dynogels = require('jinshi-dynogels');
const Joi = require('joi');

const utils = require('../utils/utils');

if (env === 'dev') {
    dynogels.AWS.config.update({
        accessKeyId: awsParams.accessKeyId,
        secretAccessKey: awsParams.secretAccessKey,
        region: 'cn-north-1',
        // endpoint: awsParams.dynamoEndpoint
    });
} else {
    dynogels.AWS.config.update({
        accessKeyId: awsParams.accessKeyId,
        secretAccessKey: awsParams.secretAccessKey,
        region: awsParams.region,
        //endpoint:awsParams.dynamoEndpoint
    });
}

const SOM = dynogels.define('js_subscribe_order', {
    hashKey: 'user_id',
    rangeKey: 'subs_order_id',// 订阅订单ID
    timestamps: true,
    schema: {
        user_id: Joi.string(),
        subs_order_id: Joi.string(),// 按订单ID的方式生成
        family_id: Joi.string(),
        wares_id: Joi.string(),// 订阅商品ID，带两个#号
        wares_detail: Joi.object(),// 存储下单时的商品详情
        num: Joi.number(),// 份数
        wares_cover: Joi.string(),// 封面
        wares_title: Joi.string(),// 标题
        price: Joi.number(),// 商品总价
        freight: Joi.number(),// 邮费总价
        total: Joi.number(),// 应付款总价
        sku_detail: Joi.array(),// 订阅商品详情
        /*
            [{
                sku_id:'10000-10000',
                spu_id:'',
                spu_name:'',
                sku_name:'',
                price:0,
                num:2
            },{
                sku_id:'10001-10001',
                spu_id:'',
                spu_name:'',
                sku_name:'',
                price:0,
                num:2
            }]
         */
        weeks: Joi.array(),// 发货周
        stages: Joi.number(),// 订阅期数
        exec_stages: Joi.number(),// 已完成的期数
        status: Joi.number(),// 0为进行中，1位已完成
        // 支付完成后回调写入
        freight_discount:Joi.number(),// 邮费折扣
        family_balance_consume:Joi.number(),// 家庭余额消耗
        user_balance_consume:Joi.number(),// 用户余额消耗
        actual_payment:Joi.number(),// 实际支付
        reverse_reason:Joi.string()
    }
});

// if (env === 'dev') {
//     dynogels.createTables({'js_subscribe_order': {readCapacity: 1, writeCapacity: 1}}, (err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class SO {
    get user_id() {
        return this._user_id;
    }

    set user_id(value) {
        this._user_id = value;
    }

    get subs_order_id() {
        return this._subs_order_id;
    }

    set subs_order_id(value) {
        this._subs_order_id = value;
    }

    get family_id() {
        return this._family_id;
    }

    set family_id(value) {
        this._family_id = value;
    }

    get wares_id() {
        return this._wares_id;
    }

    set wares_id(value) {
        this._wares_id = value;
    }

    get wares_detail() {
        return this._wares_detail;
    }

    set wares_detail(value) {
        this._wares_detail = value;
    }

    get num() {
        return this._num;
    }

    set num(value) {
        this._num = value;
    }

    get wares_cover() {
        return this._wares_cover;
    }

    set wares_cover(value) {
        this._wares_cover = value;
    }

    get wares_title() {
        return this._wares_title;
    }

    set wares_title(value) {
        this._wares_title = value;
    }

    get price() {
        return this._price;
    }

    set price(value) {
        this._price = value;
    }

    get freight() {
        return this._freight;
    }

    set freight(value) {
        this._freight = value;
    }

    get sku_detail() {
        return this._sku_detail;
    }

    set sku_detail(value) {
        this._sku_detail = value;
    }

    get weeks() {
        return this._weeks;
    }

    set weeks(value) {
        this._weeks = value;
    }

    get stages() {
        return this._stages;
    }

    set stages(value) {
        this._stages = value;
    }

    get exec_stages() {
        return this._exec_stages;
    }

    set exec_stages(value) {
        this._exec_stages = value;
    }

    get status() {
        return this._status;
    }

    set status(value) {
        this._status = value;
    }

    get freight_discount() {
        return this._freight_discount;
    }

    set freight_discount(value) {
        this._freight_discount = value;
    }

    get family_balance_consume() {
        return this._family_balance_consume;
    }

    set family_balance_consume(value) {
        this._family_balance_consume = value;
    }

    get user_balance_consume() {
        return this._user_balance_consume;
    }

    set user_balance_consume(value) {
        this._user_balance_consume = value;
    }

    get actual_payment() {
        return this._actual_payment;
    }

    set actual_payment(value) {
        this._actual_payment = value;
    }

    get reverse_reason(){ return this._reverse_reason;}
    set reverse_reason(value){ this._reverse_reason = value;}

    // 创建订阅订单，支付后直接创建，与商品订单逻辑不同
    create(callback) {
        SOM.create({
            user_id: this.user_id,
            subs_order_id: utils.get_order_id(),// 直接在这里实现创建方法
            family_id: this.family_id,
            wares_id: this.wares_id,
            wares_detail: this.wares_detail,
            num: this.num,
            wares_cover: this.wares_cover,
            wares_title: this.wares_title,
            price: this.price,
            freight: this.freight,
            sku_detail: this.sku_detail,
            weeks: this.weeks,
            stages: this.stages,
            exec_stages: 0,
            status: 0,
            freight_discount: this.freight_discount,
            family_balance_consume: this.family_balance_consume,
            user_balance_consume: this.user_balance_consume,
            actual_payment: this.actual_payment
        }, (err, data) => {
            callback(err, data)
        })
    }

    // 查询订单详情
    getSubsOrder(callback) {
        SOM.get({
            user_id: this.user_id,
            subs_order_id: this.subs_order_id
        }, (err, data) => {
            callback(err, data);
        })
    }

    // erp后台更新已订阅周期
    update(callback){
        SOM.update({
            user_id: this.user_id,
            subs_order_id: this.subs_order_id,
            exec_stages:this.exec_stages,
        },(err,data)=>{
            callback(err,data)
        })
    }

    // 取消订单更新
    reverseSubsOrder(callback){
        SOM.update({
            user_id:this.user_id,
            subs_order_id:this.subs_order_id,
            status:1,
            exec_stages:this.exec_stages, // 全部完成
            reverse_reason:this.reverse_reason
        },(err,data)=>{
            callback(err,data);
        })
    }

    // 获取某种状态的订单列表

    getSubsOrderList(status,family_id,callback,last_key){
        status = Number(status);
        if (last_key){
            SOM.query(this.user_id)
                .filter('status').equals(status)
                .filter('family_id').equals(family_id)
                .startKey(last_key)
                .descending()
                .limit(50)
                .exec((err, data) => {
                    callback(err, data);
                })
        } else {
            SOM.query(this.user_id)
                .filter('status').equals(status)
                .filter('family_id').equals(family_id)
                .descending()
                .limit(50)
                .exec((err, data) => {
                    callback(err, data);
                })
        }
    }

    // 内部方法，用了scan
    // 获取订单列表
    getOrderListScan(status, callback, last_key) {

    }

    // 获取某种状态的订单总数
    getOrderNum(callback) {

    }
     //更新期数
     updateStages(callback){
   
     }
    // 删除订单
    deleteItem(callback) {
        SOM.destroy({user_id: this.user_id, subs_order_id: this.subs_order_id}, (err) => {
            callback(err);
        })
    }
}

module.exports = SO;
