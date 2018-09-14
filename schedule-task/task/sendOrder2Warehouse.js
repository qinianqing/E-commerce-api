// 通过SOAP把订单推到仓库
const soap = require('soap');
// 将js对象转化为xml
const xml2js = require('xml2js');
const getTid = require('../utils/getTid');

const Order = require('../models/Order');
const configParams= require('../config');
const whUrl = configParams.xbmParams.whUrl;
const warehouseid = configParams.xbmParams.warehouseid;
const cid = configParams.xbmParams.cid;
const pwd = configParams.xbmParams.pwd;

// 本任务接口全部位async封装的异步操作

let last_key = 0;

Date.prototype.format = function (format) {
    let args = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(format))
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let i in args) {
        let n = args[i];
        if (new RegExp("(" + i + ")").test(format))
            format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? n : ("00" + n).substr(("" + n).length));
    }
    return format;
};

// 获取符合条件的订单
const getJsOrders = (lastkey)=>{
    return new Promise((resolve,reject)=>{
        let order = new Order();
        order.getSendOrders((err,data)=>{
            if (err !== null){
                reject(err.message)
            }else {
                resolve(data)
            }
        },lastkey)
    })
};

// 把订单发送到仓库
const sendOrders = (d)=>{
    let sendD = format2Xml(d.xml);
    sendD = format2XmlCdata({
        arg0:sendD
    });
    sendD = {
        _xml:sendD
    };
    // console.log("ds",sendM)
    // let sendM = d.xml;
    soap.createClient(whUrl, function(err, client) {
        client.requestOrders(sendD, function(err, result) {
            if (err) {
                console.log('error',err.message);
            }else {
                let parser = new xml2js.Parser();
                parser.parseString(result.return, function (err, result) {
                    if (err){
                        console.log('parse_error',err.message);
                    }else {
                        if(result.rt.rc){
                            if (result.rt.rc[0] === '0000'){
                                // 推送成功
                                for (let i=0;i<d.key.length;i++){
                                    updateOrderSended(d.key[i].user_id,d.key[i].order_id);
                                }
                            }else {
                                console.log('wh_error',result.rt.rc[0]+result.rt.rm[0]+result.rt.tid[0])
                            }
                        }
                    }
                });
            }
        });
    });
};

// 把订单check状态更新为已经发货
const updateOrderSended = (user_id,order_id)=>{
    let order = new Order();
    order.user_id = user_id;
    order.order_id = order_id;
    order.updateSended((err,data)=>{
        if (err){
            console.error(err.message)
        }
    })
};

const format2XmlCdata = (data)=>{
    let options = {
        cdata: true,
        rootName:'tns:requestOrders',
        headless:true
    };
    let builder = new xml2js.Builder(options);
    return builder.buildObject(data);
};

// 把批量订单信息格式化成xml
const format2Xml = (data)=>{
    let options = {
        cdata: false,
        rootName:'requestOrders',
        headless:false
    };
    let builder = new xml2js.Builder(options);
    return builder.buildObject(data);
};

// 格式化订单数据
const formatOrder = (data)=>{
    let item = {
        warehouseid:warehouseid,
        clientid:cid,
        systemid:data.order_id,// erp单号，仓库系统用于判断单号是否重复
        ordercode:data.order_id,
        astype:'CM',
        status:'checked',
        seller:'锦时',
        businesstime:new Date(data.createdAt).format("yyyy-MM-dd hh:mm:ss"),// 创建时间 yyyy-MM-dd hh:mm:ss
        paytime:new Date(data.paidAt).format("yyyy-MM-dd hh:mm:ss"),// 支付时间 yyyy-MM-dd hh:mm:ss
        tousername:data.contact,
        postcode:'0',// 邮政编码，全为未知，传个0
        totel:data.phone,// 客户电话号
        tophone:data.phone,// 客户手机号
        prov:data.province, // 省份
        city:data.city,// 市
        district:data.county,// 区
        address:data.address,// 详细地址
        expresscode:data.express_brand
    };
    item.expresscode = 'ZTO';
    if (data.express_brand === 'zto'){
        item.expresscode = 'ZTO';
    }
    if (data.express_brand === 'sf-express'){
        item.expresscode = 'SF';
    }
    let goods = [];
    for (let i=0;i<data.items.length;i++){
        let good = {
            name:data.items[i].spu_name+data.items[i].sku_name,
            outerid:data.items[i].sku_id || data.items[i].barcode,
            amount:data.items[i].num
        };
        goods.push(good);
    }
    item.goods = {
        good:goods
    };
    return item;
};

// 封装异步
module.exports = async ()=>{
    try {
        let orders = [];
        last_key = 1;
        while (last_key){
            if (last_key === 1){
                last_key = 0;
            }
            let items = await getJsOrders(last_key);
            orders = orders.concat(items.Items);
            if (items.LastEvaluatedKey){
                last_key = items.LastEvaluatedKey;
            }else {
                last_key = 0;
            }
        }
        // format订单
        let formatOrders = [];
        for (let i=0;i<orders.length;i++){
            formatOrders.push(formatOrder(orders[i].attrs))
        }
        let times = Math.ceil(orders.length/100);
        // 构建发货数据
        let item = {
            tid:getTid(),
            cid:cid,
            pwd:pwd,
            // tid:'init',
            // orders:''
        };
        let sendMsgs = [];
        for (let i=0;i<times;i++){
            let orderI = [];
            let orderM = [];
            if (100*i+100<formatOrders.length) {
                for (let k=i*100;k<100*i+100;k++){
                    orderI.push(formatOrders[k]);
                    orderM.push({
                        user_id:orders[k].attrs.user_id,
                        order_id:orders[k].attrs.order_id
                    })
                }
            }else {
                for (let k=i*100;k<formatOrders.length;k++){
                    orderI.push(formatOrders[k]);
                    orderM.push({
                        user_id:orders[k].attrs.user_id,
                        order_id:orders[k].attrs.order_id
                    })
                }
            }
            item.orders = {
                order:orderI
            };
            item.tid = getTid();
            sendMsgs.push({
                xml:item,
                key:orderM
            })
        }
        for (let i=0;i<sendMsgs.length;i++){
            setTimeout(()=>{
                sendOrders(sendMsgs[i]);
            },500);
        }
    }catch (err){
        console.error(err)
    }
};