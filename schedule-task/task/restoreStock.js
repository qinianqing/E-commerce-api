// 整个流程每30秒做一次，更新一次商品信息
'use strict';

const AWS = require('aws-sdk');
const TABLE = 'js_order';

let shutDown = false;

AWS.config.update({
    accessKeyId:'AKIAODLUFAI6FTDAFGFQ',
    secretAccessKey:'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',
    region:'cn-northwest-1',
    //endpoint:awsParams.dynamoEndpoint
});

const dynamodbstreams = new AWS.DynamoDBStreams({apiVersion: '2012-08-10'});
const Goods = require('../models/Goods');
const Order = require('../models/Order');

// 批量处理
//去重
function unique(arr){
    let result = [];
    for(let i=0;i<arr.length;i++){
        if(result.indexOf(arr[i])===-1){
            result.push(arr[i])
        }
    }
    return result;
}

let warehouseStockName = '';

let stock = {
    setWarehouseByProvince:(direct,province)=>{
        if (direct){
            warehouseStockName = 'stock';
        }else {
            // warehouseStockName = WarehoseMapping[province];
            warehouseStockName = 'stock';
        }
    },
    setWarehouse:(stockName)=>{
        if (stockName === 'stock' || stockName === 'sh_stock' || stockName === 'gz_stock' || stockName === 'cd_stock'){
            warehouseStockName = stockName;
        }
    },
    // 增加库存
    add:(p)=>{
        let list = p.list;
        let g = new Goods;
        let n = 0;
        for (let i=0;i<list.length;i++){
            let spu_id = list[i].sku_id.split('-')[0];
            g.addSkuStock(list[i].sku_id,list[i].num,(err,data)=>{
                n++;
                if (err){
                    console.error('<<<',list[i].sku_id+'/'+list[i].num+'/'+err.message)
                }
                if (n === list.length){
                    p.callback({
                        error_code:0,
                        error_msg:'ok'
                    })
                }
            },warehouseStockName)
        }
    },
    // 扣减库存
    minus:(p)=>{
        let list = p.list;
        let g = new Goods;
        let n = 0;
        for (let i=0;i<list.length;i++){
            let spu_id = list[i].sku_id.split('-')[0];
            g.delSkuStock(list[i].sku_id,list[i].num,(err,data)=>{
                n++;
                if (err){
                    console.error('<<<',list[i].sku_id+'/'+list[i].num+'/'+err.message)
                }
                if (n === list.length){
                    p.callback({
                        error_code:0,
                        error_msg:'ok'
                    })
                }
            },warehouseStockName)
        }
    }
};

// 获取订单数据
let getOrder = (user_id,order_id)=>{
    return new Promise((resovle,reject)=>{
        let order = new Order();
        order.user_id = user_id;
        order.order_id = order_id;
        order.getOrder((err,data)=>{
            if (err){
                reject(err.message);
            }
            if(!data){
                reject('错误订单号');
            }
            resovle(data.attrs);
        })
    })
};

const examine = (d)=>{
    let status = d.eventName;
    let rOrder = d.dynamodb;
    switch (status){
        case 'INSERT':
            // 什么都不做
            break;
        case 'MODIFY':
            // 从INIT到取消加库存
            // 从FOUNDING到FOUNDED加库存
            // 推送逆向单状态更新通知
            let newStatus = rOrder.NewImage.status.S;
            let oldStatus = rOrder.OldImage.status.S;

            let user_id = rOrder.NewImage.user_id.S;
            let order_id = rOrder.NewImage.order_id.S;

            const goAdd = async ()=>{
                try {
                    let order = await getOrder(user_id,order_id);
                    let items = order.items;
                    let p = {
                        list:items,
                        callback:(resp)=>{
                            if (resp.error_code){
                                console.log(resp.error_code);
                            }
                        }
                    };
                    stock.add(p);
                }catch (err){
                    console.error(err)
                }
            };

            if (newStatus === 'CANCEL' && oldStatus === 'INIT'){
                goAdd();
            }
            if (newStatus === '_DENY'&& oldStatus === '_INIT'){
                goAdd();
            }
            // 其他的状态什么都不做
            break;
        case 'REMOVE':
            // 删除了逆向订单
            // 什么都不做
            break
    }
};

