const router = require('express').Router();

const func = require('../utils/utils');

const Order = require('../models/Order');

const getCartItems = require('../../cart/interface/getCartItems');
const deleteCartItems = require('../../cart/interface/deleteCartItems');
const createSchedule = require('../../schedule/interface/createSchedule');
const getTargetScheduleByContent = require('../../schedule/interface/getScheduleByContent');
const cancelSchedule = require('../../schedule/interface/cancelSchedule');
const getProduct = require('../../product/interface/getProduct');
const updateStock = require('../../product/interface/updateStock');
const checkCouponAvaliable = require('../../promote/coupon/interface/checkCouponAvilable');
const getFamily = require('../../family/interface/getFamily');

//去重
function unique(arr) {
    let result = [];
    for (let i = 0; i < arr.length; i++) {
        if (result.indexOf(arr[i]) === -1) {
            result.push(arr[i])
        }
    }
    return result;
}

/**
 * 以下为支持方法
 *
 */

let checkAvaliable = (fit,spus,condition,skus)=>{
    spus = unique(spus);// 去重
    if (fit[0] === '*'){
        return true;
    }else {
        // condition为0，则只要有就可以用
        if (condition === 0){
            let n = 0;
            for (let i=0;i<fit.length;i++){
                for (let k=0;k<spus.length;k++){
                    if (fit[i] === spus[k]){
                        n++;
                        break;
                    }
                }
            }
            if (n>0) {
                return true;
            }else {
                return false;
            }
        }else {
            // condition不为0,则必须要计算总值
            let p = 0;
            for (let i=0;i<fit.length;i++){
                for (let k=0;k<spus.length;k++){
                    if (fit[i] === spus[k]){
                        for (let t=0;t<skus.length;t++){
                            if (skus[t].sku_id.split('-')[0] === spus[k]){
                                p = p+skus[t].price*skus[t].num;
                            }
                        }
                        break;
                    }
                }
            }
            if (p>=condition) {
                return true;
            }else {
                return false;
            }
        }
    }
};

let sku2spu = (skus)=>{
    let spus = [];
    for (let i=0;i<skus.length;i++){
        spus.push(skus[i].sku_id.split('-')[0]);
    }
    return spus;
};

// 查询券码是否有效
const checkCouponCodeFunc = (owner_id, code, type, skus) => {
    return new Promise((resolve, reject) => {
        // 校验券是否OK
        checkCouponAvaliable({
            owner_id: owner_id,
            code: code,
            type: type,
            callback: (resp) => {
                if (resp.error_code) {
                    reject(resp);
                } else {
                    // 如果是优惠券多判断一步
                    if (type === 0){
                        let spus = sku2spu(skus);
                        let c = resp.data;
                        let check = checkAvaliable(c.fit,spus,c.condition,skus);
                        if (check){
                            resolve(1)
                        }else {
                            reject(0)
                        }
                    }else {
                        resolve(resp.data);
                    }
                }
            }
        })
    })
};

