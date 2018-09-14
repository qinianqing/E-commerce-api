// search

let express = require('express');
let router = express.Router();

// 构造ES客户端
const AWS = require('aws-sdk');
// 配置es客户端
const options = {
    host:['https://search-se-jinshi-capoiecpteku4kivjhdxtp3nr4.cn-northwest-1.es.amazonaws.com.cn'],
    connectionClass: require('http-aws-es'),
    awsConfig:new AWS.Config({
        region:'cn-northwest-1',
        credentials: new AWS.Credentials('AKIAPQWLZ4KQYR7HGJ3Q','gcrf3r9jtZNCc47oBzin54wmWOHozmAl7dy/bGO2')
    }),
};
const es = require('elasticsearch').Client(options);

// 搜索主入口
router.get('/',(req,res,next)=>{
    // 向ES服务发起请求
    if (req.query.query || req.query.query === 0){
        let query = req.query.query;
        const size = 20;
        let from = 0;
        if (req.query.from){
            from = req.query.from;
        }
        es.search({
            index:'product',
            type:'goods',
            body:{
                "query":{
                    "function_score": {
                        "query": {
                            "bool":{
                                "should":[
                                    {"match_phrase":{"goods_name":query}},
                                    {"match_phrase":{"describe":query}},
                                ],
                                "filter":{
                                    "term":{
                                        "direct":false
                                    }
                                },

                            },
                        },
                        "min_score":0.1
                    }
                }
            },
            size:size,
            from:from,
            //analyzer:'analysis-smartcn'
        },(err,resp)=>{
            if (err){
                res.send({
                    error_code:5001,
                    error_msg:err.message
                })
            }else {
                res.send({
                    error_code:0,
                    error_msg:'ok',
                    data:resp.hits
                })
            }
        })
    }else {
        res.send({
            error_code:5000,
            error_msg:'need query'
        })
    }
});

//猜你喜欢
router.get('/random',(req,res,next)=>{
    // 向ES服务发起请求
    const size = 16;
    es.search({
        index:'product',
        type:'goods',
        body:{
            "query": {
                "bool":{
                    "must":[
                        {
                            "term":
                                {"show":true}
                        },
                        {
                            "term":{
                                "direct":false
                            }
                        }
                    ]
                }
            },
            "sort":{
                "_script":{
                    "script":"Math.random()",
                    "type":"number",
                    //"params":{},
                    "order":"asc"
                }
            }
        },
        size:size,
        from:0,
    },(err,resp)=>{
        if (err){
            res.send({
                error_code:5001,
                error_msg:err
            })
        }else {
            res.send({
                error_code:0,
                error_msg:'ok',
                data:resp.hits
            })
        }
    })
});


module.exports = router;

// // // mapping
// router.get('/delete-index',(req,res,next)=>{
//     es.indices.delete({
//         index:'product'
//     },(err,resp)=>{
//         console.log(err);
//         console.log(resp);
//     })
// });
//
//
// router.get('/create-index',(req,res,next)=>{
//     es.indices.create({
//         index:'product'
//     },(err,resp)=>{
//         console.log(err);
//         console.log(resp);
//     })
// });
//
// router.get('/set-mapping',(req,res,next) =>{
//     es.indices.putMapping({
//         index:'subscribe',
//         type:'wares',
//         body:{
//             "properties": {
//                 // "goods_name": {
//                 //     "type": "text",
//                 //     "analyzer": "smartcn",
//                 //     "search_analyzer": "smartcn"
//                 // },
//                 // "describe": {
//                 //     "type": "text",
//                 //     "analyzer": "smartcn",
//                 //     "search_analyzer": "smartcn"
//                 // },
//                 "priority":{
//                     "type":"long",
//                     "fielddata": true
//                 }
//                 // "tag":{
//                 //     "type":"keyword",
//                 // },
//             }
//         }
//     },(err,resp)=>{
//         console.log(err);
//         console.log(resp);
//         if (err){
//             res.send(err)
//         }else {
//             res.send(resp)
//         }
//     })
// });