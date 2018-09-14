const router = require('express').Router();
const Cart = require('../models/Cart');

// 商品SDK
const product = require('../../product/interface/getProduct');

//去重
function unique(arr){
    let result = [];
    for(let i=0;i<arr.length;i++){
        if(result.indexOf(arr[i]) === -1){
            result.push(arr[i])
        }
    }
    return result;
}
/*
 获取购物车列表
*/
router.get('/list',function(req,res,next){
    if(req.currentUser){
        let params = req.body;
        let cart = new Cart();
        cart.user_id = req.currentUser.user_id;
        cart.getOnesCart((err,data)=>{
            if(err){
                res.send({
                    error_code:4000,
                    error_msg:err.message
                })
            }else{
                // 对返回数据进行格式化
                if (data.Count){
                    // 查询SKU表，判断是否是有效状态
                    let dataA = [];
                    let skus = [];
                    for (let i=0;i<data.Count;i++){
                        skus.push(data.Items[i].attrs.sku_id);
                        dataA.push(data.Items[i].attrs)
                    }
                    // 批量查询sku信息
                    product.get.skus({
                        skus:skus,
                        callback:(resp)=>{
                            let invalidA = [];
                            let validA = [];
                            if(resp.error_code !== 0){
                                return res.send(resp);
                            }
                            let skuItems = resp.data;
                            for (let i=0;i<skuItems.length;i++){
                                dataA[i].show = skuItems[i].show;
                                dataA[i].stock = skuItems[i].stock;
                                dataA[i].skuName = skuItems[i].type_id;
                                dataA[i].cover = skuItems[i].image;
                                dataA[i].id = data.Items[i].attrs.object_id;
                                dataA[i].crossedPrice = skuItems[i].discount_price;
                                dataA[i].price = skuItems[i].price;
                                dataA[i].spu = skuItems[i].goods_name;
                                dataA[i].weight = skuItems[i].weight;
                                dataA[i].cashback = skuItems[i].cashback;
                            }
                            for(let i=0;i<skuItems.length;i++){
                                // 计算库存列表
                                if (dataA[i].show === true){
                                    if (Number(dataA[i].stock) === 0){
                                        dataA[i].reason = '无库存';
                                        invalidA.push(dataA[i])
                                    }else if (dataA[i].stock<dataA[i].num){
                                        dataA[i].reason = '库存不足';
                                        validA.push(dataA[i])
                                    }else {
                                        validA.push(dataA[i])
                                    }
                                }else {
                                    dataA[i].reason = '下架';
                                    invalidA.push(dataA[i])
                                }
                            }
                            res.send({
                                error_code:0,
                                error_msg:'ok',
                                data:{
                                    count:dataA.length,
                                    valid:validA,
                                    invalid:invalidA
                                }
                            })
                        }
                    });
                }else {
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:{
                            count:0
                        }
                    })
                }
            }
        })
    }else{
        res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
});
/*
 清空所有失效购物车条目
 */
