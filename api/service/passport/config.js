const { dbRegion } = require('../../config');

// 服务用户的AWS参数
const awsParams = {
    accessKeyId:'AKIAP25THPPYTKQ3SMZQ',
    secretAccessKey:'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',
    region:dbRegion,
    //dynamoEndpoint:'http://localhost:8000'
};

// secret
const secret = '6bac8008717948769a15be2e7def4714';

// secret key 内部调用令牌
const secretKey = 'acbfcda041084388890dbb05d6424b0c';

// 锦时HOME-小程序参数
const  jsWaParams = {
    appid:'wx4bcc5cb5de9dc705',
    secret:'6332ac4083e3c5d601bab4fc4df7573e'
};

module.exports = {
    awsParams,
    jsWaParams,
    secret,
    secretKey
};