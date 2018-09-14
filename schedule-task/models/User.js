// User Model
// const { env } = require('../../../config');

const {
    awsParams,
} = require('../config');

const dynogels = require('jinshi-dynogels');

// if (env === 'dev'){
//     dynogels.AWS.config.update({
//         accessKeyId:awsParams.accessKeyId,
//         secretAccessKey:awsParams.secretAccessKey,
//         region:awsParams.region,
//         endpoint:awsParams.dynamoEndpoint
//     });
// }else {
    dynogels.AWS.config.update({
        accessKeyId:awsParams.accessKeyId,
        secretAccessKey:awsParams.secretAccessKey,
        region:awsParams.region,
        //endpoint:awsParams.dynamoEndpoint
    });
// }

const Joi = require('joi');

const UserM = dynogels.define('js_user',{
    hashKey: 'user_id',
    timestamps: true,
    schema:{
        user_id:Joi.string(),
        avatar:Joi.string(),
        user_name:Joi.string(),
        gender:Joi.number(),// 1是男
        tel:Joi.string(), // 手机号，作为用户绑定的唯一ID
        union_id:Joi.string(),
        wa_open_id:Joi.string(),
        wa_session_key:Joi.string(),
        wa_form_id:Joi.array(),
        member_tried:Joi.number(),
        balance:Joi.number() // balance单位为分
    },
    indexes: [
        { hashKey: 'wa_open_id', type: 'global', name: 'WaOpenIdIndex' },
        { hashKey: 'union_id',rangeKey:'createdAt', type: 'global', name: 'UnionIdIndex' }
    ]
});

// if (env === 'dev' || env === 'build') {
//     dynogels.createTables({
//         'js_user': {readCapacity: 5, writeCapacity: 5},
//     }, function(err) {
//         if (err) {
//             console.log('Error creating tables: ', err);
//         } else {
//             console.log('Tables has been created');
//         }
//     });
// }

class User {
    get user_id() { return this._user_id; }
    set user_id(value) { this._user_id = value; }

    get avatar() { return this._avatar; }
    set avatar(value) { this._avatar = value; }

    get user_name() { return this._user_name; }
    set user_name(value) { this._user_name = value; }

    get tel() { return this._tel; }
    set tel(value) { this._tel = value; }

    get gender() { return this._gender; }
    set gender(value) { this._gender = value; }

    get union_id() { return this._union_id; }
    set union_id(value) { this._union_id = value; }

    get wa_open_id() { return this._wa_open_id; }
    set wa_open_id(value) { this._wa_open_id = value; }

    get wa_form_id() { return this._wa_form_id; }
    set wa_form_id(value) { this._wa_form_id = value; }

    get wa_session_key() { return this._wa_session_key; }
    set wa_session_key(value) { this._wa_session_key = value; }

    get member_tried() { return this._member_tried; }
    set member_tried(value) { this._member_tried = value; }

    get balance() { return this._balance; }
    set balance(value) { this._balance = value; }

    // 创建新用户
    create(callback){
        UserM.create({
            user_id:this.user_id,
            avatar:this.avatar,
            user_name:this.user_name,
            tel:this.tel,
            union_id:this.union_id,
            wa_open_id:this.wa_open_id,
            wa_session_key:this.wa_session_key,
            balance:0
        },{overwrite : false},function (err,user){
            callback(err,user.attrs);
        })
    }

    updateFormId(callback){
        UserM.update({
            user_id:this.user_id,
            wa_form_id:this.wa_form_id
        },function (err,user) {
            callback(err,user)
        })
    }

    // 更新用户账户余额
    updateBalance(callback){
        UserM.update({
            user_id:this.user_id,
            balance:this.balance
        },function (err,user) {
            callback(err,user)
        })
    }

    // 扣减用户账户余额
    updateBalanceConsume(amount,callback){
        UserM.update({
            user_id:this.user_id,
            balance:{$add:amount*-1}
        },function (err,user) {
            callback(err)
        })
    }

