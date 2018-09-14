// 品牌
const Brand = require('../models/Brand');
const Goods = require('../models/Goods');
const router = require('express').Router();

// 构造ES客户端
const AWS = require('aws-sdk');
// 配置es客户端
const options = {
    host: ['https://search-se-jinshi-capoiecpteku4kivjhdxtp3nr4.cn-northwest-1.es.amazonaws.com.cn'],
    connectionClass: require('http-aws-es'),
    awsConfig: new AWS.Config({
        region: 'cn-northwest-1',
        credentials: new AWS.Credentials('AKIAPQWLZ4KQYR7HGJ3Q', 'gcrf3r9jtZNCc47oBzin54wmWOHozmAl7dy/bGO2')
    }),
};
const es = require('elasticsearch').Client(options);

let getBrandDetail = (brand_id)=>{
    return new Promise((resolve,reject)=>{
        let brand = new Brand();
        brand.brand_id = brand_id;
        brand.getBrandDetails((err,resp)=>{
            if (err){
                reject({
                    error_code:5003,
                    error_msg:err.message
                })
            }else {
                resolve({
                    error_code:0,
                    error_msg:'ok',
                    data:resp.Items[0].attrs
                })
            }
        })
    });
};

// 根据品牌获取商品列表
// 更新为搜索引擎实现
router.get('/list-by-brand',(req,res,next)=>{
    if (req.query.brand_id){
        let handle = async ()=>{
            try {
                let query = req.query.brand_id;
                const size = 20;
                let from = 0;
                if (req.query.from) {
                    from = Number(req.query.from);
                }
                let brandMsg;
                if (from === 0){
                    brandMsg = await getBrandDetail(req.query.brand_id);
                    brandMsg = brandMsg.data;
                }
                es.search({
                    index: 'product',
                    type: 'goods',
                    body: {
                        "query": {
                            "bool": {
                                "must": [
                                    {"match_phrase": {"brand_id": query}},
                                    {"match_phrase": {"show": true}},
                                ],
                            }
                            // "function_score": {
                            //     "query": {
                            //         "bool":{
                            //             "must":[
                            //                 {"match_phrase":{"brand_id":query}},
                            //                 {"match_phrase":{"show":true}},
                            //             ],
                            //             "filter":{
                            //                 "term":{
                            //                     "direct":false
                            //                 }
                            //             },
                            //         }
                            //     },
                            //     "min_score":0.1
                            // }
                        },
                        // 排序算法
                        "sort":[
                            { "priority": { "order": "desc" }},
                            { "updatedAt": { "order": "desc" }}
                        ]
                    },
                    size: size,
                    from: from,
                }, (err, resp) => {
                    if (err) {
                        res.send({
                            error_code: 5001,
                            error_msg: err.message
                        })
                    } else {
                        res.send({
                            error_code: 0,
                            error_msg: 'ok',
                            data: {
                                brand:brandMsg,
                                product:resp.hits
                            }
                        })
                    }
                })
            }catch (err){
                res.send(err)
            }
        };
        handle();
    }else {
        res.send({
            error_code:5001,
            error_msg:'缺少品牌ID'
        })
    }
});

// 根据品牌获取商品列表
// router.get('/list-by-brand',(req,res,next)=>{
//     if (req.query.brand_id){
//         let goods = new Goods();
//         goods.brand_id = req.query.brand_id;
//         // 获取品牌信息
//         let brand = new Brand();
//         brand.brand_id = req.query.brand_id;
//         brand.getBrandDetails((err,resp)=>{
//             if (err){
//                 res.send({
//                     error_code:5003,
//                     error_msg:err.message
//                 })
//             }else {
//                 goods.getSpuByBrand((err,data)=>{
//                     if(err){
//                         res.send({
//                             error_code:5004,
//                             error_msg:err.message
//                         })
//                     }else {
//                         res.send({
//                             error_code:0,
//                             error_msg:'ok',
//                             data:{
//                                 brand:resp.Items[0].attrs,
//                                 product:data
//                             }
//                         })
//                     }
//                 })
//             }
//         })
//     }else {
//         res.send({
//             error_code:5001,
//             error_msg:'缺少品牌ID'
//         })
//     }
// });





module.exports = router;