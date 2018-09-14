const { dbRegion } = require('../../config');

// 填写你的应用配置信息
const  appParams = {
    cluster:'Zeus', // AWS上集群名字
    service:'order', // 服务名
    developer_name:'ziv' // 你的企业邮箱前缀
};

// order service的AWS服务参数
const awsParams = {
    accessKeyId:'AKIAO642RUM4H4BZANCA',
    secretAccessKey:'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',
    region:dbRegion,
    dynamodbEndpoint:'http://localhost:8000'
};

// 主域
let host = 'https://api.jiyong365.com';

if (process.env.EV === 'stg'){
    host = 'https://stg.jiyong365.com'
}

module.exports = {
    awsParams,
    host
};