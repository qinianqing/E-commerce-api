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
});

//js_spu 一系列商品表
const SpuM = dynogels.define('js_spu',{
    hashKey: 'spu_id',
    timestamps: true,
    schema:{
        spu_id:Joi.string(),
        brand_id:Joi.string(),
        number:Joi.string(),
        subtract:Joi.string(),
        show:Joi.boolean(),
        spu_name:Joi.string(),
        default_image:Joi.string(),
        details_image:Joi.array(),
        default_describe:Joi.string(),
        default_price:Joi.number(),
        default_discountprice:Joi.number(),
        level3_id:Joi.array()
    },
    indexes: [{
        hashKey: 'level3_id',
        rangeKey: 'spu_name',
        type: 'global',
        name: 'Level3idIndex',
    }]
});
/*
dynogels.createTables({
  'js_spu': {
    readCapacity: 5,
    writeCapacity: 5,
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
class Spu {
    get spu_id(){ return this._spu_id;}
    set spu_id(value) { this._spu_id = value;}

    get brand_id(){ return this._brand_id;}
    set brand_id(value){ this._brand_id = value;}

    get number(){ return this._number;}
    set number(value){ this._number = value;}

    get subtract(){ return this._subtract;}
    set subtract(value){ this._subtract = value;}

    get spu_name(){ return this._spu_name;}
    set spu_name(value){ this._spu_name = value;}

    get show(){ return this._show;}
    set show(value){ this._show = value;}

    get default_image(){ return this._default_image;}
    set default_image(value){ this._default_image = value;}

    get details_image(){ return this._details_image;}
    set details_image(value){ this._details_image = value;}

    get default_describe(){ return this._default_describe;}
    set default_describe(value){ this._default_describe = value;}

    get default_discountprice(){ return this._default_discountprice;}
    set default_discountprice(value){ this._default_discountprice = value;}

    get default_price(){ return this._default_price;}
    set default_price(value){ this._default_price = value;}

    get level3_id(){ return this._level3_id;}
    set level3_id(value){ this._level3_id = value;}

    /* 新建spu */
    createSpu(callback){
        SpuM.create({
            spu_id:uuid().replace(/-/g, ''),
            brand_id: this.brand_id,
            spu_name:this.spu_name,
            default_image:this.default_image,
            details_image:this.details_image,
            default_price:this.default_price,
            default_discountprice:this.default_discountprice,
            default_describe:this.default_describe,
            show:true,
            level3_id: this.level3_id
        },(err,spu)=>{
            callback(err,spu)
        })

    }
    /* 修改spu */
    updateSpu(callback){
        SpuM.update({
            spu_id:this.spu_id,
            brand_id: this.brand_id,
            spu_name:this.spu_name,
            default_image:this.default_image,
            details_image:this.details_image,
            show:true,
            default_price:this.default_price,
            default_discountprice:this.default_discountprice,
            default_describe:this.default_describe,
            level3_id: this.level3_id
        },(err,data) => {
            callback(err,data)
        })
    }
    /* 得到整张spu表 */
    getAllSpu(callback){
        SpuM
            .scan()
            .exec((err,data)=>{
                callback(err,data)
            })
    }
    getSpuDetails(callback){
        SpuM.query(this.spu_id)
            .exec((err,data)=>{
                callback(err,data)
            })
    }
    getSpu(callback){
        SpuM.query(this.level3_id)
            .usingIndex('Level3idIndex')
            .descending()
            .exec((err,data)=>{
                callback(err,data)
            })
    }


}
module.exports = Spu;