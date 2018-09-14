// 外部商家编码为主键，以barcode为分区间，条码必填，保证可以发货

const Goods = require('../models/Goods');

// 通过SOAP把订单推到仓库
const soap = require('soap');
// 将js对象转化为xml
const xml2js = require('xml2js');
const getTid = require('../utils/getTid');

const configParams= require('../config');
const whUrl = configParams.xbmParams.whUrl;
const warehouseid = configParams.xbmParams.warehouseid;
const cid = configParams.xbmParams.cid;
const pwd =  configParams.xbmParams.pwd;

// 获取符合条件的订单
const getGoods = (lastkey)=>{
    return new Promise((resolve,reject)=>{
        let good = new Goods();
        good.getGoodsCMS((err,data)=>{
            if (err !== null){
                reject(err.message)
            }else {
                resolve(data)
            }
        },lastkey)
    })
};

// 推送商品到仓库
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
                        console.log('parse_error',err.message);
                    }else {
                        if (result.rt.rc[0] === '0000'){
                            // 商品推送成功
                            console.log('成功推送',result.rt.tid[0])
                        }else {
                            console.log('wh_error',result.rt.rc[0]+result.rt.rm[0])
                            // console.log('<<<</n',rawRequest)
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

let last_key = 0;

module.exports = async ()=>{
    try {
        let goods = [];
        last_key = 1;
        while (last_key){
            if (last_key === 1){
                last_key = 0;
            }
            let items = await getGoods(last_key);
            goods = goods.concat(items.Items);
            if (items.LastEvaluatedKey){
                last_key = items.LastEvaluatedKey;
            }else {
                last_key = 0;
            }
        }
        let items = [];
        for (let i=0;i<goods.length;i++){
            for (let t=0;t<goods[i].attrs.skus.length;t++){
                // 向仓库推送商品，只有有条码的商品才会推送
                if (goods[i].attrs.skus[t].barcode && goods[i].attrs.skus[t].barcode !== '-' && goods[i].attrs.skus[t].barcode !== '条形编码'){
                    items.push({
                        'name':goods[i].attrs.goods_name,
                        'spec':goods[i].attrs.skus[t].type_id,
                        'outerid':goods[i].attrs.skus[t].sku_id,
                        'cbarcode':goods[i].attrs.skus[t].barcode
                    });
                }
            }
        }
        let times = Math.ceil(items.length/50);
        let sendMsgs = [];
        for (let i=0;i<times;i++) {
            let goodM = [];
            if (50*i+50<items.length){
                for (let k = i * 50; k < i*50+50; k++) {
                    goodM.push(items[k]);
                }
            }else {
                for (let k = i * 50; k < items.length; k++) {
                    goodM.push(items[k]);
                }
            }
            sendMsgs.push(goodM);
        }
        for (let i=0;i<sendMsgs.length;i++){
            setTimeout(()=>{
                sendGoods(sendMsgs[i]);
            },1000);
        }
    }catch (err){
        console.error(err)
    }
};