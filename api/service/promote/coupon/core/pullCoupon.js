// 获取某个用户/家庭的全部优惠券，调用接口时要更新券的状态
// author by Ziv
// 2018-3-13

const CouponI = require('../models/Coupon-wallet');

/*
* @param owner_id 获取
* @param type 0/1 0是优惠券，1是免邮券
*
* @return
*                           error_code:0,
                            error_msg:'ok',
                            data:{
                                valid:{
                                    Count:items.length,
                                    Items:items
                                },
                                inactive:{
                                    Count:notActItems.length,
                                    Items:notActItems
                                }
                            }
 */


let pull = (owner_id,type,callback) => {
    // 获取优惠券列表
    if (owner_id){
        let couponI = new CouponI();
        couponI.owner_id = owner_id;
        let cType = 0;
        if (type === 1){
            cType = 1;
        }
        couponI.queryOnesCoupon((err,data)=>{
            if (err){
                callback({
                    error_code:2002,
                    error_msg:err.message
                });
            }else {
                if (data){
                    if (data.Items.length){
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
                        let items = [];
                        let notActItems = [];
                        let changeItems = [];
                        let nowTime = new Date();
                        nowTime = nowTime.getTime();
                        for (let i=0;i<data.Items.length;i++){
                            let item = data.Items[i].attrs;
                            item.activeAt = Number(item.activeAt);
                            item.expiredAt = Number(item.expiredAt);
                            // 判断优惠券状态
                            if (item.status === 'OK'){
                                // 判断券是否超过时效期
                                if (nowTime < item.expiredAt){
                                    items.push(item);
                                }else {
                                    item.status = 'INVALID';
                                    changeItems.push(item);
                                }
                            }else if (item.status === 'INVALID'){
                                // 判断券是否已经被使用
                                if (!item.order_id){
                                    // 判断券是否进去激活期，并小于失效期
                                    if (nowTime >= item.activeAt && nowTime <item.expiredAt){
                                        // 进入可用状态
                                        item.status = 'OK';
                                        items.push(item);
                                        changeItems.push(item);
                                    }else if (nowTime < item.activeAt){
                                        // 还没有到激活使用期限
                                        notActItems.push(item);
                                    }else if (nowTime >= item.expiredAt){
                                        // 超期失效
                                        item.status = 'INVALID';
                                        changeItems.push(item);
                                    }
                                }
                            }
                        }

                        // 返回优惠券信息
                        callback ({
                            error_code:0,
                            error_msg:'ok',
                            data:{
                                valid:{
                                    Count:items.length,
                                    Items:items
                                },
                                inactive:{
                                    Count:notActItems.length,
                                    Items:notActItems
                                }
                            }
                        });

                        // 修改状态
                        for (let i=0;i<changeItems.length;i++){
                            let cw = new CouponI();
                            cw.owner_id = changeItems[i].owner_id;
                            cw.createdAt = changeItems[i].createdAt;
                            cw.status = changeItems[i].status;
                            cw.updateCouponStatus((err)=>{
                                if(err){
                                    console.error(err.message+'***'+i+'***'+cw.owner_id+'***'+cw.createdAt)
                                }
                            })
                        }
                    }else {
                        callback({
                            error_code:0,
                            error_msg:'ok',
                            data:{
                                valid:{
                                    Count:0,
                                    Items:[]
                                },
                                inactive:{
                                    Count:0,
                                    Items:[]
                                }
                            }
                        });
                    }
                }else {
                    callback({
                        error_code:2003,
                        error_msg:'获取优惠券列表错误'
                    });
                }

            }
        },cType);
    }else {
        callback({
            error_code:2001,
            error_msg:'缺少owner_id'
        });
    }
};

module.exports = pull;