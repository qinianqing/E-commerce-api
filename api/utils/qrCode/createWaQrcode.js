const request = require('request');
const qn = require('qn');

const getWaToken = require('../getToken/getWaToken');


const { qiniuConfig } = require('./config');

const client = qn.create({
    accessKey: qiniuConfig.ACCESS_KEY,
    secretKey: qiniuConfig.SECRET_KEY,
    bucket: 'jinshi-ugc',
    origin: 'https://img1.jiyong365.com',
    // timeout: 3600000, // default rpc timeout: one hour, optional
    // if your app outside of China, please set `uploadURL` to `http://up.qiniug.com/`
    uploadURL: 'https://up-z1.qiniup.com',
});

module.exports = (scene,page)=>{
    return new Promise((resolve,reject)=>{
        let handle = async ()=>{
            let wx_access_token = await getWaToken();
            let postData = {
                    scene: scene,
                    width: 300,
                    page: page,
                };
            postData = JSON.stringify(postData);
            request({
                method: 'POST',
                url: 'http://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=' + wx_access_token,
                body: postData,
                encoding: null //很重要，把请求头编码设置为二进制
            }, function (error, response, body) {
                //把二进制转化为buffer
                let buffer = new Buffer(body, 'binary');
                let randomStr = Math.random().toString(36).substr(2);
                let picName = 'wx_code' + Date.now() + randomStr + '.png';
                client.upload(buffer, {key: picName}, function (err, result) {
                    if (err){
                        reject(err)
                    }
                    resolve(result.url);
                });
            });
        };
        handle();
    })
};