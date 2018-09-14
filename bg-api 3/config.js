// 后台服务的AWS参数
const awsParams = {
    accessKeyId:'AKIAP25THPPYTKQ3SMZQ',
    secretAccessKey:'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',
    region:'cn-northwest-1',
    // region:'cn-north-1',
    dynamoEndpoint:'http://localhost:8000'
};

let host = 'http://api.eatgood365.com';

if (process.env.EV = 'stg'){
    host = 'https://stg.eatgood365.com'
}

// 锦时HOME-小程序参数
const  jsWaParams = {
    appid:'wx4bcc5cb5de9dc705',
    secret:'6332ac4083e3c5d601bab4fc4df7573e'
};

const qiniuConfig = {
    ACCESS_KEY:'FcAROZO49rjG2WK1GMqgK_-mU3z9rif5ql43BHJe',
    SECRET_KEY:'NhjfxxooezGFLlwLYGsWZEYZhb5nnJU4NSimjb8J'
};

// 填写你的应用配置信息
const  appParams = {
    cluster:'Zeus', // AWS上集群名字
    service:'BE', // 服务名
    developer_name:'ziv' // 你的企业邮箱前缀
};

module.exports = {
    awsParams,
    jsWaParams,
    host,
    qiniuConfig
};