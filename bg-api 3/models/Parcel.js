// Parcel model

// author by Ziv
// TODO
// 1、上线前需求务必注释掉endpoint，不能设为空
// 2、注释掉createTable方法
//
// v0.1
// 2018-01-11

const { awsParams } = require('../config');
const uuid = require('uuid/v4');

const dynogels = require('dynogels');
dynogels.AWS.config.update({
    accessKeyId:awsParams.accessKeyId,
    secretAccessKey:awsParams.secretAccessKey,
    region:awsParams.region,
    //endpoint:awsParams.dynamodbEndpoint
});

const Joi = require('joi');

const ParcelM = dynogels.define('js_parcel',{
    hashKey: 'user_id',
    rangeKey:'parcel_id',
    timestamps: true,
    schema:{
        user_id:Joi.string(),// 所属用户
        parcel_id:Joi.string(),// uuid生成
        free:Joi.number(),// 1，是免费包裹，0是自费包裹
        name:Joi.string(),
        week:Joi.string(),// 邮包周数，显示当周周一0点的timestamp
        status:Joi.string(),// 状态，INIT、BIND、DELIVERD、SUCCESS
        family_id:Joi.string(),
        handle_date:Joi.string(),// 邮包处理日期
        address:Joi.string(),
        contact:Joi.string(),
        phone:Joi.string(),
        able:Joi.string(),
        orders:Joi.array(),
        province:Joi.string(), // 用于计算邮费
        /*
        orders:[{
            order_id:Joi.string(),// 订单号
            cashback:Joi.number(),// 订单单品返现总额
            paymemt:Joi.number(), // 单订单支付总额
            freight:Joi.number(),// 单订单运费
            items:[{
                sku_id:Joi.string(),
                spu_id:Joi.string(),
                spu_name:Joi.string(),
                sku_name:Joi.string(),
                cover:Joi.string(),
                num:Joi.number(),
                unit_price:Joi.number(),
                cashback:Joi.number()
            }],
        }],
        */
        freight: Joi.number(),
        freight_discount:Joi.number(),
        express_id:Joi.string(),// 快递单号
        express_brand:Joi.string()
    },
});
/*
dynogels.createTables({'js_parcel': { readCapacity: 5, writeCapacity: 5 }},(err) => {
    if (err) {
        console.log('updating tables error', err);
    } else {
        console.log('table updated');
    }
})
*/
class Parcel {
    get user_id() { return this._user_id; }
    set user_id(value) { this._user_id = value; }

    get status() { return this._status; }
    set status(value) { this._status = value; }

    get family_id() { return this._family_id; }
    set family_id(value) { this._family_id = value; }

    get parcel_id() { return this._parcel_id; }
    set parcel_id(value) { this._parcel_id = value; }

    get free() { return this._free; }
    set free(value) { this._free = value; }

    get name() { return this._name; }
    set name(value) { this._name = value; }

    get week() { return this._week; }
    set week(value) { this._week = value; }

    get address() { return this._address; }
    set address(value) { this._address = value; }

    get contact() { return this._contact; }
    set contact(value) { this._contact = value; }

    get phone() { return this._phone; }
    set phone(value) { this._phone = value; }

    get able() { return this._able; }
    set able(value) { this._able = value; }

    get orders() { return this._orders; }
    set orders(value) { this._orders = value; }

    get province() { return this._province; }
    set province(value) { this._province = value; }

    get handle_date() { return this._handle_date; }
    set handle_date(value) { this._handle_date = value; }

    get freight() { return this._freight; }
    set freight(value) { this._freight = value; }

    get freight_discount() { return this._freight_discount; }
    set freight_discount(value) { this._freight_discount = value; }

    get express_id() { return this._express_id; }
    set express_id(value) { this._express_id = value; }

    get express_brand() { return this._express_brand; }
    set express_brand(value) { this._express_brand = value; }

    create(callback){
        ParcelM.create({
            user_id:this.user_id,
            parcel_id:Date.now()+uuid(),
            name:this.name,
            week:this.week,
            free:this.free,
            status:'INIT',
            family_id:this.family_id,
            address:this.address,
            province:this.province,
            contact:this.contact,
            phone:this.phone,
            able:this.able,
            handle_date:this.handle_date, // 默认为当周最后一天的12点，一旦绑定订单指定时间，更新为发货日-时效的当天中午12点，具体可以调节
            //orders:this.orders,
            //cashback:this.cashback,
            //payment:this.payment,
            //total:this.total,
            //freight:this.freight,
            //freight_discount:this.freight_discount
        },function (err,data){
            callback(err,data)
        })
    }

