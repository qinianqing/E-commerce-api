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

const SPM = dynogels.define('js_subscribe_package', {
    hashKey: 'subs_order_id',
    rangeKey: 'week',
    timestamps: true,
    schema: {
        subs_order_id: Joi.string(),
        week:Joi.string(),// 发货周第一秒
        user_id:Joi.string(),// 用户id
        family_id:Joi.string(),// 送货家庭ID
        package_id:Joi.string(),
        status:Joi.number(),// 0(等待处理)，1（已发货），2（已完成，签收自动更新为已完成，一旦签收记录购买记录）,-1为取消
        express_id:Joi.string(),
        express_brand:Joi.string(),
        relation_order_id:Joi.string(),// 为空时，则不是伴随发货
        sku_detail: Joi.array(),//
        index:Joi.number(),// 顺序
        num:Joi.number(),// 订购的组数
        /*
            [{
                sku_id:'10000-10000',
                spu_id:'',
                spu_name:'',
                sku_name:'',
                cover:'',
                price:0,
                num:2
            },{
                sku_id:'10001-10001',
                spu_id:'',
                spu_name:'',
                sku_name:'',
                cover:'',
                num:2
            }]
         */
    },
    indexes:[
        { hashKey: 'user_id', rangeKey: 'week', type: 'global', name: 'UserWeekIndex' },
    ]
});

// if (env === 'dev') {
//     dynogels.createTables({'js_subscribe_package': { readCapacity: 1, writeCapacity: 1 }},(err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class SP {
    get subs_order_id() { return this._subs_order_id; }
    set subs_order_id(value) { this._subs_order_id = value; }

    get week(){ return this._week;}
    set week(value){ this._week = value;}

    get user_id(){ return this._user_id;}
    set user_id(value){ this._user_id = value;}

    get family_id(){ return this._family_id;}
    set family_id(value){ this._family_id = value;}

    get package_id() { return this._package_id; }
    set package_id(value) { this._package_id = value;}

    get status(){ return this._status;}
    set status(value){ this._status = value;}

    get express_id() { return this._express_id; }
    set express_id(value) { this._express_id = value; }

    get express_brand(){ return this._express_brand;}
    set express_brand(value){ this._express_brand = value;}

    get relation_order_id() { return this._relation_order_id; }
    set relation_order_id(value) { this._relation_order_id = value;}

    get sku_detail(){ return this._sku_detail;}
    set sku_detail(value){ this._sku_detail = value;}

    get num(){ return this._num;}
    set num(value){ this._num = value;}

    get index(){ return this._index;}
    set index(value){ this._index = value;}

    // 创建包裹
    create(callback) {
        SPM.create({
            subs_order_id: this.subs_order_id,
            week:this.week,
            user_id:this.user_id,
            family_id:this.family_id,
            num:this.num,
            status: 0,
            index:this.index,
            sku_detail:this.sku_detail
        }, (err, data) => {
            callback(err, data);
        })
    }

    getPackageByUser(callback,last_key){
        if (last_key){
            SPM.query(this.user_id)
                .usingIndex('UserWeekIndex')
                .limit(20)
                .descending()
                .startKey(last_key)
                .exec((err,data)=>{
                    callback(err,data);
                })
        }else {
            SPM.query(this.user_id)
                .usingIndex('UserWeekIndex')
                .limit(20)
                .descending()
                .exec((err,data)=>{
                    callback(err,data);
                })
        }
    }

    getPackageByUserAndWeek(callback,last_key){
        if (last_key){
            SPM.query(this.user_id)
                .where('week').equals(this.week)
                .filter('family_id').equals(this.family_id)
                .usingIndex('UserWeekIndex')
                .limit(50)
                .descending()
                .startKey(last_key)
                .exec((err,data)=>{
                    callback(err,data);
                })
        }else {
            SPM.query(this.user_id)
                .where('week').equals(this.week)
                .filter('family_id').equals(this.family_id)
                .usingIndex('UserWeekIndex')
                .limit(50)
                .descending()
                .exec((err,data)=>{
                    callback(err,data);
                })
        }
    }
    // erp后台调用
    getPackageByUserAndWeek2(callback){
        SPM.query(this.user_id)
            .where('week').equals(this.week)
            .usingIndex('UserWeekIndex')
            .exec((err,data)=>{
                callback(err,data);
            })
    }
    getPackage(callback){
        SPM.get({
            subs_order_id:this.subs_order_id,
            week:this.week
        },(err,data)=>{
            callback(err,data);
        })
    }

    /* 获取所有package */
    getAllPackage(callback, lastkey) {
        if (lastkey) {
            SPM.scan()
                .startKey(lastKey)
                .limit(5)
                .loadAll()
                .exec((err, data) => {
                    callback(err, data)
                })
        } else {
            SPM.scan()
                .limit(5)
                .loadAll()
                .exec((err, data) => {
                    callback(err, data)
                })
        }

    }
    // 获取某个订单下的所有包裹
    querySubsPackageByOrder(callback){
        SPM.query(this.subs_order_id)
            .descending()
            .exec((err,data)=>{
                callback(err,data);
            })
    }

    // 发货更新状态
    updateByDelivery(callback){
        SPM.update({
            subs_order_id: this.subs_order_id,
            week:this.week,
            status:1,
            express_id:this.express_id,
            express_brand:this.express_brand,
            relation_order_id:this.relation_order_id
        },(err,data)=>{
            callback(err,data)
        })
    }

    // 收货时回调
    updateByReceipt(callback){
        SPM.update({
            subs_order_id: this.subs_order_id,
            week:this.week,
            status:2
        },(err,data)=>{
            callback(err)
        })
    }

    // 取消时回调
    updateByReverse(callback){
        SPM.update({
            subs_order_id: this.subs_order_id,
            week:this.week,
            status:-1
        },(err,data)=>{
            callback(err)
        })
    }

    //取消收藏
    deleteItem(callback) {
        SPM.destroy({ subs_order_id: this.subs_order_id, week: this.week }, (err) => {
            callback(err);
        })
    }
}
module.exports = SP;
