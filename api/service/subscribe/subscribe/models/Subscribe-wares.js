const { env } = require('../../../../config');

const { awsParams } = require('../../config.js');
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

const STM = dynogels.define('js_subscribe_wares', {
    hashKey: 'id',
    //rangeKey: 'createdAt',// 不需要排序键
    timestamps: true,
    schema: {
        id: Joi.string(),// 分区键，按照时间戳形式生成
        show:Joi.number(),// 0，下架，1，上架
        wares:Joi.array(),// 全部订阅商品
        /*
        [],是一个数组
        以下是单个对象的组成
        {
            id:'id#0',// 后方是index
            skus:[{
                sku_id:'10000-10000',
                num:2
            },{
                sku_id:'10001-10001',
                num:2
            }],
            limit:3,
            note:'7.7折',
            price:[{
                id:'id#0#0'
                stages:3,
                price:39,
                vip_price:30
            }]
        }
         */
        cover: Joi.string(),// 订阅封面，用于显示在订阅详情页
        list_cover:Joi.string(),// 订阅封面，用于显示在订阅频道首页列表
        share_cover:Joi.string(),// 分享图片
        title: Joi.string(),// 订阅标题，用于显示在订阅频道首页和订阅详情页,
        focus:Joi.string(),
        priority:Joi.number()// 优先级
    },
    indexes:[
        { hashKey: 'show', rangeKey: 'createdAt', type: 'global', name: 'ShowIndex' },
    ]
});

// if (env === 'dev') {
//     dynogels.createTables({'js_subscribe_wares': { readCapacity: 1, writeCapacity: 1 }},(err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class ST {
    get id() { return this._id; }
    set id(value) { this._id = value; }

    get show() { return this._show; }
    set show(value) { this._show = value; }

    get wares(){ return this._wares;}
    set wares(value){ this._wares = value;}

    get cover() { return this._cover; }
    set cover(value) { this._cover = value;}

    get list_cover(){ return this._list_cover;}
    set list_cover(value){ this._list_cover = value;}

    get share_cover(){ return this._share_cover;}
    set share_cover(value){ this._share_cover = value;}

    get title(){ return this._title;}
    set title(value){ this._title = value;}

    get focus(){ return this._focus;}
    set focus(value){ this._focus = value;}

    get priority(){ return this._priority;}
    set priority(value){ this._priority = value;}

    // 创建订阅商品
    create(callback) {
        STM.create({
            id: this.id,
            show:this.show,
            wares:this.wares,
            cover: this.cover,
            list_cover:this.list_cover || '-',
            share_cover:this.share_cover,
            title:this.title,
            focus:this.focus,
            priority:0
        }, (err, data) => {
            callback(err, data)
        })
    }

    updateWares(callback){
        STM.update({
            id: this.id,
            show:this.show,
            wares:this.wares,
            cover: this.cover,
            list_cover:this.list_cover,
            share_cover:this.share_cover,
            title:this.title,
            focus:this.focus,
            priority:this.priority
        },(err,data)=>{
            callback(err,data)
        })
    }

    // 获取一个订阅商品
    getWare(callback){
        STM.get({id:this.id},(err,data)=>{
            callback(err,data);
        })
    }

    // 根据创建时间获取一个订阅商品
    getCreateWare(callback){
        STM.query(this.createdAt)
            .exec((err,data)=>{
            callback(err,data);
        })
    }
    // 获取可订阅列表
    getSubcribeList(callback,last_key){
        if (last_key){
            STM.query(1)
                .limit(20)
                .usingIndex('ShowIndex')
                .startKey(last_key)
                .descending()
                .exec((err,data)=>{
                    callback(err,data)
                })
        }else {
            STM.query(1)
                .limit(20)
                .usingIndex('ShowIndex')
                .descending()
                .exec((err,data)=>{
                    callback(err,data)
                })
        }
    }

    // cms 获取可订阅列表
    getSubcribeListCms(callback,last_key){
        if (last_key){
            STM.scan()
                .limit(20)
                .startKey(last_key)
                // .descending()
                .exec((err,data)=>{
                    callback(err,data)
                })
        }else {
            STM.scan()
                .limit(20)
                // .descending()
                .exec((err,data)=>{
                    callback(err,data)
                })
        }
    }

    // 删除订阅商品，不提供对外接口
    deleteItem(callback) {
        STM.destroy(this.id, (err) => {
            callback(err);
        })
    }
}
module.exports = ST;
