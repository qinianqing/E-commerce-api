const { env } = require('../../../config');

const { awsParams } = require('../config.js');
const dynogels = require('jinshi-dynogels');
const Joi = require('joi');

if (env === 'dev'){
    dynogels.AWS.config.update({
        accessKeyId:awsParams.accessKeyId,
        secretAccessKey:awsParams.secretAccessKey,
        region:'cn-north-1',
        // endpoint:awsParams.dynamoEndpoint
    });
}else {
    dynogels.AWS.config.update({
        accessKeyId:awsParams.accessKeyId,
        secretAccessKey:awsParams.secretAccessKey,
        region:awsParams.region,
        //endpoint:awsParams.dynamoEndpoint
    });
}

//商品品牌表
const BrandM = dynogels.define('js_brand',{
    hashKey:'brand_id',
    timestamps:true,
    schema:{
        brand_id:Joi.string(),
        name:Joi.string(),
        from:Joi.string(),
        introduce:Joi.string(),
        num:Joi.number()
    }
});

// if (env === 'dev') {
//     dynogels.createTables({'js_brand': { readCapacity: 1, writeCapacity: 1 }},(err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class Brand {
    get brand_id(){ return this._brand_id;}
    set brand_id(value) { this._brand_id = value;}

    get name(){ return this._name;}
    set name(value){ this._name = value;}

    get from(){ return this._from;}
    set from(value){ this._from = value;}

    get introduce() { return this._introduce;}
    set introduce(value){ this._introduce = value; }

    get num(){ return this._num;}
    set num(value){ this._num = value;}
    create(callback){
        BrandM.create({
        brand_id:this.brand_id,
        name:this.name,
        from:this.from,
        introduce:this.introduce,
        num:this.num
        },(err,brand)=>{
            callback(err,brand)
        })
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