/**
 * Created by Mbb on 2018/4/18.
 */

// 订阅商品支付回调
const createSubsOrder = require('../../subscribe/subscribe/interface/createSubsOrder');
const PayOrder = require('../models/PayOrder');

// 扣减用户余额
const updateUserBalance = require('../../passport/interface/updateUserBalance');
let updateUserBalanceFunc = (user_id,amount)=>{
    return new Promise((resolve,reject)=>{
        updateUserBalance({
            user_id:user_id,
            consume:amount,// 记录消费额
            callback:(resp)=>{
                if (resp.error_code){
                    reject(resp);
                }else {
                    resolve(resp.data);
                }
            }
        })
    })
};

// 记录返现流水
const updateFamilyBalace = require('../../family/interface/updateFamilyBalance');
let updateFamilyBalanceFunc = (user_id,family_id,amount)=>{
    return new Promise((resolve,reject)=>{
        updateFamilyBalace({
            user_id:user_id,
            family_id:family_id,
            consume:amount,
            callback:(resp)=>{
                if (resp.error_code){
                    reject(resp);
                }else {
                    resolve(resp.data);
                }
            }
        })
    })
};

// 格式化时间
const format = '___-_-_ _:_:__';
const formatTime = time =>
    new Date(
        time.split('')
            .map((value, index) => value + format[index])
            .join('').replace(/_/g, '')
    );

module.exports = (msg)=> {
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
                // 更新支付单
                if (err){
                    console.error(err.message)
                }else {
                    if (pom){
                        pom = pom.attrs;
                        // user_id family_id wares_id 总价 运费 运费折扣 家庭余额消耗 用户余额消耗 用户实际支付 周
                        let prop = pom.prop;
                        prop = prop.split('&');
                        let user_id =  prop[0];
                        let family_id = prop[1];
                        let wares_id = prop[2];
                        let price = prop[3];
                        let freight = prop[4];
                        let freight_discount = prop[5];
                        let family_balance_consume = prop[6];
                        let user_balance_consume = prop[7];
                        let act_pay = prop[8];
                        let weeks = prop[9];
                        let vip = prop[10];
                        let num = prop[11];
                        weeks = weeks.split('#');
                        createSubsOrder({
                            wares_id:wares_id,
                            vip:Number(vip),
                            user_id:user_id,
                            family_id:family_id,
                            num:Number(num),
                            freight:Number(freight),
                            total:Number(price) ,
                            stages:weeks.length,
                            freight_discount:Number(freight_discount),
                            family_balance_consume:Number(family_balance_consume),
                            user_balance_consume:Number(user_balance_consume),
                            actual_payment:Number(act_pay),
                            weeks:weeks
                        }).then((resp)=>{
                            let handle = async ()=>{
                                try {
                                    if (Number(family_balance_consume)){
                                        await updateFamilyBalanceFunc(user_id,family_id,Number(family_balance_consume));
                                    }
                                    if (Number(user_balance_consume)){
                                        await updateUserBalanceFunc(user_id,Number(user_balance_consume));
                                    }
                                }catch (err){
                                    console.error(err)
                                }
                            };
                            handle();
                        },(err)=>{
                            if (err){
                                console.error(err);
                            }
                            console.error(pom+'订单创建失败');
                        })
                    }else {
                        console.error('更新错误')
                    }
                }
            })
        }
    });
};