// v1.0 增加拆单逻辑

// 引入变量
const axios = require('axios');
const qs = require('querystring');
const uuid = require('uuid/v4');
// 支持方法

// 查询订单信息
const getOrder = require('../../order/interface/getOrder');
let getOrderFunc = (user_id, order_id) => {
    return new Promise((resolve, reject) => {
        getOrder({
            user_id: user_id,
            order_id: order_id,
            callback: (resp) => {
                if (resp.error_code) {
                    reject(resp);
                } else {
                    resolve(resp.data);
                }
            }
        })
    })
};

// 更新订单
const updateOrder = require('../../order/interface/updateOrderByPay');
const createOrderBySplit = require('../../order/interface/createOrderBySplit');

const getFreightUtils = require('../../order/utils/utils');
const getFreight = getFreightUtils.freight_cal_jd;

function unique(arr){
    let result = [];
    for(let i=0;i<arr.length;i++){
        if(result.indexOf(arr[i]) === -1){
            result.push(arr[i])
        }
    }
    return result;
}

let splitParams = (items,order)=>{
    let total = 0;
    let cashback = 0;
    let goods_total = 0;
    let weight = 0;
    let freight = 0;
    let coupon_discount = 0;
    let freight_discount = 0;
    let payment = 0;
    let discount = 0;
    let family_balance_consume = 0;
    let user_balance_consume = 0;
    let actual_payment = 0;

    for (let i=0;i<items.length;i++){
        goods_total = goods_total+items[i].unit_price*items[i].num;
        cashback = cashback + items[i].cashback*items[i].num;
        weight = weight + items[i].weight*items[i].num;
    }
    goods_total = goods_total*100;
    weight = parseInt(weight);
    freight = getFreight(weight/1000,order.province)*100;

    total = freight+goods_total;

    if (order.free_ship_code !== '-'){
        if(order.goods_total>9900){
            freight_discount = freight;
        }else {
            if (freight > 1000){
                freight_discount = 1000;
            }else {
                freight_discount = freight;
            }
        }
    }else {
        if(order.goods_total>9900){
            freight_discount = freight;
        }
    }
    // 平摊优惠券
    if (order.coupon_code !== '-'){
        coupon_discount = Number((order.coupon_discount/order.goods_total*goods_total).toFixed(2));
    }

    discount = freight_discount + coupon_discount;

    payment = Number((order.paymemt/order.goods_total*goods_total).toFixed(2));

    family_balance_consume = Number((order.family_balance_consume/order.goods_total*goods_total).toFixed(2));

    user_balance_consume = Number((order.user_balance_consume/order.goods_total*goods_total).toFixed(2));

    actual_payment = Number((order.actual_payment/order.goods_total*goods_total).toFixed(2));

    return {
        total:total,
        cashback:cashback*100,
        goods_total:goods_total,
        freight:freight,
        coupon_discount:coupon_discount,
        freight_discount:freight_discount,
        payment:payment,
        discount:discount,
        family_balance_consume:family_balance_consume,
        user_balance_consume:user_balance_consume,
        actual_payment:actual_payment
    }
};

