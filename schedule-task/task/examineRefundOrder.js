// 整个流程每30秒做一次，更新一次商品信息
'use strict';

const AWS = require('aws-sdk');
const TABLE = 'js_reverse_order';

let shutDown = false;

AWS.config.update({
    accessKeyId:'AKIAODLUFAI6FTDAFGFQ',
    secretAccessKey:'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',
    region:'cn-northwest-1',
    //endpoint:awsParams.dynamoEndpoint
});

const dynamodbstreams = new AWS.DynamoDBStreams({apiVersion: '2012-08-10'});

// 引入Modal
const Order = require('../models/Order');
const Record = require('../models/BuyRecord');
const ReverseOrder = require('../models/ReverseOrder');
const Account = require('../models/Account');
const Family = require('../models/Family');
const User = require('../models/User');
const Sche = require('../models/Schedule');

// 获取订单数据
let getOrder = (user_id,order_id)=>{
    return new Promise((resovle,reject)=>{
        let order = new Order();
        order.user_id = user_id;
        order.order_id = order_id;
        order.getOrderCR((err,data)=>{
            if (err){
                reject(err.message);
            }
            if(!data){
                reject('错误订单号');
            }
            resovle(data.attrs);
        })
    })
};

let getFamilyCashbackSche = (user_id,family_id,order_id)=>{
    return new Promise((resolve,reject)=>{
        let sche = new Sche();
        sche.method = '/family/cashback';
        let content = user_id+'&&'+family_id+'&&'+order_id;
        sche.getTargetSchedule(content,(err,data)=>{
            if (err){
                reject(err.message)
            }
            resolve(data);
        })
    })
};

// 更新订单状态
let updateOrder = (user_id,order_id,status)=>{
    return new Promise((resovle,reject)=>{
        let order = new Order();
        order.user_id = user_id;
        order.order_id = order_id;
        order.status = status;
        order.updateStatus((err,data)=>{
            if (err){
                reject(err.message);
            }
            resovle(1);
        })
    })
};

// 获取订单下所有购买记录
let getRecordByOrderId = (user_id,order_id)=>{
    return new Promise((resovle,reject)=>{
        let record = new Record();
        record.user_id = user_id;
        record.order_id = order_id;
        record.getRecordByOrderid((err,data)=>{
            if (err){
                reject(err.message);
            }
            resovle(data);
        })
    })
};

// 更新购买记录，不允许返现
let updateRecord = (user_id,object_id)=>{
    return new Promise((resovle,reject)=>{
        let record = new Record();
        record.user_id = user_id;
        record.object_id = object_id;
        record.setRecordRefund((err,data)=>{
            if (err){
                reject(err.message);
            }
            resovle(1);
        })
    })
};

// 获取家庭返现account
let getFamilyAccountByOrderId = (family_id,order_id)=>{
    return new Promise((resolve,reject)=>{
        let acc = new Account();
        acc.owner_id = family_id;
        acc.order_id = order_id;
        acc.getAccountsByOrderId((err,data)=>{
            if (err){
                reject(err.message)
            }
            resolve(data)
        })
    })
};

// 获取消费account，并设置为取消
let setConsumeAccCancel = (owner_id,order_id)=>{
    return new Promise((resolve,reject)=>{
        let acc = new Account();
        acc.owner_id = owner_id;
        acc.order_id = order_id;
        acc.getConsumeAccByOrderid((err,data)=>{
            if(err){
                reject(err.message)
            }
            if (data.Count){
                // 有花销
                for (let i=0;i<data.Count;i++){
                    let n = 0;
                    acc.object_id = data.Items[i].attrs.object_id;
                    acc.status = 2;
                    acc.setAccountStatus((err)=>{
                        n++;
                        if(n === data.Count){
                            resolve(1);
                        }
                    })
                }
            }else {
                resolve(1);
            }
        })
    })
};

// 更新account
let updateAcc = (owner_id,object_id)=>{
    return new Promise((resolve,reject)=>{
        let acc = new Account();
        acc.owner_id = owner_id;
        acc.object_id = object_id;
        acc.status = 2;
        acc.setAccountStatus((err)=>{
            if (err){
                reject(err.message)
            }
            resolve(1)
        })
    })
};

let addAccRe = (owner_id,detail,amount)=>{
    return new Promise((resolve,reject)=>{
        let acc = new Account();
        acc.owner_id = owner_id;
        acc.type = 4;
        acc.status = 1;
        acc.detail = detail;
        acc.order_id = '-';
        acc.amount = amount;
        acc.create((err,data)=>{
            if (err){
                reject(err.message)
            }
            resolve(1);
        })
    })
};

