// Goods_group SDK v1.0

// TODO 务必记录每一次修改

// v1.0 Ziv
// 2018-04-18

// 4-20完成测试

// 用于其他微服务对优惠券接口的调用，依赖axios库

// 调用示例：

// 使用前必须先调用init，初始化secret
let secret = '';

// 依赖库
const axios = require('axios');
const qs = require('querystring');

// 设置域名
//let host = 'https://api.jiyong365.com';
let host = 'http://localhost:3001';

if (process.env.EV === 'stg'){
    host = 'https://stg.jiyong365.com'
}

let methods = {
    init:(sec)=>{
        secret = sec;
    },
    // 创建一个商品集合
    // @param object
    create:(p)=>{

        if (secret) {
            if (p.cover&&p.list_cover&&p.title&&p.focus&&p.describe&&p.list&&p.callback){
                let path = '/product/group/create';
                let params = {
                    cover:p.cover,
                    list_cover:p.list_cover,
                    title:p.title,
                    focus:p.focus,
                    describe:p.describe,
                    list:p.list,
                    secret:secret
                };
                requestPost(path,params,(resp)=>{
                    p.callback(resp);
                });
            }else{
                throw new Error('缺少参数');
            }
        }else{
            throw new Error('缺少秘钥');
        }
    },
    // 编辑订阅商品
    update:(p)=>{
        if (secret) {
            if (p.id&&p.callback){
                let path = '/product/group/update';
                let params = {
                    id:p.id,
                    cover:p.cover,
                    list_cover:p.list_cover,
                    title:p.title,
                    focus:p.focus,
                    describe:p.describe,
                    list:p.list,
                    secret:secret
                };
                requestPost(path,params,(resp)=>{
                    p.callback(resp);
                });
            }else{
                throw new Error('需要参数');
            }
        }else{
            throw new Error('缺少秘钥');
        }
    },
    // 获取订阅集合列表
    // 如果有last_key需要对其拆分成id两个项
    list:(p)=>{
        if (secret) {
            if (p.callback){
                let path = '/product/group/list';
                let params = {
                    id:p.id,
                    secret:secret
                };
                requestPost(path,params,(resp)=>{
                    p.callback(resp);
                });
            }else{
                throw new Error('需要参数');
            }
        }else{
            throw new Error('缺少秘钥');
        }
    },
    // 检索订阅集合
    search:(p)=>{
        if (secret) {
            if (p.query&&p.callback){
                let path = '/product/group/search';
                let params = {
                    query:p.query,
                    secret:secret
                };
                requestPost(path,params,(resp)=>{
                    p.callback(resp);
                });
            }else{
                throw new Error('需要参数');
            }
        }else{
            throw new Error('缺少秘钥');
        }
    }
};

let requestPost = (path,params,callback)=>{
    axios.post(host+path,qs.stringify(params))
        .then((response) => {
            callback(response.data);
        },(error) => {
            console.error(error);
        })
};

let requestGet = (path,params,callback)=>{
    axios.get(host+path, {params: params})
        .then(function (response) {
            callback(response.data);
        })
        .catch(function (error) {
            console.error(error);
        });
};

module.exports = methods;