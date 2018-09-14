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

//商品品牌表
const BrandM = dynogels.define('js_brand',{
    hashKey:'brand_id',
    timestamps:true,
    schema:{
        brand_id:Joi.string(),
        name:Joi.string(),
        from:Joi.string(),
        introduce:Joi.string(),
    }
});
/*
dynogels.createTables({'js_brand': { readCapacity: 5, writeCapacity: 5 }},(err) => {
    if (err) {
        console.log('updating tables error', err);
    } else {
        console.log('table updated');
    }
})
*/
class Brand {
    get brand_id(){ return this._brand_id;}
    set brand_id(value) { this._brand_id = value;}

    get name(){ return this._name;}
    set name(value){ this._name = value;}

    get from(){ return this._from;}
    set from(value){ this._from = value;}

    get introduce() { return this._introduce;}
    set introduce(value){ this._introduce = value; }

    createBrand(callback){
        BrandM.create({
            brand_id:uuid().replace(/-/g, ''),
            name:this.name,
            from:this.from,
            introduce:this.introduce,
        },(err,brand)=>{
            callback(err,brand)
        })
    }
    updateBrand(callback){
        BrandM.update({
            brand_id:this.brand_id,
            name:this.name,
            from:this.from,
            introduce:this.introduce,
        },(err,brand)=>{
            callback(err,brand)
        })
    }
    // contains
    queryBrand(Name,callback) {
        BrandM
            .scan()
            .where('name').contains(Name)
            .exec((err,data) => {
                callback(err, data)
            });
    }
    /* 得到整张Brand表 */
    getAllBrands(callback){
        BrandM
            .scan()
            .exec((err,data)=>{
                callback(err,data)
            })
    }

    getAllBrand(callback, lastkey) {
        if (lastkey) {
            BrandM.scan()
                .startKey(lastkey)
                .limit(20)
                // .loadAll()
                .exec((err, data) => {
                    callback(err, data)
                })
        } else {
            BrandM.scan()
                .limit(20)
                // .loadAll()
                .exec((err, data) => {
                    callback(err, data)
                })
        }

    }
    getBrandDetails(callback){
        BrandM.query(this.brand_id)
            .exec((err,data)=>{
                callback(err,data)
            })
    }
    getBrands(brandids, callback) {
        BrandM.getItems(brandids, (err, brands) => {
            callback(err,brands)
        })
    }


}
module.exports = Brand;
