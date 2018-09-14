const Package = require('../models/Subscribe-package');
const getWeekTime = require('../utils/getWeekTime');
const Family = require('../models/Family');
const soap = require('soap');
// 将js对象转化为xml
const xml2js = require('xml2js');
const getTid = require('../utils/getTid');
const unique = require('../utils/unique');
const configParams= require('../config');
const whUrl = configParams.xbmParams.whUrl;
const warehouseid = configParams.xbmParams.warehouseid;
const cid = configParams.xbmParams.cid;
const pwd = configParams.xbmParams.pwd;
//得到订阅商品列表
const getSubscribeList = (lastkey)=>{
    return new Promise((resolve,reject)=>{
        let package = new Package();
        package.getAllPackage((err,data)=>{
            if (err !== null){
                reject(err.message)
            }else {
                resolve(data)
            }
        },lastkey)
    })
}
//获取家庭信息
const getFamilyMsg = (familys)=>{
    return new Promise((resolve,reject)=>{
        let family = new Family();
    
        family.getAllFanilyMsg(familys,(err,data)=>{
            if (err !== null){
                reject(err.message)
            }else {
                resolve(data)
            }
        })
    })
}
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

const format2XmlCdata = (data)=>{
    let options = {
        cdata: true,
        rootName:'tns:requestOrders',
        headless:true
    };
    let builder = new xml2js.Builder(options);
    return builder.buildObject(data);
};
// 把订单check状态更新为已经发货
const updateOrderSended = (subs_order_id,week)=>{
    let package = new Package();
    package.subs_order_id = subs_order_id;
    package.week = week;
    package.updateSended((err,data)=>{
        if (err){
            console.error(err.message)
        }
    })
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
}
// 把订单发送到仓库
const sendOrders = (d)=>{
    let sendD = format2Xml(d.xml);
    sendD = format2XmlCdata({
        arg0:sendD
    });
    sendD = {
        _xml:sendD
    };
   
    
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
                                    updateOrderSended(d.key[i].subs_order_id,d.key[i].week);
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

//判断发货时间
const sendGoodTime = ()=>{
        //判断当前时间是本周5下午3点前还是之后
        let nowTime = new Date();
        let currentWeek = nowTime.getDay();
        let currentHour = nowTime.getHours();
        
        let n;
        if(currentWeek === 0 || currentWeek === 6){
            n = 1;
        }else{
            if(currentWeek === 5){
                if(currentHour < 15){
                   n = 0;
                }else{
                  n = 1;
                }
              }else{
                  n = 0;
              }
        }
        return getWeekTime(n);
}
// 格式化订单数据
const formatOrder = (data)=>{
    let item = {
        warehouseid:warehouseid,
        clientid:cid,
        systemid:data.subs_order_id,// erp单号，仓库系统用于判断单号是否重复
        ordercode:data.subs_order_id,
        astype:'CM',
        status:'checked',
        seller:'锦时',
        businesstime:new Date(data.createdAt).format("yyyy-MM-dd hh:mm:ss"),// 创建时间 yyyy-MM-dd hh:mm:ss
        paytime:new Date(data.createdAt).format("yyyy-MM-dd hh:mm:ss"),// 支付时间 yyyy-MM-dd hh:mm:ss
        tousername:data.contact,
        postcode:'0',// 邮政编码，全为未知，传个0
        totel:data.phone,// 客户电话号
        tophone:data.phone,// 客户手机号
        prov:data.province, // 省份
        city:data.city,// 市
        district:data.county,// 区
        address:data.address,// 详细地址
        sellermemo:'锦时订阅'
        // expresscode:data.express_brand
    };
    item.expresscode = 'ZTO';
    if (data.express_brand === 'zto'){
        item.expresscode = 'ZTO';
    }
    if (data.express_brand === 'sf-express'){
        item.expresscode = 'SF';
    }
    let goods = [];
    for (let i=0;i<data.sku_detail.length;i++){
        let good = {
            name:data.sku_detail[i].goods_name + data.sku_detail[i].type_id,
            outerid:data.sku_detail[i].sku_id || data.sku_detail[i].barcode,
            amount:data.sku_detail[i].num
        };
        goods.push(good);
    }
    item.goods = {
        good:goods
    };
    return item;
};

let lastkey = 0;
module.exports =  async ()=>{
    try {
        let packages = [];
        last_key = 1;
        while (last_key){
            if (last_key === 1){
                last_key = 0;
            }
            let items = await getSubscribeList(last_key);
            packages = packages.concat(items.Items);
            if (items.LastEvaluatedKey){
                last_key = items.LastEvaluatedKey;
            }else {
                last_key = 0;
            }
        }
        let weekTIme = sendGoodTime();
      
       let newPackages = [];
       if(packages.length > 0){
        for(var i = 0;i < packages.length;i++){
            if(packages[i].attrs.status === 0 && packages[i].attrs.week === weekTIme)
            newPackages.push(packages[i].attrs)
          }
          let familyMsg = [];
          for(var m = 0;m < newPackages.length;m++){
              let item = {
                  user_id:newPackages[m].user_id,
                  family_id:newPackages[m].family_id
              }
              familyMsg.push(item)
          }  
          let familyMsgs = await getFamilyMsg(unique(familyMsg));
         let formatFamilies = [];
         for(var k = 0;k < familyMsgs.length;k++){
             formatFamilies.push(familyMsgs[k].attrs)
         }
         for(var i = 0;i < newPackages.length;i++){
             for(var j = 0;j < formatFamilies.length;j++){
                 if(newPackages[i].family_id === formatFamilies[j].family_id){
                     newPackages[i].county = formatFamilies[j].county;
                     newPackages[i].contact = formatFamilies[j].contact;
                     newPackages[i].address = formatFamilies[j].address;
                     newPackages[i].city = formatFamilies[j].city;
                     newPackages[i].province = formatFamilies[j].province;
                     newPackages[i].phone = formatFamilies[j].phone;
 
                 }
             }
         }
       
        
         let formatOrders = [];
         for (let i=0;i<newPackages.length;i++){
             formatOrders.push(formatOrder(newPackages[i]))
         }
         let times = Math.ceil(newPackages.length/100);
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
                         user_id:packages[k].attrs.user_id,
                         order_id:packages[k].attrs.subs_order_id
                     })
                 }
             }else {
                 for (let k=i*100;k<formatOrders.length;k++){
                     orderI.push(formatOrders[k]);
                     orderM.push({
                         user_id:packages[k].attrs.user_id,
                         order_id:packages[k].attrs.subs_order_id
                     })
                 }
             }
             item.orders = {
                 order:orderI
             };
             // item.tid = getTid();
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
       }else{
           console.log('订阅表没有数据')
       }
     
       
    }catch(err){
        console.log(err)
    }
}