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
const GroupM = dynogels.define('js_goods_group',{
    hashKey:'id',
    timestamps:true,
    schema:{
        id:Joi.string(),
        cover:Joi.string(),
        list_cover:Joi.string(),
        title:Joi.string(),
        focus:Joi.string(),
        describe:Joi.string(),
        list:Joi.array(), // spu_id列表
        coupon_id:Joi.string() //优惠券模版id
    }
});

// if (env === 'dev') {
//     dynogels.createTables({'js_goods_group': { readCapacity: 1, writeCapacity: 1 }},(err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class Group {
    get id(){ return this._id;}
    set id(value) { this._id = value;}

    get cover(){ return this._cover;}
    set cover(value){ this._cover = value;}

    get list_cover(){ return this._list_cover;}
    set list_cover(value){ this._list_cover = value;}

    get title() { return this._title;}
    set title(value){ this._title = value; }

    get focus() { return this._focus;}
    set focus(value){ this._focus = value; }

    get describe(){ return this._describe;}
    set describe(value){ this._describe = value;}

    get list(){ return this._list;}
    set list(value){ this._list = value;}

    get coupon_id(){ return this._coupon_id;}
    set coupon_id(value){ this._coupon_id = value;}

    create(callback){
        GroupM.create({
            id:String(Date.now()),
            cover:this.cover || '-',
            list_cover:this.list_cover || this.cover || '-',
            title:this.title,
            focus:this.focus,
            describe:this.describe || this.title,
            list:this.list || [0],
            coupon_id:this.coupon_id
        },(err,data)=>{
            callback(err,data)
        })
    }

    getGroup(callback){
        GroupM.get(this.id,(err,data)=>{
            callback(err,data)
        })
    }

    getGroupList(last_key,callback){
        if (last_key){
            GroupM.scan()
                .limit(20)
                .startKey(last_key)
                .exec((err,data)=>{
                    callback(err,data)
                })
        }else {
            GroupM.scan()
                .limit(20)
                .exec((err,data)=>{
                    callback(err,data)
                })
        }
    }

    searchGroup(query,callback){
        GroupM.scan()
            .where('title').contains(query)
            .loadAll()
            .exec((err,data)=>{
                callback(err,data);
            })
    }

    updateGroup(p,callback) {
        GroupM.update({
            id:p.id,
            cover:this.cover || '-',
            list_cover:this.list_cover || this.cover || '-',
            title:this.title,
            focus:this.focus,
            describe:this.describe || this.title,
            list:this.list || [0],
            coupon_id:this.coupon_id || '-'
        },(err,data)=>{
            callback(err);
        })
    }

}
module.exports = Group;