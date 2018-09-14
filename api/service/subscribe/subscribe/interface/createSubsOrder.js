// 创建订阅订单
// 最新的构建
const Order = require('../models/Subscribe-order');
const Package = require('../models/Subscribe-package');
const Wares = require('../models/Subscribe-wares');

const getProductMsg = require('../../../product/interface/getProduct');

module.exports = (p)=>{
    return new Promise((resolve,reject)=>{
        // vip值是0/1
        if (!p.wares_id||!p.user_id||!p.family_id || !p.num || !p.freight || !p.total || !p.stages || !p.actual_payment||!p.weeks){
            reject({
                error_code:10001,
                error_msg:'缺少参数'
            })
        }
        if (p.freight_discount>=0 && p.family_balance_consume>=0 && p.user_balance_consume>=0&&p.vip>=0 ){

        }else {
            reject({
                error_code:100011,
                error_msg:'缺少参数'
            })
        }
        let order = new Order();// 创建订单
        let wares = new Wares(); // 获取商品信息
        wares.id = p.wares_id.split('#')[0];// 传上来的是具体SKU组合的具体阶段价格
        wares.getWare((err,data)=>{
            if (err){
                reject({
                    error_code:10002,
                    error_msg:'缺少参数'
                })
            }
            if (!data){
                reject({
                    error_code:10003,
                    error_msg:'错误wares_id'
                })
            }
            data = data.attrs;
            let ware_id_parent = p.wares_id.split('#')[0]+'#'+p.wares_id.split('#')[1];
            let ware_info;
            // 获取订阅SKU信息
            for (let i=0;i<data.wares.length;i++){
                if (data.wares[i].id === ware_id_parent){
                    ware_info = data.wares[i];
                    break;
                }
            }
            // 获取该SKU下的梯度信息
            // 暂时无用
            let priceStrategy ;
            for (let i=0;i<ware_info.price.length;i++){
                if (ware_info.price[i].id === p.wares_id){
                    priceStrategy = ware_info.price[i];
                    break;
                }
            }

            // 获取订阅商品中包含的SKU信息
            let skuss = [];
            for (let i=0;i<ware_info.skus.length;i++){
                skuss.push(ware_info.skus[i].sku_id);
            }
            getProductMsg.get.skus({
                skus:skuss,
                callback:(resp)=>{
                    if (resp.error_code){
                        reject(resp);
                    }
                    let d = resp.data;
                    for (let i=0;i<d.length;i++){
                        for (let k=0;k<d.length;k++){
                            if (ware_info.skus[i].sku_id === d[k].sku_id){
                                ware_info.skus[i].spu_id = d[k].goods_id;
                                ware_info.skus[i].cover = d[k].image;
                                ware_info.skus[i].goods_name = d[k].goods_name;
                                ware_info.skus[i].price = d[k].price;
                                ware_info.skus[i].type_id = d[k].type_id;
                                ware_info.skus[i].discount_price = d[k].discount_price;
                            }
                        }
                    }
                    order.user_id = p.user_id;
                    order.family_id = p.family_id;
                    order.wares_id = p.wares_id;
                    order.wares_detail = {
                        ware_info:ware_info,
                        vip:p.vip,
                        priceStrategy:priceStrategy
                    };
                    order.num = p.num;
                    order.wares_cover = ware_info.cover;
                    order.wares_title = ware_info.title;
                    order.price = p.total;
                    order.freight = p.freight;
                    order.sku_detail = ware_info.skus;
                    order.weeks = p.weeks;
                    order.stages = p.stages;
                    order.freight_discount = p.freight_discount;
                    order.family_balance_consume = p.family_balance_consume;
                    order.user_balance_consume = p.user_balance_consume;
                    order.actual_payment = p.actual_payment;
                    order.create((err,data)=>{
                        if (err){
                            reject({
                                error_code:10004,
                                error_msg:err.message
                            })
                        }else {
                            let pack = new Package();
                            let n = 0;
                            for (let i=0;i<p.stages;i++){
                                pack.subs_order_id = data.attrs.subs_order_id;
                                pack.user_id = p.user_id;
                                pack.family_id = p.family_id;
                                pack.week = p.weeks[i];
                                pack.index = i+1;
                                pack.num = p.num;
                                pack.sku_detail = ware_info.skus;
                                pack.create((err)=>{
                                    n++;
                                    if (n === p.stages){
                                        resolve({
                                            error_code:0,
                                            error_msg:'ok'
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
            })
        })
    })
};