let updateOrderByPayFunc = (p) => {
    return new Promise((resolve, reject) => {
        let eBrand = 'zto';
        if (p.goods_total>9900 && p.free_ship_code !== '-'){
            eBrand = 'sf-express';// 高端单用顺丰
        }
        if (p.items.length>1){
            // 拆单逻辑
            let o = p;
            let opss = [];
            for (let i=0;i<p.items.length;i++){
                opss.push(p.items[i].op);
            }
            let op = unique(opss);
            let ops = new Array(op.length);
            // 拆单
            for (let i=0;i<op.length;i++){
                ops[i] = [];
                for (let k=0;k<p.items.length;k++){
                    if (p.items[k].op === op[i]){
                        ops[i].push(p.items[k]);
                    }
                }
            }
            // 第一单改为原单，第二单以后为新单
            for (let i=0;i<op.length;i++){
                if (i === 0){
                    let t = splitParams(ops[i],p);
                    // 仅更改订单
                    updateOrder({
                        user_id: p.user_id,
                        order_id: p.order_id,
                        total: t.total,
                        cashback: t.cashback,
                        goods_total: t.goods_total,
                        express_brand:eBrand,
                        freight: t.freight,
                        coupon_discount: t.coupon_discount,
                        freight_discount: t.freight_discount,
                        payment: t.payment,
                        items:ops[i],
                        op:op[0],
                        pay_order_id: p.pay_order_id,
                        discount: t.discount,
                        paidAt: p.paidAt,
                        family_balance_consume: t.family_balance_consume,
                        user_balance_consume: t.user_balance_consume,
                        actual_payment: t.actual_payment,

                        callback: (resp) => {
                            if (resp.error_code) {
                                console.error(p.user_id+'订单原单修改失败');
                            }
                        }
                    })
                }else {
                    // 第2单以后
                    let t = splitParams(ops[i],p);
                    o.order_id = o.order_id+'-'+i;

                    o.total = t.total;
                    o.cashback = t.cashback;
                    o.goods_total = t.goods_total;
                    o.freight = t.freight;
                    o.op = op[i];
                    o.express_brand = eBrand;
                    o.coupon_discount = t.coupon_discount;
                    o.freight_discount = t.freight_discount;
                    o.payment = t.payment;
                    o.discount = t.discount;
                    o.family_balance_consume = t.family_balance_consume;
                    o.user_balance_consume = t.user_balance_consume;
                    o.actual_payment = t.actual_payment;

                    o.items = ops[i];
                    o.callback = (resp)=>{
                        if(resp.error_code){
                            console.error(o.order_id+'第'+i+'单,创建失败'+op[i]);
                        }
                    };
                    createOrderBySplit(o);
                }
                if (i === op.length-1){
                    resolve(1);
                }
            }
        }else {
            // 仅更改订单
            updateOrder({
                user_id: p.user_id,
                order_id: p.order_id,
                total: p.total,
                cashback: p.cashback,
                express_brand:eBrand,
                goods_total: p.goods_total,
                freight: p.freight,
                coupon_discount: p.coupon_discount,
                freight_discount: p.freight_discount,
                payment: p.payment,
                items:p.items,
                op:p.items[0].op,
                pay_order_id: p.pay_order_id,
                discount: p.discount,
                paidAt: p.paidAt,
                family_balance_consume: p.family_balance_consume,
                user_balance_consume: p.user_balance_consume,
                actual_payment: p.actual_payment,
                callback: (resp) => {
                    if (resp.error_code) {
                        reject(resp);
                    } else {
                        resolve(1); // 返回订单信息
                    }
                }
            })
        }
    })
};

const useCoupon = require('../../promote/coupon/interface/useCoupon');
// 作废优惠券
let useCouponFunc = (user_id, code, order_id) => {
    return new Promise((resolve, reject) => {
        useCoupon.coupon({
            user_id: user_id,
            code: code,
            order_id: order_id,
            callback: (resp) => {
                if (resp.error_code) {
                    reject(resp);
                } else {
                    resolve(1);
                }
            }
        })
    })
};

let useFscFunc = (family_id, code, order_id) => {
    return new Promise((resolve, reject) => {
        useCoupon.freeShipCoupon({
            family_id: family_id,
            code: code,
            order_id: order_id,
            callback: (resp) => {
                if (resp.error_code) {
                    reject(resp);
                } else {
                    resolve(1);
                }
            }
        })
    })
};

// 更改取消订单计划
const cancelOrder = require('../../schedule/interface/cancelSchedule');
let cancelOrderCancelTaskFunc = (content) => {
    return new Promise((resolve, reject) => {
        cancelOrder({
            method: '/order/cancel',
            content: content,
            callback: (resp) => {
                if (resp.error_code) {
                    reject(resp);
                } else {
                    resolve(resp.data);
                }
            }
        })
    })
};

// // 写入购买记录
// const addBuyRecord = require('../../order/interface/addBuyRecord');
// let addBuyRecordFunc = (user_id,order_id,family_id,parcel_id,skuItems)=>{
//     return new Promise((resolve,reject)=>{
//         addBuyRecord({
//             user_id:user_id,
//             order_id:order_id,
//             family_id:family_id,
//             parcel_id:parcel_id,
//             skuItems:skuItems,
//             callback:(resp)=>{
//                 if (resp.error_code){
//                     reject(resp);
//                 }else {
//                     resolve(1);
//                 }
//             }
//         })
//     })
// };

// 记录消费流水
const addAccountBill = require('../../wallet/interface/addAccountBill');
let addAccountFunc = (p) => {
    return new Promise((resolve, reject) => {
        addAccountBill({
            owner_id: p.owner_id,
            type: p.type,
            status: p.status,
            detail: p.detail,
            sku_id: p.sku_id || '-',
            order_id: p.order_id,
            amount: p.amount, // 记录元
            callback: (resp) => {
                if (resp.error_code) {
                    reject(resp);
                } else {
                    resolve(resp.data);
                }
            }
        })
    })
};

// 扣减用户余额
const updateUserBalance = require('../../passport/interface/updateUserBalance');
let updateUserBalanceFunc = (user_id, amount) => {
    return new Promise((resolve, reject) => {
        updateUserBalance({
            user_id: user_id,
            consume: amount, // 记录消费额
            callback: (resp) => {
                if (resp.error_code) {
                    reject(resp);
                } else {
                    resolve(resp.data);
                }
            }
        })
    })
};

