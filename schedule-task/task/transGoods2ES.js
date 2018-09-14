// 整个流程每30秒做一次，更新一次商品信息
'use strict';

const AWS = require('aws-sdk');
const TABLE = 'js_p';

let shutDown = false;

AWS.config.update({
    accessKeyId:'AKIAODLUFAI6FTDAFGFQ',
    secretAccessKey:'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',
    region:'cn-northwest-1',
    //endpoint:awsParams.dynamoEndpoint
});

const dynamodbstreams = new AWS.DynamoDBStreams({apiVersion: '2012-08-10'});

// 外部商家编码为主键，以barcode为分区间，条码必填，保证可以发货
const whUrl = 'http://xbmtest.kucangbao.com/kcb-1.0/cxf/warehouse?wsdl';

const warehouseid = 'cf3c23f41a6142fa9e4d011b71ed8018';
const cid = '55b6b91d185e4b32aeb41a360b2ee4de';
const pwd = '5e990765ff514ba8b940d83bada08f3f';

const soap = require('soap');
const xml2js = require('xml2js');
const getTid = require('../utils/getTid');

// 把订单发送到仓库
const sendGoods = (d)=>{
    let sendD = format2Xml({
        tid:getTid(),
        cid:cid,
        pwd:pwd,
        clientid:cid,
        goodslist:{
            goods:d
        }
    });
    sendD = format2XmlCdata({
        arg0:sendD
    });
    sendD = {
        _xml:sendD
    };
    soap.createClient(whUrl, function(err, client) {
        client.requestGoods(sendD, function(err, result) { //login是方法是别人定义的接口方法
            if (err) {
                console.log('error',err.message);
            }else {
                let parser = new xml2js.Parser();
                parser.parseString(result.return, function (err, result) {
                    if (err){
                        console.log('parse_error',err);
                    }else {
                        if (result.rt.rc){
                            if (result.rt.rc[0] === '0000'){
                                // 商品推送成功
                                console.log('成功推送',result.rt.tid[0])
                            }else {
                                console.log('wh_error',result.rc)
                            }
                        }
                    }
                });
            }
        });
    });
};

const format2XmlCdata = (data)=>{
    let options = {
        cdata: true,
        rootName:'tns:requestGoods',
        headless:true
    };
    let builder = new xml2js.Builder(options);
    return builder.buildObject(data);
};

