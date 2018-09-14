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
let secret = 'ae425cc3e4f345de8fa39fab9db8e751';

module.exports = {
    awsParams,
    secret,
    host
};