// 更新家庭balance
const updateFamilyBalance = (user_id,family_id,amount)=>{
    return new Promise((resolve,reject)=>{
        let family = new Family();
        family.user_id = user_id;
        family.family_id = family_id;
        family.updateBalanceByCashBack(amount,(err,data)=>{
            if (err){
                reject(err.message)
            }else {
                resolve(1)
            }
        })
    });
};

// 更新用户balance
const updateUserBalance = (user_id,amount)=>{
    return new Promise((resolve,reject)=>{
        let user = new User();
        user.user_id = user_id;
        user.updateBalanceCashback(amount,(err,data)=>{
            if (err){
                reject(err.message)
            }else {
                resolve(1)
            }
        })
    });
};

// 更新reverse_order
const updateReverseOrder = (user_id,reverse_id,status,msg)=>{
    return new Promise((resolve,reject)=>{
        let item = {
            msg:msg,
            time:Date.now()
        };
        let reverse = new ReverseOrder();
        reverse.user_id = user_id;
        reverse.reverse_id = reverse_id;
        reverse.getReverseOrder((err,data)=>{
            if (err){
                reject(err.message)
            }
            data = data.attrs;
            let msgs = data.messages;
            msgs.push(item);
            reverse.messages = msgs;
            reverse.status = status;
            reverse.updateReverseOrder((err,data)=>{
                if (err){
                    reject(err.message)
                }else {
                    resolve(1)
                }
            })
        });
    });
};

const axios = require('axios');
const getToken = require('./getWxAccessToken');
// 发布模板消息
const sendMsg = (user_id,order_id,msg,reverse_id,type)=>{
    return new Promise((resolve,reject)=>{
        // 获得微信access_token
        let token = getToken.token();
        // 获取form_id
        let getFormIdFunc = (user_id)=>{
            return new Promise((resolve,reject)=>{
                let user = new User();
                user.user_id = user_id;
                user.getTargetUser((err,data) =>{
                    if (err){
                        reject({
                            error_code:1002,
                            error_msg:err.message
                        })
                    }else {
                        // 遍历wa_form_id
                        let formIDs = data.attrs.wa_form_id;
                        let now = new Date();
                        now = now.getTime();
                        if (formIDs.length>0){
                            let formIdList = [];
                            let targetFormId = '';
                            for (let i=0;i<formIDs.length;i++){
                                // 清理过期form_id
                                let expiredData = new Date(formIDs[i].expiredAt);
                                expiredData = expiredData.getTime();
                                if (expiredData > now){
                                    // 时效
                                    if (!targetFormId){
                                        if (formIDs[i].quota>0){
                                            targetFormId = formIDs[i].form_id;
                                            if ((formIDs[i].quota-1) >0){
                                                let tItem = {
                                                    form_id:formIDs[i].form_id,
                                                    quota:formIDs[i].quota-1,
                                                    expiredAt:formIDs[i].expiredAt
                                                };
                                                formIdList.push(tItem);
                                            }
                                        }
                                    }else {
                                        if (formIDs[i].quota>0){
                                            formIdList.push(formIDs[i]);
                                        }
                                    }
                                }
                            }
                            user.wa_form_id = formIdList;
                            user.updateFormId((err)=>{
                                if(err){
                                    console.error(err.message)
                                }
                            });
                            resolve(targetFormId);
                        }else {
                            reject({
                                error_code:1003,
                                error_msg:'没有form_id'
                            });
                        }
                    }
                })
            })
        };

        // 获取微信用户open_id
        let getUserOpenIdFunc = (user_id)=>{
            return new Promise((resolve,reject)=>{
                let user = new User();
                user.getUser(user_id,(err,data)=>{
                    if (err){
                        reject(err.message);
                    }
                    resolve(data.attrs.wa_open_id);
                })
            })
        };

        // 发送已开始配送模板信息
        let sendWXTemplateMsgFunc = (wx_access_token,wa_open_id,order_id,msg,reverse_id,type,form_id)=>{
            return new Promise((resolve,reject)=>{
                // 发送一条模板消息
                axios.defaults.headers.post['Content-Type'] = 'application/json';
                axios.post('https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token='+wx_access_token,{
                    touser:wa_open_id,
                    template_id:'xch8XzM5tYKvlti6Z5feXTPEKq5X3KigB9JgmVSivpI',
                    page:'/page/order/reverse/detail?reverse_Id='+reverse_id,// 跳转小程序页面
                    form_id:form_id,
                    data:{
                        "keyword1": {
                            "value": msg,
                            "color": "#ff4500"
                        },
                        "keyword2": {
                            "value": order_id,
                            "color": "#173177"
                        },
                        "keyword3": {
                            "value": reverse_id,
                            "color": "#173177"
                        },
                        "keyword4": {
                            "value": type,
                            "color": "#173177"
                        }
                    }
                }).then((response)=>{
                    if (response.data.errcode){
                        reject(response.data.errmsg);
                    }else {
                        resolve('ok');
                    }
                },(err)=>{
                    reject(err.message);
                });
            })
        };
        let go = async ()=>{
            try {
                let formid = await getFormIdFunc(user_id);
                let open_id = await getUserOpenIdFunc(user_id);
                await sendWXTemplateMsgFunc(token,open_id,order_id,msg,reverse_id,type,formid);
            }catch (err){
                console.error(err)
            }
        };
        go();
    })
};

