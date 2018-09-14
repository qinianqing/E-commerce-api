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
const InviteM = dynogels.define('js_invite', {
    hashKey: 'user_id',
    rangeKey: 'createdAt',   
    timestamps: true,
    schema: {
        object_id: Joi.string(), //作为全局索引查询的分区键,value固定,查询是否是排行榜
        user_id: Joi.string(), //邀请人用户ID
        invite_user: Joi.string(), //被邀请用户ID
        invite_num: Joi.number(), //邀请用户数量
        invite_history: Joi.string(), //邀请用户历史
        order_id:Joi.string(),
        invite_money:Joi.number()
    },
    indexes: [{
        hashKey: 'object_id',
        rangeKey: 'invite_num',
        type: 'global',
        name: 'InviteIndex',
    }]

});

// if (env === 'dev') {
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

class Invite {
    get object_id() {
        return this._object_id;
    }
    set object_id(value) {
        this._object_id = value;
    }

    get user_id() {
        return this._user_id;
    }
    set user_id(value) {
        this._user_id = value;
    }

    get invite_user() {
        return this._invite_user;
    }
    set invite_user(value) {
        this._invite_user = value;
    }

    get invite_num() {
        return this._invite_num;
    }
    set invite_num(value) {
        this._invite_num = value;
    }

    get invite_history() {
        return this._invite_history;
    }
    set invite_history(value) {
        this._invite_history = value;
    }
    get order_id(){
        return this._order_id;
    }
    set order_id(value){
        this._order_id = value;
    }
    get invite_money(){
        return this._invite_money;
    }
    set invite_money(value){
        this._invite_money = value;
    }
    //创建
    create(callback) {
        InviteM.create({
            object_id: this.object_id,
            user_id: this.user_id,
            invite_user: this.invite_user,
            invite_num: this.invite_num,
            invite_history: this.invite_history,
            order_id:this.order_id || '-',
            invite_money:this.invite_money
        }, (err, data) => {
            callback(err, data)
        })
    }
    //已经邀请过的用户再次邀请
    getAgain(callback){
        InviteM
             .query(this.user_id)
             .filter('object_id').equals('YES')
             .exec((err,data)=>{
                 callback(err,data)
             })
    }
    //我的邀请详细信息
    getMyinvite(callback) {
        InviteM
            .query(this.user_id)
            .exec((err, data) => {
                callback(err, data)
            })

    }
    //通过邀请好友，获取个人邀请
    getMyinviteNo(callback){
        InviteM
        .query(this.user_id)
        .filter('object_id').notContains('-')
        .exec((err, data) => {
            callback(err, data)
        })
    }
    //某用户邀请数量
    getOneNum(callback) {
        InviteM
            .query(this.user_id)
            .select('COUNT')
            .exec((err, data) => {
                callback(err, data)
            })
    }
    //邀请排行
    getRanking(callback) {
        InviteM
            .query(this.object_id)
            .usingIndex('InviteIndex')
            .descending()
            .limit(10)
            .exec((err, data) => {
                callback(err, data)
            })
    }
    //邀请后更新状态
    updateRanking(callback) {
        InviteM
            .update({
                user_id: this.user_id,
                createdAt: this.createdAt,
                object_id:'NO'
            },{expected: {object_id:'YES'}},((err,data)=>{
                callback(err,data)
            }))
    }
    //得到一条邀请数据
    getOneInvite(callback){
        InviteM
        .query(this.user_id)
        .filter('invite_user').equals(this.invite_user)
        .filter('order_id').equals(this.order_id)
        .select('COUNT')
        .exec((err,data)=>{
            callback(err,data)
        })
    }
    //排行
    getOneInviteList(callback){
        InviteM
        .query(this.user_id)
        .filter('order_id').equals(this.order_id)
        .filter('object_id').equals('-')
        .exec((err,data)=>{
            callback(err,data)
        })
    }
    //分享好友数量
    getOneInviteListNum(callback){
        InviteM
        .query(this.user_id)
        .filter('order_id').equals(this.order_id)
        .filter('object_id').equals('-')
        .select('COUNT')
        .exec((err,data)=>{
            callback(err,data)
        })
    }
}
module.exports = Invite;