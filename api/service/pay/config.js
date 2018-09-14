const { dbRegion } = require('../../config');

// 填写你的应用配置信息
const  appParams = {
    cluster:'Zeus', // AWS上集群名字
    service:'Pay', // 服务名
    developer_name:'' // 你的企业邮箱前缀
};

let host = 'https://api.jiyong365.com';

if(process.env.EV === 'STG'){
    host = 'https://stg.jiyong365.com';
}

// 填写服务的AWS服务参数
const awsParams = {
    accessKeyId:'AKIAODLIFC6PXODRNGAA',
    secretAccessKey:'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',
    region:dbRegion,
    dynamodbEndpoint:'http://localhost:8000'
};

// 小程序支付参数
const wxpayParams = {
    WEIXIN_APPID:'wx4bcc5cb5de9dc705', // 小程序APPID
    WEIXIN_MCHID:'1456835102', // 商户号
    WEIXIN_PAY_SECRET:'79uymeS8k3qFQAwxnzFUVGgrcfVH8Abx' //微信商户平台 API secret，非小程序 secret
};

module.exports = {
    awsParams,
    wxpayParams,
    host
};