const Schedule = require('../models/Schedule');

let handleInviteCashPlan = (user_id,order_id)=>{
    let content = user_id+'&&'+order_id;
    let sche = new Schedule();
    sche.method = '/invite/cash-plan';
    sche.content = content;
    sche.getTargetSchedule((err,data)=>{
        if (err){
            console.log(err.message)
        }else {
            if (data.Count === 1){
                // 先删除计划
                sche.object_id = data.Items[0].object_id;
                sche.deleteItem((err)=>{
                    if (err){
                        console.log(err.message)
                    }
                })
            }
        }
    });
    let sche1 = new Schedule();
    sche1.method = '/invite/paycash';
    sche1.content = content;
    sche1.getTargetSchedule((err,data)=>{
        if (err){
            console.log(err.message)
        }else {
            if (data.Count === 1){
                // 先删除计划
                sche1.object_id = data.Items[0].object_id;
                sche1.deleteItem((err)=>{
                    if (err){
                        console.log(err.message)
                    }
                })
            }
        }
    });
    setConsumeAccCancel(user_id,order_id);
};

const done = require('../utils/done');

const examine = (d)=>{
    let status = d.eventName;
    let rOrder = d.dynamodb;
    switch (status){
        case 'INSERT':
            if (rOrder.NewImage.type.S === 'REFUND'){
                // 直接退款
                // 直接更新状态
                let user_id = rOrder.NewImage.user_id.S;
                let order_id = rOrder.NewImage.order_id.S;
                let reverse_id = rOrder.NewImage.reverse_id.S;

                let go = async ()=>{
                    try {
                        // 获取订单信息
                        // user_id,order_id
                        let order = await getOrder(user_id,order_id);
                        if (order.status === 'REFUNDING'){
                            // 更新订单至REFUNDED状态
                            // user_id,order_id,status
                            await updateOrder(user_id,order_id,'REFUNDED');
                            if(order.family_id !== '-'){
                                // 删除用户家庭返现计划
                                // user_id,family_id,order_id
                                let sches = await getFamilyCashbackSche(user_id,order.family_id,order_id);
                                if(sches.Count){
                                    for (let i=0;i<sches.Count;i++){
                                        done('/family/cashback',sches.Items[i].attrs.object_id);
                                    }
                                }
                                // 获取用户返现记录
                                // family_id,order_id
                                let accs = await getFamilyAccountByOrderId(order.family_id,order_id);
                                if (accs.Count){
                                    for (let i=0;i<accs.Count;i++){
                                        // 更新账目
                                        // owner_id,object_id
                                        await updateAcc(order.family_id,accs.Items[i].attrs.object_id);
                                    }
                                }
                            }
                            let family_balance_consume = order.family_balance_consume;
                            if (family_balance_consume){
                                // 将家庭基金消费原路退回
                                // user_id,family_id,amount
                                await updateFamilyBalance(user_id,order.family_id,family_balance_consume);
                                // 将家庭基金扣减的acc置为取消
                                // owner_id,order_id
                                await setConsumeAccCancel(order.family_id,order_id);
                                // 记录新的acc
                                // owner_id,detail,amount
                                await addAccRe(order.family_id,'订单'+order_id+'退款',family_balance_consume);
                            }
                            let user_balance_consume = order.user_balance_consume;
                            if(user_balance_consume){
                                // 将用户消费款原路退回
                                await updateUserBalance(user_id,user_balance_consume);
                                // 将用户钱包余额消费置为取消
                                // owner_id,order_id
                                await setConsumeAccCancel(user_id,order_id);
                                // 记录新的acc
                                // owner_id,detail,amount
                                await addAccRe(user_id,'订单'+order_id+'退款',user_balance_consume);
                            }
                            // 获取所有buy records
                            // user_id,order_id
                            let recs = await getRecordByOrderId(user_id,order_id);
                            if (recs.Count){
                                for (let i=0;i<recs.Count;i++){
                                    // 改变所有buyrecord记录
                                    // user_id,object_id
                                    await updateRecord(user_id,recs.Items[i].attrs.object_id)
                                }
                            }
                            let actual_payment = Number(order.actual_payment);
                            // 返回到用户的个人账户
                            // user_id,amount
                            await updateUserBalance(user_id,actual_payment);
                            // 创建退款账目记录
                            // owner_id,detail,amount
                            await addAccRe(user_id,'订单'+order_id+'退款',actual_payment);
                            // 更新reverse_id
                            // user_id,reverse_id,status,msg
                            await updateReverseOrder(user_id,reverse_id,'*SUCCESS','您的订单退款申请已由系统自动审核通过');
                            // 发送模板消息
                            // user_id,order_id,msg,reverse_id,type
                            await sendMsg(user_id,order_id,'退款成功',reverse_id,'退款申请');
                            handleInviteCashPlan(user_id,order_id);
                        }
                    }catch (err){
                        console.error(err)
                    }
                };
                go();
            }
            break;
        case 'MODIFY':
            // 推送逆向单状态更新通知
            let newStatus = rOrder.NewImage.status.S;
            let oldStatus = rOrder.OldImage.status.S;
            let type = rOrder.NewImage.type.S;
            let user_id = rOrder.NewImage.user_id.S;
            let order_id = rOrder.NewImage.order_id.S;
            let item = rOrder.NewImage.item.M;
            let reverse_id = rOrder.NewImage.reverse_id.S;
            let typeName = '';
            let typeTarget = '';
            switch (type){
                case 'RETURN':
                    typeName = '退货';
                    typeTarget = 'RETURNED';
                    break;
                case 'RECHANGE':
                    typeName = '换货';
                    typeTarget = 'RECHANGED';
                    break
            }
            if (newStatus === '_SENDBACK' && oldStatus === '_INIT'){
                // 用户申请被同意，直接操作对应item所属的Account和BuyRecord，发送模板信息
                // 修改Account的状态
                // 查找所有Account，并对所有item的sku_id下指定数量的acc进行修改
                let go = async ()=>{
                    let order = await getOrder(user_id,order_id);
                    if (order.family_id !== '-'){
                        // 获取用户返现记录
                        // family_id,order_id
                        let accs = await getFamilyAccountByOrderId(order.family_id,order_id);
                        if (accs.Count){
                            let n = 0;
                            for (let i = 0;i<accs.Count;i++){
                                if (accs.Items[i].attrs.sku_id === item.sku_id){
                                    // 将acc设置为取消
                                    // 更新账目
                                    // owner_id,object_id
                                    await updateAcc(order.family_id,accs.Items[i].attrs.object_id);
                                    n++;
                                }
                                if (n === item.num){
                                    break;
                                }
                            }
                        }
                    }
                    // 查找所有buy record
                    // 获取所有buy records
                    // user_id,order_id
                    let recs = await getRecordByOrderId(user_id,order_id);
                    let record = new Record();
                    record.user_id = user_id;
                    for (let i=0;i<recs.Count;i++){
                        if (recs.Items[i].attrs.sku_id === item.sku_id){
                            record.object_id = recs.Items[i].attrs.object_id;
                            // 更新BuyRecord数量
                            if (recs.Items[i].attrs.num === item.num){
                                // 直接删除这一条record
                                record.deleteItem((err)=>{
                                    console.error(err.message);
                                })
                            }else {
                                // 修改record的数量
                                record.num = parseInt(Number(recs.Items[i].attrs.num)-Number(item.num));
                                record.updateRecordNum((err)=>{
                                    console.error(err.message);
                                })
                            }
                        }
                    }
                    // user_id,order_id,msg,reverse_id,type
                    await sendMsg(user_id,order_id,'请将退货商品寄回',reverse_id,typeName+'申请');
                };
                // 修改BuyRecord的状态
                go();
            }
            // 推到DENY_，发送模板消息
            if (newStatus === '_DENY'&& oldStatus === '_INIT'){
                // 用户申请被拒绝，发送模板信息
                sendMsg(user_id,order_id,typeName+'申请被拒绝',reverse_id,typeName+'申请');
            }
            // 成功状态更新订单
            if (newStatus === '*SUCCESS'){
                // 更新订单信息
                updateOrder(user_id,order_id,typeTarget);
            }
            // 其他的状态什么都不做
            break;
        case 'REMOVE':
            // 删除了逆向订单
            // 什么都不做
            break
    }
};

