// Conpon-wallet Model
const { env } = require('../../../../config');

const { awsParams } = require('../config');

const dynogels = require('jinshi-dynogels');
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

const Joi = require('joi');

const CardWalletM = dynogels.define('js_card_wallet',{
    hashKey: 'user_id',
    rangeKey:'createdAt',
    timestamps: true,
    schema:{
        user_id:Joi.string(),
        family_id:Joi.string(),
        card_type:Joi.string(), // 1001，联名卡
        code:Joi.string(), // 激活卡码
        card_id:Joi.string(),// 卡ID
    },
});

// if (env === 'dev') {
//     dynogels.createTables({'js_coupon_wallet': { readCapacity: 1, writeCapacity: 1 }},(err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class CardWallet {
    get user_id() { return this._user_id; }
    set user_id(value) { this._user_id = value; }

    get family_id() { return this._family_id; }
    set family_id(value) { this._family_id = value; }

    get card_type() { return this._card_type; }
    set card_type(value) { this._card_type = value; }

    get code() { return this._code; }
    set code(value) { this._code = value; }

    get card_id() { return this._card_id; }
    set card_id(value) { this._card_id = value; }

    // 激活一张卡
    create(callback){
        CardWalletM.create({
            user_id:this.user_id,
            family_id:this.family_id,
            card_type:this.card_type, // 1001，联名卡
            code:uuid().replace(/-/g, ''),//
            card_id:this.card_id,// 卡ID
        },{overwrite : false},function (err,coupon){
            callback(err,coupon);
        })
    }

    // 获取激活卡数量
    getOnesCardNum(callback){
        CardWalletM.query(this.user_id)
            .filter('card_type').equals(this.card_type)
            .filter('card_id').equals(this.card_id)
            .select('COUNT')
            .exec((err,data)=>{
                callback(err,data)
            })
    }
}

module.exports = CardWallet;