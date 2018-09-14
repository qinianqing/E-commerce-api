const CBC = require('../models/CoBrandedCard');

const getUserCardNum = require('./getCardActiveNum');
const getFamily = require('../../../family/interface/getFamily');
const updateFamily = require('../../../family/interface/updateFamilyFromMember');


let getCardActNum = (card_id,user_id)=>{
    return new Promise((resolve,reject)=>{
        getUserCardNum({
            card_id:card_id,
            user_id:user_id,
            card_type:'1001', // 联名卡
            callback:(resp)=>{
                if (resp.error_code){
                    reject(resp)
                }else {
                    resolve(resp)
                }
            }
        })
    })
};

const activeCallback = require('./cardActiveCallback');

const activeCoupon = require('../../coupon/interface/activeCoupon');
const pushCoupon = require('../../coupon/core/pushCoupon');

let pushCouponFunc = (user_id,coupon_id)=>{
    return new Promise((resolve,reject) => {
        pushCoupon(user_id,coupon_id,(resp)=>{
            if(resp.error_code){
                reject(resp)
            }else {
                resolve(1)
            }
        })
    })
};

module.exports = (p) =>{
    let cbc = new CBC();
    if (p.id && p.user_id&&p.family_id){

    }else {
        return p.callback({
            error_code:1104001,
            error_msg:'缺少参数'
        })
    }
    cbc.id = p.id;
    cbc.getCard((err,data) => {
        if (err){
            return p.callback({
                error_code:1104002,
                error_msg:err.message
            })
        }
        if (data === null){
            return p.callback({
                error_code:1104003,
                error_msg:'错误id'
            })
        }
        data = data.attrs;
        if (data.status === 0){
            return p.callback({
                error_code:1104004,
                error_msg:'该卡暂不能领取'
            })
        }
        let now = Date.now();
        if (now >= data.expiredAt){
            return p.callback({
                error_code:1104005,
                error_msg:'该卡已经失效'
            })
        }
        if (data.active_num > data.num){
            return p.callback({
                error_code:1104006,
                error_msg:'该卡已领完'
            })
        }
        let getUAN = async ()=>{
            try {
                let numb = await getCardActNum(p.id,p.user_id);
                if (numb.data >= data.limit) {
                    return p.callback({
                        error_code: 1104007,
                        error_msg: '您已经领取' + data.limit + '张'
                    })
                }
                // 用户具备领取条件
                activeCallback({
                    id:p.id,
                    user_id:p.user_id,
                    family_id:p.family_id,
                    callback:(resp)=>{
                        if (resp.error_code){
                            return p.callback(resp)
                        }else {
                            activeCoupon.freeShipCoupon({
                                family_id: p.family_id,
                                weeks: data.fscs,
                                callback: (resp) => {
                                    if (resp.error_code) {
                                        return p.callback(resp)
                                    }
                                    // 更新家庭会员信息
                                    getFamily({
                                        user_id:p.user_id,
                                        family_id:p.family_id,
                                        callback:(resp)=>{
                                            if (resp.error_code){
                                                return p.callback(resp)
                                            }
                                            let d = resp.data;
                                            let days = Number(data.days)*1000*60*60*24;// 毫秒数
                                            let tDate;
                                            if (d.vip_expiredAt ){
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
                                                user_id:p.user_id,
                                                family_id:p.family_id,
                                                vip_expiredAt:tDate,
                                                callback:(resp)=>{
                                                    if (resp.error_code){
                                                        return p.callback(resp)
                                                    }
                                                    // 推优惠券
                                                    let handleCouponPush = async ()=>{
                                                        try {
                                                            for (let i=0;i<data.coupons.length;i++){
                                                                await pushCouponFunc(p.user_id,data.coupons[i]);
                                                            }
                                                            return p.callback({
                                                                error_code:0,
                                                                error_msg:'ok'
                                                            })
                                                        }catch (err){
                                                            return p.callback(err)
                                                        }
                                                    };
                                                    handleCouponPush();
                                                }
                                            })
                                        }
                                    });
                                }
                            })
                        }
                    }
                });
            }catch (err){
                return p.callback(err)
            }
        };
        getUAN();
    })
};