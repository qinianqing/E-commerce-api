// BuyRecord model

// author by Ziv
// 1、上线前需求务必注释掉endpoint，不能设为空
// 2、注释掉createTable方法
//
// 本数据库表用于计划任务

// v0.1
// 2018-04-04
// const { env } = require('../../../config');

const {
    awsParams
} = require('../config.js');
const dynogels = require('jinshi-dynogels');
const Joi = require('joi');
const uuid = require('uuid/v4');

// if (env === 'dev'){
//     dynogels.AWS.config.update({
//         accessKeyId:awsParams.accessKeyId,
//         secretAccessKey:awsParams.secretAccessKey,
//         region:awsParams.region,
//         endpoint:awsParams.dynamoEndpoint
//     });
// }else {
dynogels.AWS.config.update({
    accessKeyId: awsParams.accessKeyId,
    secretAccessKey: awsParams.secretAccessKey,
    region: awsParams.region,
    //endpoint:awsParams.dynamoEndpoint
});
// }
const PayOrderM = dynogels.define('js_pay_order', {
    hashKey: 'tradeId',
    timestamps: true,
    schema: {
        tradeId: Joi.string(),
        amount: Joi.number(),
        user_id: Joi.string(),
        wa_open_id: Joi.string(),
        productDescription: Joi.string(),
        status: Joi.string(),
        ip: Joi.string(),
        tradeType: Joi.string(),
        prepayId: Joi.string(),
        errorCode: Joi.string(),
        errorCodeDes: Joi.string(),
        paidAt: Joi.string(),
        transactionId: Joi.string(),
        bankType: Joi.string(),
        prop: Joi.string(),
        deliveredAt: Joi.string(),
        express_id: Joi.string(),
        express_brand: Joi.string(),
        dFee: Joi.string(),

    }
});

// if (env === 'dev' || env === 'build') {
//     dynogels.createTables({'js_pay_order': { readCapacity: 5, writeCapacity: 5 }},(err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class PayOrder {
    get tradeId() {
        return this._tradeId;
    }
    set tradeId(value) {
        this._tradeId = value;
    }

    get amount() {
        return this._amount;
    }
    set amount(value) {
        this._amount = value;
    }

    get user_id() {
        return this._user_id;
    }
    set user_id(value) {
        this._user_id = value;
    }

    get wa_open_id() {
        return this._wa_open_id;
    }
    set wa_open_id(value) {
        this._wa_open_id = value;
    }

    get productDescription() {
        return this._productDescription;
    }
    set productDescription(value) {
        this._productDescription = value;
    }

    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }

    get ip() {
        return this._ip;
    }
    set ip(value) {
        this._ip = value;
    }

    get tradeType() {
        return this._tradeType;
    }
    set tradeType(value) {
        this._tradeType = value;
    }

    get prepayId() {
        return this._prepayId;
    }
    set prepayId(value) {
        this._prepayId = value;
    }

    get errorCode() {
        return this._errorCode;
    }
    set errorCode(value) {
        this._errorCode = value;
    }

    get errorCodeDes() {
        return this._errorCodeDes;
    }
    set errorCodeDes(value) {
        this._errorCodeDes = value;
    }

    get paidAt() {
        return this._paidAt;
    }
    set paidAt(value) {
        this._paidAt = value;
    }


    get transactionId() {
        return this._transactionId;
    }
    set transactionId(value) {
        this._transactionId = value;
    }

    get bankType() {
        return this._bankType;
    }
    set bankType(value) {
        this._bankType = value;
    }

    get notify_url() {
        return this._notify_url;
    }
    set notify_url(value) {
        this._notify_url = value;
    }

    get prop() {
        return this._prop;
    }
    set prop(value) {
        this._prop = value;
    }
    get deliveredAt(){
       return this._deliveredAt;
    }
    set deliveredAt(value){
        this._deliveredAt = value;
    }
    get express_id(){
        return this._express_id;
    }
    set express_id(value){
        this._express_id = value;
    }
    get express_brand(){
        return this._express_brand;
    }
    set express_brand(value){
        this._express_brand = value;
    }
    get dFee(){
        return this._dFee;
    }
    set dFee(value){
    this._dFee = value;
    }
    create(callback) {
        PayOrderM.create({
            tradeId: this.tradeId,
            amount: this.amount,
            user_id: this.user_id,
            wa_open_id: this.wa_open_id,
            productDescription: this.productDescription,
            status: this.status,
            ip: this.ip,
            tradeType: this.tradeType,
            prepayId: this.prepayId,
            prop: this.prop,
            deliveredAt: this.dAt || '-',
            express_id: this.eid || '-',
            express_brand: this.eb || '-',
            dFee: this.dfee || '-'
        }, function (err, pom) {
            if (callback) {
                callback(err, pom)
            }
        })
    }
    /* 获取所有 */
    getAllPayOrder(callback,lastkey) {
        if (lastkey) {
            PayOrderM.scan()
                .startKey(lastkey)
                .limit(100)
                // .loadAll()
                .exec((err, data) => {
                    callback(err, data)
                })
        } else {
            PayOrderM.scan()
                .limit(100)
                // .loadAll()
                .exec((err, data) => {
                    callback(err, data)
                })
        }

    }
    
    getPayOrder(callback) {
        PayOrderM.get(this.tradeId, (err, order) => {
            callback(err, order);
        })
    }

    update(params, callback) {
        PayOrderM.update(params, function (err, pom) {
            callback(err, pom);
        })
    }

    place() {
        return new Promise((resolve, reject) => {
            // 参数文档： https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=9_1
            wxpay.createUnifiedOrder({
                openid: this.wa_open_id,
                body: this.productDescription,
                out_trade_no: this.tradeId,
                total_fee: this.amount,
                spbill_create_ip: this.ip,
                notify_url: this.notify_url,
                trade_type: this.tradeType,
            }, function (err, result) {
                if (err) return reject(err);
                return resolve(result);
            });
        }).then(handleError).then(validateSign).then(({
            prepay_id,
        }) => {
            this.prepayId = prepay_id; // prepay_id可以用于发送模板消息
            return this.create();
        }).catch((err) => {
            console.error(err)
        });
    }
}

module.exports = PayOrder;