// 获取流
const listStreams = (eSSA)=>{
    return new Promise((resolve,reject)=> {
        let params;
        if (eSSA){
            params = {
                Limit: 100,
                TableName: TABLE,
                ExclusiveStartStreamArn: eSSA
            };
        }else {
            params = {
                Limit: 100,
                TableName: TABLE,
                //ExclusiveStartStreamArn: eSSA
            };
        }
        dynamodbstreams.listStreams(params, (err, data) => {
            if (err) {
                reject(err.stack);
            }
            else {
                resolve(data);
            }
        })
    })
};

const describeStream = (steamArn,eSSI)=>{
    return new Promise((resolve,reject)=> {
        let params;
        if (eSSI){
            params = {
                ExclusiveStartShardId:eSSI,
                StreamArn: steamArn, /* required */
                Limit: 100
            };
        }else {
            params = {
                //ExclusiveStartShardId:eSSI,
                StreamArn: steamArn, /* required */
                Limit: 100
            };
        }
        dynamodbstreams.describeStream(params, function(err, data) {
            if (err){
                reject(err.stack)
            }else {
                resolve(data)
            }
        })
    })
};

const getShardIndictor = (ShardId,StreamArn)=>{
    return new Promise((resolve,reject)=> {
        let params = {
            ShardId: ShardId, /* required */
            ShardIteratorType: 'LATEST', /* required */
            StreamArn: StreamArn, /* required */
            //SequenceNumber: SequenceNumber
        };
        dynamodbstreams.getShardIterator(params, function (err, data) {
            if (err) {
                reject(err.stack)
            } else {
                resolve(data)
            }
        })
    })
};