// 记录返现流水
const updateFamilyBalace = require('../../family/interface/updateFamilyBalance');
let updateFamilyBalanceFunc = (user_id, family_id, amount) => {
    return new Promise((resolve, reject) => {
        updateFamilyBalace({
            user_id: user_id,
            family_id: family_id,
            consume: amount,
            callback: (resp) => {
                if (resp.error_code) {
                    reject(resp);
                } else {
                    resolve(resp.data);
                }
            }
        })
    })
};

// // 创建家庭返现计划
// const createSchedule = require('../../schedule/interface/createSchedule');
// const setScheduleTask = (occur,content)=>{
//     return new Promise((resolve,reject)=>{
//         createSchedule({
//             method:'/family/cashback',
//             occur:occur,
//             content:content,
//             callback:(resp)=>{
//                 if (resp.error_code){
//                     reject(resp);
//                 }else {
//                     resolve(resp.data);
//                 }
//             }
//         })
//     })
// };

const createSchedule = require('../../schedule/interface/createSchedule');
// 创建用户周返现计划
const setScheduleTaskForUserBuy = (occur, content) => {
    return new Promise((resolve, reject) => {
        createSchedule({
            method: '/user/buy',
            occur: occur,
            content: content,
            callback: (resp) => {
                if (resp.error_code) {
                    reject(resp);
                } else {
                    resolve(resp.data);
                }
            }
        })
    })
};

// 获取form_id
const getFormId = require('../../passport/interface/getFormId');
let getFormIdFunc = (user_id) => {
    return new Promise((resolve, reject) => {
        getFormId({
            user_id: user_id,
            callback: (resp) => {
                if (resp.error_code) {
                    reject(resp);
                } else {
                    resolve(resp.data); // 直接返回form_id
                }
            }
        })
    })
};

// 获得微信access_token
let getWxAccessTokenFunc = () => {
    return new Promise((resolve, reject) => {
        axios.get('http://task.jiyong365.com' + '/schedule/wx-access-token').then((response) => {
            let wx_access_token = response.data;
            resolve(wx_access_token);
        }, (err) => {
            reject(err.message);
        })
    })
};

// 获取微信用户open_id
const getUserInfo = require('../../passport/interface/getUserInfo');
let getUserFunc = (user_id) => {
    return new Promise((resolve, reject) => {
        getUserInfo({
            user_id: user_id,
            callback: (resp) => {
                if (resp.error_code) {
                    reject(resp);
                } else {
                    resolve(resp.data); // 直接返回open_id
                }
            }
        })
    })
};

// 发送模板信息
let sendWXTemplateMsgFunc = (wx_access_token, wa_open_id, order_id, total, form_id) => {
    return new Promise((resolve, reject) => {
        // 发送一条模板消息
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        axios.post('https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + wx_access_token, {
            touser: wa_open_id,
            template_id: 'Q2EH4KhcJCn60HKqDSFkFW3FGEPiF0pygLtf9irfQrg',
            page: '/page/order/detail/detail?order_id=' + order_id, // 跳转小程序页面
            form_id: form_id,
            data: {
                "keyword1": {
                    "value": order_id,
                    "color": "#000000"
                },
                "keyword2": {
                    "value": total,
                    "color": "#173177"
                },
                "keyword3": {
                    "value": "单品补贴将于确认收货后7天充入账户",
                    "color": "#173177"
                }
            },
            emphasis_keyword: 'keyword1.DATA'
        }).then((response) => {
            if (response.data.errcode) {
                reject(response.data.errmsg);
            } else {
                resolve('ok');
            }
        }, (err) => {
            reject(err.message);
        });
    })
};

// 获取本周第一秒
let cal_week_first_second = (n) => {
    let today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    let oneday = 1000 * 60 * 60 * 24;
    let day = today.getDay();
    today = today.getTime();
    let mon;
    if (day) {
        mon = today - (day - 1) * oneday;
    } else {
        // 周日
        mon = today - 6 * oneday;
    }
    return String(mon + n * 7 * oneday)
};
//创建活动
let createAct = require('../../invite/interface/createAct');
let createActFun = (p) => {
    return new Promise((resolve, reject) => {
        createAct({
            user_id: p.user_id,
            order_id: p.order_id,
            callback: (resp) => {
                if (resp.error_code) {
                    reject(resp);
                } else {
                    resolve(resp.data);
                }
            }
        })
    })
};

