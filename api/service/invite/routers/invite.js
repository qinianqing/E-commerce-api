const router = require('express').Router();

const axios = require('axios');
const Invite = require('../models/Invite');
const Act = require('../models/Act');
const User = require('../../passport/models/User');

const request = require('request');
const qiniu = require('qiniu');
const fs = require('fs');
const base64 = require('base-64');

const getUserid = require('../../passport/interface/verifyToken');
const getWxcode = require('../../../utils/qrCode/createWaQrcode');
const pushCoupon = require('../../promote/coupon/core/pushCoupon');
const Coupon = require('../../promote/coupon/models/Coupon-template');
const CouponWallets = require('../../promote/coupon/models/Coupon-wallet');

//去重
function unique(arr) {
    let result = [];
    for (let i = 0; i < arr.length; i++) {
        if (result.indexOf(arr[i]) === -1) {
            result.push(arr[i])
        }
    }
    return result;
}
//判断数组里面是否包含某元素
Array.prototype.in_array = function (element) {　　
    for (var i = 0; i < this.length; i++) {　　　　
        if (this[i] === element) {　　　　　　
            return true;　　
        }　
    }　　
    return false;
};

//七牛配置
const {
    qiniuConfig
} = require('../config');
qiniu.conf.ACCESS_KEY = qiniuConfig.ACCESS_KEY;
qiniu.conf.SECRET_KEY = qiniuConfig.SECRET_KEY;
var mac = new qiniu.auth.digest.Mac(qiniu.conf.ACCESS_KEY, qiniu.conf.SECRET_KEY);
//要上传的空间
var bucket = 'jinshi-product';
//构建上传策略函数
function uptoken(bucket, key) {
    var options = {
        scope: bucket + ":" + key
    }
    var putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(mac);
}

//获取access_token
let getWxAccessTokenFunc = () => {
    return new Promise((resolve, reject) => {
        axios.get('http://task.jiyong365.com/schedule/wx-access-token').then((response) => {
            let wx_access_token = response.data;
            resolve(wx_access_token);
        }, (err) => {
            reject(err.message);
        })
    })
};
//通过token获取用户信息
let getUserMessage = (token) => {
    return new Promise((resolve, reject) => {
        getUserid(token, (resp) => {
            if (resp.data) {
                resolve(resp);
            } else {
                reject(resp.error_msg);
            }
        })
    })
};
//构造上传函数
function uploadFile(uptoken, key, localFile) {
    return new Promise(function (resolve, reject) {
        var extra = new qiniu.form_up.PutExtra();
        var formUploader = new qiniu.form_up.FormUploader();
        formUploader.putFile(uptoken, key, localFile, extra, function (err, ret) {
            if (!err) {
                // 上传成功， 处理返回值
                //console.log(ret.hash, ret.key, ret.persistentId);
                resolve(ret.hash);
            } else {
                // 上传失败， 处理返回代码
                reject(err);
            }
        });
    })
}

// 获取小程序二维码,并加上经过base64转码加七牛云水印
router.post('/get/wx_code', (req, res, next) => {
    if (!req.currentUser) {
        return {
            error_code: 5001,
            error_msg: '无调用权限'
        }
    }
    let wx_code = async () => {
        let wx_access_token = await getWxAccessTokenFunc();
        let user_id = req.currentUser.user_id;
        let scene = user_id;
        let page = 'page/index/index';
        let getWxCode = await getWxcode(scene, page);
        var baseChange = base64.encode(getWxCode);
        var jsPic = 'https://cdn.jiyong365.com/%E5%88%86%E4%BA%AB%E9%A1%B5%E9%9D%A2-03%285%29.jpg';
        var sharePic = `${jsPic}?watermark/1/image/${baseChange}/dissolve/100/gravity/Center/dx/0/dy/490/ws/0.35`;
        res.send({
            error_code: 0,
            error_msg: 'ok',
            data: sharePic
        })
    };
    wx_code();
});

