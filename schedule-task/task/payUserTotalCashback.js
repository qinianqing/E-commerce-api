// 每周一上午11点钟结算上上周的所有已支付用户的返现信息

// 获取某周第一秒
let cal_week_first_second = (n)=>{
    let today = new Date();
    let day = today.getDay();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    let oneday = 1000*60*60*24;
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

// 全场满额返现设置
let discount_cal = (money) => {
    money = Number(money.toFixed(2));
    if(money < 99){
        return 0;
    }else if (money>=99 && money <198){
        return 5;
    }else if (money>=198 && money <396){
        return 15;
    }else if (money>=396 && money<600){
        return 36;
    }else if (money>=600 && money <1000){
        return 60;
    }else if (money >= 1000){
        return 110;
    }
};

const Schedule = require('../models/Schedule');
const Record = require('../models/BuyRecord');
const User = require('../models/User');
const Account = require('../models/Account');


const setHandling = require('../utils/handling');
const done = require('../utils/done');
const setCancel = require('../utils/cancel');

// 获取某周某用户所有购买的记录
const getAllUserWeekRecord = (user_id,week)=>{
    return new Promise((resolve,reject)=>{
        let record = new Record();
        record.user_id = user_id;
        record.week = week;
        record.getWeekRecordsJoinTotalCB((err,data)=>{
            if (err){
                reject(err.message);
            }else {
                resolve(data);
            }
        })
    })
};

// 更新家庭余额
const updateUserBalance = (user_id,amount)=>{
    return new Promise((resolve,reject)=>{
        let user = new User();
        user.user_id = user_id;
        user.updateBalanceCashback(Number(amount),(err,data)=>{
            if (err){
                reject(err.message)
            }else {
                resolve(1)
            }
        })
    });
};



// 创建account
const createAcc = (user_id,amount,week)=>{
    return new Promise((resolve,reject)=>{
        let y = String(new Date(Number(week)).getFullYear());
        y = y.split('');
        let year = y[2]+y[3];
        let acc = new Account();
        acc.owner_id = user_id;
        acc.type = 1;
        acc.status = 1;
        acc.detail = year+'年'+getWeekNumber(week)+'周满额返现';
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


module.exports = () => {
    let last_key = 1;
    while (last_key){
        last_key = '';
        let schedule = new Schedule();
        let t = cal_week_first_second(-2);// 获取上上周第一秒的时间戳
        schedule.method = '/user/buy';
        schedule.getSchedulesByOccur(t,last_key,(err,data)=>{
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
                                await setHandling('/user/buy',d.object_id);
                                let user_id = d.content;
                                // 任务0 获取所有家庭和用户下的待返现记录
                                let results = await getAllUserWeekRecord(user_id,t);
                                // 任务1 计算总返现额
                                let total = 0;
                                for (let i=0;i<results.Items.length;i++){
                                    let t = results.Items[i].attrs;
                                    total = total + Number(t.price)*Number(t.num);
                                }
                                let amount = discount_cal(total);
                                if (amount){
                                    // 任务2 更新用户余额
                                    await updateUserBalance(user_id,amount);
                                    // 任务3 创建account
                                    await createAcc(user_id,amount,t);
                                }
                                await done('/user/buy',d.object_id);
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