// Passport SDK v1.0

// TODO 务必记录每一次修改

// v1.0 Ziv
// 2018-03-14
// 通过callback的方式获取微信模板ID或者在微信支付中添加模板ID，依赖axios库

// 首先应当调用init，传入secret

let secret = '';

// 依赖库
const axios = require('axios');
const qs = require('querystring');

// 设置域名
let host = 'https://api.jiyong365.com';
//let host = 'http://localhost:3000';

if (process.env.EV === 'stg'){
    host = 'https://stg.jiyong365.com';
}

let methods = {
    init:(sec)=>{
        secret = sec;
    },
    userInfo:{
        get:(user_id,callback)=>{
            if (!secret){
                throw  new Error('缺少秘钥');
            }
            let path = '/user/sdk/info';
            let params = {
                user_id:user_id,
                secret:secret
            };
            requestPost(path,params,(resp)=>{
                callback(resp);
            })
        },
        batch:(users,callback)=>{
            if (!secret){
                throw  new Error('缺少秘钥');
            }
            let path = '/user/sdk/info-batch';
            let params = {
                users:users,
                secret:secret
            };
            requestPost(path,params,(resp)=>{
                callback(resp);
            })
        }
    }
    ,
    formId:{
        // 添加模板消息发送秘钥
        add:(user_id,prepayId,callback)=>{
            if(secret){
                let nowT = new Date();
                nowT = nowT.getTime();
                let aDay = 1000 * 60 * 60 * 24;
                let expiredAt = nowT+7*aDay;

                let path = '/user/add-form-id-pay';
                let params = {
                    user_id:user_id,
                    form_id:prepayId,
                    quota:3,
                    expiredAt:expiredAt,
                    secret:secret
                };
                requestPost(path,params,(resp)=>{
                    callback(resp);
                });
            }else {
                throw new Error('缺少秘钥');
            }
        },
        // 返回模板消息ID
        use:(user_id,callback)=>{
            if(secret){
                let path = '/user/get-form-id-wa';
                let params = {
                    user_id:user_id,
                    secret:secret
                };
                requestPost(path,params,(resp)=>{
                    callback(resp);
                });
            }else {
                throw new Error('缺少秘钥');
            }
        }
    },
};

let requestPost = (path,params,callback)=>{
    axios.post(host+path,qs.stringify(params))
        .then((response) => {
            callback(response.data);
        },(error) => {
            console.error(error.message);
        })
};



module.exports = methods;