const { dbRegion } = require('../../config');

// family service的用户
const awsParams = {
    accessKeyId:'AKIAOBHFHBWSJNOIXOCA',
    secretAccessKey:'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',
    region:dbRegion,
    dynamoEndpoint:'http://localhost:8000'
};

let host = 'https://api.jiyong365.com';

// inner API secret
const innerSecret = '2d5a8a7f1be346b089a4cb63d5cdf88f';

// 锦时HOME-小程序参数
const  jsWaParams = {
    appid:'wx4bcc5cb5de9dc705',
    secret:'564d7746192a122f512dff44f450deee'
};

// 填写你的应用配置信息
const  appParams = {
    cluster:'Zeus', // AWS上集群名字
    service:'Family', // 服务名
    developer_name:'ziv' // 你的企业邮箱前缀
};

// 零售价
let price = 199;

// 根据环境调节
if (process.env.EV === 'STG'){
    price = 0.01;
    host = 'https://stg.jiyong365.com'
}

module.exports = {
    awsParams,
    jsWaParams,
    innerSecret,
    price,
    host
};