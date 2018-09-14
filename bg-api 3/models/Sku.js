// Common model

// author by Ziv
// TODO
// 1、上线前需求务必注释掉endpoint，不能设为空
// 2、注释掉createTable方法
//
// v0.1
// 2018-01-06

const Joi = require("joi");
const dynogels = require("dynogels");
const uuid = require("uuid/v4");
const { awsParams } = require('../config');

dynogels.AWS.config.update({
    accessKeyId:awsParams.accessKeyId,
    secretAccessKey:awsParams.secretAccessKey,
    region:awsParams.region,
    //endpoint:awsParams.dynamoEndpoint
})

//js_sku 商品最小单位表
const SkuM = dynogels.define('js_sku', {
    hashKey: 'sku_id',
    rangeKey:'spu_id',
    timestamps: true,
    schema: {
        sku_id: Joi.string(),
        spu_id: Joi.string(),
        sku_name: Joi.string(),
        carousel_image: Joi.array(),//轮播
        price: Joi.number(),
        stock: Joi.number(),//库存
        show:Joi.boolean(),//上下架
        cashback:Joi.number(),//返现
        number:Joi.number(),//起购数量
        specification: {
            specification_id: Joi.string(),
            specifications:Joi.string(),
            pack: Joi.string(),
            storage:Joi.string(),
            guarantee_time:Joi.string(),
            production_place:Joi.string(),
            weight:Joi.number()
        },
        discount_price:Joi.number(),
        tag_id:Joi.array(),
        service_id:Joi.array(),
        default_image:Joi.string(),
        joinTotalCashback:Joi.boolean()//参与不参与
    },
    indexes: [{
        hashKey: 'spu_id',
        rangeKey: 'sku_name',
        type: 'global',
        name: 'SpuidIndex',
    }]
});
/*
dynogels.createTables({
  'js_sku': {
    readCapacity: 10,
    writeCapacity: 10,
    streamSpecification: {
      streamEnabled: true,
      streamViewType: 'NEW_IMAGE'
    }
  }
}, err => {
  if (err) {
    console.log('Error creating tables', err);
  } else {
    console.log('table are now created and active');
  }
});
*/
class Sku {
    get sku_id() { return this._sku_id; }
    set sku_id(value) { this._sku_id = value; }

    get spu_id() { return this._spu_id; }
    set spu_id(value) { this._spu_id = value;}

    get service_id(){ return this._service_id;}
    set service_id(value){ this._service_id = value;}

    get sku_name() { return this._sku_name; }
    set sku_name(value) { this._sku_name = value;}

    get carousel_image() { return this._carousel_image; }
    set carousel_image(value) { this._carousel_image = value;}

    get show() { return this._show;}
    set show(value){ this._show = value;}

    get cashback(){ return this._cashback;}
    set cashback(value){ this._cashback = value;}

    get number(){ return this._number;}
    set number(value){ this._number = value;}

    get price() { return this._price;}
    set price(value) { this._price = value;}

    get discount_price() { return this._discount_price;}
    set discount_price(value) { this._discount_price = value;}

    get stock() {return this._stock;}
    set stock(value) { this._stock = value;}

    get tag_id(){ return this._tag_id;}
    set tag_id(value) { this._tag_id = value;}

    get specification(){ return this._specification;}
    set specification(value){ this._specification = value;}

    get default_image(){ return this._default_image;}
    set default_image(value){this._default_image = value;}

    get joinTotalCashback(){ return this._joinTotalCashback;}
    set joinTotalCashback(value){this._joinTotalCashback = value;}

    createSku(callback){
        SkuM.create({
            spu_id:this.spu_id,
            sku_id:uuid().replace(/-/g, ''),
            sku_name:this.sku_name,
            carousel_image:this.carousel_image,
            show:false,
            price:this.price,
            number:this.number,
            discount_price:this.discount_price,
            stock:this.stock,
            cashback:this.cashback,
            tag_id:this.tag_id,
            service_id:this.service_id,
            specification:this.specification,
            default_image:this.default_image,
            joinTotalCashback:this.joinTotalCashback
        },(err,sku)=>{
            callback(err,sku)
        })
    }

    /* 修改sku */
    updateSku(callback){
        SkuM.update({
            spu_id:this.spu_id,
            sku_id:this.sku_id,
            sku_name:this.sku_name,
            carousel_image:this.carousel_image,
            show:true,
            price:this.price,
            number:this.number,
            discount_price:this.discount_price,
            cashback:this.cashback,
            tag_id:this.tag_id,
            service_id:this.service_id,
            specification:this.specification,
            default_image:this.default_image,
            joinTotalCashback:this.joinTotalCashback
        },(err,data) => {
            callback(err,data)
        })
    }

    /* 得到整张spu表 */
    getAllSku(callback){
        SkuM
            .scan()
            .exec((err,data)=>{
                callback(err,data)
            })
    }

    getSkuDetails(callback){
        SkuM.query(this.sku_id)
            .exec((err,data)=>{
                callback(err,data)
            })
    }
    getSkusDetails(callback){
        SkuM.query(this.spu_id)
            .usingIndex('SpuidIndex')
            .descending()
            .exec((err,data)=>{
                callback(err,data)
            })
    }
    // 一次最多取100个数据
    getSkus(skuids,callback){
        SkuM.getItems(skuids,(err,skus)=>{
            callback(err,skus)
        })
    }
    // 更新库存
    updateStock(sku,callback){
        SkuM.update({
            sku_id: sku.sku_id,
            spu_id:sku.spu_id,
            stock: { $del: sku.num }
        },(err,sku)=>{
            callback(err);
        })
    }
    getAllSkusByTargetSpu(spu,callback){
        SkuM.parallelScan(5)
            .where('spu_id').equals(spu)
            .exec((err,data)=>{
                callback(err,data)
            })
    }
    getall(callback){
        SkuM
            .scan()
            .exec((err,data)=>{
                callback(err,data)
            })
    }
}


module.exports = Sku;
