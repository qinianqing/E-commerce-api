// 整个流程每30秒做一次，更新一次商品信息
'use strict';

const AWS = require('aws-sdk');
const TABLE = 'js_subscribe_wares';

let shutDown = false;

AWS.config.update({
    accessKeyId:'AKIAODLUFAI6FTDAFGFQ',
    secretAccessKey:'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',
    region:'cn-northwest-1',
    //endpoint:awsParams.dynamoEndpoint
});

const dynamodbstreams = new AWS.DynamoDBStreams({apiVersion: '2012-08-10'});

// 获取更新数据
const Goods = require('../models/Goods');
// 配置es客户端
const options = {
    host:['https://search-se-jinshi-capoiecpteku4kivjhdxtp3nr4.cn-northwest-1.es.amazonaws.com.cn'],
    connectionClass: require('http-aws-es'),
    awsConfig:new AWS.Config({
        region:'cn-northwest-1',
        credentials: new AWS.Credentials('AKIAO6E66F2SHPLCP7LQ','fgJqVjqTob799JxWBuGHIUqpq/fT597Fu6/ztCoL')
    }),
};
const es = require('elasticsearch').Client(options);

let status;

const buildModel = (d)=>{
    status = d.eventName;
    let goodsItem = d.dynamodb;
    let item;
    if (status === 'INSERT' || status === 'MODIFY') {
        item = {
            id:goodsItem.Keys.id.S,
            cover:goodsItem.NewImage.cover.S,
            list_cover:goodsItem.NewImage.list_cover.S,
            title:goodsItem.NewImage.title.S,
            priority:Number(goodsItem.NewImage.priority.N || goodsItem.NewImage.priority.S),
            focus:goodsItem.NewImage.focus.S,
            updatedAt:goodsItem.NewImage.updatedAt.S,
            show: Number(goodsItem.NewImage.show.N || goodsItem.NewImage.show.S)
        };
        // 下架商品不能被搜索到，新增和修改都要被监测到
        if (item.show) {
            // 获取spu name
            // 创建/修改文档
            if (status === 'INSERT') {
                putItem(item);
            }else{
                if (Number(goodsItem.OldImage.show.N || goodsItem.OldImage.show.S)) {
                    updateItem(item);
                }else{
                    putItem(item);
                }
            }
        }else{
            if (status === 'MODIFY') {
                // 判断原镜像是否是上架状态
                if (Number(goodsItem.OldImage.show.N || goodsItem.OldImage.show.S)) {
                    // 删除搜索引擎中的对象
                    deleteItem(item);
                }
                // 其他情况不做任何操作
            }
        }
    }else if (status === 'REMOVE') {
        item = {
            id:goodsItem.Keys.id.S
        };
        deleteItem(item);
    }
};

const putItem = (item)=>{
    // 创建ES文档
    es.create({
        index:'subscribe',
        type:'wares',
        id:item.id,
        body:item,
        refresh:true
    },(err,resp)=>{
        if (err) {
            console.error(err.message);
        }
    })
};

const updateItem = (item)=>{
    // 修改文档
    es.update({
        index:'subscribe',
        type:'wares',
        id:item.id,
        body:{
            doc:item
        },
        refresh:true
    },(err,resp)=>{
        if (err) {
            console.error(err.message);
        }
    })
};

const deleteItem = (item)=>{
    // 删除ES文档
    es.delete({
        index:'subscribe',
        type:'wares',
        id:item.id
    },(err,resp)=>{
        if (err) {
            console.error(err.message);
        }
    })
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
                                    buildModel(record);
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
        console.log('启动订阅商品流获取');
        shutDown = false;
        go();
    },
    restart:()=>{
        // 重新启动流获取
        console.log('重启订阅商品流获取');
        shutDown = true;
        setTimeout(()=>{
            shutDown = false;
            go();
        },100)
    }
};