const axios = require('axios');
const qs = require('querystring');
const PayOrder = require('../models/PayOrder');

const activeCoupon = require('../../promote/coupon/interface/activeCoupon');
const getFamily = require('../../family/interface/getFamily');
const updateFamily = require('../../family/interface/updateFamilyFromMember');

// 格式化时间
const format = '___-_-_ _:_:__';
const formatTime = time =>
    new Date(
        time.split('')
            .map((value, index) => value + format[index])
            .join('').replace(/_/g, '')
    );

// 获取form_id
const getFormId = require('../../passport/interface/getFormId');
let getFormIdFunc = (user_id)=>{
    return new Promise((resolve,reject)=>{
        getFormId({
            user_id:user_id,
            callback:(resp)=>{
                if (resp.error_code){
                    reject(resp);
                }else {
                    resolve(resp.data);// 直接返回form_id
                }
            }
        })
    })
};

// 获得微信access_token
let getWxAccessTokenFunc = ()=>{
    return new Promise((resolve,reject)=>{
        axios.get('http://task.jiyong365.com'+'/schedule/wx-access-token').then((response)=>{
            let wx_access_token = response.data;
            resolve(wx_access_token);
        },(err)=>{
            reject(err.message);
        })
    })
};

// 获取微信用户open_id
const getUserInfo = require('../../passport/interface/getUserInfo');
/**
 *  @param {string} user_id
 *  @return {string} wa_open_id
 */
let getUserFunc = (user_id)=>{
    return new Promise((resolve,reject)=>{
        getUserInfo({
            user_id:user_id,
            callback:(resp)=>{
                if (resp.error_code){
                    reject(resp);
                }else {
                    resolve(resp.data);// 直接返回open_id
                }
            }
        })
    })
};

