const { dbRegion } = require('../../../config');

// 优惠券服务的AWS参数
const awsParams = {
    accessKeyId:'AKIAOSZL26BZSTFTHI6A',
    secretAccessKey:'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',
    region:dbRegion,
    //dynamoEndpoint:'http://localhost:8000'
};

let host = 'https://api.jiyong365.com';

if (process.env.EV = 'stg'){
    host = 'https://stg.jiyong365.com'
}

// secret 内部调用令牌
const secret = '6bac8008717948769a15be2e7def4714';

// 锦时+ - 小程序参数
const  jsWaParams = {
    appid:'wx4bcc5cb5de9dc705',
    secret:'6332ac4083e3c5d601bab4fc4df7573e'
};

// 填写你的应用配置信息
const  appParams = {
    cluster:'Zeus', // AWS上集群名字
    service:'Cobranded', // 服务名
    developer_name:'ziv' // 你的企业邮箱前缀
};

module.exports = {
    awsParams,
    jsWaParams,
    secret,
    host
};