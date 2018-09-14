/*
 * 将服务部署到预览环境
 * v0.1
 * ziv@yongxin.io
 */
const { appParams,awsParams } = require('../config');

// 配置AWS环境
var AWS = require('aws-sdk');
AWS.config.region = 'cn-north-1';
AWS.config.accessKeyId = awsParams.accessKeyId;
AWS.config.secretAccessKey = awsParams.secretAccessKey;
var ecs = new AWS.ECS({apiVersion:'2014-11-13'});

// 创建新镜像

// 创建任务定义

// 创建服务