// 获取流
const listStreams = (eSSA)=>{
    return new Promise((resolve,reject)=> {
        let params;
        if (eSSA){
            params = {
                Limit: 100,
                TableName: TABLE,
                ExclusiveStartStreamArn: eSSA
            };
        }else {
            params = {
                Limit: 100,
                TableName: TABLE,
                //ExclusiveStartStreamArn: eSSA
            };
        }
        dynamodbstreams.listStreams(params, (err, data) => {
            if (err) {
                reject(err.stack);
            }
            else {
                resolve(data);
            }
        })
    })
};

const describeStream = (steamArn,eSSI)=>{
    return new Promise((resolve,reject)=> {
        let params;
        if (eSSI){
            params = {
                ExclusiveStartShardId:eSSI,
                StreamArn: steamArn, /* required */
                Limit: 100
            };
        }else {
            params = {
                //ExclusiveStartShardId:eSSI,
                StreamArn: steamArn, /* required */
                Limit: 100
            };
        }
        dynamodbstreams.describeStream(params, function(err, data) {
            if (err){
                reject(err.stack)
            }else {
                resolve(data)
            }
        })
    })
};

const getShardIndictor = (ShardId,StreamArn)=>{
    return new Promise((resolve,reject)=> {
        let params = {
            ShardId: ShardId, /* required */
            ShardIteratorType: 'LATEST', /* required */
            StreamArn: StreamArn, /* required */
            //SequenceNumber: SequenceNumber
        };
        dynamodbstreams.getShardIterator(params, function (err, data) {
            if (err) {
                reject(err.stack)
            } else {
                resolve(data)
            }
        })
    })
};

const getRecords = (ShardIterator)=>{
    return new Promise((resolve,reject)=>{
        let params = {
            ShardIterator: ShardIterator, /* required */
            Limit: 100
        };
        dynamodbstreams.getRecords(params, function(err, data) {
            if (err) {
                reject(err.stack)
            } else {
                resolve(data)
            }
        });
    })
};

const go = async ()=>{
    try {
        let LastEvaluatedStreamArn = '1';
        while (LastEvaluatedStreamArn){
            LastEvaluatedStreamArn = '';
            let d1 = await listStreams(LastEvaluatedStreamArn);
            LastEvaluatedStreamArn = d1.LastEvaluatedStreamArn;

            // 获得了流列表
            let ExclusiveStartShardId = '1';
            while (ExclusiveStartShardId){
                ExclusiveStartShardId = '';
                for (let i=0;i<d1.Streams.length;i++){
                    let d2 = await describeStream(d1.Streams[i].StreamArn,ExclusiveStartShardId);
                    ExclusiveStartShardId = d2.StreamDescription.LastEvaluatedShardId;
                    for (let m=0;m<d2.StreamDescription.Shards.length;m++){
                        let d3 = await getShardIndictor(d2.StreamDescription.Shards[m].ShardId,d2.StreamDescription.StreamArn);
                        let NextShardIterator = d3.ShardIterator;
                        while (NextShardIterator){
                            if (shutDown){
                                break;
                            }
                            let d4 = await getRecords(NextShardIterator);
                            NextShardIterator = d4.NextShardIterator;
                            if (d4.Records.length){
                                // 处理Records
                                d4.Records.forEach((record)=>{
                                    examine(record);
                                })
                            }
                        }
                    }
                }
            }
        }
    }catch (err){
        console.error(err);
    }
};

module.exports = {
    start:()=>{
        // 启动流获取
        console.log('启动订单流获取');
        shutDown = false;
        go();
    },
    restart:()=>{
        // 重新启动流获取
        console.log('重启订单流获取');
        shutDown = true;
        setTimeout(()=>{
            shutDown = false;
            go();
        },100)
    }
};