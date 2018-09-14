const { env } = require('../../../../config');

const {
    awsParams,
} = require('../../config.js');
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

const CollectM = dynogels.define('js_collect', {
    hashKey: 'user_id',
    rangeKey: 'collect_id',
    timestamps: true,
    schema: {
        user_id: Joi.string(),
        goods_id:Joi.string(),
        collect_id: Joi.string(),
        is_collect: Joi.boolean()
    }
});

// if (env === 'dev') {
//     dynogels.createTables({'js_collect': { readCapacity: 1, writeCapacity: 1 }},(err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class Collect {
    get user_id() { return this._user_id; }
    set user_id(value) { this._user_id = value; }

    get goods_id(){ return this._goods_id;}
    set goods_id(value){ this._goods_id = value;}

    get collect_id() { return this._collect_id; }
    set collect_id(value) { this._collect_id = value;}

    get is_collect(){ return this._is_collect;}
    set is_collect(value){ this._is_collect = value;}

    //商品收藏
    create(callback) {
        CollectM.create({
            user_id: this.user_id,
            goods_id:this.goods_id,
            collect_id: Date.now() + uuid(),
            is_collect:this.is_collect
        }, (err, collect) => {
            callback(err, collect)
        })
    }

    //取消收藏
    delect(callback) {
        let user_id = this.user_id;
        let collect_id = this.collect_id;
        CollectM.destroy({ user_id: user_id, collect_id: collect_id }, (err) => {
            callback(err);
        })
    }
    // 查询某件商品是否用户是否收藏过
    getSomeOneWhetherCollect(callback){
        CollectM.query(this.user_id)
            .filter('goods_id').equals(this.goods_id)
            .attributes(['collect_id'])
            .exec((err,data)=>{
                callback(err,data)
            })
    }
    //查询收藏订单
    getCollectList(callback, lastkey) {
        if (lastkey) {
            CollectM.query(this.user_id)
                .startKey(lastKey)
                .descending()
                .limit(20)
                .exec((err, data) => {
                    callback(err, data)
                })
        } else {
            CollectM.query(this.user_id)
                .descending()
                .limit(20)
                .exec((err, data) => {
                    callback(err, data)
                })
        }
    }
    //选择
    getCollects(collectes, callback) {
        CollectM.getItems(collectes, { ConsistentRead: true }, (err, collects) => {
            callback(err, collects)
        })
    }
}
module.exports = Collect;
