// Order model

// author by Ziv
// 1、上线前需求务必注释掉endpoint，不能设为空
// 2、注释掉createTable方法
//
// v0.1
// 2018-01-03
// const { env } = require('../../../config');

const {awsParams} = require('../config');

const dynogels = require('jinshi-dynogels');

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

const Joi = require('joi');

const OrderM = dynogels.define('js_order', {
    hashKey: 'user_id',
    rangeKey: 'order_id',
    timestamps: true,
    schema: {
        // 用户信息
        user_id: Joi.string(),// 所属用户
        family_id: Joi.string(),// 家庭ID，临时地址为空
        // 订单信息
        order_id: Joi.string(),// 订单号
        direct: Joi.string(), // 是否为厂家直发订单
        status: Joi.string(),// 状态，INIT()、PENDING_、DELIVERED_（只有待收货带_，用于把订单分离出来）、SUCCESS、REFUNDING(、REFUNDED、RETURNING、RETURNED、RECHANGING、RECHANGED、CANCEL
        reverse_ids: Joi.array(),// 逆向订单列表，
        arrival_date: Joi.string(),// 预计送达日
        handle_date: Joi.string(),// 订单处理日期
        items: Joi.array(),
        /*
        items: [{
            sku_id:Joi.number(),
            spu_id:Joi.number(),
            spu_name:Joi.string(),
            sku_name:Joi.string(),
            cover:Joi.string(),
            num:Joi.number(),
            unit_price:Joi.number(),
            cashback:Joi.number(),
            status:Joi.number(),// 1为处于异常状态中
        }],
        */
        // 配送信息，parcel_id在支付时分配，express相关信息在发货时分配
        parcel_id: Joi.string(),// 邮包编号，不需要单独存储邮包信息
        express_id: Joi.string(),// 快递单号
        express_brand: Joi.string(),// 快递厂牌
        deliveredAt: Joi.string(),// 发货时间
        // 地址信息
        address: Joi.string(),
        contact: Joi.string(),
        phone: Joi.string(),
        province: Joi.string(),
        city: Joi.string(),
        county: Joi.string(),
        // 付款信息
        total: Joi.number(),// 分，订单总金额
        cashback: Joi.number(),// 分，订单返现总金额
        goods_total: Joi.number(),// 分，商品总金额
        coupon_code: Joi.string(),// 代金券券码
        coupon_discount: Joi.number(),// 代金券优惠金额
        freight: Joi.number(),// 分，运费
        free_ship_code: Joi.string(),// 免邮券券码
        freight_discount: Joi.number(), // 分，运费优惠总额
        // 支付信息
        pay_order_id: Joi.string(),// 支付单号
        paidAt: Joi.string(),// 支付时间
        family_balance_consume: Joi.number(),// 分，消耗用户家庭余额
        user_balance_consume: Joi.number(),// 分，消耗用户钱包余额
        payment: Joi.number(),// 分，应付款总金额,支付时计算出来的应支付总额
        discount: Joi.number(),// 优惠总额
        actual_payment: Joi.number(),// 分，实际实付金额
        check: Joi.string(),//审核，(PENGDING/订单初始状态,ACCESS/通过，REJECT/拒绝)
        op: Joi.string(),//供应商
    },
    indexes: [
        {hashKey: 'express_id', rangeKey: 'express_brand', type: 'global', name: 'ExpressIndex'},
        {hashKey: 'order_id', type: 'global', name: 'orderIdIndex'},
        {hashKey: 'status', type: 'global', name: 'StatusIndex'},
    ]
});

// if (env === 'dev' || env === 'build') {
// dynogels.createTables({'js_order': { readCapacity: 5, writeCapacity: 5 }},(err) => {
//     if (err) {
//         console.log('updating tables error', err);
//     } else {
//         console.log('table updated');
//     }
// })
// }


class Order {
    get user_id() {
        return this._user_id;
    }

    set user_id(value) {
        this._user_id = value;
    }

    get family_id() {
        return this._family_id;
    }

    set family_id(value) {
        this._family_id = value;
    }

    get order_id() {
        return this._order_id;
    }

    set order_id(value) {
        this._order_id = value;
    }

    get status() {
        return this._status;
    }

    set status(value) {
        this._status = value;
    }

    get reverse_ids() {
        return this._reverse_ids;
    }

    set reverse_ids(value) {
        this._reverse_ids = value;
    }

    get arrival_date() {
        return this._arrival_date;
    }

    set arrival_date(value) {
        this._arrival_date = value;
    }

    get handle_date() {
        return this._handle_date;
    }

    set handle_date(value) {
        this._handle_date = value;
    }

