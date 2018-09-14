const { awsParams } = require('../config.js');
const dynogels = require('jinshi-dynogels');
//const uuid = require('uuid/v4');

const Joi = require('joi');

dynogels.AWS.config.update({
    accessKeyId:awsParams.accessKeyId,
    secretAccessKey:awsParams.secretAccessKey,
    region:awsParams.region,
    //endpoint:awsParams.dynamoEndpoint
});
const CategoryM = dynogels.define('js_category',{
    hashKey:'id',
    timestamps:true,
    schema:{
        id:Joi.string(),
        name:Joi.string(),
        level:Joi.number(),
        parent_id:Joi.string(),
        cover:Joi.string()
    }
});

// dynogels.createTables({'js_category': { readCapacity: 5, writeCapacity: 5 }},(err) => {
//     if (err) {
//         console.log('updating tables error', err);
//     } else {
//         console.log('table updated');
//     }
// })

class Category {
    get id(){ return this._id;}
    set id(value){ this._id = value;}

    get name(){ return this._name;}
    set name(value) { this._name = value;}

    get level(){ return this._level;}
    set level(value) { this._level = value;}

    get parent_id(){ return this._parent_id;}
    set parent_id(value) { this._parent_id = value;}

    get cover(){ return this._cover;}
    set cover(value) { this._cover = value;}

    create(callback){
        CategoryM.create({
            id:String(new Date().getTime()),
            name:this.name,
            level:this.level,
            parent_id:this.parent_id,
            cover:this.cover
        },(err,data)=>{
            callback(err,data)
        })
    }
    update(callback){
        CategoryM.update({
            id:this.id,
            name:this.name,
            level:this.level,
            parent_id:this.parent_id,
            cover:this.cover
        },(err,data)=>{
            callback(err,data)
        })
    }
    getChildCategory(id,callback){
        CategoryM
            .scan()
            .where('parent_id').equals(id)
            .loadAll()
            .exec((err,data)=>{
                callback(err,data)
            })
    }
    /* 得到整张Category表 */
    getAllCategory(callback){
        CategoryM
            .scan()
            .exec((err,data)=>{
                callback(err,data)
            })
    }

    getCategory(callback){
        CategoryM
            .get(this.id,(err,data)=>{
                callback(err,data)
            })
    }
}
module.exports = Category;