// 入口，传入支付单信息
module.exports = (po) => {
    // 获取信息参数
    let prop = po.prop;
    // user_id&order_id&actPay&payment&couponDiscount&freight_discount&familyConsume&userConsume&vip
    let user_id = prop.split('&')[0];
    let order_id = prop.split('&')[1];
    let actPay = prop.split('&')[2];
    let payment = prop.split('&')[3];
    let coupon_discount = prop.split('&')[4];
    let freight_discount = prop.split('&')[5];
    let family_consume = prop.split('&')[6];
    let user_consume = prop.split('&')[7];
    let vip = parseInt(prop.split('&')[8]);

    // 转化为元
    coupon_discount = Number((coupon_discount / 100).toFixed(2));
    freight_discount = Number((freight_discount / 100).toFixed(2));
    payment = Number((payment / 100).toFixed(2));
    family_consume = Number((family_consume / 100).toFixed(2));
    user_consume = Number((user_consume / 100).toFixed(2));
    actPay = Number((actPay / 100).toFixed(2));

    // TASK 1：更新订单
    let goEn = async () => {
        try {
            let order = await getOrderFunc(user_id,order_id);
            order = order.order;
            order.coupon_discount = coupon_discount;
            order.freight_discount = freight_discount;
            order.parcel_id = uuid();
            order.paymemt = payment;
            order.pay_order_id = po.tradeId;
            order.discount = freight_discount + coupon_discount;
            order.paidAt = po.updatedAt;
            order.family_balance_consume = family_consume;
            order.user_balance_consume = user_consume;
            order.actual_payment = actPay;
            // 更新订单并拆单
            await updateOrderByPayFunc(order);
            // TASK 2：作废优惠券
            // 作废优惠券
            if (order.coupon_code !== '-') {
                let resultUFC = await useCouponFunc(user_id, order.coupon_code, order_id);
            }
            if (order.free_ship_code !== '-') {
                let resultUFF = await useFscFunc(order.family_id, order.free_ship_code, order_id);
            }
            // TASK 3：取消订单消除任务
            let content = user_id + '&&' + order_id;
            let resultCOCTF = await cancelOrderCancelTaskFunc(content);
            // // TASK 4：写入购买记录
            // let resultABRF = await addBuyRecordFunc(user_id, order_id, order.family_id, order.parcel_id, order.items);

            // TASK 5：扣减家庭余额
            if (family_consume && order.family_id) {
                let result = await updateFamilyBalanceFunc(user_id, order.family_id, family_consume);
            }
            // TASK 8：扣减用户余额
            if (user_consume) {
                let resultUUBF = await updateUserBalanceFunc(user_id, user_consume);
            }
            // TASK 6：记录消费流水（家庭)
            if (family_consume && order.family_id) {
                let p = {
                    owner_id: order.family_id,
                    type: 0,
                    status: 1,
                    detail: '消费：订单' + order_id,
                    order_id: order_id,
                    amount: -1 * family_consume, // 记录元
                };
                let resultAAFC = await addAccountFunc(p);
            }
            // TASK 7：记录返现流水家庭
            for (let i = 0; i < order.items.length; i++) {
                for (let m = 0; m < order.items[i].num; m++) {
                    let p = {
                        owner_id: order.family_id,
                        type: 1,
                        status: 0,
                        sku_id: order.items[i].sku_id,
                        detail: '单品补贴：' + order.items[i].spu_name + order.items[i].sku_name,
                        order_id: order_id,
                        amount: order.items[i].cashback, // 记录元
                    };
                    let resultAAFCB = await addAccountFunc(p);
                }
            }
            // TASK 9：记录消费流水（用户）
            if (user_consume) {
                let p = {
                    owner_id: user_id,
                    type: 0,
                    status: 1,
                    detail: '消费：订单' + order_id,
                    order_id: order_id,
                    amount: -1 * user_consume, // 记录元
                };
                let resultAAC = await addAccountFunc(p);
            }
            // TASK 11: 写入个人用户购买记录，告诉task系统该用户发生了购买
            let occur2 = cal_week_first_second(0);
            let setScheduleTaskForUser = await setScheduleTaskForUserBuy(occur2, user_id);
            // TASK 10：发送模板消息，通知用户
            // 获取form_id
            let u_info = await getUserFunc(user_id);
            let form_id = await getFormIdFunc(user_id);
            let open_id = u_info.wa_open_id;
            let wa_access_token = await getWxAccessTokenFunc();
            if (payment >= 30) {
                let sendMoneyData = await createActFun(order);
            }
            let resultSM = await sendWXTemplateMsgFunc(wa_access_token, open_id, payment, form_id);
        } catch (err) {
            console.error(err);
        }
    };
    goEn();
};