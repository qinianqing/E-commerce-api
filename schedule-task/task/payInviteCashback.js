// 每天上午11点钟结算

const Schedule = require('../models/Schedule');
const User = require('../models/User');
const Account = require('../models/Account');


const setHandling = require('../utils/handling');
const done = require('../utils/done');
const setCancel = require('../utils/cancel');

// 更新家庭余额
const updateUserBalance = (user_id)=>{
    return new Promise((resolve,reject)=>{
        let user = new User();
        user.user_id = user_id;
        user.updateBalanceCashback(5,(err,data)=>{
            if (err){
                reject(err.message)
            }else {
                resolve(1)
            }
        })
    });
};



// 创建account
const createAcc = (user_id,amount,order_id)=>{
    return new Promise((resolve,reject)=>{
        let acc = new Account();
        acc.owner_id = user_id;
        acc.type = 1;
        acc.status = 1;
        acc.detail = "订单："+order_id+'邀请返现';
        acc.order_id = '-';
        acc.amount = amount;
        acc.create((err)=>{
            if (err){
                reject(err.message)
            }else {
                resolve(1);
            }
        })
    });
};

const getAccounts = (uid,order_id)=>{
    return new Promise((resolve,reject)=>{
        let acc = new Account();
        acc.owner_id = uid;
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

// 更新account的状态
const updateAccountStatus = (uid,object_id)=>{
    return new Promise((resolve,reject)=>{
        let acc = new Account();
        acc.owner_id = uid;
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
        schedule.method = '/invite/paycash';
        let t = String(Date.now());
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
                                await setHandling('/invite/paycash',d.object_id);
                                let user_id = d.content.split('&&')[0];
                                let order_id = d.content.split('&&')[1];
                                // 任务2 更新用户余额
                                await updateUserBalance(user_id);

                                // 获取账目，并更新
                                let accs = await getAccounts(user_id,order_id);
                                // 任务3 更新account的状态
                                for (let i=0;i<accs.Items.length;i++){
                                    let r = accs.Items[i].attrs;
                                    await updateAccountStatus(user_id,r.object_id);
                                }

                                // 任务3 更新account
                                // await createAcc(user_id,5,order_id);

                                await done('/invite/paycash',d.object_id);
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