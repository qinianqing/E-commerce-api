// 填写你的应用配置信息
const appParams = {
    cluster: '', // AWS上集群名字
    service: '', // 服务名
    developer_name: '' // 你的企业邮箱前缀
};

let host = 'https://api.jiyong365.com';

if (process.env.EV === 'STG') {
    host = 'https://stg.jiyong365.com';
}

// 填写服务的AWS服务参数
const awsParams = {
    accessKeyId: 'AKIAODLUFAI6FTDAFGFQ',
    secretAccessKey: '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',
    region: 'cn-northwest-1',
    dynamodbEndpoint: 'http://localhost:8000'
};

// 锦时Home服务号
const fwhParams = {
    appid: 'wxa65fa2c65ec5fdcf',
    secret: 'c8cf032e222e73687a5f46ea11853e7c'
};

// 小程序支付参数
const wxpayParams = {
    WEIXIN_APPID: 'wx4bcc5cb5de9dc705', // 小程序APPID
    WEIXIN_MCHID: '1456835102', // 商户号
    WEIXIN_PAY_SECRET: '79uymeS8k3qFQAwxnzFUVGgrcfVH8Abx', //微信商户平台 API secret，非小程序 secret,
    WEIXIN_SECRET: '6332ac4083e3c5d601bab4fc4df7573e'
};
//task 仓库对接 小斑马
const xbmParams = {
    cid: 'c36907a06aec4ca4ae08a7f7cd5777a3',
    pwd: '35cfb4d032b24bf7a01901b556dd8299',
    clientid: 'c36907a06aec4ca4ae08a7f7cd5777a3',
    warehouseid: 'f29bae8c3cc74893b4898e783f41446b',
    whUrl:'http://xiaobanma.kucangbao.com/kcb-1.0/cxf/warehouse?wsdl'
}
module.exports = {
    awsParams,
    wxpayParams,
    host,
    fwhParams,
    xbmParams
};