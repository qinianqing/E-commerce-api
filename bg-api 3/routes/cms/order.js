/**
 * Created by Ziv on 2017/9/14.
 */
let express = require('express');
let router = express.Router();
let Order = require('../../models/Order');
const sort = require('../../util/util');
const downLoadUtil = require('../../util/csv');
var fs = require("fs");
var axios = require('axios');
//获取order列表
router.get('/list', function (req, res, next) {
    // 对lastkey参数需要拼合处理last_key
    let last_key;
    if (req.query.user_id && req.query.order_id) {
        last_key = {
            user_id: req.query.user_id,
            order_id: req.query.order_id,
            status: req.query.status
        }
    }
    let order = new Order();

    order.getStatusOrderList((err, datas) => {
        order.getOrderList((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                // res.send(data)
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data,
                    count: datas.Count
                })
            }
        }, last_key)

    })
});

//获取某一天未发货订单列表
router.get('/handle-list', function (req, res, next) {
    // if(req.query.secret === secret){

    // 对lastkey参数需要拼合处理last_key
    let last_key;
    if (req.query.user_id && req.query.order_id) {
        last_key = {
            user_id: req.query.user_id,
            order_id: req.query.order_id,
            status: req.query.status
        }
    }
    let order = new Order();
    order.status = req.query.status;
    order.getStatusOrderList((err, datas) => {
        order.getHandleOrderList(req.query.handle_date, (err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data,
                    count: datas.Count
                })
            }
        }, last_key)
    })
});

//线下核销获取order列表
router.get('/offline-list', function (req, res, next) {
    let order = new Order();
    let orderId = req.query.order_id;
    // let lastFive = orderId.substr(orderId.length-5);
    order.status = 'PENDING_';
    order.queryOrderByExpress(orderId, (err, data) => {
        if (err) {
            res.send({
                error_code: 5002,
                error_msg: err.message
            })
        } else {
            if (data.Items.length > 0) {
                let arr = [];
                for (let i = 0; i < data.Items.length; i++) {
                    let item = {
                        user_id: data.Items[i].attrs.user_id,
                        order_id: data.Items[i].attrs.order_id
                    };
                    arr.push(item)
                }
                order.getOrderItems(arr, (err, data) => {
                    if (err) {
                        res.send({
                            error_code: 5002,
                            error_msg: err.message
                        })
                    } else {
                        res.send({
                            error_code: 0,
                            error_msg: 'ok',
                            data: data,
                        })
                    }
                })
            } else {
                res.send({
                    error_code: 5003,
                    error_msg: '该订单不是待发货状态或不存在'
                })
            }
        }
    })
});
// 线下核销确认发货
router.post('/offline-update', function (req, res, next) {
    // 更新
    if (req.body.user_id && req.body.order_id) {
        // 新建
        let order = new Order();
        order.status = 'DELIVERED_';
        order.user_id = req.body.user_id;
        order.order_id = req.body.order_id;
        order.express_id = '10001';
        order.express_brand = 'js';
        order.updateStatus((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data.attrs
                })
            }
        })
    } else {
        res.send({
            error_code: 5003,
            error_msg: 'short param'
        })
    }
});

// 线下核销确认收货
router.post('/offline-success', function (req, res, next) {
    // 更新
    if (req.body.user_id && req.body.order_id) {
        // 新建
        let order = new Order();
        order.status = 'SUCCESS';
        order.user_id = req.body.user_id;
        order.order_id = req.body.order_id;
        order.orderSuccess((err, data) => {

            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data.attrs
                })
            }
        })
    } else {
        res.send({
            error_code: 5003,
            error_msg: 'short param'
        })
    }
});
//获取不同状态order列表
router.get('/status-list', function (req, res, next) {
    // 对lastkey参数需要拼合处理last_key
    let last_key;
    if (req.query.user_id && req.query.order_id) {
        last_key = {
            user_id: req.query.user_id,
            order_id: req.query.order_id,
            status: req.query.status
        }
    }
    let order = new Order();
    order.status = req.query.status;
    order.getStatusList((err, datas) => {
        order.getAllStatusList((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                // res.send(data)
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data,
                    count: datas.Count
                })
            }
        }, last_key)
    })
});


// 订单号查询
router.get('/order-list', function (req, res, next) {
    // if(req.query.secret === secret){
    // 对lastkey参数需要拼合处理last_key
    let last_key;
    if (req.query.user_id && req.query.order_id) {
        last_key = {
            user_id: req.query.user_id,
            order_id: req.query.order_id
        }
    }
    let order = new Order();
    order.order_id = req.query.orderId;
    order.getOrderId((err, data) => {
        if (err) {
            res.send({
                error_code: 5002,
                error_msg: err.message
            })
        } else {
            res.send(data)
        }
    }, last_key)

});