    // 增加用户账户余额
    updateBalanceCashback(amount,callback){
        UserM.update({
            user_id:this.user_id,
            balance:{$add:amount}
        },function (err,user) {
            callback(err)
        })
    }

    // 将用户会员试用状态置为已试用
    updateMemberTried(callback){
        UserM.update({
            user_id:this.user_id,
            member_tried:1
        },function(err,user){
            callback(err)
        })
    }

    // 更新用户的基本信息
    updateUserInfo(callback){
        UserM.update({
            user_id:this.user_id,
            avatar:this.avatar,
            user_name:this.user_name,
            gender:this.gender
        },function (err,user){
            callback(err,user);
        })
    }

    // 更新用户绑定的手机号
    updateUserTel(callback){
        UserM.update({
            user_id:this.user_id,
            tel:this.tel,
        },function (err,user){
            callback(err,user);
        })
    }

    // 更新用户绑定的手机号
    updateUserUnionId(callback){
        UserM.update({
            user_id:this.user_id,
            union_id:this.union_id,
        },function (err,user){
            callback(err,user);
        })
    }

    // 直接传入user_id获取指定用户
    getUser(param,callback){
        UserM.get(param,(err,data) => {
            callback(err,data)
        });
    }

    getUserCR(param,callback){
        UserM.get(param,{ ConsistentRead: true },(err,data) => {
            callback(err,data)
        });
    }

    getUsers(param,callback){
        UserM.getItems(param,(err,data)=>{
            callback(err,data)
        })
    }

    // 根据user_id获取指定用户
    getTargetUser(callback){
        UserM.get({user_id:this.user_id},(err,data) => {
            callback(err,data)
        })
    }

    getTargetUserCR(callback){
        UserM.get({user_id:this.user_id},{ ConsistentRead: true },(err,data) => {
            callback(err,data)
        })
    }

    // 根据手机号查询用户
    queryTel(param,callback){
        UserM.query(param)
            .usingIndex('telIndex')
            .exec((err,resp) => {
                callback(err,resp)
            });
    }

    // 删除一个用户
    // 注意该方法仅可以在合并用户半账号时可用
    deleteUser(param,callback){
        UserM.destroy(param,function (err) {
            callback(err)
        })
    }

    /*
     *   以下为锦时+小程序专用功能
     *
     */

    // 根据锦时+小程序的open_id查询用户
    queryJsWaOpenId(param,callback){
        UserM.query(param)
            .usingIndex('WaOpenIdIndex')
            .exec((err,resp) => {
                callback(err,resp)
        });
    }

    // 根据union_id查询用户
    queryUnionId(callback){
        UserM.query(this.union_id)
            .usingIndex('UnionIdIndex')
            .exec((err,resp) => {
                callback(err,resp)
            });
    }

    updateWAInfo(callback){
        if (this.wa_form_id){
            UserM.update({
                user_id:this.user_id,
                wa_session_key:this.wa_session_key,
                wa_form_id:this.wa_form_id,
                wa_open_id:this.wa_open_id,
                avatar:this.avatar,
                user_name:this.user_name,
                gender:this.gender
            },function (err,data){
                callback(err,data);
            })
        }else {
            UserM.update({
                user_id:this.user_id,
                wa_session_key:this.wa_session_key,
                wa_open_id:this.wa_open_id,
                avatar:this.avatar,
                user_name:this.user_name,
                gender:this.gender
            },function (err,data){
                callback(err,data);
            })
        }
    }

    // 更新锦时+小程序的session-key
    updateSessionKey(callback){
        if (this.union_id){
            UserM.update({
                user_id:this.user_id,
                wa_session_key:this.wa_session_key,
                union_id:this.union_id
            },function (err,user){
                callback(err);
            })
        }else {
            UserM.update({
                user_id:this.user_id,
                wa_session_key:this.wa_session_key
            },function (err,user){
                callback(err);
            })
        }
    }
}

module.exports = User;