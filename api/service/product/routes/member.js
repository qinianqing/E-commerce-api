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

router.get('/list-by-member', (req, res, next) => {
    // 向ES服务发起请求
    if (req.query.member) {
        let query = req.query.member;
        const size = 20;
        let from = 0;
        if (req.query.from) {
            from = req.query.from;
        }
        es.search({
            index: 'product',
            type: 'goods',
            body: {
                "query": {
                    "function_score": {
                        "query": {
                            "bool":{
                                "must":[
                                    {"match_phrase":{"member":query}},
                                    {"match_phrase":{"show":true}},
                                ],
                                "filter":{
                                    "term":{
                                        "direct":false
                                    }
                                },
                            }
                        },
                        "min_score":0.1
                    }
                    // "match_phrase": {
                    //     "member": query
                    // },
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
                    data: resp.hits
                })
            }
        })
    } else {
        res.send({
            error_code: 5000,
            error_msg: 'need query'
        })
    }
});

module.exports = router;