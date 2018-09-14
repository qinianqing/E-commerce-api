// 封装商品内部接口
const router = require('express').Router();

// 引入变量
const Goods = require('../models/Goods');
const { secret } = require('../config');

// 接口封装

// SPU 相关接口封装

// 获取SPU简要信息
router.post('/spu-brief',(req,res,next)=>{
    if (req.body.secret !== secret){
        return res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
    if (!req.body.spu_id){
        return res.send({
            error_code:5002,
            error_msg:'缺少spu_id'
        })
    }
    let goods = new Goods();
    // 涉及库存信息都是强一致性读取
    goods.getSpu(req.body.spu_id,(err,data)=>{
        if(err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        if (!data){
            return res.send({
                error_code:5004,
                error_msg:'无该商品'
            })
        }
        data = data.attrs;
        res.send({
            error_code:0,
            error_msg:'ok',
            data:{
                goods_name:data.goods_name,
                goods_price:data.goods_price,
                default_image:data.default_image,
                describe:data.describe,
                tag:data.tag,
                cashback:data.cashback,
                show:data.show
            }
        })
    })
});

// 获取SPU详细信息
router.post('/spu',(req,res,next)=>{
    if (req.body.secret !== secret){
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
    if (!req.body.spu_id){
        return res.send({
            error_code:5002,
            error_msg:'缺少spu_id'
        })
    }
    let goods = new Goods();
    // 涉及库存信息都是强一致性读取
    goods.getSpuCR(req.body.spu_id,(err,data)=>{
        if(err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        if (!data){
            return res.send({
                error_code:5004,
                error_msg:'无该商品'
            })
        }
        res.send({
            error_code:0,
            error_msg:'ok',
            data:data
        })
    })
});


// 批量获取SPU信息，最多100个
router.post('/spu-batch',(req,res,next)=>{
    if (req.body.secret !== secret){
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
    if (!req.body.spus){
        return res.send({
            error_code:5002,
            error_msg:'缺少spu列表'
        })
    }
    let spusT;
    if (typeof req.body.spus === 'string'){
        spusT = [req.body.spus];
    }else {
        spusT = req.body.spus;
    }
    let spus = unique(spusT);
    let goods = new Goods();
    // 涉及库存信息都是强一致性读取
    goods.getSpusCR(spus,(err,data)=>{
        if(err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        res.send({
            error_code:0,
            error_msg:'ok',
            data:data
        })
    })
});

// 批量获取SPU简要信息，最多100个
router.post('/spu-brief-batch',(req,res,next)=>{
    if (req.body.secret !== secret){
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
    if (!req.body.spus){
        return res.send({
            error_code:5002,
            error_msg:'缺少spu列表'
        })
    }
    let spusT;
    if (typeof req.body.spus === 'string'){
        spusT = [req.body.spus];
    }else {
        spusT = req.body.spus;
    }
    let spus = unique(spusT);
    let goods = new Goods();
    // 涉及库存信息都是强一致性读取
    goods.getSpus(spus,(err,data)=>{
        if(err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        let items = [];
        for (let i=0;i<data.length;i++){
            let item = {
                goods_name:data[i].attrs.goods_name,
                goods_price:data[i].attrs.goods_price,
                default_image:data[i].attrs.default_image,
                describe:data[i].attrs.describe,
                tag:data[i].attrs.tag,
                show:data[i].attrs.show,
                cashback:data[i].attrs.goods_cashback
            };
            items.push(item);
        }
        res.send({
            error_code:0,
            error_msg:'ok',
            data:items
        })
    })
});

// SKU 相关接口封装

// 获取SKU简要信息
router.post('/sku-brief',(req,res,next)=>{
    if (req.body.secret !== secret){
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
    if (!req.body.sku_id){
        return res.send({
            error_code:5002,
            error_msg:'缺少sku_id'
        })
    }
    let goods = new Goods();
    let spu_id = req.body.sku_id.split('-')[0];
    // 涉及库存信息都是强一致性读取
    goods.getSpu(spu_id,(err,data)=>{
        if(err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        if (!data){
            return res.send({
                error_code:5004,
                error_msg:'无该商品'
            })
        }
        data = data.attrs;
        let item;
        for (let i=0;i<data.skus.length;i++){
            if (data.skus[i].sku_id === req.body.sku_id){
                item = data.skus[i];
            }
        }
        if (!item){
            return res.send({
                error_code:5005,
                error_msg:'无该SKU'
            })
        }
        res.send({
            error_code:0,
            error_msg:'ok',
            data:{
                goods_name:data.goods_name,
                price:item.price,
                type_id:item.type_id,
                sku_id:item.sku_id,
                discount_price:item.discount_price,
                image:item.image,
                cashback:item.cashback
            }
        })
    })
});

// 获取SKU详细信息
router.post('/sku',(req,res,next)=>{
    if (req.body.secret !== secret){
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
    if (!req.body.sku_id){
        return res.send({
            error_code:5002,
            error_msg:'缺少sku_id'
        })
    }
    let goods = new Goods();
    let spu_id = req.body.sku_id.split('-')[0];
    // 涉及库存信息都是强一致性读取
    goods.getSpuCR(spu_id,(err,data)=>{
        if(err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        if (!data){
            return res.send({
                error_code:5004,
                error_msg:'无该商品'
            })
        }
        data = data.attrs;
        let item;
        for (let i=0;i<data.skus.length;i++){
            if (data.skus[i].sku_id === req.body.sku_id){
                item = data.skus[i];
            }
        }
        if (!item){
            return res.send({
                error_code:5005,
                error_msg:'无该SKU'
            })
        }
        item.goods_name = data.goods_name;
        res.send({
            error_code:0,
            error_msg:'ok',
            data:item
        })
    })
});

// 批量获取SKU信息，最多100个
router.post('/sku-batch',(req,res,next)=>{
    if (req.body.secret !== secret){
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
    if (!req.body.skus){
        return res.send({
            error_code:5002,
            error_msg:'缺少sku列表'
        })
    }
    let goods = new Goods();
    let skus;
    if (typeof req.body.skus === 'string'){
        skus = [req.body.skus];
    }else {
        skus = req.body.skus;
    }
    let spusT = [];
    for (let i=0;i<skus.length;i++){
        spusT.push(skus[i].split('-')[0]);
    }
    spus = unique(spusT);
    // 涉及库存信息都是强一致性读取
    goods.getSpusCR(spus,(err,data)=>{
        if(err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        if (!data){
            return res.send({
                error_code:5004,
                error_msg:'查询错误'
            })
        }
        let items = new Array(skus.length);
        for (let m=0;m<skus.length;m++){
            let k_id = skus[m];
            // 遍历所有取回的SKU
            for (let n=0;n<data.length;n++){
                // 判断k_id拆分是否和spu_id相等
                if (k_id.split('-')[0] === data[n].attrs.goods_id){
                    for (let b=0;b<data[n].attrs.skus.length;b++){
                        if (k_id === data[n].attrs.skus[b].sku_id){
                            items[m] = data[n].attrs.skus[b];
                            items[m].goods_name = data[n].attrs.goods_name;
                        }
                    }
                }
            }
        }
        res.send({
            error_code:0,
            error_msg:'ok',
            data:items
        })
    })
});

// 批量获取SKU简要信息，最多100个
router.post('/sku-brief-batch',(req,res,next)=>{
    if (req.body.secret !== secret){
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
    if (!req.body.skus){
        return res.send({
            error_code:5002,
            error_msg:'缺少sku列表'
        })
    }
    let goods = new Goods();
    let skus;
    if (typeof req.body.skus === 'string'){
        skus = [req.body.skus];
    }else {
        skus = req.body.skus;
    }
    let spusT = [];
    for (let i=0;i<skus.length;i++){
        spusT.push(skus[i].split('-')[0]);
    }
    spus = unique(spusT);
    // 涉及库存信息都是强一致性读取
    goods.getSpus(spus,(err,data)=>{
        if(err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        if (!data){
            return res.send({
                error_code:5004,
                error_msg:'查询错误'
            })
        }
        let items = new Array(skus.length);
        for (let m=0;m<skus.length;m++){
            let k_id = skus[m];
            // 遍历所有取回的SKU
            for (let n=0;n<data.length;n++){
                // 判断k_id拆分是否和spu_id相等
                if (k_id.split('-')[0] === data[n].attrs.goods_id){
                    for (let b=0;b<data[n].attrs.skus.length;b++){
                        if (k_id === data[n].attrs.skus[b].sku_id){
                            items[m] = data[n].attrs.skus[b];
                            items[m].goods_name = data[n].attrs.goods_name;
                        }
                    }
                }
            }
        }
        let itemsB = [];
        for (let s=0;s<items.length;s++){
            let item;
            if (items[s]){
                item = {
                    goods_name:items[s].goods_name,
                    price:items[s].price,
                    type_id:items[s].type_id,
                    sku_id:items[s].sku_id,
                    discount_price:items[s].discount_price,
                    image:items[s].image,
                    cashback:items[s].cashback
                }
            }else {
                item = 0;
            }
            itemsB.push(item);
        }
        res.send({
            error_code:0,
            error_msg:'ok',
            data:itemsB
        })
    })
});

// 去重方法
function unique(arr){
    let result = [];
    for(let i=0;i<arr.length;i++){
        if(result.indexOf(arr[i]) === -1){
            result.push(arr[i])
        }
    }
    return result;
}

module.exports = router;
