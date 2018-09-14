const { dbRegion } = require('../../config');

const awsParams = {
    accessKeyId:'AKIAPQWLZ4KQYR7HGJ3Q',
    secretAccessKey:'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',
    region:dbRegion,
    dynamoEndpoint:'http://localhost:8000'
};

let host = 'https://api.jiyong365.com';

if (process.env.EV = 'STG'){
    host = 'https://stg.jiyong365.com'
}

// 锦时HOME-小程序参数
const  jsWaParams = {
    appid:'wx4bcc5cb5de9dc705',
    secret:'6332ac4083e3c5d601bab4fc4df7573e'
};

// 填写你的应用配置信息
const  appParams = {
    cluster:'Zeus', // AWS上集群名字
    service:'Common', // 服务名
    developer_name:'ziv' // 你的企业邮箱前缀
};


module.exports = {
    awsParams,
    jsWaParams,
    host
};