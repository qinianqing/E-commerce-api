// /product
const router = require('express').Router();

const Brand = require('../models/Brand');
const Goods = require('../models/Goods');
const getWxcode = require('../../../utils/qrCode/createWaQrcode');
const product = require('../interface/getProduct');

// 根据tag来获取商品
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
router.get('/list-by-tag', (req, res, next) => {
    // 向ES服务发起请求
    if (req.query.tag) {
        let query = req.query.tag;
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
                                    {"match_phrase":{"tag":query}},
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
                    //     "tag": query
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

// 根据三级分类获取产品
// router.get('/list-by-category', (req, res, next) => {
//     if (req.query.last_key) {
//         req.query.last_key = decodeURIComponent(req.query.last_key);
//         req.query.last_key = JSON.parse(req.query.last_key);
//     }
//     let params = req.query;
//     let goods = new Goods;
//     goods.goods_level = params.category;
//     console.log(goods.goods_level)
//     goods.getSpuByCategory(params.last_key, (err, resp) => {
//         if (err) {
//             return res.send({
//                 error_code: 5001,
//                 error_msg: err.message
//             })
//         }
//         res.send({
//             error_code: 0,
//             error_msg: 'ok',
//             data: resp
//         })
//     })
// });

const getSpuOneWhetherCollect = require('../../subscribe/collect/interface/getSpuSomeoneWhetherCollect');
const getEvaNum = require('../../evaluate/interface/getSpuEvaCount');

//不带token
router.get('/untoken', (req, res, next) => {
    let params = req.query;
    let goods = new Goods();
    goods.goods_id = String(params.goods_id);
    goods.getGoods((err, goods) => {
        if (err) {
            res.send({
                error_code: 4000,
                error_msg: err.message
            })
        } else {
            if (goods.Count > 0) {
                let brand = new Brand();
                brand.brand_id = goods.Items[0].attrs.brand_id;
                brand.getBrandDetails((err, brands) => {
                    if (err) {
                        res.send({
                            error_code: 4001,
                            error_msg: err.message
                        })
                    } else {
                        if (brands.Count > 0) {
                            goods.Items[0].attrs.from = brands.Items[0].attrs.from;
                            goods.Items[0].attrs.name = brands.Items[0].attrs.name;
                            goods.Items[0].attrs.introduce = brands.Items[0].attrs.introduce;
                            goods.Items[0].attrs.is_collect = false;
                            // 获取评论数量
                            getEvaNum({
                                goods_id: String(params.goods_id),
                                callback: (resp) => {
                                    if (resp.error_code) {
                                        return res.send(resp);
                                    }
                                    goods.Items[0].attrs.eva_num = resp.data;
                                    if (resp.data > 9999) {
                                        goods.Items[0].attrs.eva_num = '9999+';
                                    }
                                    res.send({
                                        error_code: 0,
                                        error_msg: 'ok',
                                        data: goods.Items
                                    })
                                }
                            });
                            // res.send({
                            //     error_code:0,
                            //     error_msg:'ok',
                            //     data:goods.Items
                            // })


                        } else {
                            res.send({
                                error_code: 4002,
                                error_msg: 'the brand is miss'
                            })
                        }
                    }
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'the goods is null',
                    data: []
                })
            }
        }
    })
});

//生成微信分享二维码
router.get('/share/wx/code',(req,res,next)=>{
    let params = req.query;
    let scene = params.goods_id;
    let page = 'page/product/goodsdetail/goodsdetail';

    let good = new  Goods();
    good.goods_id = req.query.goods_id;
    good.getSpu(scene,(err,data)=> {
        if (err){
            return res.send({
                error_code:5001,
                error_msg:err.message
            })
        }
        if (!data){
            return res.send({
                error_code:5002,
                error_msg:'错误商品ID'
            })
        }
        let getWxcodeFun = async()=>{
            try {
                let code = await getWxcode(scene,page);
                res.send({
                    error_code:0,
                    error_msg:'ok',
                    data:code
                });
                good.wa_qr_code = code;
                good.updateWaQrCode(()=>{
                    console.log("success")
                });
            }catch (err){
                console.error(err)
            }
        };
        getWxcodeFun();
    });
});

//单独的sku
router.get('/getSku',function(req,res,next){
    let skus = [];
    let dataA = [];
    skus.push(req.query.skusId);
    product.get.skus({
        skus:skus,
        callback:(resp)=>{
            if(resp.error_code !== 0){
                return res.send(resp);
            }
            res.send({
                error_code:0,
                error_msg:'ok',
                data:resp.data
            })
        }
    });
    
});

//更改商品数据结构
router.get('/', (req, res, next) => {
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    let params = req.query;
    let goods = new Goods();
    goods.goods_id = String(params.goods_id);
    goods.getGoods((err, goods) => {
        if (err) {
            res.send({
                error_code: 4000,
                error_msg: err.message
            })
        } else {
            if (goods.Count > 0) {
                let brand = new Brand();
                brand.brand_id = goods.Items[0].attrs.brand_id;
                brand.getBrandDetails((err, brands) => {
                    if (err) {
                        res.send({
                            error_code: 4001,
                            error_msg: err.message
                        })
                    } else {
                        if (brands.Count > 0) {
                            goods.Items[0].attrs.from = brands.Items[0].attrs.from;
                            goods.Items[0].attrs.name = brands.Items[0].attrs.name;
                            goods.Items[0].attrs.introduce = brands.Items[0].attrs.introduce;
                            getSpuOneWhetherCollect({
                                user_id: req.currentUser.user_id,
                                goods_id: String(params.goods_id),
                                callback: (resp) => {
                                    if (resp.error_code) {
                                        return res.send(resp);
                                    }

                                    if (resp.data) {
                                        goods.Items[0].attrs.is_collect = true;
                                        goods.Items[0].attrs.collect_id = resp.collect_id;
                                    } else {
                                        goods.Items[0].attrs.is_collect = false;
                                    }
                                    // 获取评论数量
                                    getEvaNum({
                                        goods_id: String(params.goods_id),
                                        callback: (resp) => {
                                            if (resp.error_code) {
                                                return res.send(resp);
                                            }
                                            goods.Items[0].attrs.eva_num = resp.data;
                                            if (resp.data > 9999) {
                                                goods.Items[0].attrs.eva_num = '9999+';
                                            }
                                            res.send({
                                                error_code: 0,
                                                error_msg: 'ok',
                                                data: goods.Items
                                            })
                                        }
                                    });
                                }
                            });
                        } else {
                            res.send({
                                error_code: 4002,
                                error_msg: 'the brand is miss'
                            })
                        }
                    }
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'the goods is null',
                    data: []
                })
            }
        }
    })
});
//得到相关商品
router.get('/get/correlation',(req,res,next)=>{
     let goods = new Goods();
     let params = req.query;
     goods.goods_id = params.goods_id;
     goods.getGoodsCorrelationId((err,data)=>{
         if(err){
             res.send({
                 error_code:4001,
                 error_msg:err.message
             })
         }else{
             if (data.Count){
                 if(data.Items[0].attrs.correlation && data.Items[0].attrs.correlation.length > 0){
                     let list = data.Items[0].attrs.correlation;
                     let newList = [];
                     for(let i = 0;i < list.length;i++){
                         let item = {
                             goods_id:list[i]
                         };
                         newList.push(item)
                     }
                    
                     goods.getSpus(newList,(err,lists)=>{
                        
                         if(err){
                             res.send({
                                 error_code:4002,
                                 error_msg:err.message
                             })
                         }else{
                             res.send({
                                 error_code:0,
                                 error_msg:'ok',
                                 data:lists
                             })
                         }
                     })
                 }else{
                     res.send({
                         error_code:0,
                         error_msg:'ok',
                         data:[]
                     })
                 }
             }else {
                 res.send({
                     error_code:0,
                     error_msg:'ok',
                     data:[]
                 })
             }
         }
     })
});
module.exports = router;