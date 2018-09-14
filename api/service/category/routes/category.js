// 分类
const router = require('express').Router();
const { secret } = require('../config');
const Category = require('../models/Category');
const Goods = require('../../product/models/Goods');

//录入Category数据
router.post('/create-category', (req, res, next) => {
    let p = req.body;
    if (p.secret === secret){
        if (p.name && p.level && p.parent_id){
            let category = new Category();
            category.name = p.name;
            category.level = p.level;
            category.parent_id = p.parent_id || '';
            category.cover = p.cover || '';
            category.create((err, data) => {
                if (err) {
                    res.send({
                        error_code: 4000,
                        error_msg: err.message
                    })
                } else {
                    res.send({
                        error_code: 0,
                        error_msg: 'ok'
                    })
                }
            })
        }else {
            res.send({
                error_code:5002,
                error_msg:'缺少参数'
            })
        }
    }else {
        res.send({
            error_code: 4001,
            error_msg: '错误secret'
        })
    }
});

// 输入一个类目ID返回子类目
router.get('/child_category', (req, res, next) => {
    let params = req.query;
    if (!params.id){
        return res.send({
                error_code:5002,
                error_msg:'缺少ID'
        })
    }
    let category = new Category();
    category.getChildCategory(params.id,(err,data)=>{
        if (err){
            return res.send({
                error_code:5001,
                error_msg:err.message
            })
        }
        res.send({
            error_code:0,
            error_msg:'ok',
            data:data
        })
    });
});

// 请求同级id，返回同级
router.get('/get_peerid',(req,res,next)=>{
    let params = req.query;
    let category = new Category();
    category.id = params.id;
    category.getCategory((err,data)=>{
        if(err){
            res.send({
                error_code:4000,
                error_msg:err.message
            })
        }else{
            let parent_id = data.attrs.parent_id;
            category.getChildCategory(parent_id,(err,data)=>{
                if(err){
                    res.send({
                        error_code:4001,
                        error_msg:err.message
                    })
                }else{
                    let list = [];
                    if(data.Count > 0){
                        for(let i = 0;i < data.Count;i++){
                            list.push(data.Items[i].attrs)
                        }
                    }
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:list
                    })
                }
            })
        }
    })
});

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
router.get('/get_goods', (req, res, next) => {
    // 向ES服务发起请求
    if (req.query.levelid3) {
        let query = req.query.levelid3;
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
                    "match_phrase": {
                        "level3_id": query
                    },
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

// //得到ID下面的商品
// 更新为使用搜索引擎实现

// router.get('/get_goods',(req,res,next)=>{
//     let params = req.query;
//     let goods = new Goods();
//     goods.getspusByLevel3(params.levelid3,(err,data)=>{
//         if(err){
//             res.send({
//                 error_code:4000,
//                 error_msg:err.message
//             })
//         }else{
//             let goodsArray = [];
//             if(data.Count > 0){
//                 for(let i = 0;i < data.Count;i++){
//                     goodsArray.push(data.Items[i].attrs)
//                 }
//             res.send({
//                 error_code:0,
//                 error_msg:'ok',
//                 data:goodsArray
//             })
//         }else{
//           res.send({
//             error_code:0,
//             error_msg:'ok',
//             data:goodsArray
//         })
//       }}
//     })
// });

module.exports = router;