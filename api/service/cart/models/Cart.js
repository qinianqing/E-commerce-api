//Cart Model
const { env } = require('../../../config');

const { awsParams,} = require('../config.js');

const dynogels = require('jinshi-dynogels');
const Joi = require('joi');
const uuid = require('uuid/v4');

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

const CartM = dynogels.define('js_cart',{
    hashKey:'user_id',
    rangeKey:'object_id',
    timestamps:true,
    schema:{
        user_id:Joi.string(),
        object_id:Joi.string(),
        sku_id:Joi.string(),
        spu_id:Joi.string(),
        num:Joi.number(),
    }
});

if (env === 'dev'){
    dynogels.createTables({'js_cart': { readCapacity: 1, writeCapacity: 1 }},(err) => {
        if (err) {
            console.log('updating tables error', err);
        } else {
            console.log('table updated');
        }
    })
}

class Cart {
    get user_id(){ return this._user_id; }
    set user_id(value) { this._user_id = value;}

    get sku_id(){ return this._sku_id;}
    set sku_id(value) { this._sku_id = value;}

    get spu_id(){ return this._spu_id;}
    set spu_id(value) { this._spu_id = value;}

    get num() { return this._num;}
    set num(value) { this._num = value;}

    //创建购物车条目
    create(callback){
        CartM.create({
            user_id:this.user_id,
            object_id:Date.now()+uuid(),
            sku_id:this.sku_id,
            spu_id:this.spu_id,
            num:this.num,
        },function (err,cart){
            callback(err,cart);
        })
    }

    // 批量获取用户

    // 查询用户购物车中的条目数
    getCartLenth(callback){
        CartM.query(this.user_id)
            .select('COUNT')
            .exec((err,data)=>{
                callback(err,data)
            })
    }

    //删除购物车条目
    deleteItem(callback){
        CartM.destroy({ user_id:this.user_id,object_id:this.object_id},(err)=>{
            callback(err);
        })
    }

    getCartItem(callback){
        CartM.get({
            user_id:this.user_id,
            object_id:this.object_id
        },(err,data)=>{
            callback(err,data)
        })
    }

    // 批量获取
    getCartItems(items,callback){
        CartM.getItems(items,(err,data)=>{
            callback(err,data)
        })
    }

    // 查询某用户所有购物车
    getOnesCart(callback){
        CartM.query(this.user_id)
            .descending()
            .exec((err,data)=>{
                callback(err,data);
            })
    }

    // 修改购物车
    updateCartItem(params,callback){
        CartM.update(params,(err)=>{
            callback(err);
        })
    }

    // 修改购物车数量
    updateCartNum(callback){
        CartM.update({
            user_id:this.user_id,
            object_id:this.object_id,
            num:{$add:this.num}
        },(err)=>{
            callback(err)
        })
    }
}

module.exports = Cart;