// 异步查询购物车条目
const getCartItemsFunc = (items) => {
    return new Promise((resolve, reject) => {
        getCartItems({
            items: items,
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

// 异步查询商品详细数据
const getProductFunc = (skus) => {
    return new Promise((resolve, reject) => {
        getProduct.get.skus({
            skus: skus,
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

// 获取家庭信息
const getFamilyFunc = (user_id, family_id) => {
    return new Promise((resolve, reject) => {
        getFamily({
            user_id: user_id,
            family_id: family_id,
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

// 创建定时删除计划
const setScheduleTask = (occur, content) => {
    return new Promise((resolve, reject) => {
        createSchedule({
            method: '/order/cancel',
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

// 更新库存
const minusStockFunc = (list) => {
    return new Promise((resolve, reject) => {
        updateStock.minus({
            list: list,
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

// 删除购物车条目
const deleteCartItemsFunc = (user_id, items) => {
    return new Promise((resolve, reject) => {
        deleteCartItems({
            user_id: user_id,
            items: items,
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

// 直接由SKU创建新订单
// 一次只能对一个sku下订单，用于产地直发SKU，避免复杂的拆单逻辑
router.post('/create-sku-direct', (req, res, next) => {
    if (!req.currentUser) {
        return res.send({
            error_code: 5001,
            error_msg: '无调用权限'
        })
    }
    let params = req.body;
    let user_id = req.currentUser.user_id;
    
    if (!params.sku || !params.address || !params.contact || !params.phone || !params.province || !params.city || !params.county) {
        return res.send({
            error_code: 5002,
            error_msg: '缺少必要参数'
        })
    }
    let direct = async () => {
        let tItems = [];
        let item = {
            num: Number(params.num)
        };
        tItems.push(item);
        try {
            // 是否有免邮券，判断是否可以使用
            if (params.family_id && params.fsc_code) {
                await checkCouponCodeFunc(params.family_id, params.fsc_code, 1);
            }

            // 构建查询商品的参数
            let skuIds = [];
            skuIds.push(params.sku);

            if (params.coupon_code) {
                let couponFit = checkCouponFit(skuIds, fits);

                if (!couponFit) {
                    return res.send({
                        error_code: 5011,
                        error_msg: '优惠券不适配商品'
                    })
                }
            }

            // 返回值
            let skus;
            // 查询商品信息
            skus = await getProductFunc(skuIds);
            for (let i=0;i<skus.length;i++){
                skus[i].num = tItems[i].attrs.num;
            }
            let fits;
            // 是否有优惠券，判断是否可以使用
            if (params.coupon_code) {
                fits = await checkCouponCodeFunc(user_id, params.coupon_code, 0 ,skus);
            }
            // 计算核心数据并进行库存判断
            let skusList = []; // 存储到订单中的items数据
            let weight = 0; // 订单中商品总重量，单位克
            let cashback = 0; // 订单商品总返现额
            let priceT = 0; // 订单商品总金额
            let shortA = []; // 下单商品中缺货的商品列表
            let notShowList = []; // 下单商品中下架的商品列表
            for (let i = 0; i < skus.length; i++) {
                // 判断库存足不足
                if (Number(skus[i].stock) < Number(tItems[i].num)) {
                    shortA.push({
                        sku_id: skus[i].sku_id,
                        spu_id: skus[i].goods_id,
                        sku_name: skus[i].type_id,
                        spu_name: skus[i].goods_name,
                        stock: skus[i].stock
                    })
                
                }
                if (!skus[i].show) {
                    notShowList.push({
                        sku_id: skus[i].sku_id,
                        spu_id: skus[i].goods_id,
                        sku_name: skus[i].type_id,
                        spu_name: skus[i].goods_name,
                    })
                }
                let item = {
                    sku_id: skus[i].sku_id,
                    spu_id: skus[i].goods_id,
                    barcode:skus[i].barcode,
                    op: skus[i].op,
                    sku_name: skus[i].type_id,
                    spu_name: skus[i].goods_name,
                    cover: skus[i].image,
                    unit_price: skus[i].price,
                    num: parseInt(tItems[i].num),
                    weight:skus[i].weight,
                    cashback: skus[i].cashback,
                };
              
                skusList.push(item);
             
                weight = weight + Number(skus[i].weight) * Number(tItems[i].num);
                cashback = cashback + Number(skus[i].cashback) * Number(tItems[i].num);
                priceT = priceT + Number(skus[i].price) * Number(tItems[i].num);
            }
            // 防止出现js float计算不准的问题
           
            priceT = parseInt(priceT * 100);
            cashback = parseInt(cashback * 100);
            weight = parseInt(weight);
            if (notShowList.length) {
                return res.send({
                    error_code: 7000,
                    error_msg: '部分商品下架',
                    data: notShowList
                });
            }
            if (shortA.length) {
                return res.send({
                    error_code: 7001,
                    error_msg: '部分商品库存不足',
                    data: shortA
                });
            }
            let order_id;
            let createdAt;

            // 下单
            let createOrder = () => {
                return new Promise((resolve, reject) => {
                    let order = new Order();
                    order.user_id = user_id; // 指定目标用户
                    order.order_id = func.get_order_id(); // 构建订单号
                    order.arrival_date = params.arrival_date; // 预计送达日期
                    order.family_id = params.family_id || '-';
                    order.handle_date = func.get_handle_date(params.arrival_date, params.province); // 计算订单处理日期
                    order.items = skusList;
                    order.address = params.address;
                    order.direct = '1';// TODO 此处可以传入供应商ID
                    order.contact = params.contact;
                    order.phone = params.phone;
                    order.province = params.province;
                    order.city = params.city;
                    order.county = params.county;
                    order.total = priceT + parseInt(func.freight_cal_jd(weight / 1000, params.province) * 100);
                    order.cashback = cashback;
                    order.goods_total = priceT;
                    order.freight = parseInt(func.freight_cal_jd(weight / 1000, params.province) * 100);
                    order.coupon_code = params.coupon_code || '-';
                    order.free_ship_code = params.fsc_code || '-';
                   
                    order.create((err, item) => {
                        if (err) {
                            reject({
                                error_code: 5006,
                                error_msg: err.message
                            })
                        } else {
                            order_id = item.attrs.order_id;
                            createdAt = item.attrs.createdAt;
                            resolve(order_id);
                        }
                    })
                });
            };
            await createOrder();
           
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: {
                    order_id: order_id
                }
            });
            // 创建定时删除计划
            await setScheduleTask(String(Date.parse(createdAt) + 2 * 3600 * 1000), user_id + '&&' + order_id);
            // 更新库存
            await minusStockFunc(skusList);
            // 删除购物车条目
            // await deleteCartItemsFunc(user_id, params.items);

        } catch (err) {
            res.send(err);
        }
    };
    direct();
});

/*
 创建新订单
 下单接口
 核心接口
 */

/*
sku的item数据示例
items:['object_id'];
 */
router.post('/create', (req, res, next) => {
    if (!req.currentUser) {
        return res.send({
            error_code: 5001,
            error_msg: '无调用权限'
        })
    }
    let params = req.body;
    if (!params.items || !params.address || !params.contact || !params.phone || !params.province || !params.city || !params.county) {
        return res.send({
            error_code: 5002,
            error_msg: '缺少必要参数'
        })
    }
    //console.log(params);
    // 防止只有一个商品时，被当做字符串处理
    if (typeof params.items === 'string') {
        params.items = [params.items];
    }
    // 最多100条数据
    if (params.items.length > 100 || params.items.length === 0) {
        return res.send({
            error_code: 5003,
            error_msg: '一次下单最多99种商品'
        })
    }
    // 构造items，查询购物车详情
    let cItems = [];
    let user_id = req.currentUser.user_id;
    for (let i = 0; i < params.items.length; i++) {
        let item = {
            user_id: user_id,
            object_id: params.items[i]
        };
        cItems.push(item);
    }

    let tItems;
    // 查询购物车
    let goEn = async () => {
        try {
            tItems = await getCartItemsFunc(cItems);

            // 是否有免邮券，判断是否可以使用
            if (params.family_id && params.fsc_code) {
                await checkCouponCodeFunc(params.family_id, params.fsc_code, 1);
            }

            // 构建查询商品的参数
            let skuIds = [];
            for (let i = 0; i < tItems.length; i++) {
                skuIds.push(tItems[i].attrs.sku_id);
            }

            // if (params.coupon_code) {
            //     let couponFit = checkCouponFit(skuIds, fits);
            //
            //     if (!couponFit) {
            //         return res.send({
            //             error_code: 5011,
            //             error_msg: '优惠券不适配商品'
            //         })
            //     }
            // }

            // 返回值
            let skus;
            // 查询商品信息
            skus = await getProductFunc(skuIds);
            for (let i=0;i<skus.length;i++){
                skus[i].num = tItems[i].attrs.num;
            }
            let fits;
            // 是否有优惠券，判断是否可以使用
            if (params.coupon_code) {
                fits = await checkCouponCodeFunc(user_id, params.coupon_code, 0 ,skus);
            }
            // 计算核心数据并进行库存判断
            let skusList = []; // 存储到订单中的items数据
            let weight = 0; // 订单中商品总重量，单位克
            let cashback = 0; // 订单商品总返现额
            let priceT = 0; // 订单商品总金额
            let shortA = []; // 下单商品中缺货的商品列表
            let notShowList = []; // 下单商品中下架的商品列表
            for (let i = 0; i < skus.length; i++) {
                // 判断库存足不足
                if (Number(skus[i].stock) < Number(tItems[i].attrs.num)) {
                    shortA.push({
                        sku_id: skus[i].sku_id,
                        spu_id: skus[i].goods_id,
                        sku_name: skus[i].type_id,
                        spu_name: skus[i].goods_name,
                        stock: skus[i].stock
                    })
                }
                if (!skus[i].show) {
                    notShowList.push({
                        sku_id: skus[i].sku_id,
                        spu_id: skus[i].goods_id,
                        sku_name: skus[i].type_id,
                        spu_name: skus[i].goods_name,
                    })
                }
                let item = {
                    sku_id: skus[i].sku_id,
                    spu_id: skus[i].goods_id,
                    barcode:skus[i].barcode,
                    op: skus[i].op,
                    sku_name: skus[i].type_id,
                    spu_name: skus[i].goods_name,
                    cover: skus[i].image,
                    unit_price: skus[i].price,
                    num: parseInt(tItems[i].attrs.num),
                    weight:skus[i].weight,
                    cashback: skus[i].cashback,
                };
                skusList.push(item);
                weight = weight + Number(skus[i].weight) * Number(tItems[i].attrs.num);
                cashback = cashback + Number(skus[i].cashback) * Number(tItems[i].attrs.num);
                priceT = priceT + Number(skus[i].price) * Number(tItems[i].attrs.num);
            }
            // 防止出现js float计算不准的问题
            priceT = parseInt(priceT * 100);
            cashback = parseInt(cashback * 100);
            weight = parseInt(weight);
            if (notShowList.length) {
                return res.send({
                    error_code: 7000,
                    error_msg: '部分商品下架',
                    data: notShowList
                });
            }
            if (shortA.length) {
                return res.send({
                    error_code: 7001,
                    error_msg: '部分商品库存不足',
                    data: shortA
                });
            }
            let order_id;
            let createdAt;
            // 下单
            let createOrder = () => {
                return new Promise((resolve, reject) => {
                    let order = new Order();
                    order.user_id = user_id; // 指定目标用户
                    order.order_id = func.get_order_id(); // 构建订单号
                    order.arrival_date = params.arrival_date; // 预计送达日期
                    order.family_id = params.family_id || '-';
                    order.handle_date = func.get_handle_date(params.arrival_date, params.province); // 计算订单处理日期
                    order.items = skusList;
                    order.address = params.address;
                    order.contact = params.contact;
                    order.phone = params.phone;
                    order.province = params.province;
                    order.city = params.city;
                    order.county = params.county;
                    order.total = priceT + parseInt(func.freight_cal_jd(weight / 1000, params.province) * 100);
                    order.cashback = cashback;
                    order.goods_total = priceT;
                    order.freight = parseInt(func.freight_cal_jd(weight / 1000, params.province) * 100);
                    order.coupon_code = params.coupon_code || '-';
                    order.free_ship_code = params.fsc_code || '-';
                    order.create((err, item) => {
                        if (err) {
                            reject({
                                error_code: 5006,
                                error_msg: err.message
                            })
                        } else {
                            order_id = item.attrs.order_id;
                            createdAt = item.attrs.createdAt;
                            resolve(order_id);
                        }
                    })
                });
            };
            await createOrder();
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: {
                    order_id: order_id
                }
            });
            // 创建定时删除计划
            await setScheduleTask(String(Date.parse(createdAt) + 2 * 3600 * 1000), user_id + '&&' + order_id);
            // 更新库存
            await minusStockFunc(skusList);
            // 删除购物车条目
            await deleteCartItemsFunc(user_id, params.items);
        } catch (err) {
            return res.send(err);
        }
    };
    goEn();
});

// 将订单从数据库里删除，仅允许删除完成状态的订单
router.post('/delete-order', (req, res, next) => {
    if (!req.currentUser) {
        return res.send({
            error_code: 5001,
            error_msg: '无调用权限'
        })
    }
    if (!req.body.order_id) {
        return res.send({
            error_code: 5002,
            error_msg: '缺少order_id'
        })
    }
    let order = new Order();
    order.user_id = req.currentUser.user_id;
    order.order_id = req.body.order_id;
    order.getOrder((err, data) => {
        if (err) {
            return res.send({
                error_code: 5003,
                error_msg: err.message
            })
        }
        if (!data) {
            return res.send({
                error_code: 5004,
                error_msg: '错误订单号'
            })
        }
        data = data.attrs;
        if (data.status !== 'REFUNDED' && data.status !== 'RETURNED' && data.status !== 'RECHANGED' && data.status !== 'CANCEL' && data.status !== 'SUCCESS') {
            return res.send({
                error_code: 5005,
                error_msg: '该状态下的订单不可删除'
            })
        }
        order.deleteItem((err) => {
            if (err) {
                return res.send({
                    error_code: 5006,
                    error_msg: err.message
                })
            }
            return res.send({
                error_code: 0,
                error_msg: 'ok'
            })
        })
    })
});

// 将订单置为取消
router.post('/cancel-order', (req, res, next) => {
    if (!req.currentUser) {
        return res.send({
            error_code: 5001,
            error_msg: '无调用权限'
        })
    }
    if (!req.body.order_id) {
        return res.send({
            error_code: 5002,
            error_msg: '缺少order_id'
        })
    }
    let order = new Order();
    order.user_id = req.currentUser.user_id;
    order.order_id = req.body.order_id;
    order.getOrder((err, data) => {
        if (err) {
            return res.send({
                error_code: 5003,
                error_msg: err.message
            })
        }
        if (!data) {
            return res.send({
                error_code: 5004,
                error_msg: '错误订单号'
            })
        }
        data = data.attrs;
        if (data.status !== 'INIT') {
            return res.send({
                error_code: 5005,
                error_msg: '该状态下的订单不可取消'
            })
        }
        order.status = 'CANCEL';
        order.updateStatus((err, d) => {
            if (err) {
                return res.send({
                    error_code: 5006,
                    error_msg: err.message
                })
            }
            return res.send({
                error_code: 0,
                error_msg: 'ok'
            })
        })
    })
});

const addCart = require('../../cart/interface/addCart');

router.post('/buy-again', (req, res, next) => {
    if (!req.currentUser) {
        return res.send({
            error_code: 5001,
            error_msg: '无调用权限'
        })
    }
    if (!req.body.order_id) {
        return res.send({
            error_code: 5002,
            error_msg: '缺少order_id'
        })
    }
    let order = new Order();
    order.user_id = req.currentUser.user_id;
    order.order_id = req.body.order_id;
    order.getOrder((err, data) => {
        if (err) {
            return res.send({
                error_code: 5003,
                error_msg: err.message
            })
        }
        if (!data) {
            return res.send({
                error_code: 5004,
                error_msg: '错误订单号'
            })
        }
        data = data.attrs;
        let n = 0;
        let errList = [];
        for (let i = 0; i < data.items.length; i++) {
            addCart({
                spu_id: data.items[i].sku_id.split('-')[0],
                sku_id: data.items[i].sku_id,
                num: data.items[i].num,
                user_id: req.currentUser.user_id,
                callback: (resp) => {
                    if (resp.error_code) {
                        errList.push(data.items[i].sku_id);
                    } else {
                        n++;
                    }
                    if (errList.length + n === data.items.length) {
                        return res.send({
                            error_code: 0,
                            error_msg: 'ok',
                            data: {
                                errList: errList
                            }
                        })
                    }
                }
            })
        }
    });
});

// 物流信息更新webhook，TODO，未测试
const axios = require('axios');

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
let getUserOpenIdFunc = (user_id) => {
    return new Promise((resolve, reject) => {
        getUserInfo({
            user_id: user_id,
            callback: (resp) => {
                if (resp.error_code) {
                    reject(resp);
                } else {
                    resolve(resp.data.wa_open_id); // 直接返回open_id
                }
            }
        })
    })
};

// 发送已开始配送模板信息
let sendWXTemplateMsgFuncDelivery = (wx_access_token, wa_open_id, order_id, express_id, express_name, form_id) => {
    return new Promise((resolve, reject) => {
        // 发送一条模板消息
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        axios.post('https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + wx_access_token, {
            touser: wa_open_id,
            template_id: '2dNpvxYGyzHXFd4LlC0rYnLcom0tXrseNOSYJ-sbyi0',
            page: '/page/order/logistic/logistic?order_id=' + order_id, // 跳转小程序页面
            form_id: form_id,
            data: {
                "keyword1": {
                    "value": express_id,
                    "color": "#000000"
                },
                "keyword2": {
                    "value": express_name,
                    "color": "#173177"
                },
                "keyword3": {
                    "value": order_id,
                    "color": "#173177"
                },
                "keyword4": {
                    "value": "您的家庭补给品已在路上，点击查看物流信息",
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

// 发送签收模板信息
let sendWXTemplateMsgFuncSign = (wx_access_token, wa_open_id, order_id, express_id, express_name, form_id) => {
    return new Promise((resolve, reject) => {
        // 发送一条模板消息
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        axios.post('https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + wx_access_token, {
            touser: wa_open_id,
            template_id: 'bcCUDhjQLaJszUaDehzNbYtv9-NhIhxmep1kHa2pwOs',
            page: '/page/order/detail/detail?order_id=' + order_id, // 跳转小程序页面
            form_id: form_id,
            data: {
                "keyword1": {
                    "value": express_id,
                    "color": "#000000"
                },
                "keyword2": {
                    "value": express_name,
                    "color": "#173177"
                },
                "keyword3": {
                    "value": order_id,
                    "color": "#173177"
                },
                "keyword4": {
                    "value": "确认收货后7天将为您的家庭结算单品补贴",
                    "color": "#173177"
                }
            },
            emphasis_keyword: 'keyword4.DATA'
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

// 创建家庭返现计划
const setFamilyCashBackScheduleTask = (p) => {
    return new Promise((resolve, reject) => {
        let family = new Family();
        if (p.order.family_id) {
            getFamily({
                user_id: p.user_id,
                family_id: p.order.family_id,
                callback: (resp) => {
                    if (resp.error_code) {
                        reject(resp);
                    } else {
                        let vip = resp.data.vip;
                        if (vip === 1 || vip === 2) {
                            createSchedule({
                                method: '/family/cashback',
                                occur: p.occur,
                                content: p.user_id + '&&' + p.order.family_id + '&&' + p.order.order_id,
                                callback: (resp) => {
                                    if (resp.error_code) {
                                        reject(resp);
                                    } else {
                                        resolve(1);
                                    }
                                }
                            })
                        }
                    }
                }
            });
        } else {
            resolve(1);
        }
    })
};

// 写入购买记录
const addBuyRecord = require('../../order/interface/addBuyRecord');
let addBuyRecordFunc = (user_id, order_id, family_id, parcel_id, skuItems) => {
    return new Promise((resolve, reject) => {
        addBuyRecord({
            user_id: user_id,
            order_id: order_id,
            family_id: family_id,
            parcel_id: parcel_id,
            skuItems: skuItems,
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

// 物流信息更新回调,确认收货
const sha256 = require('js-sha256').sha256;
router.post('/logistic-hook', (req, res, next) => {
    // 校验是否来自tracking-more，如果不是立刻拒绝访问
    // 获取来源origin
    let params = req.body.data;
    console.log(params);
    if (!params) {
        return res.sendStatus(404);
    }
    if (!params.verifyInfo) {
        return res.sendStatus(404);
    }
    const email = 'ziv@yongxin.io';
    let timeStr = params.verifyInfo.timeStr;
    console.log(timeStr);
    let signature = params.verifyInfo.signature;
    console.log(signature);
    let signature2 = sha256.hmac(timeStr, email);
    console.log(signature2);
    if (signature !== signature2) {
        return res.sendStatus(404);
    } else {
        res.sendStatus(200);
    }
    let express_id = params.tracking_number; // 获取物流单号，需要根据express_id来查询订单并对订单进行更新
    let express_brand = params.carrier_code; // 物流供应商单号

    // 查询订单
    let order = new Order();
    order.express_id = express_id;
    order.express_brand = express_brand;
    order.queryOrderByExpress((err, data) => {
        if (data.Count) {
            // 校验成功，且有订单
            switch (express_brand) {
                case 'jd':
                    express_brand = '京东快递';
                    break;
                case 'sf-express':
                    express_brand = '顺丰速递';
                    break;
                case 'sto':
                    express_brand = '申通快递';
                    break;
                case 'yto':
                    express_brand = '圆通快递';
                    break;
                case 'zto':
                    express_brand = '中通快递';
                    break;
                case 'yunda':
                    express_brand = '韵达快递';
                    break;
                case 'china-ems':
                    express_brand = 'EMS';
                    break;
                case 'china-post':
                    express_brand = '中国邮政';
                    break;
                case 'deppon':
                    express_brand = '德邦物流';
                    break;
                case 'rufengda':
                    express_brand = '如风达';
                    break;
                case 'ttkd':
                    express_brand = '天天快递';
                    break;
                case 'qfkd':
                    express_brand = '全峰快递';
                    break;
                case 'cess':
                    express_brand = '国通快递';
                    break;
                case 'bestex':
                    express_brand = '百世快递';
                    break;
                case 'ane66':
                    express_brand = '安能物流';
                    break;
            }
            switch (params.status) {
                case 'transit':
                    // 如果已发货，向用户发送模板通知，已发货
                    // 发送小程序模板消息
                    console.log('transit');
                    let sendMsgFunc = async () => {
                        let form_id = await getFormIdFunc(data.Items[0].attrs.user_id);
                        let wa_access_token = await getWxAccessTokenFunc();
                        let open_id = await getUserOpenIdFunc(data.Items[0].attrs.user_id);
                        await sendWXTemplateMsgFuncDelivery(wa_access_token, open_id, data.Items[0].attrs.order_id, express_id, express_brand, form_id);
                    };
                    sendMsgFunc();
                    break;
                case 'delivered':
                    console.log('delivered');
                    // 发送小程序模板消息
                    let sendMsgFunc2 = async () => {
                        let form_id = await getFormIdFunc(data.Items[0].attrs.user_id);
                        let wa_access_token = await getWxAccessTokenFunc();
                        let open_id = await getUserOpenIdFunc(data.Items[0].attrs.user_id);
                        await sendWXTemplateMsgFuncSign(wa_access_token, open_id, data.Items[0].attrs.order_id, express_id, express_brand, form_id);
                    };
                    sendMsgFunc2();
                    // // 如果已签收，将订单置为success，并发送一条模板消息，已签收
                    // order.user_id = data.Items[0].attrs.user_id;
                    // order.order_id = data.Items[0].attrs.order_id;
                    // order.status = 'SUCCESS';
                    // order.success_time = Date.now();
                    // order.updateStatusByReceipt((err,data)=>{
                    //     if (err){
                    //         console.error('签收状态更新~'+order.order_id+'~'+order.user_id+err.message);
                    //     }
                    //     // 发送小程序模板消息
                    //     let sendMsgFunc = async ()=>{
                    //         let form_id = await getFormIdFunc(data.Items[0].attrs.user_id);
                    //         let wa_access_token = await getWxAccessTokenFunc();
                    //         let open_id = await getUserOpenIdFunc(data.Items[0].attrs.user_id);
                    //         await sendWXTemplateMsgFuncSign(wa_access_token,open_id,data.Items[0].attrs.order_id,express_id,express_brand,form_id);
                    //     };
                    //     sendMsgFunc();
                    //     let setS = async ()=>{
                    //         try {
                    //             let p = {
                    //                 occur : String(Date.now()+1000*60*60*24*7),
                    //                 user_id : order.user_id,
                    //                 order : data.attrs
                    //             };
                    //             setFamilyCashBackScheduleTask(p);
                    //         }catch (err){
                    //             console.error(err.error())
                    //         }
                    //     };
                    //     setS();
                    // });
                    break
            }
        }
    })
});

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

let handleInviteCashBack = (user_id,order_id)=>{
    let content = user_id+'&&'+order_id;
    getTargetScheduleByContent({
        method:'/invite/cash-plan',
        content:content,
        callback:(resp)=>{
            if (resp.error_code){
                console.log('订单邀请补贴错误',user_id+order_id+resp.error_msg)
            }else {
                // 正常返回
                if (resp.data.Count === 1){
                    // 先删除计划
                    cancelSchedule({
                        method:'/invite/cash-plan',
                        content:content
                    });
                    // // 创建一条account
                    let p = {
                        owner_id: user_id,
                        type: 3,
                        status: 0,
                        detail: '好友领券奖励',
                        order_id: order_id,
                        amount: -1 * 5, // 记录元
                    };
                    addAccountFunc(p);
                    // 创建新计划
                    createSchedule({
                        method: '/invite/paycash',
                        occur: String(Date.now()+1000 * 60 * 60 * 24 * 7),
                        content: user_id + '&&' + order_id,
                        callback: (resp) => {
                            if (resp.error_code) {
                                console.log('订单邀请补贴错误', user_id + order_id + resp.error_msg)
                            }}
                    })
                }
            }
        }
    })
};

/*
 用户主动确认收货
 */
router.post('/receipt', (req, res, next) => {
    if (!req.currentUser) {
        return res.send({
            error_code: 5001,
            error_msg: '无调用权限'
        })
    }
    if (!req.body.order_id) {
        return res.send({
            error_code: 5002,
            error_msg: '需要订单号'
        })
    }
    let order = new Order();
    order.user_id = req.currentUser.user_id;
    order.order_id = req.body.order_id;
    order.getOrder((err, data) => {
        if (err) {
            return res.send({
                error_code: 5003,
                error_msg: err.message
            })
        }
        if (!data) {
            return res.send({
                error_code: 5004,
                error_msg: '错误订单号'
            })
        }
        data = data.attrs;
        if (data.status !== 'DELIVERED_') {
            return res.send({
                error_code: 5005,
                error_msg: '无法操作'
            })
        }
        order.status = 'SUCCESS';
        order.success_time = Date.now();
        order.updateStatusByReceipt((err, data) => {
            if (err) {
                return res.send({
                    error_code: 5006,
                    error_msg: err.message
                })
            }
            res.send({
                error_code: 0,
                error_msg: 'ok'
            });
            data = data.attrs;
            // 添加进入家庭返现计划
            let setS = async () => {
                try {
                    let p = {
                        occur: String(Date.now() + 1000 * 60 * 60 * 24 * 7),
                        user_id: req.currentUser.user_id,
                        order: data
                    };
                    await addBuyRecordFunc(req.currentUser.user_id, req.body.order_id, data.family_id, data.parcel_id, data.items);
                    await setFamilyCashBackScheduleTask(p);
                } catch (err) {
                    console.error(err.error())
                }
            };
            setS();
            handleInviteCashBack(req.currentUser.user_id,req.body.order_id);
        })
    })
});

// 获取快递物流信息
router.get('/logistic', (req, res, next) => {
    if (req.currentUser) {
        if (req.query.order_id) {
            let order = new Order();
            order.user_id = req.currentUser.user_id;
            order.order_id = req.query.order_id;
            order.getOrder((err, data) => {
                if (err) {
                    return res.send({
                        error_code: 5005,
                        error_msg: err.message
                    })
                }
                if (!data) {
                    return res.send({
                        error_code: 5005,
                        error_msg: '订单不存在'
                    })
                }
                data = data.attrs;
                if (data.express_id) {
                    if (data.express_id === '10001' && data.express_brand === 'js'){
                        return res.send({
                            error_code: 0,
                            error_msg: 'ok',
                            data:{
                                handle_date: '发货日：' + data.handle_date,
                                express_id: data.order_id,
                                express_brand: '锦时线下',
                                msg: [{
                                    Date:data.handle_date,
                                    StatusDescription:'您的订单已于线下核销'
                                }]
                            }
                        })
                    }
                    let options = {
                        url: 'https://api.trackingmore.com/v2/trackings/realtime',
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                            "Trackingmore-Api-Key": "2494dbee-178f-426a-a28d-d6d6d003b9da"
                        },
                        data: JSON.stringify({
                            tracking_number: data.express_id,
                            carrier_code: data.express_brand || 'jd'
                        })
                    };
                    let express_brand = '';
                    switch (data.express_brand) {
                        case 'jd':
                            express_brand = '京东快递';
                            break;
                        case 'sf-express':
                            express_brand = '顺丰速递';
                            break;
                        case 'sto':
                            express_brand = '申通快递';
                            break;
                        case 'yto':
                            express_brand = '圆通快递';
                            break;
                        case 'zto':
                            express_brand = '中通快递';
                            break;
                        case 'yunda':
                            express_brand = '韵达快递';
                            break;
                        case 'china-ems':
                            express_brand = 'EMS';
                            break;
                        case 'china-post':
                            express_brand = '中国邮政';
                            break;
                        case 'deppon':
                            express_brand = '德邦物流';
                            break;
                        case 'rufengda':
                            express_brand = '如风达';
                            break;
                        case 'ttkd':
                            express_brand = '天天快递';
                            break;
                        case 'qfkd':
                            express_brand = '全峰快递';
                            break;
                        case 'cess':
                            express_brand = '国通快递';
                            break;
                        case 'bestex':
                            express_brand = '百世快递';
                            break;
                        case 'ane66':
                            express_brand = '安能物流';
                            break;
                    }
                    axios(options).then((resp) => {
                        if (resp.data.meta.code === 200) {
                            res.send({
                                error_code: 0,
                                error_msg: 'ok',
                                data: {
                                    handle_date: '发货日：' + data.handle_date,
                                    express_id: data.express_id,
                                    express_brand: express_brand,
                                    msg: resp.data.data.items[0].origin_info.trackinfo
                                }
                            })
                        } else {
                            res.send({
                                error_code: 5004,
                                error_msg: resp.data.meta.message
                            })
                        }
                    }, (err) => {
                        console.error(err);
                        res.send({
                            error_code: 5003,
                            error_msg: err.message
                        })
                    })
                } else {
                    res.send({
                        error_code: 5006,
                        error_msg: '该订单还未发货'
                    })
                }
            });
        } else {
            res.send({
                error_code: 5002,
                error_msg: '缺少order_id'
            })
        }
    } else {
        res.send({
            error_code: 5001,
            error_msg: '无调用权限'
        })
    }
});

/*
 获取订单列表
 */
router.get('/list', (req, res, next) => {
    if (req.currentUser) {
        // 处理last_key
        if (req.query.last_key) {
            req.query.last_key = decodeURIComponent(req.query.last_key);
            req.query.last_key = JSON.parse(req.query.last_key);
        }
        let stauts = req.query.status;
        if (stauts === 'DFK' || stauts === 'DSH' || stauts === 'ALL') {
            let order = new Order();
            order.user_id = req.currentUser.user_id;
            // 待付款为DFK，待收货为DSH，全部订单为ALL
            order.getOrderList(req.query.status, (err, orders) => {
                if (err) {
                    res.send({
                        error_code: 5003,
                        error_msg: err.message
                    })
                } else {
                    res.send({
                        error_code: 0,
                        error_msg: 'ok',
                        data: {
                            orders: orders
                        }
                    })
                }
            }, req.query.last_key)
        } else {
            return res.send({
                error_code: 5004,
                error_msg: '错误状态'
            })
        }
    } else {
        res.send({
            error_code: 5001,
            error_msg: '无调用权限'
        })
    }
});


/*
 获取订单详情信息
 */
router.get('/', (req, res, next) => {
    if (req.currentUser) {
        if (req.query.order_id) {
            let order = new Order();
            order.user_id = req.currentUser.user_id;
            order.order_id = req.query.order_id;
            order.getOrder((err, order) => {
                if (err) {
                    res.send({
                        error_code: 5003,
                        error_msg: err.message
                    })
                } else {
                    if (order) {
                        // todo 如果有family_id那么就获取家庭name
                        order = order.attrs;
                        if (order.family_id !== '-') {
                            let getFamilyEn = async () => {
                                try {
                                    let f = await getFamilyFunc(req.currentUser.user_id, order.family_id);
                                    order.family_name = f.name;
                                    res.send({
                                        error_code: 0,
                                        error_msg: 'ok',
                                        data: {
                                            order: order
                                        }
                                    })
                                } catch (err) {
                                    order.family_name = '家庭被删除';
                                    res.send({
                                        error_code: 0,
                                        error_msg: 'ok',
                                        data: {
                                            order: order
                                        }
                                    })
                                }
                            };
                            getFamilyEn();
                        } else {
                            res.send({
                                error_code: 0,
                                error_msg: 'ok',
                                data: {
                                    order: order
                                }
                            })
                        }
                    } else {
                        res.send({
                            error_code: 5004,
                            error_msg: '订单号错误'
                        })
                    }
                }
            })
        } else {
            res.send({
                error_code: 5002,
                error_msg: '需要order_id'
            })
        }
    } else {
        res.send({
            error_code: 5001,
            error_msg: '无调用权限'
        })
    }
});
//得到代付款的数量
router.get('/dfk/num',(req,res,next)=>{
    let order = new Order();
    order.user_id = req.currentUser.user_id;
    order.getOrderListNum((err,data)=>{
        if(err){
           res.send({
               error_code:4001,
               error_msg:err.message
           })
        }else{
            res.send({
                error_code:0,
                error_msg:'ok',
                data:data.Count
            })
        }
    })
});

//待收货
router.get('/dsh/num',(req,res,next)=>{
    let order = new Order();
    order.user_id = req.currentUser.user_id;
    order.getOrderDshtNum((err,data)=>{
        if(err){
           res.send({
               error_code:4001,
               error_msg:err.message
           })
        }else{
            res.send({
                error_code:0,
                error_msg:'ok',
                data:data.Count
            })
        }
    })
});

module.exports = router;