//创建邀请信息
router.post('/create', (req, res, next) => {
    if (req.currentUser) {
        var params = req.body;
        let invite = new Invite();
        if (params.user_id === req.currentUser.user_id) {
            res.send({
                error_code: 4000,
                error_msg: 'youself no invite youself'
            })
        } else {
            invite.user_id = params.user_id;
            invite.getMyinvite((err, data) => {
                if (err) {
                    res.send({
                        error_code: 4005,
                        error_msg: err.message
                    })
                } else {
                    if (data.Count > 0) {
                        let useHistoryOne = params.user_id + '_' + req.currentUser.user_id;
                        let dataArray = [];
                        for (var p = 0; p < data.Count; p++) {
                            dataArray.push(data.Items[p].attrs.invite_history);
                        }
                        let isUseOne = dataArray.in_array(useHistoryOne);
                        if (isUseOne) {
                            res.send({
                                error_code: 0,
                                error_msg: 'this user is invited',
                            })
                        } else {
                            invite.user_id = req.currentUser.user_id;
                            invite.getMyinvite((err, dataThree) => {
                                if (err) {
                                    res.send({
                                        error_code: 4011,
                                        error_msg: err.message
                                    })
                                } else {
                                    if (dataThree.Count > 0) {
                                        let useHistoryThree = req.currentUser.user_id + '_' + params.user_id;
                                        let dataThreeArray = [];
                                        for (var p = 0; p < dataThree.Count; p++) {
                                            dataThreeArray.push(dataThree.Items[p].attrs.invite_history);
                                        }
                                        let isUseThree = dataThreeArray.in_array(useHistoryThree);
                                        if (isUseThree) {
                                            res.send({
                                                error_code: 4012,
                                                error_msg: 'this user is inivted'
                                            })
                                        } else {
                                            invite.user_id = params.user_id;
                                            invite.getAgain((err, again) => {
                                                if (err) {
                                                    res.send({
                                                        error_code: 4006,
                                                        error_msg: err.message
                                                    })
                                                } else {

                                                    let againItem = again.Items[0].attrs;
                                                    invite.user_id = againItem.user_id;
                                                    invite.createdAt = againItem.createdAt;
                                                    invite.updateRanking((err, updateData) => {
                                                        if (err) {
                                                            res.send({
                                                                error_code: 4007,
                                                                error_msg: err.message
                                                            })
                                                        } else {
                                                            invite.order_id = params.order_id || '-';
                                                            invite.user_id = againItem.user_id;
                                                            invite.invite_money = Number(params.invite_money) || 0;
                                                            invite.object_id = 'YES';
                                                            invite.invite_user = req.currentUser.user_id;
                                                            invite.invite_num = againItem.invite_num + 1;
                                                            invite.invite_history = againItem.user_id + '_' + req.currentUser.user_id;
                                                            invite.create((err, addData) => {
                                                                if (err) {
                                                                    res.send({
                                                                        error_code: 4008,
                                                                        error_msg: err.message
                                                                    })
                                                                } else {
                                                                    res.send({
                                                                        error_code: 0,
                                                                        error_msg: 'ok',
                                                                        data: addData
                                                                    })
                                                                }
                                                            })
                                                        }
                                                    })
                                                }

                                            })
                                        }
                                    } else {
                                        invite.user_id = params.user_id;
                                        invite.getAgain((err, again) => {
                                            if (err) {
                                                res.send({
                                                    error_code: 4006,
                                                    error_msg: err.message
                                                })
                                            } else {
                                                let againItem = again.Items[0].attrs;
                                                invite.user_id = againItem.user_id;
                                                invite.createdAt = againItem.createdAt;
                                                invite.updateRanking((err, updateData) => {
                                                    if (err) {
                                                        res.send({
                                                            error_code: 4007,
                                                            error_msg: err.message
                                                        })
                                                    } else {
                                                        invite.user_id = againItem.user_id;
                                                        invite.object_id = 'YES';
                                                        invite.invite_user = req.currentUser.user_id;
                                                        invite.invite_num = againItem.invite_num + 1;
                                                        invite.order_id = params.order_id || '-';
                                                        invite.invite_money = Number(params.invite_money) || 0;
                                                        invite.invite_history = againItem.user_id + '_' + req.currentUser.user_id;
                                                        invite.create((err, addData) => {
                                                            if (err) {
                                                                res.send({
                                                                    error_code: 4008,
                                                                    error_msg: err.message
                                                                })
                                                            } else {
                                                                res.send({
                                                                    error_code: 0,
                                                                    error_msg: 'ok',
                                                                    data: addData
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }

                                        })
                                    }
                                }
                            })
                        }
                    } else {
                        invite.user_id = req.currentUser.user_id;
                        invite.getMyinvite((err, dataTwo) => {
                            if (err) {
                                res.send({
                                    error_code: 4009,
                                    error_msg: err.message
                                })
                            } else {
                                if (dataTwo.Count > 0) {
                                    let useHistoryTwo = req.currentUser.user_id + '_' + params.user_id;
                                    let dataTwoArray = [];
                                    for (var p = 0; p < dataTwo.Count; p++) {
                                        dataTwoArray.push(dataTwo.Items[p].attrs.invite_history);
                                    }
                                    let isUseTwo = dataTwoArray.in_array(useHistoryTwo);
                                    if (isUseTwo) {
                                        res.send({
                                            error_code: 4010,
                                            error_msg: 'this user is invite'
                                        })
                                    } else {
                                        invite.order_id = params.order_id || '-';
                                        invite.user_id = params.user_id;
                                        invite.object_id = 'YES';
                                        invite.invite_money = Number(params.invite_money) || 0;
                                        invite.invite_user = req.currentUser.user_id;
                                        invite.invite_history = req.currentUser.user_id + '_' + req.currentUser.user_id;
                                        invite.invite_num = 1;
                                        invite.create((err, data) => {
                                            if (err) {
                                                res.send({
                                                    error_code: 4004,
                                                    error_msg: err.message
                                                })
                                            } else {
                                                res.send({
                                                    error_code: 0,
                                                    error_msg: 'ok'
                                                })
                                            }
                                        })
                                    }
                                } else {
                                    invite.user_id = params.user_id;
                                    invite.object_id = 'YES';
                                    invite.order_id = params.order_id || '-';
                                    invite.invite_user = req.currentUser.user_id;
                                    invite.invite_money = Number(params.invite_money) || 0;
                                    invite.invite_history = params.user_id + '_' + req.currentUser.user_id;
                                    invite.invite_num = 1;
                                    invite.create((err, data) => {
                                        if (err) {
                                            res.send({
                                                error_code: 4004,
                                                error_msg: err.message
                                            })
                                        } else {
                                            res.send({
                                                error_code: 0,
                                                error_msg: 'ok'
                                            })
                                        }
                                    })
                                }
                            }
                        })


                    }
                }
            })
        }

    } else {
        res.send({
            error_code: 5001,
            error_msg: '无调用权限'
        })
    }
});

//老用户
router.post('/create/old', (req, res, next) => {
    if (!req.currentUser) {
        return {
            error_code: 5001,
            error_msg: '无调用权限'
        }
    }
    let invite = new Invite();
    let params = req.body;
    invite.user_id = params.user_id;
    invite.invite_user = req.currentUser.user_id;
    invite.object_id = "-";
    invite.invite_num = 0;
    invite.invite_history = params.user_id + '_' + req.currentUser.user_id;
    invite.order_id = params.order_id;
    invite.invite_money = Number(params.invite_money);
    invite.create((err, data) => {
        if (err) {
            res.send({
                error_code: 4001,
                error_msg: err.message
            })
        } else {
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: data
            })
        }
    })
});

//获得排行榜
router.get('/ranking', (req, res, next) => {
    if (!req.currentUser) {
        return {
            error_code: 5001,
            error_msg: '无调用权限'
        }
    }
    let invite = new Invite();
    let user = new User();
    invite.object_id = 'YES';
    invite.getRanking((err, data) => {
        if (err) {
            res.send({
                error_code: 4001,
                error_msg: err.message
            })
        } else {
            if (data.Count > 0) {
                let rankArray = [];
                let userArrays = [];
                for (var i = 0; i < data.Count; i++) {
                    rankArray.push(data.Items[i].attrs);
                    let items = {
                        user_id: data.Items[i].attrs.user_id
                    };
                    userArrays.push(items)
                }
                let userArray = unique(userArrays);
                let userMessages = [];
                user.getUsers(userArray, (err, userMessage) => {
                    for (var m = 0; m < userMessage.length; m++) {
                        userMessages.push(userMessage[m].attrs)
                    }
                    for (var r = 0; r < rankArray.length; r++) {
                        for (var k = 0; k < userMessages.length; k++) {
                            if (rankArray[r].user_id === userMessages[k].user_id) {
                                rankArray[r].user_name = userMessages[k].user_name;
                                rankArray[r].user_avatar = userMessages[k].avatar;
                            }
                        }
                    }
                    res.send({
                        error_code: 0,
                        error_msg: 'ok',
                        data: rankArray
                    })
                })
            } else {
                res.send({
                    error_msg: 'ok',
                    error_code: 0,
                    data: null
                })
            }
        }
    })
});

//我的邀请
router.get('/myself', (req, res, next) => {
    if (!req.currentUser) {
        return {
            error_code: 5001,
            error_msg: '无调用权限'
        }
    }
    let invite = new Invite();
    invite.user_id = req.currentUser.user_id;
    invite.getMyinviteNo((err, data) => {
        if (err) {
            res.send({
                error_code: 4003,
                error_msg: err.message
            })
        } else {
            if (data.Count > 0) {
                let inviteArray = [];
                let inviteArrays = [];
                for (var i = 0; i < data.Count; i++) {
                    inviteArrays.push(data.Items[i].attrs)
                    let items = {
                        user_id: data.Items[i].attrs.invite_user
                    }
                    inviteArray.push(items);
                }
                let user = new User();
                let userArray = unique(inviteArray);
                let userMessages = [];
                user.getUsers(userArray, (err, userMessage) => {

                    for (var m = 0; m < userMessage.length; m++) {
                        userMessages.push(userMessage[m].attrs)
                    }
                    for (var r = 0; r < inviteArrays.length; r++) {
                        for (var k = 0; k < userMessages.length; k++) {
                            if (inviteArrays[r].invite_user === userMessages[k].user_id) {
                                inviteArrays[r].user_name = userMessages[k].user_name;
                                inviteArrays[r].user_avatar = userMessages[k].avatar;
                            }
                        }
                    }
                    res.send({
                        error_code: 0,
                        error_msg: 'ok',
                        data: inviteArrays
                    })

                })
            } else {
                res.send({
                    error_msg: 'ok',
                    error_code: 0,
                    data: 0
                })
            }
        }
    })
});

//拼手气红包
router.get('/random/coupon', (req, res, next) => {
    if (!req.currentUser) {
        return {
            error_code: 5001,
            error_msg: '无调用权限'
        }
    }
    let user_id = req.currentUser.user_id;
    let coupon_ids = ['c6e2adce37e64037b326d830dc9fc58f'];
    pushCoupon(user_id, coupon_ids[0], (resp) => {
        if (resp.error_code > 0) {
            res.send({
                error_code: 4001,
                error_msg: 'this coupon is mistake'
            })
        } else {
            let CouponWallet = new CouponWallets();
            CouponWallet.owner_id = user_id;
            CouponWallet.coupon_id = coupon_ids[0];
            CouponWallet.getOnesTargetCouponGetLast((err, data) => {
                if (err) {
                    res.send({
                        error_code: 4002,
                        error_msg: err.message
                    })
                } else {
                    res.send({
                        error_code: 0,
                        error_msg: 'ok',
                        data: data.Items[0].attrs
                    })
                }
            })
        }
    })
});

//创建一个新人红包
router.get('/new/coupon', (req, res, next) => {
    if (!req.currentUser) {
        return {
            error_code: 5001,
            error_msg: '无调用权限'
        }
    }
    let user_id = req.currentUser.user_id;
    let coupon_ids = ['a097f7d4297b46db906cc39846c6ce3e'];
    pushCoupon(user_id, coupon_ids[0], (resp) => {
        if (resp.error_code > 0) {
            res.send({
                error_code: 4001,
                error_msg: 'this coupon is mistake'
            })
        } else {
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: resp.data
            })
        }
    })
});

//朋友手气
router.get('/check/same', (req, res, next) => {
    if (!req.currentUser) {
        return {
            error_code: 5001,
            error_msg: '无调用权限'
        }
    }
    let invite = new Invite();
    invite.user_id = req.query.user_id;
    invite.invite_user = req.currentUser.user_id;
    invite.order_id = req.query.order_id;
    invite.getOneInvite((err, data) => {
        if (err) {
            res.send({
                error_code: 4001,
                error_msg: err.message
            })
        } else {
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: data.Count
            })
        }
    })
});

//得到某用户一天得到的拼手气红包
router.get('/day/coupon', (req, res, next) => {
    if (!req.currentUser) {
        return {
            error_code: 5001,
            error_msg: '无调用权限'
        }
    }
    let CouponWallet = new CouponWallets();
    CouponWallet.owner_id = req.currentUser.user_id;
    CouponWallet.coupon_id = 'c6e2adce37e64037b326d830dc9fc58f';
    CouponWallet.getOnesTargetCouponGetNumS((err, data) => {
        if (err) {
            res.send({
                error_code: 4001,
                error_msg: err.message
            })
        } else {
            if (data.Count > 0) {
                var dayList = [];
                var dayTime = new Date().toLocaleDateString();
                for (var i = 0; i < data.Count; i++) {
                    if ((new Date(Number(data.Items[i].attrs.activeAt))).toLocaleDateString() === dayTime) {
                        dayList.push(data.Items[i].attrs)
                    }
                }

                if (dayList.length > 4) {
                    res.send({
                        error_code: 0,
                        error_msg: 'ok',
                        data: 'no'
                    })
                } else {
                    res.send({
                        error_code: 0,
                        error_msg: 'ok',
                        data: 'yes'
                    })
                }
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: 'yes'
                })
            }
        }
    })
});