    get items() {
        return this._items;
    }

    set items(value) {
        this._items = value;
    }

    get parcel_id() {
        return this._parcel_id;
    }

    set parcel_id(value) {
        this._parcel_id = value;
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

    get deliveredAt() {
        return this._deliveredAt;
    }

    set deliveredAt(value) {
        this._deliveredAt = value;
    }

    get address() {
        return this._address;
    }

    set address(value) {
        this._address = value;
    }

    get contact() {
        return this._contact;
    }

    set contact(value) {
        this._contact = value;
    }

    get phone() {
        return this._phone;
    }

    set phone(value) {
        this._phone = value;
    }

    get province() {
        return this._province;
    }

    set province(value) {
        this._province = value;
    }

    get city() {
        return this._city;
    }

    set city(value) {
        this._city = value;
    }

    get county() {
        return this._county;
    }

    set county(value) {
        this._county = value;
    }

    get payment() {
        return this._payment;
    }

    set payment(value) {
        this._payment = value;
    }

    get total() {
        return this._total;
    }

    set total(value) {
        this._total = value;
    }

    get cashback() {
        return this._cashback;
    }

    set cashback(value) {
        this._cashback = value;
    }

    get goods_total() {
        return this._goods_total;
    }

    set goods_total(value) {
        this._goods_total = value;
    }

    get discount() {
        return this._discount;
    }

    set discount(value) {
        this._discount = value;
    }

    get coupon_code() {
        return this._coupon_code;
    }

    set coupon_code(value) {
        this._coupon_code = value;
    }

    get coupon_discount() {
        return this._coupon_discount;
    }

    set coupon_discount(value) {
        this._coupon_discount = value;
    }

    get freight() {
        return this._freight;
    }

    set freight(value) {
        this._freight = value;
    }

    get free_ship_code() {
        return this._free_ship_code;
    }

    set free_ship_code(value) {
        this._free_ship_code = value;
    }

    get freight_discount() {
        return this._freight_discount;
    }

    set freight_discount(value) {
        this._freight_discount = value;
    }

    get pay_order_id() {
        return this._pay_order_id;
    }

    set pay_order_id(value) {
        this._pay_order_id = value;
    }

    get paidAt() {
        return this._paidAt;
    }

    set paidAt(value) {
        this._paidAt = value;
    }

    get check() {
        return this._check;
    }

    set check(value) {
        this._check = value;
    }

    get op() {
        return this._op;
    }

    set op(value) {
        this._op = value;
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

    get direct() {
        return this._direct;
    }

    set direct(value) {
        this._direct = value;
    }

    create(callback) {
        OrderM.create({
            user_id: this.user_id,
            family_id: this.family_id,
            order_id: this.order_id,
            status: 'INIT',
            reverse_ids: [],
            arrival_date: this.arrival_date,
            handle_date: this.handle_date,
            items: this.items,
            address: this.address,
            contact: this.contact,
            phone: this.phone,
            province: this.province,
            city: this.city,
            county: this.county,
            total: this.total,
            cashback: this.cashback,
            goods_total: this.goods_total,
            freight: this.freight,
            coupon_code: this.coupon_code,
            free_ship_code: this.free_ship_code,
            check: this.check || 'PENDING',
            op: this.check || 'JS'
        }, function (err, order) {
            callback(err, order)
        })
    }

    // 获取订单详情
    getOrder(callback) {
        OrderM.get({user_id: this.user_id, order_id: this.order_id}, (err, order) => {
            callback(err, order);
        })
    }

    queryOrderByExpress(lastFive, callback) {
        OrderM.query(this.status)
            .filter('order_id').contains(lastFive)
            .usingIndex('StatusIndex')
            .exec((err, data) => {
                callback(err, data)
            })
    }

    // 批量获取
    getOrderItems(items, callback) {
        OrderM.getItems(items, (err, data) => {
            callback(err, data)
        })
    }

    deleteItem(callback) {
        OrderM.destroy({user_id: this.user_id, order_id: this.order_id}, (err) => {
            callback(err);
        })
    }

    /* 得到整张order表 */
    getAllOrderList(callback) {
        OrderM
            .scan()
            .select('COUNT')
            .exec((err, data) => {
                callback(err, data)
            })
    }

    /* 得到PENDING_状态列表长度 */
    getStatusOrderList(callback) {
        OrderM.query('PENDING_')
            .usingIndex('StatusIndex')
            .select('COUNT')
            .exec((err, data) => {
                callback(err, data)
            })
    }

    // 获取某个handle_date并且状态为PENDING_的订单列表
    getHandleOrderList(handle, callback, lastKey) {
        if (lastKey) {
            OrderM.query('PENDING_')
                .filter('handle_date').equals(handle)
                .usingIndex('StatusIndex')
                .descending()
                .startKey(lastKey)
                .limit(20)
                .exec((err, resp) => {
                    callback(err, resp)
                })
        } else {
            OrderM.query('PENDING_')
                .filter('handle_date').equals(handle)
                .descending()
                .usingIndex('StatusIndex')
                .limit(20)
                .exec((err, resp) => {
                    callback(err, resp)
                })
        }
    }


    // 获取订单列表，按创建时间倒叙排列
    getOrderList(callback, lastKey) {
        if (lastKey) {
            OrderM.query('PENDING_')
            // .where('status').equals('PENDING_')
                .usingIndex('StatusIndex')
                .descending()
                .startKey(lastKey)
                .limit(20)
                .exec((err, resp) => {
                    callback(err, resp)
                })
        } else {
            OrderM.query('PENDING_')
                .descending()
                .usingIndex('StatusIndex')
                .limit(20)
                .exec((err, resp) => {
                    callback(err, resp)
                })
        }
    }

    /* 得到PENDING_状态列表长度 */
    getCheckOrderLength(check,callback) {
        OrderM.query('PENDING_')
            .filter('check').equals(check)
            .usingIndex('StatusIndex')
            .select('COUNT')
            .exec((err, data) => {
                callback(err, data)
            })
    }

    // 审核状态查询
    getCheckOrderList(check,callback, lastKey) {
        if (lastKey) {
            OrderM.query('PENDING_')
                .filter('check').equals(check)
                .usingIndex('StatusIndex')
                .descending()
                .startKey(lastKey)
                .limit(20)
                .exec((err, resp) => {
                    callback(err, resp)
                })
        } else {
            OrderM.query('PENDING_')
                .filter('check').equals(check)
                .descending()
                .usingIndex('StatusIndex')
                .limit(20)
                .exec((err, resp) => {
                    callback(err, resp)
                })
        }
    }


    /* 得到PENDING_状态列表长度 */
    getOpOrderLength(op,callback) {
        OrderM.query('PENDING_')
            .filter('op').equals(op)
            .usingIndex('StatusIndex')
            .select('COUNT')
            .exec((err, data) => {
                callback(err, data)
            })
    }

    // 供应商查询
    getOpOrderList(op,callback, lastKey) {
        if (lastKey) {
            OrderM.query('PENDING_')
                .filter('op').equals(op)
                .usingIndex('StatusIndex')
                .descending()
                .startKey(lastKey)
                .limit(20)
                .exec((err, resp) => {
                    callback(err, resp)
                })
        } else {
            OrderM.query('PENDING_')
                .filter('op').equals(op)
                .descending()
                .usingIndex('StatusIndex')
                .limit(20)
                .exec((err, resp) => {
                    callback(err, resp)
                })
        }
    }
    /* 得到某个状态列表长度 */
    getStatusList(callback) {
        OrderM.query(this.status)
            .usingIndex('StatusIndex')
            .select('COUNT')
            .exec((err, data) => {
                callback(err, data)
            })
    }

    // 获取不同状态订单列表，按创建时间倒叙排列
    getAllStatusList(callback, lastKey) {
        if (lastKey) {
            OrderM.query(this.status)
                .descending()
                .usingIndex('StatusIndex')
                .startKey(lastKey)
                .limit(20)
                .exec((err, resp) => {
                    callback(err, resp)
                })
        } else {
            OrderM.query(this.status)
                .descending()
                .usingIndex('StatusIndex')
                .limit(20)
                .exec((err, resp) => {
                    callback(err, resp)
                })
        }
    }

    // 订单号查询
    getOrderId(callback, lastKey) {
        if (lastKey) {
            OrderM.query(this.order_id)
                .usingIndex('orderIdIndex')
                .limit(100)
                .descending()
                .startKey(lastKey)
                .exec((err, data) => {
                    callback(err, data);
                })
        } else {
            OrderM.query(this.order_id)
                .usingIndex('orderIdIndex')
                .limit(100)
                .descending()
                .exec((err, data) => {
                    callback(err, data);
                })
        }
    }

    getOrderLast(lastFive, callback) {
        OrderM.query(this.user_id)
            .where('order_id').between(lastFive)
        // .filter('order_id').contains(lastFive)
            .exec((err, order) => {
                callback(err, order)
            })
    }

    // order_id头部和时间有关系，可以直接倒序排列
    getOrderLists(status, callback, lastKey) {
        if (status === 'DFK') {
            // 待付款状态订单
            OrderM.query(this.user_id)
                .filter('status').equals('INIT')
                .descending()
                .loadAll()
                .exec((err, resp) => {
                    callback(err, resp)
                })
        } else if (status === 'DSH') {
            // 待收货订单
            OrderM.query(this.user_id)
                .filter('status').contains('_')
                .descending()
                .loadAll()
                .exec((err, resp) => {
                    callback(err, resp)
                })
        } else if (status === 'ALL') {
            // 全部订单
            if (lastKey) {
                OrderM.query(this.user_id)
                    .descending()
                    .startKey(lastKey)
                    .limit(20)
                    .exec((err, resp) => {
                        callback(err, resp)
                    })
            } else {
                OrderM.query(this.user_id)
                    .descending()
                    .limit(20)
                    .exec((err, resp) => {
                        callback(err, resp)
                    })
            }
        }
    }

    // 支付时更新状态
    updateAfterPay(callback) {
        OrderM.update({
            user_id: this.user_id,
            order_id: this.order_id,
            status: 'PENDING_',
            parcel_id: this.parcel_id,
            coupon_discount: this.coupon_discount,
            freight_discount: this.freight_discount,
            payment: this.payment,
            pay_order_id: this.pay_order_id,
            paidAt: this.paidAt,
            family_balance_consume: this.family_balance_consume,
            user_balance_consume: this.user_balance_consume,
            actual_payment: this.actual_payment
        }, function (err, order) {
            callback(err, order);
        })
    }

    // 发货时更新状态
    updateAfterDelivery(callback) {
        OrderM.update({
            user_id: this.user_id,
            order_id: this.order_id,
            status: 'DELIVERED_',
            deliveredAt: this.deliveredAt,
            express_id: this.express_id,
            express_brand: this.express_brand,
        }, function (err, order) {
            callback(err, order);
        })
    }

    // 状态变更
    updateStatus(callback) {
        OrderM.update({
            user_id: this.user_id,
            order_id: this.order_id,
            status: this.status,
            express_id: this.express_id,
            express_brand: this.express_brand
        }, function (err, order) {
            callback(err, order);
        })
    }

    // 确认收货
    orderSuccess(callback) {
        OrderM.update({
            user_id: this.user_id,
            order_id: this.order_id,
            status: this.status,
        }, function (err, order) {
            callback(err, order);
        })
    }

    // 逆向订单时更新状态
    updateStatusByReverse(reverse_id, callback) {
        OrderM.update({
            user_id: this.user_id,
            order_id: this.order_id,
            status: this.status,
            reverse_ids: {$add: reverse_id}
        }, function (err, order) {
            callback(err, order);
        })
    }

    //审核订单
    updateOrderCheck(callback) {
        OrderM.update({
            user_id: this.user_id,
            order_id: this.order_id,
            check: this.check,
        }, function (err, order) {
            callback(err, order);
        })
    }

    //编辑订单
    updateOrderAddress(callback) {
        OrderM.update({
            user_id: this.user_id,
            order_id: this.order_id,
            status: this.status,
            check: this.check,
            address: this.address,
            contact: this.contact,
            phone: this.phone,
            province: this.province,
            city: this.city,
            county: this.county,
        }, function (err, order) {
            callback(err, order);
        })
    }

    //获得审核订单列表
    getOrderListByCheck(callback, lastKey) {
        if (lastKey) {
            OrderM.query('PENDING_')
            // .where('status').equals('PENDING_')
                .usingIndex('StatusIndex')
                .filter('check').equals(this.check)
                .descending()
                .startKey(lastKey)
                .limit(20)
                .exec((err, resp) => {
                    callback(err, resp)
                })
        } else {
            OrderM.query('PENDING_')
                .descending()
                .usingIndex('StatusIndex')
                .filter('check').equals(this.check)
                .limit(20)
                .exec((err, resp) => {
                    callback(err, resp)
                })
        }
    }

//获得审核供应商订单
    getOrderListByOp(callback, lastKey) {
        if (lastKey) {
            OrderM.query('PENDING_')
            // .where('status').equals('PENDING_')
                .usingIndex('StatusIndex')
                .filter('op').equals(this.op)
                .filter('check').equals(this.check)
                .descending()
                .startKey(lastKey)
                .limit(20)
                .exec((err, resp) => {
                    callback(err, resp)
                })
        } else {
            OrderM.query('PENDING_')
                .descending()
                .usingIndex('StatusIndex')
                .filter('op').equals(this.op)
                .filter('check').equals(this.check)
                .limit(20)
                .exec((err, resp) => {
                    callback(err, resp)
                })
        }
    }
}

module.exports = Order;