// 获取订单详情
router.get('/order-reverse', function (req, res, next) {
    if (!req.query.token) {
        return res.sendStatus(404);
    }
    let order = new Order();
    order.order_id = req.query.order_id;
    order.user_id = req.query.user_id;
    order.getOrder((err, data) => {
        if (err) {
            res.send({
                error_code: 5002,
                error_msg: err.message
            })
        } else {
            res.send(data)
        }
    })

});
// update状态
router.post('/updateStatus', function (req, res, next) {
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    // 更新
    if (req.body.status && req.body.user_id && req.body.order_id && req.body.express_id && req.body.express_brand) {
        // 新建
        let order = new Order();
        order.status = req.body.status;
        order.user_id = req.body.user_id;
        order.order_id = req.body.order_id;
        order.express_id = req.body.express_id;
        order.express_brand = req.body.express_brand;
        order.updateStatus((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data.attrs
                })
            }
        })
    } else {
        res.send({
            error_code: 5003,
            error_msg: 'short param'
        })
    }

});

// delete
router.post('/delete', function (req, res, next) {
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    // 删除
    if (req.body.object_id) {
        // 新建
        let rec = new Rec();
        rec.object_id = req.body.object_id;
        rec.deleteRec((err) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'ok'
                })
            }
        })
    } else {
        res.send({
            error_code: 5003,
            error_msg: 'short object_id'
        })
    }
});

// batch delete
// 批量删除
router.post('/batchDelete', function (req, res, next) {
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    // 批量删除
    if (req.body.items) {
        // 新建
        let items = req.body.items;
        let rec = new Rec();
        let len = items.length;
        let k = 0;
        for (let i = 0; i < len; i++) {
            rec.object_id = items[i];
            rec.deleteRec((err) => {
                if (err) {
                    res.send({
                        error_code: 5002,
                        error_msg: err.message
                    })
                } else {
                    k++;
                    if (k === len) {
                        res.send({
                            error_code: 0,
                            error_msg: 'ok'
                        })
                    }
                }
            })
        }
    } else {
        res.send({
            error_code: 5003,
            error_msg: 'short object_id array'
        })
    }
});

// sort
router.post('/sort', function (req, res, next) {
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    // 排序
    let order = new Order();
    order.updateStatus((err, data) => {
        res.send({
            error_code: 0,
            error_msg: 'ok',
            data: data
        })
    })
});
//审核订单
router.post('/check/access', (req, res, next) => {
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    let order = new Order();
    let params = req.body;
    order.user_id = params.user_id;
    order.order_id = params.order_id;
    order.check = params.check;
    order.updateOrderCheck((err, data) => {
        if (err) {
            res.send({
                error_code: 4001,
                error_msg: err.message
            })
        } else {
            res.send({
                error_code: 0,
                error_msg: 'ok'
            })
        }
    })
})
//编辑订单
router.post('/check/edit', (req, res, next) => {
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    let order = new Order();
    let params = req.body;
    order.user_id = params.user_id;
    order.order_id = params.order_id;
    order.status = params.status;
    order.address = params.address;
    order.contact = params.contact;
    order.phone = params.phone;
    order.province = params.province;
    order.city = params.city;
    order.check = params.check;
    order.county = params.county;
    order.updateOrderAddress((err, data) => {
        if (err) {
            res.send({
                error_code: 4001,
                error_msg: err.message
            })
        } else {
            res.send({
                error_code: 0,
                error_msg: 'ok'
            })
        }
    })
})
//查询订单
router.get('/order-list-check', (req, res, next) => {
    if (!req.query.token) {
        return res.sendStatus(404);
    }
    let order = new Order();
    let params = req.query;
    order.check = params.check;
    order.getOrderListByCheck((err, data) => {
        if (err) {
            res.send({
                error_code: 4001,
                error_msg: err.message
            })
        } else {
            res.send({
                error_code: 0,
                error_msg: 'ok'
            })
        }
    })
})
//根据供应商查询订单
router.get('/order-list-op', (req, res, next) => {
    if (!req.query.token) {
        return res.sendStatus(404);
    }
    let order = new Order();
    let params = req.query;
    order.op = params.op;
    order.check = params.check;
    order.getOrderListByOp((err, data) => {
        if (err) {
            res.send({
                error_code: 4001,
                error_msg: err.message
            })
        } else {
            res.send({
                error_code: 0,
                error_msg: 'ok'
            })
        }
    })
})
router.get('/csv', (req, res, next) => {
    let params = req.query;
    let items = JSON.parse(params.p);
    var c = items.items;
    let news = [];
    if (c.length > 0) {
        news = c;
        let skuName = '';
        let skuId = '';
        let spuName = '';
        let num = '';
        let op = '';
        let n = 0;
        for (var i = 0; i < news.length; i++) {
            skuName = skuName + news[i].sku_name + '\n';
            skuId = skuId + news[i].sku_id + '\n';
            spuName = spuName + news[i].spu_name + '\n';
            num = num + news[i].num + '\n';
            op = op + news[i].op + '\n';
            n++;
            let msg = [{
                id: items.order_id,
                name: items.contact,
                skuId: skuId,
                spuName: spuName,
                skuName: skuName,
                num: num,
                pay: items.payment,
                time: items.handle_date,
                op: op,
                address: `${items.province}${items.city}${items.county}${items.address}`,

            }]

            if (n === news.length) {
                downLoadUtil.downLoad(req, res, function (row) {
                    return {
                        "订单编号": row.id,
                        "下单人": row.name,
                        "商品ID": row.skuId,
                        "商品名称": row.spuName,
                        "商品规格": row.skuName,
                        "数量": row.num,
                        "总计": row.pay,
                        "下单时间": row.time,
                        "供应商": row.op,
                        "地址": row.address,
                    };
                }, msg, '锦时HOME订单')
            }
        }
    } else {
        res.send({
            error_code: 4000,
            error_msg: '此订单没有商品'
        })
    }
})

