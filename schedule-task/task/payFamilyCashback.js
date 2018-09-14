// 每天中午11点开始定时获取

// 步骤一，获取返现schedule，步骤二，获取返现
// 向消费家庭进行返现，获取需要返现的记录
const setHandling = require('../utils/handling');
const done = require('../utils/done');
const setCancel = require('../utils/cancel');

const Schedule = require('../models/Schedule');
// 为用户家庭开始返现
const Family = require('../models/Family');
const Account = require('../models/Account');

// 基本方法封装
// 获取一单下的account
const getAccounts = (family_id,order_id)=>{
    return new Promise((resolve,reject)=>{
        let acc = new Account();
        acc.owner_id = family_id;
        acc.order_id = order_id;
        acc.getAccountsByOrderId((err,data)=>{
            if (err){
                reject(err.message)
            }else {
                resolve(data)
            }
        })
    });
};

// 更新家庭余额
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

// 更新account的状态
const updateAccountStatus = (family_id,object_id)=>{
    return new Promise((resolve,reject)=>{
        let acc = new Account();
        acc.owner_id = family_id;
        acc.object_id = object_id;
        acc.status = 1;
        acc.setAccountStatus((err)=>{
            if (err){
                reject(err.message)
            }else {
                resolve(1);
            }
        })
    });
};

module.exports = () => {
    let last_key = 1;
    while (last_key){
        last_key = '';
        let schedule = new Schedule();
        let t = String(Date.now());
        schedule.method = '/family/cashback';
        schedule.getSchedules(t,last_key,(err,data)=>{
            if (err){
                console.log('数据库连接不正确',err.message)
            }else {
                // 将item置为处理中,防止下一个请求重复请求
                if (data.Count>0){
                    if (data.LastEvaluatedKey){
                        last_key = data.LastEvaluatedKey;
                    }
                    // 开始处理
                    let handle = async ()=>{
                        try {
                            for (let i=0;i<data.Count;i++){
                                let d = data.Items[i].attrs;
                                await setHandling('/family/cashback',d.object_id);
                                let user_id = d.content.split('&&')[0];
                                let family_id = d.content.split('&&')[1];
                                let order_id = d.content.split('&&')[2];
                                // 任务0 获取所有家庭和用户下的待返现记录
                                let accs = await getAccounts(family_id,order_id);
                                // 任务1 计算总返现额
                                let cashback = 0;
                                for (let i=0;i<accs.Items.length;i++){
                                    let r = accs.Items[i].attrs;
                                    cashback = cashback + Number(r.amount);
                                }
                                // 任务2 更新家庭余额
                                if (cashback){
                                    await updateFamilyBalance(user_id,family_id,cashback);
                                    // 任务3 更新account的状态
                                    for (let i=0;i<accs.Items.length;i++){
                                        let r = accs.Items[i].attrs;
                                        await updateAccountStatus(family_id,r.object_id);
                                    }
                                }
                                await done('/family/cashback',d.object_id);
                                //setCancel('/family/cashback',d.object_id);
                            }
                        }catch (err){
                            console.error('返现处理错误',err)
                        }
                    };
                    handle();
                }else {
                    console.log(t+'无数据');
                }
            }
        })
    }
};

//const BuyRecord = require('../models/BuyRecord');
// // 获取指定的购买记录
// const getBuyRecord = (user_id,order_id)=>{
//     return new Promise((resolve,reject)=>{
//         let record = new BuyRecord();
//         record.user_id = user_id;
//         record.order_id = order_id;
//         record.getRecordByOrderid((err,data)=>{
//             if (err){
//                 reject(err.message)
//             }else {
//                 resolve(data)
//             }
//         })
//     });
// };