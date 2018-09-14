const router = require('express').Router();

const times = require('../utils/utils');

const axios = require('axios');

const Package = require('../models/Subscribe-package');

const addBuyRecord = require('../../../order/interface/addBuyRecordWithoutCB');
let addBuyRecordFunc = (user_id,order_id,family_id,parcel_id,skuItems)=>{
    return new Promise((resolve,reject)=>{
        addBuyRecord({
            user_id:user_id,
            order_id:order_id,
            family_id:family_id,
            parcel_id:parcel_id,
            skuItems:skuItems,
            callback:(resp)=>{
                if (resp.error_code){
                    reject(resp);
                }else {
                    resolve(1);
                }
            }
        })
    })
};

const { secret } = require('../../config');
const sendFWHMsg = require('../../../../utils/sendMsg/fwhTemplateMsg');
const sendWaMsg = require('../../../../utils/sendMsg/waTemplateMsg');
const getUser = require('../../../passport/interface/getUserInfo');
// 发货通知，向服务号发信息
router.post('/send-delivery-msg',(req,res,next)=>{
    let p = req.body;
    if(secret !== p.secret){
        return res.sendStatus(404)
    }
    if (!p.user_id){
        return res.send('缺少user_id');
    }
    if (!p.user_id){
        return res.send('缺少user_id');
    }
    getUser({
        user_id:p.user_id,
        callback:(resp)=>{
            if (resp.error_code){
                return res.send(resp)
            }
            let u = resp.data;
            if (u.fwh_open_id){
                sendFWHMsg.deliveryMsg(u.fwh_open_id,'订阅商品已发货',p.id,p.express_brand,p.express_id,'签收后可对商品进行评价','page/subscribe/order/detail?id='+p.id,'http://jinshi.life');
                res.sendStatus(200)
            }else {
                // 发送小程序模板消息
                sendWaMsg.orderDelivery(p.user_id,p.express_id,p.express_brand,p.id);
                res.sendStatus(200)
            }
        }
    })
});

