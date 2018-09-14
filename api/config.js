// API服务部署参数
// TODO 上线前务必要将环境设置为生产环境

//let env = 'dev'; // 开发状态
let env = 'pro'; // 生产状态

if (process.env.EV === 'pro'){
    env = 'pro';
}

let dbRegion = 'cn-north-1';
// let dbRegion = 'cn-north-1';

if (env !== 'dev'){
    dbRegion = 'cn-northwest-1'
    // dbRegion = 'cn-north-1'
}


const awsParams = {
    accessKeyId:'AKIAOSZL26BZFRFFFI6A',
    secretAccessKey:'tdw3b1F0gHFzw4scDFoF+muUDR0JIbM/RECCjS5ja',
    region:'cn-north-1',
    // dynamoEndpoint:'http://localhost:8000'
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
    service:'API', // 服务名
    developer_name:'ziv' // 你的企业邮箱前缀
};

module.exports = {
    awsParams,
    jsWaParams,
    secret,
    host,
    env,
    dbRegion
};