router.post('/clear-invalid',function (req,res,next) {
    if (req.currentUser){
        let cart = new Cart();
        cart.user_id = req.currentUser.user_id;
        cart.getOnesCart((err,data)=>{
            if(err){
                res.send({
                    error_code:4000,
                    error_msg:err.message
                })
            }else{
                // 对返回数据进行格式化
                if (data.Count){
                    // 查询SKU表，判断是否是有效状态
                    let dataA = [];
                    let skus = [];
                    for (let i=0;i<data.Count;i++){
                        skus.push(data.Items[i].attrs.sku_id);
                        dataA.push(data.Items[i].attrs)
                    }
                    product.get.skus({
                        skus:skus,
                        callback:(resp)=>{
                            if(resp.error_code > 0){
                                return res.send(resp)
                            }
                            let d = resp.data;
                            let invalidA = [];
                            for (let i=0;i<d.length;i++){
                                dataA[i].show = d[i].show;
                                dataA[i].stock = d[i].stock;
                            }
                            for(let i=0;i<data.Count;i++){
                                // 计算库存列表
                                if (dataA[i].show === true){
                                    if (Number(dataA[i].stock) === 0){
                                        invalidA.push(dataA[i])
                                    }
                                }else {
                                    invalidA.push(dataA[i])
                                }
                            }
                            if (invalidA.length){
                                // 开始删除
                                let k= [];
                                for (let i=0;i<invalidA.length;i++){
                                    let cartD = new Cart();
                                    cartD.user_id = req.currentUser.user_id;
                                    cartD.object_id = invalidA[i].object_id;
                                    cartD.deleteItem((err)=>{
                                        if (!err){
                                            k.push('a');
                                            if (k.length === invalidA.length){
                                                res.send({
                                                    error_code:0,
                                                    error_msg:'ok'
                                                })
                                            }
                                        }
                                    })
                                }
                            }else {
                                res.send({
                                    error_code:0,
                                    error_msg:'ok'
                                })
                            }
                        }
                    });
                }else {
                    res.send({
                        error_code:0,
                        error_msg:'ok'
                    })
                }
            }
        })
    }else {
        res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
});

/*
 加入购物车
*/
router.post('/add',function(req,res,next){
    if(req.currentUser){
        if (req.body.spu_id && req.body.sku_id && req.body.num){
            if (req.body.spu_id !== req.body.sku_id.split('-')[0]){
                return res.send({
                    error_code:701,
                    error_msg:'参数错误'
                })
            }
            let params = req.body;
            let cart = new Cart();
            cart.user_id = req.currentUser.user_id;
            cart.getOnesCart((err,data)=>{
                if (data.Count >= 99){
                    res.send({
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
                                res.send({
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
                                            return res.send(resp);
                                        }
                                        let skuItem = resp.data;
                                        if (skuItem.show){
                                            if (Number(skuItem.stock)>=Number(params.num)+Number(cartItem.num)){
                                                // 获取sku_id和spu_id
                                                // 查询sku_id表
                                                cart.updateCartNum((err)=>{
                                                    if (err){
                                                        return res.send({
                                                            error_code:5003,
                                                            error_msg:err.message
                                                        })
                                                    }
                                                    res.send({
                                                        error_code:0,
                                                        error_msg:'ok'
                                                    })
                                                })
                                            }else {
                                                res.send({
                                                    error_code:7001,
                                                    error_msg:'仅剩'+skuItem.stock+'件'
                                                })
                                            }
                                        }else {
                                            res.send({
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
                                    return res.send(resp);
                                }
                                let skuItem = resp.data;
                                if (skuItem.show){
                                    if (Number(skuItem.stock)>=Number(params.num)){
                                        cart.create((err,cart)=>{
                                            if(err){
                                                res.send({
                                                    error_code:4000,
                                                    error_msg:err.message
                                                })
                                            }else{
                                                res.send({
                                                    error_code:0,
                                                    error_msg:'ok'
                                                })
                                            }
                                        })
                                    }else {
                                        res.send({
                                            error_code:7003,
                                            error_msg:'仅剩'+skuItem.stock+'件'
                                        })
                                    }
                                }else {
                                    res.send({
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
            res.send({
                error_code:5002,
                error_msg:'缺少参数'
            })
        }
    }else{
        res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
});

/*
* 获取相同spu id下的所有sku项目
*
*/
router.get('/skus-by-spu',function (req,res,next) {
    if (req.currentUser){
        if (req.query.spu_id){
            product.get.spu({
                spu_id:req.query.spu_id,
                callback:(resp)=> {
                    if (resp.error_code >0){
                        return res.send(resp);
                    }
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:{
                            skus:resp.data.attrs.skus,
                            styles:resp.data.attrs.styles
                        }
                    })
                }
            });
        }else {
            res.send({
                error_code:5003,
                error_msg:'缺少spu_id'
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
});


/*
 编辑购物车
*/
router.post('/update',function(req,res,next){
    if(req.currentUser){
        let params = req.body;
        if (params.object_id){
            let cart = new Cart();
            let p = {};
            p.user_id = req.currentUser.user_id;
            p.object_id = params.object_id;

            cart.user_id = req.currentUser.user_id;
            cart.object_id = params.object_id;
            cart.getCartItem((err,data)=>{
                if(err){
                    res.send({
                        error_code:7018,
                        error_msg:err.message
                    })
                }else {
                    // 传上来skuid
                    let cartItem = data.attrs;
                    if (params.sku_id){
                        cart.getOnesCart((err,cartItemsUpdate) =>{
                            if (err){
                                res.send({
                                    error_code:7017,
                                    error_msg:err.message
                                })
                            }else {
                                // 遍历项，如果有
                                let currentHaveSku = {};
                                for (let i=0;i<cartItemsUpdate.Count;i++){
                                    if(params.sku_id === cartItemsUpdate.Items[i].attrs.sku_id){
                                        currentHaveSku = cartItemsUpdate.Items[i].attrs;
                                    }
                                }
                                if (currentHaveSku.sku_id){
                                    // 购物车已有
                                    // 如果库存满足就删除已有的，将所有的项都加载到当前update的上
                                    p.sku_id = params.sku_id;
                                    // 获取购物车项目，对比数量和库存
                                    product.get.sku({
                                        sku_id:params.sku_id,
                                        callback:(resp)=>{
                                            if (resp.error_code >0){
                                                return res.send(resp);
                                            }
                                            let skuItem = resp.data;
                                            if (skuItem.show){
                                                if (params.num){
                                                    p.num = Number(params.num)+Number(currentHaveSku.num);
                                                    if (p.num < Number(skuItem.number)){
                                                        p.num = Number(skuItem.number)
                                                    }
                                                    // 直接对比数量
                                                    if (Number(skuItem.stock) >= p.num){
                                                        // 获取sku_id和spu_id
                                                        // 查询sku_id表
                                                        cart.updateCartItem(p,(err)=>{
                                                            if(err){
                                                                res.send({
                                                                    error_code:7016,
                                                                    error_msg:err.message
                                                                })
                                                            }else{
                                                                // 删除currentHaveSku
                                                                let cartDe = new Cart();
                                                                cartDe.user_id = req.currentUser.user_id;
                                                                cartDe.object_id = currentHaveSku.object_id;
                                                                cartDe.deleteItem((erro)=>{
                                                                    if (erro){
                                                                        res.send({
                                                                            error_code:7015,
                                                                            error_msg:erro.message
                                                                        })
                                                                    }else {
                                                                        res.send({
                                                                            error_code:0,
                                                                            error_msg:'ok'
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }else {
                                                        res.send({
                                                            error_code:7014,
                                                            error_msg:'仅剩'+skuItem.stock+'件'
                                                        })
                                                    }
                                                }else {
                                                    p.num = Number(cartItem.num)+Number(currentHaveSku.num);
                                                    if (p.num < Number(skuItem.number)){
                                                        p.num = Number(skuItem.number)
                                                    }
                                                    if (Number(skuItem.stock)>=p.num){
                                                        // 获取sku_id和spu_id
                                                        // 查询sku_id表
                                                    
                                                        cart.updateCartItem(p,(err)=>{
                                                            if(err){
                                                                res.send({
                                                                    error_code:7013,
                                                                    error_msg:err.message
                                                                })
                                                            }else{
                                                                // 删除currentHaveSku
                                                                let cartDe = new Cart();
                                                                cartDe.user_id = req.currentUser.user_id;
                                                                cartDe.object_id = currentHaveSku.object_id;
                                                                cartDe.deleteItem((erro)=>{
                                                                    if (erro){
                                                                        res.send({
                                                                            error_code:7012,
                                                                            error_msg:erro.message
                                                                        })
                                                                    }else {
                                                                        res.send({
                                                                            error_code:0,
                                                                            error_msg:'ok'
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }else {
                                                        res.send({
                                                            error_code:7011,
                                                            error_msg:'仅剩'+skuItem.stock+'件'
                                                        })
                                                    }
                                                }
                                            }else {
                                                res.send({
                                                    error_code:7010,
                                                    error_msg:'商品下架'
                                                })
                                            }
                                        }
                                    });
                                }else {
                                    // 购物车中没有
                                    p.sku_id = params.sku_id;
                                    // 获取购物车项目，对比数量和库存
                                    product.get.sku({
                                        sku_id:params.sku_id,
                                        callback:(resp)=>{
                                            if (resp.error_code >0){
                                                return res.send(resp);
                                            }
                                            let skuItem = resp.data;
                                            if (skuItem.show){
                                                if (params.num){
                                                    p.num = Number(params.num);
                                                    // 直接对比数量
                                                    if (Number(skuItem.stock)>=Number(params.num)){
                                                        if (Number(params.num)>=Number(skuItem.number)){
                                                            // 获取sku_id和spu_id
                                                            // 查询sku_id表
                                                            cart.updateCartItem(p,(err)=>{
                                                                if(err){
                                                                    res.send({
                                                                        error_code:7009,
                                                                        error_msg:err.message
                                                                    })
                                                                }else{
                                                                    res.send({
                                                                        error_code:0,
                                                                        error_msg:'ok'
                                                                    })
                                                                }
                                                            })
                                                        }else {
                                                            res.send({
                                                                error_code:7008,
                                                                error_msg:'该商品'+skuItem.number+'件起售'
                                                            })
                                                        }
                                                    }else {
                                                        res.send({
                                                            error_code:7007,
                                                            error_msg:'仅剩'+skuItem.stock+'件'
                                                        })
                                                    }
                                                }else {
                                                    if (Number(skuItem.stock)>=Number(cartItem.num)){
                                                        p.num = Number(cartItem.num);
                                                        if (Number(params.num)>skuItem.number){
                                                            // 获取sku_id和spu_id
                                                            // 查询sku_id表
                                                            cart.updateCartItem(p,(err)=>{
                                                                if(err){
                                                                    res.send({
                                                                        error_code:7006,
                                                                        error_msg:err.message
                                                                    })
                                                                }else{
                                                                    res.send({
                                                                        error_code:0,
                                                                        error_msg:'ok'
                                                                    })
                                                                }
                                                            })
                                                        }else {
                                                            res.send({
                                                                error_code:7011,
                                                                error_msg:'该商品'+skuItem.number+'件起售'
                                                            })
                                                        }
                                                    }else {
                                                        res.send({
                                                            error_code:7005,
                                                            error_msg:'仅剩'+skuItem.stock+'件'
                                                        })
                                                    }
                                                }
                                            }else {
                                                res.send({
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
                        if (params.num){
                            p.num = params.num;
                            product.get.sku({
                                sku_id:cartItem.sku_id,
                                callback:(resp)=>{
                                    if (resp.error_code >0){
                                        return res.send(resp);
                                    }
                                    let skuItem = resp.data;
                                    if (skuItem.show){
                                        // 直接对比数量
                                        if (Number(skuItem.stock)>=Number(params.num)){
                                            if (Number(params.num)>=skuItem.number){
                                                // 获取sku_id和spu_id
                                                // 查询sku_id表
                                                cart.updateCartItem(p,(err)=>{
                                                    if(err){
                                                        res.send({
                                                            error_code:7003,
                                                            error_msg:err.message
                                                        })
                                                    }else{
                                                        res.send({
                                                            error_code:0,
                                                            error_msg:'ok'
                                                        })
                                                    }
                                                })
                                            }else {
                                                res.send({
                                                    error_code:7010,
                                                    error_msg:'该商品'+skuItem.number+'件起售'
                                                })
                                            }
                                        }else {
                                            res.send({
                                                error_code:7002,
                                                error_msg:'仅剩'+skuItem.stock+'件'
                                            })
                                        }
                                    }else {
                                        res.send({
                                            error_code:7001,
                                            error_msg:'商品下架'
                                        })
                                    }
                                }
                            });
                        }else {
                            res.send({
                                error_code:5003,
                                error_msg:'缺少参数'
                            })
                        }
                    }
                }
            })
        }else {
            res.send({
                error_code:5002,
                error_msg:'缺少object_id'
            })
        }
    }else{
        res.send({
            error_code:5001,
            error_msg:'无调用权限'

        })
    }
});

// 从购物车删除
router.post('/delete',(req,res,next)=>{
    if(req.currentUser){
        let params = req.body;
        if(params.object_id){
            let cart = new Cart();
            cart.object_id = params.object_id;
            cart.user_id = req.currentUser.user_id;
            cart.deleteItem((err)=>{
                if(err){
                    res.send({
                        error_code:4000,
                        error_msg:err.message
                    })
                }else{
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                    })
                }
            })
        }else {
            res.send({
                error_code:5003,
                error_msg:'缺少object_id'
            })
        }
    }else{
        res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
});


module.exports = router;