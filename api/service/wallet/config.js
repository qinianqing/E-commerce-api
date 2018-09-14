const { dbRegion } = require('../../config');

// 填写你的应用配置信息
const  appParams = {
    cluster:'Zeus', // AWS上集群名字
    service:'Pay', // 服务名
    developer_name:'' // 你的企业邮箱前缀
};

let host = 'https://api.jiyong365.com';

if(process.env.EV === 'STG'){
    host = 'https://stg.jiyong365.com';
}

// 钱包服务的AWS服务参数，目前和pay服务一致
const awsParams = {
    accessKeyId:'AKIAODLIFC6PXODRNGAA',
    secretAccessKey:'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',
    region:dbRegion,
    dynamodbEndpoint:'http://localhost:8000'
};

module.exports = {
    awsParams,
    host
};