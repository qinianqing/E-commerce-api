// 这是一个单线程服务
const schedule = require('node-schedule');

// 开始处理流数据
const transGoods2ES = require('./task/transGoods2ES');
const examineReverse = require('./task/examineRefundOrder');
const restoreStock = require('./task/restoreStock');
const transSubs2ES = require('./task/transSubs2ES');
transGoods2ES.start();
examineReverse.start();
restoreStock.start();
transSubs2ES.start();

// 每30秒发生一次

let rule = new schedule.RecurrenceRule();
rule.second = [0,30];

// 取消订单
const cancelOrder = require('./task/cancelOrder');

// 将不同的处理method分流到不同的方法里
let j = schedule.scheduleJob(rule,()=>{
    console.log('每30S任务启动');

    cancelOrder();// 取消订单
});


// 每10分钟发生一次，保证sharedInditor永远有效
let rule1 = new schedule.RecurrenceRule();
rule1.minute = [0,10,20,30,40,50];

schedule.scheduleJob(rule1,()=>{
    console.log('每10分钟任务启动');

    // 重启监控js_goods流服务，防止Shard iterator过期
    transGoods2ES.restart();
    examineReverse.restart();
    restoreStock.restart();
    // transSubs2ES.restart();
});

// 每30分钟发生一次，向仓库推送订单
const sendOrder2wh = require('./task/sendOrder2Warehouse');

let rule6 = new schedule.RecurrenceRule();
rule6.minute = [0,30];
schedule.scheduleJob(rule6,()=>{
    console.log('每30分钟任务启动');
    sendOrder2wh();
});


// 每天11：00发生
const payFamily = require('./task/payFamilyCashback');
const payInviteCashback = require('./task/payInviteCashback');
let rule2 = new schedule.RecurrenceRule();
rule2.hour = 11;
schedule.scheduleJob(rule2,()=>{
    console.log('每天11点启动');
    // 结算会员返现
    payFamily();
    // 结算邀请返现
    payInviteCashback();
});

// 每天0：00发生
const updateFamilyVipStatus = require('./task/updateFamilyVipStatus');
const syncAllGoods2Warehouse = require('./task/syncAllGoods2Warehouse');
// const getSubscribeCreateOrder = require('./task/getSubscribeCreateOrder');
// const payVipCreateOrder = require('./task/getSubscribeCreateOrder');
let rule5 = new schedule.RecurrenceRule();
rule5.hour = 0;
schedule.scheduleJob(rule5,()=>{
    console.log('每天0点启动');
    // 结算会员返现
    updateFamilyVipStatus();
    syncAllGoods2Warehouse();
    // getSubscribeCreateOrder();
    // payVipCreateOrder();
});

// 每小时发生一次
let rule4 = new schedule.RecurrenceRule();
rule4.minute = 0;

const token = require('./task/getWxAccessToken');
const fwhToken = require('./task/getFwhAccessToken');
const syncExpress = require('./task/syncOrderExpressMsg');
schedule.scheduleJob(rule4,()=>{
    console.log('每小时任务启动');
    // 获取wx_access_token
    token.fetch();
    fwhToken.fetch();
    syncExpress();
});
// 任务启动就先获取一次token，保证线上时刻都有有效token
token.fetch();
fwhToken.fetch();

console.log('任务启动');