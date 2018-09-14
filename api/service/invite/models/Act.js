const {
    env
} = require('../../../config');

const {
    awsParams
} = require('../config.js');
const dynogels = require('jinshi-dynogels');
const Joi = require('joi');
const uuid = require('uuid/v4');

if (env === 'dev') {
    dynogels.AWS.config.update({
        accessKeyId: awsParams.accessKeyId,
        secretAccessKey: awsParams.secretAccessKey,
        region: 'cn-north-1',
        // endpoint: awsParams.dynamoEndpoint
    });
} else {
    dynogels.AWS.config.update({
        accessKeyId: awsParams.accessKeyId,
        secretAccessKey: awsParams.secretAccessKey,
        region: awsParams.region,
        //endpoint:awsParams.dynamoEndpoint
    });
}

//商品评论表
const ActM = dynogels.define('js_act', {
    hashKey: 'user_id',
    rangeKey: 'order_id',
    timestamps: true,
    schema: {
        object_id: Joi.string(), //唯一标实
        user_id:Joi.string(),//用户id
        order_id:Joi.string(),//订单id
        status:Joi.number(),//是否分享10次
    }
});
class Act  {
    get object_id() {
        return this._object_id;
    }
    set object_id(value) {
        this._object_id = value;
    }
    get user_id(){
        return this._user_id;
    }
   set user_id(value){
       this._user_id = value;
   }
   get order_id(){
       return this._order_id;
   }
   set order_id(value){
       this._order_id = value;
   }
   get status(){
       return this._status;
   }
   set status(value){
       this._status = value;
   }
   //创建
   create(callback){
    ActM.create({
        object_id:String(new Date().getTime()),
        user_id:this.user_id,
        order_id:this.order_id,
        status:0
    },(err,data)=>{
        callback(err,data)
    })
   }
//更新状态
update(callback){
   ActM.update({
    user_id:this.user_id,
    order_id:this.order_id,
    status:1
   },(err,data)=>{
       callback(err,data)
   })
}
//福利列表，status为0
getActList(callback){
    ActM.query(this.user_id)
    .filter('status').equals(0)
    .exec((err,data)=>{
        callback(err,data)
    })
}
//得到福利列表status
getActListStatus(callback){
    ActM.query(this.user_id)
    .where('order_id').equals(this.order_id)
    .attributes(['status'])
    .exec((err,data)=>{
        callback(err,data)
    })
}
}


module.exports = Act;