//得到某一红包排行
router.get('/money/ranking', (req, res, next) => {
    if (!req.currentUser) {
        return {
            error_code: 5001,
            error_msg: '无调用权限'
        }
    }
    let params = req.query;
    let invite = new Invite();
    invite.order_id = params.order_id;
    invite.user_id = params.user_id;
    invite.getOneInviteList((err, data) => {
        if (err) {
            res.send({
                error_code: 4001,
                error_msg: err.message
            })
        } else {

            let sendList = [];
            if (data.Count > 0) {
                for (var i = 0; i < data.Count; i++) {
                    sendList.push(data.Items[i].attrs)
                }

                let userList = [];
                let userArray = [];

                for (var j = 0; j < sendList.length; j++) {
                    userList.push(sendList[j].invite_user);
                }

                userArray = unique(userList);
                let user = new User();

                user.getUsers(userArray, (err, userMessage) => {
                    if (err) {
                        res.send({
                            error_code: 4003,
                            error_msg: err.message
                        })
                    } else {
                        let userMessages = [];
                        for (var m = 0; m < userMessage.length; m++) {
                            userMessages.push(userMessage[m].attrs)
                        }

                        for (var r = 0; r < sendList.length; r++) {
                            for (var k = 0; k < userMessages.length; k++) {
                                if (sendList[r].invite_user === userMessages[k].user_id) {
                                    sendList[r].user_name = userMessages[k].user_name;
                                    sendList[r].user_avatar = userMessages[k].avatar;
                                }
                            }
                        }
                        res.send({
                            error_code: 0,
                            error_msg: 'ok',
                            data: sendList
                        })
                    }


                })

            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: 0
                })
            }
        }
    })
});

