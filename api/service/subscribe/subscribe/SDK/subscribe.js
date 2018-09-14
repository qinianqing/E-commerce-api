// Subscribe SDK v1.0

// TODO 务必记录每一次修改

// v1.0 Ziv
// 2018-04-18
// 用于其他微服务对优惠券接口的调用，依赖axios库

// 调用示例：

// 使用前必须先调用init，初始化secret
let secret = '';

// 依赖库
const axios = require('axios');
const qs = require('querystring');

// 设置域名
//let host = 'https://api.jiyong365.com';
let host = 'http://localhost:3000';

if (process.env.EV === 'stg'){
    host = 'https://stg.jiyong365.com'
}

let methods = {
    init:(sec)=>{
        secret = sec;
    },
    // 增删改查订阅商品
    wares:{
        // 创建一个订阅商品
        // @param object
        // p
        create:(p)=>{
            if (secret) {
                if (p.coupon_code&&p.coupon_id&&p.status&&p.activeAt&&p.expiredAt&&p.num&&p.callback){
                    let path = '/coupon/code/create';
                    let params = {
                        coupon_code:p.coupon_code,
                        coupon_id:p.coupon_id,
                        status:p.status,
                        activeAt:p.activeAt,
                        expiredAt:p.expiredAt,
                        num:p.num,
                        secret:secret
                    };
                    requestPost(path,params,(resp)=>{
                        p.callback(resp);
                    });
                }else{
                    throw new Error('缺少参数');
                }
            }else{
                throw new Error('缺少秘钥');
            }
        },
        // 编辑订阅商品
        update:(p)=>{
            if (secret) {
                if (p.id&&p.createdAt){
                    let path = '/coupon/code/update';
                    let params = {
                        id:p.id,
                        createdAt:p.createdAt,
                        coupon_code:p.coupon_code,
                        coupon_id:p.coupon_id,
                        status:p.status,
                        activeAt:p.activeAt,
                        expiredAt:p.expiredAt,
                        num:p.num,
                        secret:secret
                    };
                    requestPost(path,params,(resp)=>{
                        p.callback(resp);
                    });
                }else{
                    throw new Error('需要参数');
                }
            }else{
                throw new Error('缺少秘钥');
            }
        },
        // 获取订阅商品列表
        // 如果有last_key需要对其拆分成id和createdAt两个项
        list:(p)=>{
            if (secret) {
                if (p.callback){
                    let path = '/coupon/code/list';
                    let params = {
                        id:p.id,
                        createdAt:p.createdAt,
                        secret:secret
                    };
                    requestGet(path,params,(resp)=>{
                        p.callback(resp);
                    });
                }else{
                    throw new Error('需要参数');
                }
            }else{
                throw new Error('缺少秘钥');
            }
        },
    },
    // 查看订阅订单并对订单进行操作
    order:{
        // 获取订阅订单列表
        create:(p)=>{
            if (secret) {
                if (p.num&&p.limit>0&&p.mode&&p.status&&p.activeAt&&p.expiredType>=0&&p.expiredInfo&&p.name&&p.price>0&&p.condition>=0&&p.fit&&p.information&&p.callback){
                    let path = '/coupon/template/create';
                    let params = {
                        num:p.num,
                        limit:p.limit,
                        mode:p.mode,
                        status:p.status,
                        activeAt:p.activeAt,
                        expiredType:p.expiredType,
                        expiredInfo:p.expiredInfo,
                        name:p.name,
                        price:p.price,
                        background:p.background,
                        condition:p.condition,
                        fit:p.fit,
                        information:p.information,
                        secret:secret
                    };
                    requestPost(path,params,(resp)=>{
                        p.callback(resp);
                    });
                }else{
                    throw new Error('缺少参数');
                }
            }else{
                throw new Error('缺少秘钥');
            }
        },
        // 更新订阅订单信息
        update:(p)=>{
            if (secret) {
                if (p.coupon_id&&p.createdAt&&p.num&&p.limit>0&&p.mode&&p.status&&p.activeAt&&p.expiredType>=0&&p.expiredInfo&&p.name&&p.price>0&&p.condition>=0&&p.fit&&p.information&&p.callback){
                    let path = '/coupon/template/update';
                    let params = {
                        coupon_id:p.coupon_id,
                        createdAt:p.createdAt,
                        num:p.num,
                        limit:p.limit,
                        mode:p.mode,
                        status:p.status,
                        activeAt:p.activeAt,
                        expiredType:p.expiredType,
                        expiredInfo:p.expiredInfo,
                        name:p.name,
                        price:p.price,
                        condition:p.condition,
                        fit:p.fit,
                        information:p.information,
                        secret:secret
                    };
                    requestPost(path,params,(resp)=>{
                        p.callback(resp);
                    });
                }else{
                    throw new Error('缺少参数');
                }
            }else{
                throw new Error('缺少秘钥');
            }
        },
        // 获取订阅订单列表
        list:(p)=>{
            if (secret) {
                if (p.callback){
                    let path = '/coupon/template/list';
                    let params = {
                        coupon_id:p.coupon_id,
                        createdAt:p.createdAt,
                        secret:secret
                    };
                    requestGet(path,params,(resp)=>{
                        p.callback(resp);
                    });
                }else{
                    throw new Error('需要参数');
                }
            }else{
                throw new Error('缺少秘钥');
            }
        },
        // 检索订单
        search:(p)=>{
            if (secret) {
                if (p.query&&p.callback){
                    let path = '/coupon/template/search';
                    let params = {
                        query:p.query,
                        secret:secret
                    };
                    requestGet(path,params,(resp)=>{
                        p.callback(resp);
                    });
                }else{
                    throw new Error('需要参数');
                }
            }else{
                throw new Error('缺少秘钥');
            }
        }
    },
    package:{
        // 检索订单下包裹列表
        freeShipCoupon:(p)=>{
            if (secret) {
                if (p.family_id&&p.code&&p.order_id&&p.callback){
                    let path = '/coupon/use/free-ship-coupon';
                    let params = {
                        family_id:p.family_id,
                        code:p.code,
                        order_id:p.order_id,
                        secret:secret
                    };
                    requestPost(path,params,(resp)=>{
                        p.callback(resp);
                    });
                }else{
                    throw new Error('需要参数');
                }
            }else{
                throw new Error('缺少秘钥');
            }
        },
        // 订阅期数处理
        package:(p)=>{
            if (secret) {
                if (p.user_id&&p.code&&p.order_id&&p.callback){
                    let path = '/coupon/use/coupon';
                    let params = {
                        user_id:p.user_id,
                        code:p.code,
                        order_id:p.order_id,
                        secret:secret
                    };
                    requestPost(path,params,(resp)=>{
                        p.callback(resp);
                    });
                }else{
                    throw new Error('需要参数');
                }
            }else{
                throw new Error('缺少秘钥');
            }
        }
    },
};

let requestPost = (path,params,callback)=>{
    axios.post(host+path,qs.stringify(params))
        .then((response) => {
            callback(response.data);
        },(error) => {
            console.error(error);
        })
};

let requestGet = (path,params,callback)=>{
    axios.get(host+path, {params: params})
        .then(function (response) {
            callback(response.data);
        })
        .catch(function (error) {
            console.error(error);
        });
};

module.exports = methods;