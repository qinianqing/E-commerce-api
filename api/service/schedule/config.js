const { dbRegion } = require('../../config');

// TODO，注意schedule只能跑一个线程
// 填写你的应用配置信息
const  appParams = {
    cluster:'Zeus', // AWS上集群名字
    service:'schedule', // 服务名
    developer_name:'ziv@yongxin.io' // 你的企业邮箱前缀
};

let host = 'https://api.jiyong365.com';

if(process.env.EV === 'STG'){
    host = 'https://stg.jiyong365.com';
}

// 填写服务的AWS服务参数
const awsParams = {
    accessKeyId:'AKIAODLUFAI6FTDAFGFQ',
    secretAccessKey:'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',
    region:dbRegion,
    dynamodbEndpoint:'http://localhost:8000'
};

// 小程序支付参数
const wxpayParams = {
    WEIXIN_APPID:'wx4bcc5cb5de9dc705', // 小程序APPID
    WEIXIN_MCHID:'1456835102', // 商户号
    WEIXIN_PAY_SECRET:'79uymeS8k3qFQAwxnzFUVGgrcfVH8Abx', //微信商户平台 API secret，非小程序 secret,
    WEIXIN_SECRET:'6332ac4083e3c5d601bab4fc4df7573e'
};

module.exports = {
    awsParams,
    wxpayParams,
    host
};