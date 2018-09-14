// cart service的用户
const { dbRegion } = require('../../config');

const awsParams = {
    accessKeyId:'AKIAPQ3BAAIWBV6ZOZKQ',
    secretAccessKey:'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',
    region:dbRegion,
    dynamoEndpoint:'http://localhost:8000'
};

let host = 'https://api.jiyong365.com';

// 根据环境调节
if (process.env.EV === 'STG'){
    host = 'https://stg.jiyong365.com'
}

// 填写你的应用配置信息
const  appParams = {
    cluster:'Zeus', // AWS上集群名字
    service:'Cart', // 服务名
    developer_name:'ziv' // 你的企业邮箱前缀
};

module.exports = {
    awsParams,
    host
};