const getRecords = (ShardIterator)=>{
    return new Promise((resolve,reject)=>{
        let params = {
            ShardIterator: ShardIterator, /* required */
            Limit: 100
        };
        dynamodbstreams.getRecords(params, function(err, data) {
            if (err) {
                reject(err.stack)
            } else {
                resolve(data)
            }
        });
    })
};

const go = async ()=>{
    try {
        let LastEvaluatedStreamArn = '1';
        while (LastEvaluatedStreamArn){
            LastEvaluatedStreamArn = '';
            let d1 = await listStreams(LastEvaluatedStreamArn);
            LastEvaluatedStreamArn = d1.LastEvaluatedStreamArn;

            // 获得了流列表
            let ExclusiveStartShardId = '1';
            while (ExclusiveStartShardId){
                ExclusiveStartShardId = '';
                for (let i=0;i<d1.Streams.length;i++){
                    let d2 = await describeStream(d1.Streams[i].StreamArn,ExclusiveStartShardId);
                    ExclusiveStartShardId = d2.StreamDescription.LastEvaluatedShardId;
                    for (let m=0;m<d2.StreamDescription.Shards.length;m++){
                        let d3 = await getShardIndictor(d2.StreamDescription.Shards[m].ShardId,d2.StreamDescription.StreamArn);
                        let NextShardIterator = d3.ShardIterator;
                        while (NextShardIterator){
                            if (shutDown){
                                break;
                            }
                            let d4 = await getRecords(NextShardIterator);
                            NextShardIterator = d4.NextShardIterator;
                            if (d4.Records.length){
                                // 处理Records
                                d4.Records.forEach((record)=>{
                                    examine(record);
                                })
                            }
                        }
                    }
                }
            }
        }
    }catch (err){
        console.error(err);
    }
};

module.exports = {
    start:()=>{
        // 启动流获取
        console.log('启动逆向订单流获取');
        shutDown = false;
        go();
    },
    restart:()=>{
        // 重新启动流获取
        console.log('重启逆向订单流获取');
        shutDown = true;
        setTimeout(()=>{
            shutDown = false;
            go();
        },100)
    }
};