const createSchedule = require('../../schedule/interface/createSchedule');
//分享10人后，发5元现金券
router.get('/coupon/num', (req, res, next) => {
    if (!req.currentUser) {
        return {
            error_code: 5001,
            error_msg: '无调用权限'
        }
    }
    let invite = new Invite();
    let user = new User();
    let parmas = req.query;
    invite.order_id = parmas.order_id;
    invite.user_id = parmas.user_id;
    invite.getOneInviteListNum((err, data) => {
        // 只有第10条才会激活返现计划
        if (data.Count === 10) {
            createSchedule({
                method: '/invite/cash-plan',
                occur: '-',
                content:parmas.user_id + '&&' + parmas.order_id,
                callback: (resp) => {
                    res.send(resp);
                }
            })
            // user.user_id = req.currentUser.user_id;
            // user.getTargetUser((err,data)=>{
            //     if(err){
            //         res.send({
            //             error_code:4001,
            //             error_msg:err.message
            //         })
            //     }else{
            //         user.user_id = req.currentUser.user_id;
            //         user.balance = data.attrs.balance + 5;
            //         user.updateBalance((err,datas)=>{
            //            if(err){
            //                res.send({
            //                    error_code:4002,
            //                    error_msg:err.message
            //                })
            //            }else{
            //                res.send({
            //                    error_code:0,
            //                    error_msg:'ok',
            //                    data:'yes'
            //                })
            //            }
            //         })
            //     }
            // })
        } else {
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: 'no'
            })
        }
    })
});

