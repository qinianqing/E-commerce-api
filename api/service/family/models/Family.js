const { env } = require('../../../config');

// Family Model
const { awsParams } = require('../config');

const dynogels = require('jinshi-dynogels');

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

const FamilyM = dynogels.define('js_family',{
    hashKey: 'user_id',
    rangeKey:'family_id',
    timestamps: true,
    schema:{
        user_id:Joi.string(),
        family_id:Joi.string(),
        name:Joi.string(),
        default:Joi.number(),
        address:Joi.string(),// 1是男
        contact:Joi.string(),
        phone:Joi.string(),
        province:Joi.string(),
        city:Joi.string(),
        county:Joi.string(),
        remark:Joi.string(),
        vip:Joi.number(),// 0非会员，1正式会员，2试用会员
        vip_expiredAt:Joi.number(),
        tried:Joi.number(),// 0，没有试用过，1，试用过
        members:Joi.object(),
        balance:Joi.number()// 家庭储值额度
    }
});

// if (env === 'dev') {
//     dynogels.createTables({'js_family': { readCapacity: 1, writeCapacity: 1 }},(err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     })
// }

class Family {

    get user_id() { return this._user_id; }
    set user_id(value) { this._user_id = value; }

    get family_id() { return this._family_id; }
    set family_id(value) { this._family_id = value; }

    get name() { return this._name; }
    set name(value) { this._name = value; }

    get default() { return this._default; }
    set default(value) { this._default = value; }

    get address() { return this._address; }
    set address(value) { this._address = value; }

    get contact() { return this._contact; }
    set contact(value) { this._contact = value; }

    get phone() { return this._phone; }
    set phone(value) { this._phone = value; }

    get province() { return this._province; }
    set province(value) { this._province = value; }

    get city() { return this._city; }
    set city(value) { this._city = value; }

    get county() { return this._county; }
    set county(value) { this._county = value; }

    get vip() { return this._vip; }
    set vip(value) { this._vip = value; }

    get vip_expiredAt() { return this._vip_expiredAt; }
    set vip_expiredAt(value) { this._vip_expiredAt = value; }

    get remark() { return this._remark; }
    set remark(value) { this._remark = value; }

    get tried() { return this._tried; }
    set tried(value) { this._tried = value; }

    get members() { return this._members; }
    set members(value) { this._members = value; }


    /* 新建 */
    create(callback){
        FamilyM.create({
            user_id:this.user_id,
            family_id:this.family_id,
            name:this.name,
            default:this.default,
            address:this.address,
            contact:this.contact,
            phone:this.phone,
            province:this.province,
            city:this.city,
            county:this.county,
            remark:this.remark,
            vip:0,
            // vip_expiredAt:this.vip_expiredAt,
            // tried:this.tried,
            members:this.members,
            balance:0
        }, {overwrite : false},function (err,data){
            callback(err)
        })
    }

    /* 取值方法 */
    getOnesFamilies(callback){
        FamilyM.query(this.user_id)
            .descending()
            .exec((err,data) => {
                callback(err,data)
            })
    }

    getOnesDefaultFamily(callback){
        FamilyM.query(this.user_id)
            .filter('default').equals(1)
            .exec((err,data) => {
                callback(err,data)
            })
    }

    getOnesTargetFamily(callback){
        FamilyM.get({
            user_id:this.user_id,
            family_id:this.family_id
        },(err,family) => {
            callback(err,family)
        })
    }

    getOnesTargetFamilyCR(callback){
        FamilyM.get({
            user_id:this.user_id,
            family_id:this.family_id
        },{ ConsistentRead: true },(err,family) => {
            callback(err,family)
        })
    }

    /* 更新方法 */
    updateFamilyVipStatus(callback){
        FamilyM.update({
            user_id:this.user_id,
            family_id:this.family_id,
            vip:this.vip,// 0非会员，1正式会员，2试用会员
            vip_expiredAt:this.vip_expiredAt
        },function (err,data){
            callback(err,data);
        })
    }

    // 将家庭置为已经试用
    setFamilyTried(callback){
        FamilyM.update({
            user_id:this.user_id,
            family_id:this.family_id,
            vip:2,
            vip_expiredAt:this.vip_expiredAt,
            tried:1
        },(err,data)=>{
            callback(err);
        })
    }


    updateDefaultFamily(param,callback){
        FamilyM.update({
            user_id:this.user_id,
            family_id:this.family_id,
            default:param
        },function (err,family){
            callback(err,family);
        })
    }

    updateFamilyInfo(params,callback){
        FamilyM.update(params,function (err,family){
            callback(err,family);
        })
    }

    // 扣减用户账户余额
    updateBalanceConsume(amount,callback){
        FamilyM.update({
            user_id:this.user_id,
            family_id:this.family_id,
            balance:{$add:amount*-1}
        },function (err,user) {
            callback(err)
        })
    }

    // get parcels() { return this._parcels; }
    // set parcels(value) { this._parcels = value; }
    //
    // get weeks() { return this._weeks; }
    // set weeks(value) { this._weeks = value; }

    /*
    user_id:Joi.string(),
    family_id:Joi.string(),
    name:Joi.string(),
    default:Joi.number(),
    address:Joi.string(),// 1是男
    contact:Joi.string(),
    phone:Joi.string(),
    province:Joi.string(),
    city:Joi.string(),
    county:Joi.string(),
    remark:Joi.string(),
    vip:Joi.number(),// 0非会员，1正式会员，2试用会员
    vip_expiredAt:Joi.number(),
    tried:Joi.number(),
    members:Joi.object(),
 */

    // // 更新周数
    // updateFamilyMemberWeeks(callback){
    //     FamilyM.update({
    //         user_id:this.user_id,
    //         family_id:this.family_id,
    //         member:this.member,
    //         parcels:this.parcels
    //     },function (err,data){
    //         callback(err);
    //     })
    // }

    // updateFamilyMembershipByCode(callback){
    //     FamilyM.update({
    //         user_id:this.user_id,
    //         family_id:this.family_id,
    //         member:this.member,
    //         parcels:{ $add: this.parcels },
    //         weeks:{ $add: this.weeks }
    //     },function (err,data){
    //         callback(err);
    //     })
    // }

    // updateParcelConsume(callback){
    //     FamilyM.update({
    //         user_id:this.user_id,
    //         family_id:this.family_id,
    //         parcels: { $add: -1 }
    //     },function (err,family){
    //         callback(err,family);
    //     })
    // }
    //
    // updateWeekConsume(callback){
    //     FamilyM.update({
    //         user_id:this.user_id,
    //         family_id:this.family_id,
    //         weeks: { $add: -1 }
    //     },function (err,family){
    //         callback(err,family);
    //     })
    // }

    // getAllFamilyCount(callback){
    //     FamilyM
    //         .scan()
    //         .loadAll()
    //         .exec((err,data)=>{
    //             callback(err,data)
    //         })
    // }
}

module.exports = Family;