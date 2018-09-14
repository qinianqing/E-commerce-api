// 核心模块，向用户账户里推入一张优惠券
// author by Ziv
// 2018-3-13
const CouponI = require('../models/Coupon-wallet');
const CouponT = require('../models/Coupon-template');
const pullCoupon = require('./pullCoupon');

// @param owner_id
// @param coupon_id 优惠券模板ID/传入0或者空值，则为免邮券
// @param weeks number整数类型，免邮券的数量

// 优惠券模板数据结构
/*
    coupon_id:Joi.string(),
    limit:Joi.number(),// 一个用户限领几张
    num:Joi.number(), // 发券数量，-1为无限量状态
    active_num:Joi.number(), // 已激活数量
    mode:Joi.string(), // 券类型，RANDOM随机券，FIXED固定金额
    status:Joi.string(), // OK\INVALID
    activeAt:Joi.string(),// -为领取时即生效，日期格式为激活时间
    expiredType:Joi.number(),// 券失效类型，0固定时间，1一段时间失效
    expiredInfo:Joi.string(),// 失效详情，8有效期为8天，Date&Date，第一个为起始有效时间，第二个为终止有效时间
    name:Joi.string(),// 券名称
    price:Joi.string(),// 券金额，单位元，字符串形式，注意转换，随机券为MONEY&MONEY，只能填整数，比如3&9，用户取券时会获得一张3到9元之间的优惠券
    condition:Joi.number(),// 券试用条件，0为任意条件，按实际付费计算，单位为元
    fit:Joi.array(),// 列表
    information:Joi.string() // 券信息
 */

// 优惠券包数据结构
/*
    owner_id:Joi.string(),
    type:Joi.number(), // 0，代金券，1，免邮券
    code:Joi.string(), // 券码
    coupon_id:Joi.string(),// 券模板ID，免邮券没有
    status:Joi.string(), // OK\INACTIVE\EXPIRED\USED
    order_id:Joi.string(),// 使用该券的订单号，支付完成以后进行接口回调
    activeAt:Joi.string(),// 生效时间戳
    expiredAt:Joi.string(),// 券失效时间戳
    name:Joi.string(),// 券名称
    amount:Joi.number(),// 券金额，单位分
    price:Joi.number(),// 券金额，单位元
    condition:Joi.number(),// 券试用条件，0为任意条件，按实际付费计算
    fit:Joi.array(),// 列表
    information:Joi.string() // 券信息
 */

