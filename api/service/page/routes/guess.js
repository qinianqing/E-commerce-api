const router = require('express').Router();
const Guess = require('../models/Common');
const sort = require('../utils/utils');

router.get('/', (req,res,next) => {
    if (req.query.guess_id) {
        let guess = new Guess();
        guess.source = String(req.query.guess_id);
        guess.getGuess((err,data) => {
            if (err) {
                res.send({
                    error_code:5001,
                    error_msg:err.message
                })
            }else{
                if (data.Count) {
                    let list = [];
                    for(let i=0;i<data.Count;i++){
                        let item = data.Items[i].attrs.product;
                        item.index = data.Items[i].attrs.index;
                        item.guess_id = data.Items[i].attrs.source;
                        list.push(item)
                    }
                    // 返回正向排序的数据
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:sort.ascending(list)
                    })
                }else{
                    res.send({
                        error_code:5002,
                        error_msg:'no data'
                    })
                }
            }
        });
    }else{
        res.send({
            error_code:5000,
            error_msg:'short guess_id'
        })
    }
});

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