//获取不同check未发货订单列表
function a (item){
    var c = item.items;
    let items = item;
    let news = [];
    news = c;
    let skuName = '';
    let skuId = '';
    let spuName = '';
    let num = '';
    let op = '';
    let n = 0;
    for (var i = 0; i < news.length; i++) {
        skuName = skuName + news[i].sku_name + '\n';
        skuId = skuId + news[i].sku_id + '\n';
        spuName = spuName + news[i].spu_name + '\n';
        num = num + news[i].num + '\n';
        op = op + news[i].op + '\n';
        
    }
    let message = {
        skuName: skuName,
        skuId: skuId,
        num:num,
        op:op,
        spuName: spuName
    }
    return message
}
router.get('/csv/p', (req, res, next) => {
    let params = req.query;
    let list = JSON.parse(params.p);
    // console.log(">>>>>", list);
    let msg = list;
    let b = [];
   for(var i =0;i < msg.length;i++){
       b.push(a(msg[i]))
   }
  
   for(var j = 0;j < msg.length;j++){
     
       msg[j].id = msg[j].order_id;
       msg[j].name = msg[j].contact;
       msg[j].skuId= b[j].skuId;
       msg[j].spuName= b[j].spuName;
       msg[j].skuName= b[j].skuName;
       msg[j].num= b[j].num;
       msg[j].pay= msg[j].payment;
       msg[j].time= msg[j].handle_date;
       msg[j].op = b[j].op;
       msg[j].address=`${msg[j].province}${msg[j].city}${msg[j].county}${msg[j].address}`;

   }
 
   downLoadUtil.downLoad(req, res, function (row) {
                return {
                    "订单编号": row.id,
                    "下单人": row.name,
                    "商品ID": row.skuId,
                    "商品名称": row.spuName,
                    "商品规格": row.skuName,
                    "数量": row.num,
                    "总计": row.pay,
                    "下单时间": row.time,
                    "供应商": row.op,
                    "地址": row.address,
                };
            }, msg, '锦时HOME订单')
})

//获取某一天未发货订单列表
router.get('/check-list', function (req, res, next) {
    // 对lastkey参数需要拼合处理last_key
    let last_key;
    if (req.query.user_id && req.query.order_id) {
        last_key = {
            user_id: req.query.user_id,
            order_id: req.query.order_id,
            status: req.query.status
        }
    }
    let order = new Order();
    order.getCheckOrderLength(req.query.check, (err, datas) => {
        order.getCheckOrderList(req.query.check, (err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data,
                    count: datas.Count
                })
            }
        }, last_key)
    })
});

// 供应商查询
router.get('/op-list', function (req, res, next) {
    // 对lastkey参数需要拼合处理last_key
    let last_key;
    if (req.query.user_id && req.query.order_id) {
        last_key = {
            user_id: req.query.user_id,
            order_id: req.query.order_id,
            status:req.query.status
        }
    }
    let order = new Order();
    order.getOpOrderLength(req.query.op,(err, datas) => {
        order.getOpOrderList(req.query.op,(err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data,
                    count: datas.Count
                })
            }
        }, last_key)
    })
});
module.exports = router;