// 发送模板信息
let sendWXTemplateMsgFunc = (wx_access_token,wa_open_id,member_type,content,expiredAt,form_id)=>{
    return new Promise((resolve,reject)=>{
        // 发送一条模板消息
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        axios.post('https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token='+wx_access_token,{
            touser:wa_open_id,
            template_id:'fLe5JryGwRFw0mf1lZP3SYH3zSgC_oiVHltFTNo9iUE',
            page:'/page/user/mine/mine',// 跳转小程序页面
            form_id:form_id,
            data:{
                "keyword1": {
                    "value": member_type,
                    "color": "#000000"
                },
                "keyword2": {
                    "value": content,
                    "color": "#173177"
                },
                "keyword3": {
                    "value": expiredAt,
                    "color": "#173177"
                }
            },
            emphasis_keyword:'keyword1.DATA'
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

// 扣减用户余额
const updateUserBalance = require('../../passport/interface/updateUserBalance');
let updateUserBalanceFunc = (user_id, amount) => {
    return new Promise((resolve, reject) => {
        updateUserBalance({
            user_id: user_id,
            consume: amount, // 记录消费额
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

// 会员操作
module.exports = (msg)=>{
    const {
        result_code,
        err_code,
        err_code_des,
        out_trade_no,
        time_end,
        transaction_id,
        bank_type,
    } = msg;
    // 更新支付单
    let order = new PayOrder();
    order.tradeId = out_trade_no;
    order.getPayOrder((err,d) => {
        if (err){
            console.error(err.message);
        }else {
            if (!d){
                console.error('错误支付单号')
            }
            let params = {};
            params.tradeId = out_trade_no;
            params.status = result_code;
            params.paidAt = String(formatTime(time_end));
            params.transactionId = transaction_id;
            params.bankType = bank_type;
            if (err_code){
                params.errorCode = String(err_code);
            }
            if (err_code_des){
                params.errorCodeDes = err_code_des;
            }
            order.update(params,(err,pom) => {
                // 更新订单
                if (err){
                    console.error(err.message)
                }else {
                    if (pom){
                        pom = pom.attrs;
                        // 更新家庭信息
                        let prop = pom.prop;
                        let family_id = prop.split('&&')[0];
                        let type = prop.split('&&')[1];
                        let invite = prop.split('&&')[3];
                        let money = prop.split('&&')[2];
                        money = Number(money)/100;// 转化成元
                        let user_id = pom.user_id;
                        let weeks = 0;
                        let months = 0;
                        let member_type,content,expiredAt;
                        switch (type){
                            case 'y2':
                                weeks = 130;
                                months = 24;
                                member_type = '双年会员';
                                content = '免邮券120张，会员权益720天';
                                break;
                            case 'm':
                                weeks = 5;
                                months = 1;
                                member_type = '月度会员';
                                content = '免邮券5张，会员权益30天';
                                break;
                            case 'q':
                                weeks = 15;
                                months = 3;
                                member_type = '季度会员';
                                content = '免邮券15张，会员权益90天';
                                break;
                            case 'h':
                                weeks = 30;
                                months = 6;
                                member_type = '半年会员';
                                content = '免邮券30张，会员权益180天';
                                break;
                            case 'y':
                                weeks = 60;
                                months = 12;
                                member_type = '年度会员';
                                content = '免邮券60张，会员权益360天';
                                break;
                        }
                        // ASYNC方式激活免邮券、获取家庭、更新家庭信息
                        // 激活免邮券
                        // 为家庭添加免邮券
                        activeCoupon.freeShipCoupon({
                            family_id: family_id,
                            weeks: weeks,
                            callback: (resp) => {
                                if (resp.error_code) {
                                    return console.error(resp)
                                }
                                // 更新家庭会员信息
                                getFamily({
                                    user_id:user_id,
                                    family_id:family_id,
                                    callback:(resp)=>{
                                        if (resp.error_code){
                                            return console.error(resp)
                                        }
                                        let data = resp.data;
                                        let days = 30*months*1000*60*60*24;// 毫秒数
                                        let tDate;
                                        if (data.vip_expiredAt){
                                            if (d.vip === 1 || d.vip === 2){
                                                let begin = new Date(Number(d.vip_expiredAt));
                                                begin = Number(begin.getTime());
                                                tDate = begin+days;
                                            }else {
                                                let begin = new Date();
                                                begin.setHours(0);
                                                begin.setMinutes(0);
                                                begin.setSeconds(0);
                                                begin.setMilliseconds(0);
                                                begin = Number(begin.getTime());
                                                tDate = begin+days;
                                            }
                                        }else {
                                            let begin = new Date();
                                            begin.setHours(0);
                                            begin.setMinutes(0);
                                            begin.setSeconds(0);
                                            begin.setMilliseconds(0);
                                            begin = Number(begin.getTime());
                                            tDate = begin+days;
                                        }
                                        updateFamily({
                                            user_id:user_id,
                                            family_id:family_id,
                                            vip_expiredAt:tDate,
                                            callback:(resp)=>{
                                                if (resp.error_code){
                                                    return console.error(resp)
                                                }
                                                expiredAt = Number(resp.data.vip_expiredAt);
                                                expiredAt = new Date(expiredAt);
                                                expiredAt = expiredAt.getFullYear()+'年'+(expiredAt.getMonth()+1)+'月'+expiredAt.getDate()+'日';
                                                expiredAt = '会员失效期：'+expiredAt;
                                                content = resp.data.name+'：'+content;

                                                if (invite && invite !== user_id){
                                                    // 加入10%返现金
                                                    let payCash = money/10;

                                                    let p = {
                                                        owner_id: invite,
                                                        type: 3,
                                                        status: 1,
                                                        detail: '邀请好友加入会员奖励',
                                                        order_id: '-',
                                                        amount: -1 * payCash, // 记录元
                                                    };
                                                    addAccountFunc(p);
                                                    updateUserBalanceFunc(invite, payCash*-1);
                                                }

                                                let sendMsg = async ()=>{
                                                    let u_info = await getUserFunc(user_id);
                                                    let form_id = await getFormIdFunc(user_id);
                                                    let open_id = u_info.wa_open_id;
                                                    let wa_access_token = await getWxAccessTokenFunc();
                                                    let resultSM = await sendWXTemplateMsgFunc(wa_access_token,open_id,member_type,content,expiredAt,form_id);
                                                };
                                                sendMsg();
                                            }
                                        })
                                    }
                                });
                            }
                        })
                    }else {
                        console.error('更新错误')
                    }
                }
            })
        }
    });
};