
const G = require('../models/Goods');
const Go = require('../models/GoodsOld');


let createProduct = (data)=>{
    // 获取并创建新商品
    let g = new G();
    g.goods_id = data.goods_id;
    g.sku_id = '0';// 主商品是0
    g.goods_name = data.goods_name;
    g.describe = data.describe;
    g.brand_id = data.brand_id;
    g.goods_price = data.goods_price;
    g.goods_cashback = data.goods_cashback;
    g.discount_price = data.discount_price;
    g.level3_id = data.level3_id;
    g.carousel_image = data.carousel_image;
    g.tag = data.tag || [];
    g.show = data.show;
    g.service = data.service;
    g.top_price = data.top_price;
    g.mini_price = data.mini_price;
    g.share = data.share;
    g.specification = data.specification;
    g.details_image = data.details_image;
    g.default_image = data.default_image;
    g.styles = data.styles;
    g.skus = data.skus;
    g.direct = data.direct || false;
    g.priority = 1;// 默认优先级为1,
    g.correlation = data.correlation;
    g.rank_image = data.rank_image;
    g.create((err,data)=>{
        // console.log(g)
        // console.log(data)
        if (err){
            console.log('<<<'+data,err);
        }
        // console.log(data)
    })
};

let last_key = '';

let goodsList = [];

let good = new Go();

good.goods_id = '10071';
good.getGoods((err,data)=>{
    let item = data.Items[0].attrs;
    createProduct(item)
});
//
// good.getGoodsCMS((err,data)=>{
//     let lk = data.LastEvaluatedKey || 0;
//     for (let i=0;i<data.Items.length;i++){
//         let item = data.Items[i].attrs;
//         createProduct(item)
//     }
// },last_key);