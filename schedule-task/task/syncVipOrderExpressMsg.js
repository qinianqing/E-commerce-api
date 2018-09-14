// 获取订单快递信息
const PayOrder = require('../models/PayOrder');
let last_key = 0;
//得到支付记录
const PayOrderHistory = (lastkey) => {
    return new Promise((resolve, reject) => {
        let payOrder = new PayOrder();
        payOrder.getAllPayOrder((err, data) => {
            if (err !== null) {
                reject(err.message)
            } else {
                resolve(data)
            }
        }, lastkey)
    })
}
// 把订单check状态更新为已经发货
const updateOrderSended = (tradeId, dAt, eid, eb, dfee) => {
    let payOrder = new PayOrder();
    let parm = {
        tradeId: tradeId,
        deliveredAt: dAt,
        express_id: eid,
        express_brand: eb,
        dFee: dfee
    }
    payOrder.update(parm,(err, data) => {
        if (err) {
            console.error(err.message)
        }
    })
};


// 外部商家编码为主键，以barcode为分区间，条码必填，保证可以发货
const configParams = require('../config');
const whUrl = configParams.xbmParams.whUrl;
const warehouseid = configParams.xbmParams.warehouseid;
const cid = configParams.xbmParams.cid;
const pwd = configParams.xbmParams.pwd;


const soap = require('soap');
const xml2js = require('xml2js');
const getTid = require('../utils/getTid');

// 获取物流信息
const getLogisticsMsg = (tradeId) => {
    let sendD = format2Xml({
        tid: getTid(),
        cid: cid,
        pwd: pwd,
        psystemid: tradeId,
        needdattributes: false
    });
    sendD = format2XmlCdata({
        arg0: sendD
    });
    sendD = {
        _xml: sendD
    };
    soap.createClient(whUrl, function (err, client) {
        client.requestLogistics(sendD, function (err, result, rawResponse, soapHeader, rawRequest) { //login是方法是别人定义的接口方法
            if (err) {
                console.log('error', err);
            } else {
                let parser = new xml2js.Parser();
                parser.parseString(result.return, function (err, result) {
                    if (err) {
                        console.log('parse_error', err);
                    } else {
                        if (result.rt.rc) {
                            if (result.rt.rc[0] === '0000') {
                                // 商品推送成功
                                if (result.rt.sends[0].send[0].sendcode) {
                                    // 注意expresscode,可能需要一步转化
                                    let exCode = '';
                                    if (result.rt.sends[0].send[0].expresscode[0] === 'ZTO') {
                                        exCode = 'zto';
                                    }
                                    if (result.rt.sends[0].send[0].expresscode[0] === 'STO') {
                                        exCode = 'sto';
                                    }
                                    if (result.rt.sends[0].send[0].expresscode[0] === 'SF') {
                                        exCode = 'sf-express';
                                    }
                                    let df = -1;
                                    if (result.rt.sends[0].send[0].forwardfee) {
                                        df = Number(result.rt.sends[0].send[0].forwardfee[0]);
                                    }
                                    updateOrderSended(tradeId, result.rt.sends[0].send[0].shiptime[0], result.rt.sends[0].send[0].sendcode[0], exCode, df)
                                }
                            } else {
                                console.log('wh_error', result.rt.rc[0] + result.rt.rm[0])
                            }
                        }
                    }
                });
            }
        });
    });
};

const format2XmlCdata = (data) => {
    let options = {
        cdata: true,
        rootName: 'tns:requestLogistics',
        headless: true
    };
    let builder = new xml2js.Builder(options);
    return builder.buildObject(data);
};

const format2Xml = (data) => {
    let options = {
        cdata: false,
        rootName: 'requestLogistics',
        headless: false
    };
    let builder = new xml2js.Builder(options);
    return builder.buildObject(data);
};

module.exports = async () => {
    try {
        let orders = [];
        last_key = 1;
        while (last_key) {
            if (last_key === 1) {
                last_key = 0;
            }
            let items = await PayOrderHistory(last_key);
            orders = orders.concat(items.Items);
            if (items.LastEvaluatedKey) {
                last_key = items.LastEvaluatedKey;
            } else {
                last_key = 0;
            }
        }
        // console.log(">>>>",orders)
        let newPayOrderList = [];
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].attrs.productDescription === '锦时家庭会员' && orders[i].attrs.status === 'SUCCESS_XBM') {
                newPayOrderList.push(orders[i].attrs)
            }
        }
        console.log(">>>>", newPayOrderList)

        for (let i = 0; i < newPayOrderList.length; i++) {
            setTimeout(() => {
                getLogisticsMsg(orders[i].attrs.tradeId);
            }, 500);
        }
    } catch (err) {
        console.error(err)
    }
};