// 签收
router.post('/receipt',(req,res,next)=>{
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    if (!req.body.subs_order_id || !req.body.week){
        return res.send({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
    let  pack = new Package();
    pack.subs_order_id = req.body.subs_order_id;
    pack.week = req.body.week;
    pack.getPackage((err,data)=>{
        if (err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        if (!data){
            return res.send({
                error_code:5004,
                error_msg:'错误订单号'
            })
        }
        pack.updateByReceipt((err,d)=>{
            if (err){
                return res.send({
                    error_code:5005,
                    error_msg:err.message
                })
            }
            res.send({
                error_code:0,
                error_msg:'ok'
            });
            // 加入购买记录，只对第一次购买有效
            data = data.attrs;
            if (data.index === 1){
                let handle = async ()=>{
                    try {
                        await addBuyRecordFunc(req.currentUser.user_id, data.subs_order_id, data.family_id, data.parcel_id||'-', data.sku_detail);
                    }catch (err){
                        console.error(err.message)
                    }
                };
                handle();
            }
        })
    })
});

// 根据week获取某周的邮包列表
router.get('/week-list',(req,res,next)=>{
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    if (!req.query.week || !req.query.family_id){
        return res.send({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
    if(req.query.last_key){
        req.query.last_key  = decodeURIComponent(req.query.last_key);
        req.query.last_key = JSON.parse(req.query.last_key);
    }
    let pack = new Package();
    pack.user_id = req.currentUser.user_id;
    pack.family_id = req.query.family_id;
    pack.week = req.query.week;
    pack.getPackageByUserAndWeek((err,data)=>{
        if (err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        res.send({
            error_code:0,
            error_msg:'ok',
            data:data
        })
    },req.query.last_key)
});

// 获取包裹物流详情
router.get('/logistic',(req,res,next)=>{
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    if (!req.query.subs_order_id || !req.query.week){
        return res.send({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
    let pack = new Package();
    pack.subs_order_id = req.query.subs_order_id;
    pack.week = req.query.week;
    pack.getPackage((err,data)=>{
        if (err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        if (!data){
            return res.send({
                error_code:5004,
                error_msg:'错误订单号'
            })
        }
        data = data.attrs;
        if (data.express_id && data.express_brand){
            let options = {
                url:'https://api.trackingmore.com/v2/trackings/realtime',
                method:'POST',
                headers:{
                    "Content-Type":"application/json",
                    "Trackingmore-Api-Key":"2494dbee-178f-426a-a28d-d6d6d003b9da"
                },
                data:JSON.stringify({
                    tracking_number:data.express_id,
                    carrier_code:data.express_brand || 'jd'
                })
            };
            let express_brand = '';
            switch (data.express_brand){
                case 'jd':
                    express_brand = '京东快递';
                    break;
                case 'sf-express':
                    express_brand = '顺丰速递';
                    break;
                case 'sto':
                    express_brand = '申通快递';
                    break;
                case 'yto':
                    express_brand = '圆通快递';
                    break;
                case 'zto':
                    express_brand = '中通快递';
                    break;
                case 'yunda':
                    express_brand = '韵达快递';
                    break;
                case 'china-ems':
                    express_brand = 'EMS';
                    break;
                case 'china-post':
                    express_brand = '中国邮政';
                    break;
                case 'deppon':
                    express_brand = '德邦物流';
                    break;
                case 'rufengda':
                    express_brand = '如风达';
                    break;
                case 'ttkd':
                    express_brand = '天天快递';
                    break;
                case 'qfkd':
                    express_brand = '全峰快递';
                    break;
                case 'cess':
                    express_brand = '国通快递';
                    break;
                case 'bestex':
                    express_brand = '百世快递';
                    break;
                case 'ane66':
                    express_brand = '安能物流';
                    break;
            }
            axios(options).then((resp)=>{
                if (resp.data.meta.code === 200){
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:{
                            express_id:data.express_id,
                            express_brand:express_brand,
                            msg:resp.data.data.items[0].origin_info.trackinfo
                        }
                    })
                }else {
                    res.send({
                        error_code:5004,
                        error_msg:resp.data.meta.message
                    })
                }
            },(err)=>{
                res.send({
                    error_code:5003,
                    error_msg:err.message
                })
            })
        }else {
            return res.send({
                error_code:5005,
                error_msg:'该订单尚未发货'
            })
        }
    })
});

const getFamily = require('../../../family/interface/getFamily');

router.post('/update',(req,res,next)=>{
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    if (!req.body.subs_order_id || !req.body.week){
        return res.send({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
    let  pack = new Package();
    pack.subs_order_id = req.body.subs_order_id;
    pack.week = req.body.week;
    pack.express_id = req.body.express_id;
    pack.express_brand = req.body.express_brand;
    pack.updateByDelivery((err,data)=>{
        if (err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        if (!data){
            return res.send({
                error_code:5004,
                error_msg:'错误订单号'
            })
        }
        pack.updateByReceipt((err,data)=>{
            if (err){
                return res.send({
                    error_code:5005,
                    error_msg:err.message
                })
            }
            res.send({
                error_code:0,
                error_msg:'ok'
            })
        })
    })
});
// erp更新接口
router.post('/update-status',(req,res,next)=>{
    if(req.body.secret === secret){
        if (!req.body.subs_order_id || !req.body.week){
        return res.send({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
    let  pack = new Package();
    pack.subs_order_id = req.body.subs_order_id;
    pack.week = req.body.week;
    pack.express_id = req.body.express_id;
    pack.express_brand = req.body.express_brand;
    pack.relation_order_id=req.body.relation_order_id;
    pack.updateByDelivery((err,data)=>{
        if (err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        if (!data){
            return res.send({
                error_code:5004,
                error_msg:'错误订单号'
            })
        }
        res.send({
            error_code: 0,
            error_msg: 'ok',
            data: data
        })
    })
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

// erp后台获取用户全部订阅
router.get('/list',function (req,res,next) {
    // 0,1
    if(req.query.secret === secret){
        let pack = new Package();
        let n = req.query.n;
        pack.user_id = req.query.user_id;
        pack.week = times.cal_this_week_first_second(Number(n));
        pack.getPackageByUserAndWeek2((err,data)=>{
            if (err){
                res.send({
                    error_code:5002,
                    error_msg:err.message
                })
            }else {
                res.send(data)
            }
        })
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

// 获取包裹详情
router.get('/',(req,res,next)=>{
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    if (!req.query.subs_order_id || !req.query.week){
        return res.send({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
    let  pack = new Package();
    pack.subs_order_id = req.query.subs_order_id;
    pack.week = req.query.week;
    pack.getPackage((err,data)=>{
        if (err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        if (!data){
            return res.send({
                error_code:5004,
                error_msg:'错误邮包信息'
            })
        }
        // 获取家庭
        data = data.attrs;
        getFamily({
            user_id:req.currentUser.user_id,
            family_id:data.family_id,
            callback:(resp)=>{
                if (resp.error_code){
                    return res.send(resp)
                }
                data.family = resp.data;
                res.send({
                    error_code:0,
                    error_msg:'ok',
                    data:data
                })
            }
        })
    })
});

module.exports = router;