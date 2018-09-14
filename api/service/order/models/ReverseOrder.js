// BuyRecord model

// author by Ziv
// 1、上线前需求务必注释掉endpoint，不能设为空
// 2、注释掉createTable方法
//
// 本数据库表用于计划任务

// v0.1
// 2018-04-04
const {
    env
} = require('../../../config');

const {
    awsParams
} = require('../config.js');
const dynogels = require('jinshi-dynogels');
const Joi = require('joi');
const uuid = require('uuid/v4');

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

// js_reverse_order
// service:Joi.number(),// 0为不支持7天无理由，1为支持7天无理由退换货
const ReverseOrderM = dynogels.define('js_reverse_order', {
    hashKey: 'user_id',
    rangeKey: 'reverse_id',
    timestamps: true,
    schema: {
        user_id: Joi.string(),
        reverse_id: Joi.string(), // 逆向退款单号
        order_id: Joi.string(), // 逆向流程对应的正向流程订单号
        item: Joi.object(), // 对象，逆向流程中的商品
        /*
            {
                sku_id:Joi.number(),
                spu_id:Joi.number(),
                spu_name:Joi.string(),
                sku_name:Joi.string(),
                cover:Joi.string(),
                num:Joi.number(),
                unit_price:Joi.number(),
                cashback:Joi.number(),
                status:Joi.number(),// 1为处于异常状态中
            }
            */
        status: Joi.string(), // _INIT\_DENY\_SENDBACK\*SUCCESS\*CANCEL,暂时没有的状态:PROCESS_
        type: Joi.string(), // REFUND（退款）、RETURN（退货）、RECHANGE（换货)
        messages: Joi.array(), // 状态列表
        reason: Joi.string(), // 用户提出的申请理由
        content: Joi.string(), // 提交的content
        pics: Joi.array(), // 提交的图片列表
        tel: Joi.string(), //电话号码
        reverse_detail: Joi.string(), //退货说明
        logistics_pic: Joi.array(), //物流上传凭证
        /*
        [{
            msg:'',
            time:''
        }]
         */
        express_id: Joi.string(), // 逆向物流的单号
        express_brand: Joi.string(), // 逆向物流的品牌
    },
    indexes: [{
        hashKey: 'user_id',
        rangeKey: 'status',
        type: 'global',
        name: 'StatusIndex'
    }, ]
});

// if (env === 'dev') {
//     dynogels.createTables({
//         'js_reverse_order': {
//             readCapacity: 1,
//             writeCapacity: 1
//         }
//     }, (err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class ReverseOrder {
    get user_id() {
        return this._user_id;
    }
    set user_id(value) {
        this._user_id = value;
    }

    get reverse_id() {
        return this._reverse_id;
    }
    set reverse_id(value) {
        this._reverse_id = value;
    }

    get order_id() {
        return this._order_id;
    }
    set order_id(value) {
        this._order_id = value;
    }

    get item() {
        return this._item;
    }
    set item(value) {
        this._item = value;
    }

    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }

    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }

    get messages() {
        return this._messages;
    }
    set messages(value) {
        this._messages = value;
    }

    get reason() {
        return this._reason;
    }
    set reason(value) {
        this._reason = value;
    }

    get content() {
        return this._content;
    }
    set content(value) {
        this._content = value;
    }

    get pics() {
        return this._pics;
    }
    set pics(value) {
        this._pics = value;
    }

    get express_id() {
        return this._express_id;
    }
    set express_id(value) {
        this._express_id = value;
    }

    get express_brand() {
        return this._express_brand;
    }
    set express_brand(value) {
        this._express_brand = value;
    }

    get tel() {
        return this._tel;
    }
    set tel(value) {
        this._tel = value;
    }

    get reverse_detail() {
        return this._reverse_detail;
    }
    set reverse_detail(value) {
        this._reverse_detail = value;
    }

    get logistics_pic() {
        return this._logistics_pic;
    }
    set logistics_pic(value) {
        this._logistics_pic = value;
    }

    // 创建一条逆向申请
    create(callback) {
        ReverseOrderM.create({
            user_id: this.user_id,
            reverse_id: String(Date.now()),
            order_id: this.order_id,
            item: this.item,
            status: this.status,
            type: this.type,
            messages: this.messages,
            reason: this.reason,
            content: this.content,
            pics: this.pics,
        }, (err, data) => {
            callback(err, data)
        })
    }

    updateReverseOrder(callback) {
        ReverseOrderM.update({
            user_id: this.user_id,
            reverse_id: this.reverse_id,
            status: this.status,
            messages: this.msg,
        }, (err, data) => {
            callback(err, data)
        })
    }

    updateReverseOrderForExpress(callback) {
        ReverseOrderM.update({
            user_id: this.user_id,
            reverse_id: this.reverse_id,
            status: this.status,
            messages: this.msg,
            express_id: this.express_id,
            express_brand: this.express_brand,
            tel: this.tel,
            reverse_detail: this.reverse_detail,
            logistics_pic: this.logistics_pic
        }, (err, data) => {
            callback(err)
        })
    }

    // 获取指定的一条reverse order
    getReverseOrder(callback) {
        ReverseOrderM.get({
            user_id: this.user_id,
            reverse_id: this.reverse_id
        }, (err, resp) => {
            callback(err, resp)
        })
    }

    // 返回进行中的reverse
    getReverseIngOrderList(callback) {
        ReverseOrderM.query(this.user_id)
           
            .usingIndex('StatusIndex')
            .where('status').beginsWith('_')
            .descending()
            .loadAll()
            .exec((err, resp) => {
                callback(err, resp)
            })
    }

    // 返回已结束的售后历史
    getReverseEdOrderList(callback, lastKey) {
        if (lastKey) {
            ReverseOrderM.query(this.user_id)
          
                .usingIndex('StatusIndex')
                .where('status').beginsWith('*')
                .startKey(lastKey)
                .descending()
                .limit(20)
                .exec((err, resp) => {
                    callback(err, resp)
                })
        } else {
            ReverseOrderM.query(this.user_id)
                .usingIndex('StatusIndex')
                .where('status').beginsWith('*')
                .descending()
                .limit(20)
                .exec((err, resp) => {
                    callback(err, resp)
                })
        }
    }
}

module.exports = ReverseOrder;