//福利列表
router.get('/act/list', (req, res, next) => {
    if (!req.currentUser) {
        return {
            error_code: 5001,
            error_msg: '无调用权限'
        }
    }
    let act = new Act();
    let params = req.query;
    act.user_id = req.currentUser.user_id;
    act.getActList((err, data) => {
        if (err) {
            res.send({
                error_code: 4001,
                error_msg: err.message
            })
        } else {
            if (data.Count > 0) {
                let list = [];
                for (let i = 0; i < data.Count; i++) {
                    list.push(data.Items[i].attrs)
                }
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: list
                })
            } else {

                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: 'no'
                })
            }
        }
    })
});

// 记录消费流水
const addAccountBill = require('../../wallet/interface/addAccountBill');
let addAccountFunc = (p) => {
    return new Promise((resolve, reject) => {
        addAccountBill({
            owner_id: p.owner_id,
            type: p.type,
            status: p.status,
            detail: p.detail,
            sku_id: p.sku_id || '-',
            order_id: p.order_id,
            amount: p.amount, // 记录元
            callback: (resp) => {
                if (resp.error_code) {
                    reject(resp);
                } else {
                    resolve(resp.data);
                }
            }
        })
    })
};

//拼手气红包数量
router.get('/get/act/num', (req, res, next) => {
    if(!req.currentUser){
        return {
            error_code:5001,
            error_msg:'无调用权限'
        }
    }
    let invite = new Invite();
    let act = new Act();
    let parmas = req.query;
    invite.order_id = parmas.order_id;
    invite.user_id = req.currentUser.user_id;
    invite.getOneInviteListNum((err, data) => {
        if (err) {
            res.send({
                error_code: 4001,
                error_msg: err.message
            })
        } else {
            if (data.Count > 9) {
                act.order_id = parmas.order_id;
                act.user_id = req.currentUser.user_id;
                // 获取order_id和user_id下的act
                act.getActListStatus((err, list) => {
                    if (err) {
                        res.send({
                            error_code: 4003,
                            error_msg: err.message
                        })
                    } else {
                        if (list.Items[0].attrs.status === 0) {
                            createSchedule({
                                method: '/invite/cash-plan',
                                occur: '-',
                                content:req.currentUser.user_id + '&&' + parmas.order_id,
                                callback: (resp) => {
                                    if(resp.error_code){
                                        console.error(resp.error_msg);
                                    }
                                }
                            });

                            // 创建一条account
                            let p = {
                                owner_id: req.currentUser.user_id,
                                type: 3,
                                status: 0,
                                detail: '好友领券奖励',
                                order_id: parmas.order_id,
                                amount: -1 * 5, // 记录元
                            };
                            addAccountFunc(p);

                            act.update((err, datas) => {
                                if (err) {
                                    res.send({
                                        error_code: 4002,
                                        error_msg: err.message
                                        
                                    })
                                } else {
                                    res.send({
                                        error_code: 0,
                                        error_msg: 'ok',
                                        data:data.Count
                                    })
                                }
                            })
                        } else {
                            res.send({
                                error_code: 0,
                                error_msg: 'ok',
                                data:data.Count
                            })
                        }
                    }
                })
               
            } else {
              
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data.Count
                })
            }

        }
    })
});

//发券人红包数量
router.get('/send/user/num',(req,res,next)=>{
    if(!req.currentUser){
        return {
            error_code:5001,
            error_msg:'无调用权限'
        }
    }
    let invite = new Invite();
    let parmas = req.query;
    invite.order_id = parmas.order_id;
    invite.user_id = parmas.user_id;
    invite.getOneInviteListNum((err, data) => {
        if (err) {
            res.send({
                error_code: 4001,
                error_msg: err.message
            })
        } else {
            if (data.Count > 0) {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data.Count
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: 0
                })
            }

        }
    })
});

module.exports = router;