/*
 * 部署AWS正式环境
 * 启动服务器
 */

// 部署AWS正式环境
const { appParams,awsParams } = require('../config');

// 校验集群名是否合法
var clusterNameArray = ['API','FE','SE']
var legal = 0;
for (let i = 0;i<clusterNameArray.length;i++){
    if(appParams.cluster = clusterNameArray[i]){
        legal++;
    }
}
if (!legal){
    throw new Error('cluster name is illegal');
}

// 配置AWS环境
var AWS = require('aws-sdk');
AWS.config.region = 'cn-north-1';
AWS.config.accessKeyId = awsParams.accessKeyId;
AWS.config.secretAccessKey = awsParams.secretAccessKey;
var ecs = new AWS.ECS({apiVersion:'2014-11-13'});

//