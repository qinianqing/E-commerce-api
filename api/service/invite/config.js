// 使用Product的参数
const { dbRegion } = require('../../config');

// 评价服务
const awsParams = {
    accessKeyId:'AKIAPMHW344KV7C4DV3A',
    secretAccessKey:'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',
    region:dbRegion,
    // dynamoEndpoint:'http://localhost:8000'
};

// 主域
let host = 'https://api.jiyong365.com';

if (process.env.EV === 'stg'){
    host = 'https://stg.jiyong365.com';
}

// secret
const secret = '6bac8008717948769a15be2e7def4714';
const qiniuConfig = {
    ACCESS_KEY:'FcAROZO49rjG2WK1GMqgK_-mU3z9rif5ql43BHJe',
    SECRET_KEY:'NhjfxxooezGFLlwLYGsWZEYZhb5nnJU4NSimjb8J',
    region:'http://up-z1.qiniup.com'
}
module.exports = {
    awsParams,
    secret,
    host,
    qiniuConfig
};