const { env } = require('../../../config');

const { awsParams } = require('../config.js');
const dynogels = require('jinshi-dynogels');
const Joi = require('joi');

if (env === 'dev'){
    dynogels.AWS.config.update({
        accessKeyId:awsParams.accessKeyId,
        secretAccessKey:awsParams.secretAccessKey,
        region:awsParams.region,
        endpoint:awsParams.dynamoEndpoint
    });
}else {
    dynogels.AWS.config.update({
        accessKeyId:awsParams.accessKeyId,
        secretAccessKey:awsParams.secretAccessKey,
        region:awsParams.region,
        //endpoint:awsParams.dynamoEndpoint
    });
}

//商品详情表
const GoodsM = dynogels.define('js_goods',{
    hashKey:'goods_id',
    timestamps:true,
    schema:{
        goods_id:Joi.string(),//商品id
        goods_name:Joi.string(),//商品名称
        describe:Joi.string(),//商品描述
        brand_id:Joi.string(),//品牌id
        goods_price:Joi.string(),//商品最低价
        goods_cashback:Joi.number(),//会员返现价
        discount_price:Joi.number(),//划线价
        level3_id:Joi.array(),//商品3级id
        show:Joi.boolean(),//上下架
        service:Joi.array(),//商品服务
        tag:Joi.array(),//标签
        default_image:Joi.string(),//默认商品展示图
        carousel_image:Joi.array(),//商品详情顶部录轮播
        specification:Joi.array(),//商品详情规格信息
        top_price:Joi.number(),//商品详情页展示最高价
        mini_price:Joi.number(),//商品详情页展示最低价
        share:Joi.string(),//商品分享描述
        details_image:Joi.array(),//商品详情图
        styles:Joi.array(),//商品规格
        skus:Joi.array(),//sku具体信息,
        wa_qr_code:Joi.string()
    },
    indexes: [
        //{ hashKey: 'level3_id', type: 'global', name: 'CategoryIndex' },
        { hashKey: 'brand_id', type: 'global', name: 'BrandIndex' }
    ]

});

if (env === 'dev' || env === 'build') {
    dynogels.createTables({'js_goods': { readCapacity: 5, writeCapacity: 5 }},(err) => {
        if (err) {
            console.log('updating tables error', err);
        } else {
            console.log('table updated');
        }
    });
}

class Goods {
    get goods_id() { return this._goods_id };
    set goods_id(value){ this._goods_id = value };

    get goods_name() { return this._goods_name };
    set goods_name(value){ this._goods_name = value };

    get describe() { return this._describe };
    set describe(value){ this._describe = value };

    get brand_id() { return this._brand_id };
    set brand_id(value){ this._brand_id = value };

    get goods_price(){ return this._goods_price };
    set goods_price(value){ this._goods_price = value};

    get goods_cashback(){ return this._goods_cashback};
    set goods_cashback(value){ this._goods_cashback = value};

    get discount_price(){ return this._discount_price};
    set discount_price(value){ this._discount_price = value};

    get level3_id(){ return this._level3_id};
    set level3_id(value){ this._level3_id = value};

    get default_image(){ return this._default_image };
    set default_image(value){ this._default_image = value };

    get show(){ return this._show;}
    set show(value){ this._show = value };

    get service(){ return this._service;}
    set service(value){ this._service = value;}

    get tag(){ return this._tag;}
    set tag(value){ this._tag = value;}

    get carousel_image(){ return this._carousel_image};
    set carousel_image(value){  this._carousel_image = value};

    get top_price(){ return this._top_price};
    set top_price(value){ this._top_price = value};

    get mini_price(){ return this._mini_price};
    set mini_price(value){ this._mini_price = value};

    get share(){ return this._share};
    set share(value){ this._share = value}

    get details_image(){ return this._details_image;}
    set details_image(value){ this._details_image = value;}

    get styles(){ return this._styles;}
    set styles(value){ this._styles = value;}

    get skus(){ return this._skus;}
    set skus(value){ this._skus = value;}

    get specification(){ return this._specification;}
    set specification(value){ this._specification = value;}

