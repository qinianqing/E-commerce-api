const { env } = require('../../../config');

const { awsParams } = require('../config.js');
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

//商品评论表
const CommentM = dynogels.define('js_evaluation',{
    hashKey:'goods_id',
    rangeKey:'comment_id',
    timestamps:true,
    schema:{
        goods_id:Joi.string(),
        star_num:Joi.number(),
        user_id:Joi.string(),
        comment_id:Joi.string(),
        comment_content:Joi.string(),
        comment_image:Joi.array(),
        type_id:Joi.string()
    },
    /*
    indexes: [{
        hashKey: 'comment_id',
        rangeKey: 'user_id',
        type: 'global',
        name:'CommentidIndex',
      }]
      */
});

// if (env === 'dev'){
//     dynogels.createTables({
//         'js_evaluation': {
//             readCapacity: 1,
//             writeCapacity: 1,
//             // streamSpecification: {
//             //     streamEnabled: true,
//             //     streamViewType: 'NEW_IMAGE'
//             // }
//         }
//     }, err => {
//         if (err) {
//             console.log('Error creating tables', err);
//         } else {
//             console.log('table are now created and active');
//         }
//     });
// }

class Comment {
    get goods_id(){ return this._goods_id;}
    set goods_id(value){ this._goods_id = value;}

    get type_id(){return this._type_id;}
    set type_id( value){  this._type_id = value;}

    get star_num(){ return this._star_num;}
    set star_num(value){ this._star_num = value;}

    get user_id(){ return this._user_id;}
    set user_id(value) { this._user_id = value;}

    get comment_id(){ return this._comment_id;}
    set comment_id(value) { this._comment_id = value;}

    get comment_content(){ return this._comment_content;}
    set comment_content(value){ this._comment_content = value;}

    get comment_image() { return this._comment_image;}
    set comment_image(value){ this._comment_image = value;}

    getSkuCommentNum(callback,lastKey){
        if (lastKey){
            CommentM.query(this.goods_id)
                .startKey(lastKey)
                .descending()
                .limit(20)
                .exec((err,resp) => {
                    callback(err,resp)
                })
        }else {
            CommentM.query(this.goods_id)
                .descending()
                .limit(20)
                .exec((err,resp) => {
                    callback(err,resp)
                })
        }

    }

    create(callback){
        CommentM.create({
            goods_id:this.goods_id,
            type_id:this.type_id,
            star_num:this.star_num,
            user_id:this.user_id,
            comment_id: Date.now() + uuid(),
            comment_content:this.comment_content,
            comment_image:this.comment_image,
        },(err,comment)=>{
            callback(err,comment)
        })
    }

    getTargetEva(callback){
        CommentM.get({
            goods_id:this.goods_id,
            comment_id:this.comment_id
        },(err,data)=>{
            callback(err,data);
        })
    }

    countGoodEvaNum(callback){
        CommentM.query(this.goods_id)
            .select('COUNT')
            .exec((err,data)=>{
                callback(err,data);
            })
    }

    getAllSkusByTargetComments(spu,callback,lastkey) {
        if(lastkey){
            CommentM.query(spu)
                .startKey(lastKey)
                .limit(20)
                .exec((err, comments) => {
                    callback(err,comments)
                })
        }else{
            CommentM.query(spu)
                .limit(20)
                .exec((err, comments) => {
                    callback(err,comments)
                })
        }

    }
}
module.exports = Comment;