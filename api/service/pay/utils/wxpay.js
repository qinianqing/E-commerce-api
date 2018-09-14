const WXPay = require('weixin-pay');
const { wxpayParams } = require('../config');

// 加载支付参数
const wxpay = WXPay({
    appid: wxpayParams.WEIXIN_APPID,
    mch_id: wxpayParams.WEIXIN_MCHID,
    partner_key: wxpayParams.WEIXIN_PAY_SECRET, //微信商户平台 API secret，非小程序 secret
    //pfx: fs.readFileSync('./apiclient_cert.p12'), //微信商户平台证书，暂不需要，用于退款
});

module.exports = wxpay;