const format2Xml = (data)=>{
    let options = {
        cdata: false,
        rootName:'requestGoods',
        headless:false
    };
    let builder = new xml2js.Builder(options);
    return builder.buildObject(data);
};

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
    if(goodsItem.Keys.sku_id.S === '0'){
        if (status === 'INSERT' || status === 'MODIFY') {
            let tags = [];
            if(goodsItem.NewImage.tag){
                for (let i=0;i<goodsItem.NewImage.tag.L.length;i++){
                    tags.push(goodsItem.NewImage.tag.L[i].S);
                }
            }
            let level3_ids = [];
            if (goodsItem.NewImage.level3_id){
                for (let i=0;i<goodsItem.NewImage.level3_id.L.length;i++){
                    level3_ids.push(goodsItem.NewImage.level3_id.L[i].S);
                }
            }
            let spaces = [];
            if (goodsItem.NewImage.space){
                for (let i=0;i<goodsItem.NewImage.space.L.length;i++){
                    spaces.push(goodsItem.NewImage.space.L[i].S);
                }
            }
            let members = [];
            if (goodsItem.NewImage.member){
                for (let i=0;i<goodsItem.NewImage.member.L.length;i++){
                    members.push(goodsItem.NewImage.member.L[i].S);
                }
            }
            let carousel_images = [];
            if (goodsItem.NewImage.carousel_image){
                for (let i=0;i<goodsItem.NewImage.carousel_image.L.length;i++){
                    carousel_images.push(goodsItem.NewImage.carousel_image.L[i].S);
                }
            }
            let rank_images = [];
            if (goodsItem.NewImage.rank_image){
                for (let i=0;i<goodsItem.NewImage.rank_image.L.length;i++){
                    carousel_images.push(goodsItem.NewImage.rank_image.L[i].S);
                }
            }
            let direct = false;
            if (goodsItem.NewImage.direct){
                if (goodsItem.NewImage.direct.BOOL){
                    direct = true;
                }
            }
            item = {
                goods_id:goodsItem.Keys.goods_id.S,
                goods_name:goodsItem.NewImage.goods_name.S,
                goods_price:Number(goodsItem.NewImage.goods_price.S || goodsItem.NewImage.goods_price.N),
                default_image:goodsItem.NewImage.default_image.S,
                carousel_image:carousel_images,
                rank_image:rank_images,
                describe:goodsItem.NewImage.describe.S,
                discount_price:Number(goodsItem.NewImage.discount_price.N || goodsItem.NewImage.discount_price.S),
                goods_cashback:Number(goodsItem.NewImage.goods_cashback.N || goodsItem.NewImage.goods_cashback.S),
                level3_id:level3_ids,
                priority:Number(goodsItem.NewImage.priority.N || goodsItem.NewImage.priority.S),
                brand_id:goodsItem.NewImage.brand_id.S,
                updatedAt:goodsItem.NewImage.updatedAt.S,
                space:spaces,
                member:members,
                tag:tags,
                direct:direct,
                show:goodsItem.NewImage.show.BOOL
            };
            // 下架商品不能被搜索到，新增和修改都要被监测到
            if (item.show) {
                // 获取spu name
                // 创建/修改文档
                if (status === 'INSERT') {
                    putItem(item);
                }else{
                    if (goodsItem.OldImage.show.BOOL) {
                        updateItem(item);
                    }else{
                        putItem(item);
                    }
                }
            }else{
                if (status === 'MODIFY') {
                    // 判断原镜像是否是上架状态
                    if (goodsItem.OldImage.show.BOOL) {
                        // 删除搜索引擎中的对象
                        deleteItem(item);
                    }
                    // 其他情况不做任何操作
                }
            }
            // 向仓库推送商品，只有有条码的商品才会推送
            let items = [];
            console.log(">>>>>>>",goodsItem.NewImage.skus.L[i].M);
            console.log(">>>>>>>",goodsItem.NewImage.skus.L[i].M.barcode.S);
            console.log(">>>>>>>",goodsItem.NewImage);
            for (let i=0;i<goodsItem.NewImage.skus.L.length;i++){
                if (goodsItem.NewImage.skus.L[i].M.barcode.S && goodsItem.NewImage.skus.L[i].M.barcode.S !== '-' && goodsItem.NewImage.skus.L[i].M.barcode.S !== '条形编码'){
                    items.push({
                        'name':goodsItem.NewImage.goods_name.S,
                        'spec':goodsItem.NewImage.skus.L[i].M.type_id.S,
                        'outerid':goodsItem.NewImage.skus.L[i].M.sku_id.S,
                        'cbarcode':goodsItem.NewImage.skus.L[i].M.barcode.S
                    });
                }
            }
            sendGoods(items);
        }else if (status === 'REMOVE') {
            item = {
                goods_id:goodsItem.Keys.goods_id.S
            };
            deleteItem(item);
        }
    }
};

const putItem = (item)=>{
    // 创建ES文档
    es.create({
        index:'product',
        type:'goods',
        id:item.goods_id,
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
        index:'product',
        type:'goods',
        id:item.goods_id,
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
        index:'product',
        type:'goods',
        id:item.goods_id
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
        console.log('启动商品流获取');
        shutDown = false;
        go();
    },
    restart:()=>{
        // 重新启动流获取
        console.log('重启商品流获取');
        shutDown = true;
        setTimeout(()=>{
            shutDown = false;
            go();
        },100)
    }
};