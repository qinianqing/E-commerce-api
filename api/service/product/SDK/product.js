// Product SDK v1.0

// TODO 务必记录每一次修改

// v1.0 Ziv
// 2018-03-16
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
    // 批量未去重
    skus2spus:(skus)=>{
        if (secret){
            let spus = [];
            for (let i=0;i<skus.length;i++){
                spus.push(skus[i].split('-')[0]);
            }
            return spus;
        }else {
            throw new Error('缺少秘钥');
        }
    },
    sku2spu:(sku)=>{
        if (secret){
            return sku.split('-')[0];
        }else {
            throw new Error('缺少秘钥');
        }
    },
    get:{
        // 获取SPU的基本信息
        spuBrief:(p)=>{
            if (!p.spu_id||!p.callback){
                throw new Error('参数不全');
            }
            if (!secret){
                throw new Error('缺少秘钥');
            }

            let path = '/product/sdk/spu-brief';
            let params = {
                spu_id:p.spu_id,
                secret:secret
            };
            requestPost(path,params,(resp)=>{
                p.callback(resp);
            })
        },
        // 获取SPU的完整信息
        spu:(p)=>{
            if (!p.spu_id||!p.callback){
                throw new Error('参数不全');
            }
            if (!secret){
                throw new Error('缺少秘钥');
            }

            let path = '/product/sdk/spu';
            let params = {
                spu_id:p.spu_id,
                secret:secret
            };
            requestPost(path,params,(resp)=>{
                p.callback(resp);
            })
        },
        // 获取spu列表
        spus:(p)=>{
            if (!p.spus||!p.callback){
                throw new Error('参数不全');
            }
            if (!secret){
                throw new Error('缺少秘钥');
            }

            let path = '/product/sdk/spu-batch';
            let params = {
                spus:p.spus,
                secret:secret
            };
            requestPost(path,params,(resp)=>{
                p.callback(resp);
            })
        },
        // 获取spu列表的简要信息
        spusBrief:(p)=>{
            if (!p.spus||!p.callback){
                throw new Error('参数不全');
            }
            if (!secret){
                throw new Error('缺少秘钥');
            }

            let path = '/product/sdk/spu-brief-batch';
            let params = {
                spus:p.spus,
                secret:secret
            };
            requestPost(path,params,(resp)=>{
                p.callback(resp);
            })
        },
        // 获取sku基本信息
        skuBrief:(p)=>{
            if (!p.sku_id||!p.callback){
                throw new Error('参数不全');
            }
            if (!secret){
                throw new Error('缺少秘钥');
            }

            let path = '/product/sdk/sku-brief';
            let params = {
                sku_id:p.sku_id,
                secret:secret
            };
            requestPost(path,params,(resp)=>{
                p.callback(resp);
            })
        },
        // 获取SKU的基本信息
        sku:(p)=>{
            if (!p.sku_id||!p.callback){
                throw new Error('参数不全');
            }
            if (!secret){
                throw new Error('缺少秘钥');
            }

            let path = '/product/sdk/sku';
            let params = {
                sku_id:p.sku_id,
                secret:secret
            };
            requestPost(path,params,(resp)=>{
                p.callback(resp);
            })
        },
        // 批量获取SKU的基本信息
        skus:(p)=>{
            if (!p.skus||!p.callback){
                throw new Error('参数不全');
            }
            if (!secret){
                throw new Error('缺少秘钥');
            }

            let path = '/product/sdk/sku-batch';
            let params = {
                skus:p.skus,
                secret:secret
            };
            requestPost(path,params,(resp)=>{
                p.callback(resp);
            })
        },
        // 批量获取SKU的简要信息
        skusBrief:(p)=>{
            if (!p.skus||!p.callback){
                throw new Error('参数不全');
            }
            if (!secret){
                throw new Error('缺少秘钥');
            }

            let path = '/product/sdk/sku-brief-batch';
            let params = {
                skus:p.skus,
                secret:secret
            };
            requestPost(path,params,(resp)=>{
                p.callback(resp);
            })
        },
    }
};

let requestPost = (path,params,callback)=>{
    axios.post(host+path,qs.stringify(params))
        .then((response) => {
            callback(response.data);
        },(error) => {
            console.error(error.message);
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