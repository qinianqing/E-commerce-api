// 参数与线上接口完全相同
const Cart = require('../models/Cart');
const product = require('../../product/interface/getProduct');


module.exports = (p)=>{
        if (p.spu_id && p.sku_id && p.num && p.user_id){
            if (p.spu_id !== p.sku_id.split('-')[0]){
                return p.callback({
                    error_code:701,
                    error_msg:'参数错误'
                })
            }
            let params = p;
            let cart = new Cart();
            cart.user_id = p.user_id;
            cart.getOnesCart((err,data)=>{
                if (data.Count >= 99){
                    return p.callback({
                        error_code:700,
                        error_msg:'购物车最多99种商品'
                    })
                }else {
                    let  have = '';
                    // 获取购物车数据
                    for (let i=0;i<data.Count;i++){
                        if (params.sku_id === data.Items[i].attrs.sku_id){
                            have = data.Items[i].attrs.object_id;
                        }
                    }
                    if (have){
                        // 已有 item，就加数量，update
                        cart.object_id = have;
                        cart.num = parseInt(params.num);
                        // 获取sku库存和上下架信息
                        cart.getCartItem((err,data)=>{
                            if(err){
                                return p.callback({
                                    error_code:5006,
                                    error_msg:err.message
                                })
                            }else {
                                let cartItem = data.attrs;
                                // 获得sku信息
                                product.get.sku({
                                    sku_id:cartItem.sku_id,
                                    callback:(resp)=>{
                                        if (resp.error_code >0){
                                            return p.callback(resp);
                                        }
                                        let skuItem = resp.data;
                                        if (skuItem.show){
                                            if (Number(skuItem.stock)>=Number(params.num)+Number(cartItem.num)){
                                                // 获取sku_id和spu_id
                                                // 查询sku_id表
                                                cart.updateCartNum((err)=>{
                                                    if (err){
                                                        return p.callback({
                                                            error_code:5003,
                                                            error_msg:err.message
                                                        })
                                                    }
                                                    p.callback({
                                                        error_code:0,
                                                        error_msg:'ok'
                                                    })
                                                })
                                            }else {
                                                p.callback({
                                                    error_code:7001,
                                                    error_msg:'仅剩'+skuItem.stock+'件'
                                                })
                                            }
                                        }else {
                                            p.callback({
                                                error_code:7002,
                                                error_msg:'商品下架'
                                            })
                                        }
                                    }
                                })
                            }
                        })
                    }else {
                        // 没有item，就加一项
                        cart.sku_id = params.sku_id;
                        cart.spu_id = params.spu_id;
                        cart.num = params.num;
                        // 获取sku库存和上下架信息
                        product.get.sku({
                            sku_id:params.sku_id,
                            callback:(resp)=>{
                                if (resp.error_code >0){
                                    return p.callback(resp);
                                }
                                let skuItem = resp.data;
                                if (skuItem.show){
                                    if (Number(skuItem.stock)>=Number(params.num)){
                                        cart.create((err,cart)=>{
                                            if(err){
                                                p.callback({
                                                    error_code:4000,
                                                    error_msg:err.message
                                                })
                                            }else{
                                                p.callback({
                                                    error_code:0,
                                                    error_msg:'ok'
                                                })
                                            }
                                        })
                                    }else {
                                        p.callback({
                                            error_code:7003,
                                            error_msg:'仅剩'+skuItem.stock+'件'
                                        })
                                    }
                                }else {
                                    p.callback({
                                        error_code:7004,
                                        error_msg:'商品下架'
                                    })
                                }
                            }
                        });
                    }
                }
            })
        }else {
            p.callback({
                error_code:5002,
                error_msg:'缺少参数'
            })
        }

};