    get wa_qr_code(){ return this._wa_qr_code;}
    set wa_qr_code(value){ this._wa_qr_code = value;}

    // 创建新的商品
    create(callback){
        GoodsM.create({
            goods_id:this.goods_id,
            goods_name:this.goods_name,
            describe:this.describe,
            brand_id:this.brand_id,
            goods_price:this.goods_price,
            goods_cashback:this.goods_cashback,
            discount_price:this.discount_price,
            level3_id:this.level3_id,
            carousel_image:this.carousel_image,
            tag:this.tag,
            show:this.show,
            service:this.service,
            top_price:this.top_price,
            mini_price:this.mini_price,
            share:this.share,
            specification:this.specification,
            details_image:this.details_image,
            default_image:this.default_image,
            styles:this.styles,
            skus:this.skus,

        },(err,goods)=>{
            callback(err,goods)
        })
    }

    // 通过query查询商品
    getGoods(callback){
        GoodsM
            .query(this.goods_id)
            .exec((err,goods)=>{
                callback(err,goods)
            })
    }

    // 获取商品CMS
    getGoodsCMS(callback, lastkey) {
        if (lastkey) {
            GoodsM.scan()
                .startKey(lastkey)
                .limit(100)
                // .loadAll()
                .exec((err, data) => {
                    callback(err, data)
                })
        } else {
            GoodsM.scan()
                .limit(1)
                // .loadAll()
                .exec((err, data) => {
                    callback(err, data)
                })
        }
    }

    // 通过query查询商品数
    getGoodsExist(callback){
        GoodsM
            .query(this.goods_id)
            .select('COUNT')
            .exec((err,goods)=>{
                callback(err,goods)
            })
    }

    // // 通过三级分类ID，检索商品
    // getSpuByBrand(last_key,callback){
    //     if (last_key){
    //         GoodsM
    //             .query(this.brand_id)
    //             .usingIndex('BrandIndex')
    //             .limit(20)
    //             .descending()
    //             .startKey(last_key)
    //             .exec((err,data)=>{
    //                 callback(err,data)
    //             })
    //     }else {
    //         GoodsM
    //             .query(this.brand_id)
    //             .usingIndex('BrandIndex')
    //             .limit(20)
    //             .descending()
    //             .exec((err,data)=>{
    //                 callback(err,data)
    //             })
    //     }
    // }

    // 通过三级分类ID，检索商品
    getSpuByBrand(callback){
        GoodsM
            .query(this.brand_id)
            .usingIndex('BrandIndex')
            .loadAll()
            .descending()
            .exec((err,data)=>{
                callback(err,data)
            })
    }

    // update by ziv

    // 直接取商品，非强一致性读取
    getSpu(spu,callback){
        GoodsM.get({
            goods_id:spu
        },(err,data)=>{
            callback(err,data)
        })
    }

    // 批量取商品，非强一致性读取
    getSpus(spus,callback){
        GoodsM.getItems(spus,(err,data)=>{
            callback(err,data)
        })
    }

    // 直接取商品，强一致性读取
    getSpuCR(spu,callback){
        GoodsM.get({
            goods_id:spu
        },{ ConsistentRead: true },(err,data)=>{
            callback(err,data)
        })
    }

    // 批量取商品，强一致性读取
    getSpusCR(spus,callback){
        GoodsM.getItems(spus,{ ConsistentRead: true },(err,data)=>{
            callback(err,data)
        })
    }
    // 更新wa_qr_code
    updateWaQrCode(callback){
        GoodsM.update({
            goods_id:this.goods_id,
            wa_qr_code:this.wa_qr_code
        },(err,data)=>{
            callback(err,data)
        })
    }
    // 更改商品库存
    updateSkuStock(spu_id,skus,callback){
        GoodsM.update({
            goods_id:spu_id,
            skus:skus
        },(err,data)=>{
            callback(err)
        })
    }
    // 根据品类获取所有商品
    getspusByLevel3(levelid3,callback){
        GoodsM.parallelScan(5)
            .where('level3_id').contains(levelid3)
            .exec((err,data)=>{
                callback(err,data)
            })
    }

}
module.exports = Goods;