let push = (owner_id,coupon_id,callback,weeks) => {
    if(coupon_id){
        // 推入一张代金券
        // 1、获取优惠券模板信息
        let couponT = new CouponT();
        couponT.coupon_id  = coupon_id;
        couponT.getCouponTbyQuery((err,data) => {
            if (err){
                callback({
                    error_code:2001,
                    error_msg:err.message
                });
            }else {
                if (data){
                    if (data.Count === 1){
                        // cT对象，才是
                        let cT = data.Items[0].attrs;
                        if (cT.coupon_id){
                            let couponI = new CouponI();
                            couponI.owner_id = owner_id;
                            couponI.coupon_id = cT.coupon_id;
                            // 1、根据模板状态，判断是否可以领券
                            if (cT.status === 'OK'){
                                // 2、确定该优惠券激活张数，是否满足领取条件
                                // 若cT.num === -1，则无限领券
                                if (cT.num > cT.active_num || cT.num === -1){
                                    // 3、该用户该类型券张数，是否满足领取条件
                                    couponI.getOnesTargetCouponNum((err,cNum)=>{
                                        if (err){
                                            callback({
                                                error_code:2003,
                                                error_msg:err.message
                                            });
                                        }else {
                                            cNum = cNum.Count;
                                            if (cNum < cT.limit){
                                                // 4、确定券激活
                                                let nowTime = new Date();
                                                nowTime = nowTime.getTime();
                                                if (cT.activeAt === '-'){
                                                    couponI.activeAt = nowTime;
                                                    couponI.status = 'OK';
                                                }else {
                                                    let tTime = new Date(cT.activeAt);
                                                    tTime = tTime.getTime();
                                                    couponI.activeAt = tTime;
                                                    if (nowTime > tTime){
                                                        couponI.status = 'OK'
                                                    }else {
                                                        couponI.status = 'INVALID'
                                                    }
                                                }
                                                // 5、确定券失效时间戳
                                                if(cT.expiredType === 0){
                                                    // 指定时间失效
                                                    let tTime = new Date(cT.expiredInfo);
                                                    couponI.expiredAt = tTime.getTime();
                                                }else {
                                                    // 一定时间段后失效
                                                    aDay = 1000*60*60*24;
                                                    couponI.expiredAt = nowTime+aDay*parseInt(cT.expiredInfo);
                                                }
                                                // 6、根据券类型，创建price和amount
                                                if (cT.mode === 'RANDOM'){
                                                    let min = parseInt(cT.price.split('&')[0]);
                                                    let max = parseInt(cT.price.split('&')[1]);
                                                    let finalP = min + Math.floor(Math.random() * (max - min));
                                                    // 角
                                                    let jiao = Math.ceil(Math.random()*9);
                                                    finalP = finalP + jiao/10;
                                                    couponI.price = finalP;
                                                    couponI.amount = parseInt(finalP*100);
                                                }else if (cT.mode === 'FIXED'){
                                                    couponI.price = Number(Number(cT.price).toFixed(2));
                                                    couponI.amount = parseInt(Number(cT.price)*100);
                                                }
                                                // 7、复制其他信息
                                                couponI.type = 0;
                                                couponI.name = cT.name;
                                                couponI.condition = cT.condition;
                                                couponI.fit = cT.fit;
                                                couponI.information = cT.information;

                                                couponI.create((err,conpon) => {
                                                    if(err){
                                                        callback({
                                                            error_code:2005,
                                                            error_msg:err.message
                                                        });
                                                    }else {
                                                        // 8、更新券激活数量
                                                        couponT.createdAt = cT.createdAt;
                                                        if (cT.num === cT.active_num+1){
                                                            // 更新状态
                                                            couponT.status = 'INVALID';
                                                            couponT.updateCouponTConsumeNum((err,resp)=>{
                                                                if (err){
                                                                    callback({
                                                                        error_code:2006,
                                                                        error_msg:err.message
                                                                    });
                                                                }else {
                                                                    callback({
                                                                        error_code:0,
                                                                        error_msg:'ok',
                                                                        data:conpon.attrs
                                                                    });
                                                                }
                                                            })
                                                        }else {
                                                            // 只更新数量
                                                            couponT.status = 'OK';
                                                            couponT.updateCouponTConsumeNum((err,resp)=>{
                                                                if (err){
                                                                    callback({
                                                                        error_code:2007,
                                                                        error_msg:err.message
                                                                    });
                                                                }else {
                                                                    callback({
                                                                        error_code:0,
                                                                        error_msg:'ok',
                                                                        data:conpon.attrs
                                                                    });
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                            }else {
                                                callback({
                                                    error_code:2004,
                                                    error_msg:'最多可以领取'+cT.limit+'张'
                                                });
                                            }
                                        }
                                    })
                                }else {
                                    callback({
                                        error_code:2002,
                                        error_msg:'该类型券已被领完了'
                                    });
                                }
                            }else {
                                callback({
                                    error_code:2001,
                                    error_msg:'该类型券暂时不能领取'
                                });
                            }
                        }else {
                            callback({
                                error_code:2004,
                                error_msg:'获取优惠券模板错误'
                            });
                        }
                    }else {
                        callback({
                            error_code:2003,
                            error_msg:'优惠券模板错误'
                        });
                    }
                }else {
                    callback({
                        error_code:2002,
                        error_msg:'查询错误'
                    });
                }
            }
        })
    }else {
        // 推入免邮券
        let couponI = new CouponI();
        if(typeof weeks === 'number'){
            weeks = parseInt(weeks);// 将weeks格式化
            // 调用pull接口
            pullCoupon(owner_id,1,(resp)=>{
                if (resp.error_code === 0){
                    // 获取该家庭已经拥有的免邮券张数
                    let haveActivedMYQ = true;// 用户是否存在已经激活的免邮券
                    let weekOffset = 0;// 保证家庭每周只有一张免邮券
                    if (!resp.data.valid){
                        haveActivedMYQ = false;
                    }else {
                        weekOffset = parseInt(resp.data.valid.Count+resp.data.inactive.Count);
                    }
                    for (let i=0;i<weeks;i++){
                        //插入对应张数的免邮券
                        if (i===0&&!haveActivedMYQ){
                            // 没有激活券，第一张券设置为已激活
                            couponI.owner_id = owner_id;
                            couponI.type = 1;
                            couponI.coupon_id = 'MYQ';
                            couponI.status = 'OK';
                            couponI.activeAt = cal_week_first_second(parseInt(weekOffset+i));
                            couponI.expiredAt = cal_week_last_second(parseInt(weekOffset+i));
                            couponI.name = '无限制免邮券';
                            couponI.amount = 0;
                            couponI.price = 0;
                            couponI.condition = 0;
                            couponI.fit = ['*'];
                            couponI.information = '1、单笔支付满0元可使用\n2、每个会员家庭每周只可以使用一张';
                            couponI.create((err,conpon) => {
                                if(err){
                                    callback({
                                        error_code:2000,
                                        error_msg:i+'免邮券创建错误'
                                    });
                                }
                            });
                            continue;
                        }
                        // 已有激活券，所有券都设置为未激活
                        couponI.owner_id = owner_id;
                        couponI.type = 1;
                        couponI.coupon_id = 'MYQ';
                        couponI.status = 'INVALID';
                        couponI.activeAt = cal_week_first_second(parseInt(weekOffset+i));
                        couponI.expiredAt = cal_week_last_second(parseInt(weekOffset+i));
                        couponI.name = '无限制免邮券';
                        couponI.amount = 0;
                        couponI.price = 0;
                        couponI.condition = 0;
                        couponI.fit = ['*'];
                        couponI.information = '1、单笔支付满0元可使用\n2、每个会员家庭每周只可以使用一张';
                        couponI.create((err,conpon) => {
                            if(err){
                                callback({
                                    error_code:2000,
                                    error_msg:i+'免邮券创建错误'
                                });
                            }else {
                                if (i === (weeks-1)){
                                    callback({
                                        error_code:0,
                                        error_msg:'ok'
                                    });
                                }
                            }
                        })

                    }
                }else {
                    callback({
                        error_code:resp.error_code,
                        error_msg:resp.error_msg
                    })
                }
            });
        }else {
            callback({
                error_code:2001,
                error_msg:'weeks应该是一个number'
            });
        }

    }
};

// 支持方法

// 给出偏离当周的周数，计算指定周————周一 00：00：00的时间戳
// 后一周是正数，前一周是负数
let cal_week_first_second = (n)=>{
    let today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    let oneday = 1000*60*60*24;
    let day = today.getDay();
    today = today.getTime();
    let mon;
    if (day){
        mon = today-(day-1)*oneday;
    }else {
        // 周日
        mon = today-6*oneday;
    }
    return String(mon+n*7*oneday)
};

// 给出偏离当周的周数，计算指定周————周日 23：59：59的时间戳
// 后一周是正数，前一周是负数
let cal_week_last_second = (n)=>{
    let today = new Date();
    today.setHours(23);
    today.setMinutes(59);
    today.setSeconds(59);
    today.setMilliseconds(0);
    let oneday = 1000*60*60*24;
    let day = today.getDay();
    today = today.getTime();
    let mon;
    if (day){
        mon = today+(7-day)*oneday;
    }else {
        mon = today;
    }
    return new Date(mon+n*7*oneday).getTime();
};

module.exports = push;