    //  获取状态为'BIND','HANDLING','DELIVERD','SUCCESS'的邮包列表
    getBindParcel(callback){
        ParcelM
            .scan()
            .where('status').in(['BIND','HANDLING','DELIVERD','SUCCESS'])
            // .loadAll()
            .exec((err,bindparcel)=>{
                callback(err,bindparcel)
            })

     }
    getParcel(callback){
        ParcelM.get({user_id:this.user_id,parcel_id:this.parcel_id},(err,data) => {
            callback(err,data);
        })
    }

    getParcelWhetherFree(callback){
        ParcelM.get({user_id:this.user_id,parcel_id:this.parcel_id}, { AttributesToGet: ['free'] },(err,data) => {
            callback(err,data);
        })
    }

    // 获取某种类邮包总数量
    getParcelTotalNumber(callback){
        ParcelM.query(this.user_id)
            .filter('free').equals(this.free)
            .select('COUNT')
            .exec((err,data)=>{
                callback(err,data)
            })
    }

    // 获取一周所有邮包
    getParcelByWeek(callback){
        ParcelM.query(this.user_id)
            .filter('week').equals(this.week)
            .filter('family_id').equals(this.family_id)
            .descending()
            .loadAll()
            .exec((err,data)=>{
                callback(err,data)
            })
    }

    // 获取历史邮包
    getParcelHistory(callback,lk){
        if (lk){
            ParcelM.query(this.user_id)
                .filter('week').lt(this.week)
                .filter('family_id').equals(this.family_id)
                .descending()
                .startKey(lastKey)
                .limit(20)
                .exec((err,data)=>{
                    callback(err,data)
                })
        }else {
            ParcelM.query(this.user_id)
                .filter('week').lt(this.week)
                .filter('family_id').equals(this.family_id)
                .descending()
                .limit(20)
                .exec((err,data)=>{
                    callback(err,data)
                })
        }
    }

    // 获取下周邮包
    getParcelsNextWeek(callback){
        ParcelM.query(this.user_id)
            .filter('week').gt(this.week)
            .filter('family_id').equals(this.family_id)
            .descending()
            .loadAll()
            .exec((err,data)=>{
                callback(err,data)
            })
    }
    // 填写快递单号和快递公司信息
    updateStatus(callback){
        ParcelM.update({
            user_id:this.user_id,
            parcel_id:this.parcel_id,
            status:this.status,
        },function (err,data){
            callback(err,data);
        })
    }
    // update(callback){
    //     ParcelM.update({
    //         user_id:this.user_id,
    //         parcel_id:this.parcel_id,
    //         express_id:this.express_id,
    //         express_brand:this.express_brand
    //     },function (err,data) {
    //
    //         callback(err,data)
    //     })
    // }
    setBind(order,callback){
        ParcelM.update({
            user_id:this.user_id,
            parcel_id:this.parcel_id,
            status:'BIND',
            handle_date:this.handle_date,
            orders:{ $add: order},
            cashback:{ $add: order.cashback},
            total:{ $add: order.total},
            freight:{ $add: order.freight},
            freight_discount:{ $add: order.freight_discount}
        },function (err,data){
            callback(err,data);
        })
    }

    addOrder(order,callback){
        ParcelM.update({
            user_id:this.user_id,
            parcel_id:this.parcel_id,
            orders:{ $add: order},
            cashback:this.cashback,
            total:this.total,
            freight:this.freight,
            freight_discount:this.freight_discount
        },function (err,data) {
            callback(err,data)
        })
    }

    setExpressID(callback){
        ParcelM.update({
            user_id:this.user_id,
            parcel_id:this.parcel_id,
            status:this.status,
            express_id:this.express_id,
            express_brand:this.express_brand
        },function (err,data){
            callback(err,data);
        })
    }

    setFreight(callback){
        ParcelM.update({
            user_id:this.user_id,
            parcel_id:this.parcel_id,
            freight:this.freight,
            freight_discount:this.freight_discount
        },function (err,data){
            callback(err,data);
        })
    }
}

module.exports = Parcel;
