const Goods = require('../models/Goods');

let get = {
    // 获取SPU的基本信息
    spuBrief:(p)=>{
        if (!p.spu_id||!p.callback){
            throw new Error('参数不全');
        }
        let goods = new Goods();
        // 涉及库存信息都是强一致性读取
        goods.getSpu(p.spu_id,(err,data)=>{
            if(err){
                return p.callback({
                    error_code:1003,
                    error_msg:err.message
                });
            }
            if (data === null){
                return p.callback({
                    error_code:1004,
                    error_msg:'无该商品'
                })
            }else {
                data = data.attrs;
                return p.callback({
                    error_code:0,
                    error_msg:'ok',
                    data:{
                        goods_name:data.goods_name,
                        spu_id:data.goods_id,
                        goods_price:data.goods_price,
                        default_image:data.default_image,
                        describe:data.describe,
                        tag:data.tag,
                        cashback:data.cashback,
                        show:data.show
                    }
                });
            }
        })
    },
    // 获取SPU的完整信息
    spu:(p)=>{
        if (!p.spu_id||!p.callback){
            throw new Error('参数不全');
        }
        let goods = new Goods();
        // 涉及库存信息都是强一致性读取
        goods.getSpuCR(p.spu_id,(err,data)=>{
            if(err){
                return p.callback({
                    error_code:1003,
                    error_msg:err.message
                })
            }
            if (data === null){
                return p.callback({
                    error_code:1004,
                    error_msg:'无该商品'
                })
            }else {
                return p.callback({
                    error_code:0,
                    error_msg:'ok',
                    data:data
                })
            }
        })
    },
    // 获取spu列表
    spus:(p)=>{
        if (!p.spus||!p.callback){
            throw new Error('参数不全');
        }
        let spusT;
        if (typeof p.spus === 'string'){
            spusT = [p.spus];
        }else {
            spusT = p.spus;
        }
        let spus = unique(spusT);
        let goods = new Goods();
        // 涉及库存信息都是强一致性读取
        goods.getSpusCR(spus,(err,data)=>{
            if(err){
                return p.callback({
                    error_code:1003,
                    error_msg:err.message
                })
            }
            p.callback({
                error_code:0,
                error_msg:'ok',
                data:data
            })
        })
    },
    // 获取spu列表的简要信息
    spusBrief:(p)=>{
        if (!p.spus||!p.callback){
            throw new Error('参数不全');
        }
        let spusT;
        if (typeof p.spus === 'string'){
            spusT = [p.spus];
        }else {
            spusT = p.spus;
        }
        let spus = unique(spusT);
        let goods = new Goods();
        // 涉及库存信息都是强一致性读取
        goods.getSpus(spus,(err,data)=>{
            if(err){
                return p.callback({
                    error_code:1003,
                    error_msg:err.message
                })
            }
            let items = [];
            for (let i=0;i<data.length;i++){
                let item = {
                    goods_id:data[i].attrs.goods_id,
                    spu_id:data[i].attrs.goods_id,
                    goods_name:data[i].attrs.goods_name,
                    goods_cashback:data[i].attrs.goods_cashback,
                    goods_price:data[i].attrs.goods_price,
                    default_image:data[i].attrs.default_image,
                    carousel_image:data[i].attrs.carousel_image,
                    describe:data[i].attrs.describe,
                    tag:data[i].attrs.tag,
                    show:data[i].attrs.show,
                    cashback:data[i].attrs.goods_cashback,
                    rank_image:data[i].attrs.rank_image,
                };
                items.push(item);
            }
            p.callback({
                error_code:0,
                error_msg:'ok',
                data:items
            })
        })
    },
    // 获取sku基本信息
    skuBrief:(p)=>{
        if (!p.sku_id||!p.callback){
            throw new Error('参数不全');
        }
        let goods = new Goods();
        let spu_id = p.sku_id.split('-')[0];
        // 涉及库存信息都是强一致性读取
        goods.getSpu(spu_id,(err,data)=>{
            if(err){
                return p.callback({
                    error_code:1003,
                    error_msg:err.message
                })
            }
            if (data === null){
                return p.callback({
                    error_code:1004,
                    error_msg:'无该商品'
                })
            }else {
                data = data.attrs;
                let item;
                for (let i=0;i<data.skus.length;i++){
                    if (data.skus[i].sku_id === p.sku_id){
                        item = data.skus[i];
                    }
                }
                if (!item){
                    return p.callback({
                        error_code:1005,
                        error_msg:'无该SKU'
                    })
                }
                p.callback({
                    error_code:0,
                    error_msg:'ok',
                    data:{
                        goods_id:data.goods_id,
                        spu_id:data.goods_id,
                        goods_name:data.goods_name,
                        price:item.price,
                        type_id:item.type_id,
                        sku_id:item.sku_id,
                        discount_price:item.discount_price,
                        image:item.image,
                        cashback:item.cashback
                    }
                })
            }
        })
    },
    // 获取SKU的基本信息
    sku:(p)=>{
        if (!p.sku_id||!p.callback){
            throw new Error('参数不全');
        }
        let goods = new Goods();
        let spu_id = p.sku_id.split('-')[0];
        // 涉及库存信息都是强一致性读取
        goods.getSpuCR(spu_id,(err,data)=>{
            if(err){
                return p.callback({
                    error_code:1003,
                    error_msg:err.message
                })
            }
            if (data === null){
                return p.callback({
                    error_code:1004,
                    error_msg:'无该商品'
                })
            }else {
                data = data.attrs;
                let item;
                for (let i=0;i<data.skus.length;i++){
                    if (data.skus[i].sku_id === p.sku_id){
                        item = data.skus[i];
                    }
                }
                if (!item){
                    return p.callback({
                        error_code:1005,
                        error_msg:'无该SKU'
                    })
                }
                item.goods_name = data.goods_name;
                item.goods_id = data.goods_id;
                item.spu_id = data.goods_id;
                p.callback({
                    error_code:0,
                    error_msg:'ok',
                    data:item
                })
            }
        })
    },
    // 批量获取SKU的基本信息
    skus:(p)=>{
        if (!p.skus||!p.callback){
            throw new Error('参数不全');
        }
        let goods = new Goods();
        let skus;
        if (typeof p.skus === 'string'){
            skus = [p.skus];
        }else {
            skus = p.skus;
        }
        let spusT = [];
        for (let i=0;i<skus.length;i++){
            spusT.push(skus[i].split('-')[0]);
        }
        spus = unique(spusT);
        // 涉及库存信息都是强一致性读取
        goods.getSpusCR(spus,(err,data)=>{
            if(err){
                return p.callback({
                    error_code:1003,
                    error_msg:err.message
                })
            }
            if (!data){
                return p.callback({
                    error_code:1004,
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
                                items[m].op = data[n].attrs.op;
                                items[m].goods_id = data[n].attrs.goods_id;
                                items[m].spu_id = data[n].attrs.goods_id;
                            }
                        }
                    }
                }
            }
            p.callback({
                error_code:0,
                error_msg:'ok',
                data:items
            })
        })
    },
    // 批量获取SKU的简要信息
    skusBrief:(p)=>{
        if (!p.skus||!p.callback){
            throw new Error('参数不全');
        }
        let goods = new Goods();
        let skus;
        if (typeof p.skus === 'string'){
            skus = [p.skus];
        }else {
            skus = p.skus;
        }
        let spusT = [];
        for (let i=0;i<skus.length;i++){
            spusT.push(skus[i].split('-')[0]);
        }
        spus = unique(spusT);
        // 涉及库存信息都是强一致性读取
        goods.getSpus(spus,(err,data)=>{
            if(err){
                return p.callback({
                    error_code:1003,
                    error_msg:err.message
                })
            }
            if (!data){
                return p.callback({
                    error_code:1004,
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
                                items[m].goods_id = data[n].attrs.goods_id;
                                items[m].spu_id = data[n].attrs.goods_id;
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
                        goods_id:items[s].goods_id,
                        spu_id:items[s].goods_id,
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
            p.callback({
                error_code:0,
                error_msg:'ok',
                data:itemsB
            })
        })
    },
};

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

module.exports = {
    get:get
};