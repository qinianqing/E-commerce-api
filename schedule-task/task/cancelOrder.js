// 取消订单
const setHandling = require('../utils/handling');
const done = require('../utils/done');
const setCancel = require('../utils/cancel');

const Schedule = require('../models/Schedule');

const Order = require('../models/Order');

module.exports = () => {
    let last_key = 1;
    while (last_key){
        last_key = '';
        let schedule = new Schedule();
        let t = String(Date.now());
        schedule.method = '/order/cancel';
        schedule.getSchedules(t,last_key,(err,data)=>{
            if (err){
                console.log('数据库连接不正确',err.message)
            }else {
                // 将item置为处理中,防止下一个请求重复请求
                if (data.Count>0){
                    if (data.LastEvaluatedKey){
                        last_key = data.LastEvaluatedKey;
                    }
                    let order = new Order();
                    let handle = async ()=>{
                        for (let i=0;i<data.Count;i++){
                            let d = data.Items[i].attrs;
                            await setHandling('/order/cancel',d.object_id);
                            let user_id = d.content.split('&&')[0];
                            let order_id = d.content.split('&&')[1];
                            order.user_id = user_id;
                            order.order_id = order_id;
                            order.status = 'CANCEL';
                            order.updateStatus((err)=>{
                                if (err){
                                    setCancel('/order/cancel',d.object_id);
                                }else {
                                    done('/order/cancel',d.object_id);
                                }
                            })
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