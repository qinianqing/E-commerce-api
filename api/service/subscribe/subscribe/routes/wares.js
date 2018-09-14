const router = require('express').Router();

const Wares = require('../models/Subscribe-wares');
const Map = require('../models/Subscribe-spu-map');
const {secret} = require('../../config');

const getProductMsg = require('../../../product/interface/getProduct');
const updateSpuSubsMap = require('../interface/updateSpuSubsMap');
const getWxCode = require('../../../../utils/qrCode/createWaQrcode');

// 去重方法
function unique(arr) {
    let result = [];
    for (let i = 0; i < arr.length; i++) {
        if (result.indexOf(arr[i]) === -1) {
            result.push(arr[i])
        }
    }
    return result;
}

// cms获得某个订阅商品详情
router.get('/id-list', (req, res, next) => {
    if (!req.query.id) {
        return res.send({
            error_code: 5002,
            error_msg: '缺少参数'
        })
    }
    let wares = new Wares();
    wares.id = req.query.id;
    wares.getWare((err, data) => {
        if (err) {
            res.send({
                error_code: 5003,
                error_msg: err.message
            })
        } else {
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: data
            })
        }
    })
});

// 获得订阅商品列表
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
router.get('/list', (req, res, next) => {
    // 向ES服务发起请求
    const size = 20;
    let from = 0;
    if (req.query.from) {
        from = req.query.from;
    }
    es.search({
        index: 'subscribe',
        type: 'wares',
        body: {
            "query": {
                "match_phrase": {
                    "show": 1
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
});

// 获得订阅商品列表
router.get('/cms-list', (req, res, next) => {
    if (req.query.last_key) {
        req.query.last_key = decodeURIComponent(req.query.last_key);
        req.query.last_key = JSON.parse(req.query.last_key);
    }
    let wares = new Wares();
    wares.getSubcribeListCms((err, data) => {
        if (err) {
            res.send({
                error_code: 5003,
                error_msg: err.message
            })
        } else {
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: data
            })
        }
    }, req.query.last_key)
});
// 根据id获得订阅商品列表
router.get('/create-list', (req, res, next) => {
    let wares = new Wares();
    wares.id = req.query.id;
    wares.getWare((err, data) => {
        if (err) {
            res.send({
                error_code: 5003,
                error_msg: err.message
            })
        } else {
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: data
            })
        }
    })
});

// // 获得订阅商品列表
// router.get('/list',(req,res,next) => {
//     if(req.query.last_key){
//         req.query.last_key = decodeURIComponent(req.query.last_key);
//         req.query.last_key = JSON.parse(req.query.last_key);
//     }
//     let wares = new Wares();
//     wares.getSubcribeList((err,data)=>{
//         if (err){
//             res.send({
//                 error_code:5003,
//                 error_msg:err.message
//             })
//         }else {
//             res.send({
//                 error_code:0,
//                 error_msg:'ok',
//                 data:data
//             })
//         }
//     },req.query.last_key)
// });

const getWares = require('../interface/getSubsWaresDetail');
// 获取某个spu_id下的所有可订阅的商品列表，只包括列表展现的基本信息
router.get('/spu-wares', (req, res, next) => {
    if (!req.query.spu_id) {
        return res.send({
            error_code: 5002,
            error_msg: '缺少参数'
        })
    }
    let map = new Map();
    map.spu_id = req.query.spu_id;
    map.getSpu2Sub((err, data) => {
        if (err) {
            return res.send({
                error_code: 5003,
                error_msg: err.message
            })
        }
        if (!data) {
            return res.send({
                error_code: 5004,
                error_msg: '该商品无订阅场景'
            })
        }
        data = data.attrs;
        const handle = async () => {
            try {
                let items = [];
                for (let i = 0; i < data.subscribe_ids.length; i++) {
                    let result = await getWares({
                        id: data.subscribe_ids[i]
                    });
                    result = result.data;
                    items.push({
                        id: data.subscribe_ids[i],
                        cover: result.cover,
                        list_cover: result.list_cover,
                        title: result.title,
                        focus: result.focus,
                    })
                }
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: items
                })
            } catch (err) {
                res.send(err)
            }
        };
        handle();
    })
});

//获得订阅分享二维码
router.get('/wx/code', (req, res, next) => {
    let params = req.query;
    let scene = params.id;
    let page = 'page/subscribe/detail/detail';
    let getCode = async () => {
        try {
            let subscribeCode = await getWxCode(scene, page);
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: subscribeCode
            })
        } catch (err) {
            console.log("err")
        }
    }
    getCode();
})

router.post('/create', function (req, res, next) {
    if (req.body.secret === secret) {
        let p = req.body;
        if (p.show >= 0 && p.banners && p.cover.length>0 && p.title && p.focus && p.share_cover.length>0) {
            let wares = new Wares();
            wares.id = p.id;
            wares.show = Number(p.show);
            wares.focus = p.focus;
            wares.cover = p.cover;
            wares.list_cover = p.list_cover;
            wares.title = p.title;
            wares.share_cover = p.share_cover;

            let list = [];
            for (let i = 0; i < p.banners.length; i++) {
                let item = p.banners[i].banner;
                list.push(item);
            }
            let a = -1;
            for (let i = 0; i < list.length; i++) {
                a++;
                list[i].id = wares.id + "#" + a;
                let b = -1;
                for (let m = 0; m < list[i].price.length; m++) {
                    b++;
                    list[i].price[m].id = list[i].id + '#' + b;
                    list[i].price[m].price = Number(list[i].price[m].price);
                    list[i].price[m].stages = Number(list[i].price[m].stages);
                    list[i].price[m].vip_price = Number(list[i].price[m].vip_price);
                }
                for (let n = 0; n < list[i].skus.length; n++) {
                    list[i].skus[n].num = Number(list[i].skus[n].num);
                }
            }
            wares.wares = list;

            wares.create((err, data) => {
                if (err) {
                    res.send({
                        error_code: 5003,
                        error_msg: err.message
                    })
                } else {
                    res.send({
                        error_code: 0,
                        error_msg: 'ok'
                    })
                }
            })
        } else {
            res.send({
                error_code: 5002,
                error_msg: '缺少参数'
            })
        }
    } else {
        res.send({
            error_code: 5001,
            error_msg: '无访问权限'
        })
    }
});

// 更新优惠券信息
router.post('/update', function (req, res, next) {
    if (req.body.secret === secret) {
        let p = req.body;
        if (p.id && p.show >= 0 && p.banners && p.cover && p.title && p.focus && p.share_cover.length >0) {
            let wares = new Wares();
            wares.id = p.id;
            wares.show = Number(p.show);
            wares.focus = p.focus;
            wares.cover = p.cover;
            wares.list_cover = p.list_cover;
            wares.title = p.title;
            wares.priority = req.body.priority;
            wares.share_cover = p.share_cover;
            let list = [];
            for (let i = 0; i < p.banners.length; i++) {
                let item = p.banners[i].banner;
                list.push(item);
            }
            let a = -1;
            for (let i = 0; i < list.length; i++) {
                a++;
                list[i].id = wares.id + "#" + a;
                let b = -1;
                for (let m = 0; m < list[i].price.length; m++) {
                    b++;
                    list[i].price[m].id = list[i].id + '#' + b;
                    list[i].price[m].price = Number(list[i].price[m].price);
                    list[i].price[m].stages = Number(list[i].price[m].stages);
                    list[i].price[m].vip_price = Number(list[i].price[m].vip_price);
                }
                for (let n = 0; n < list[i].skus.length; n++) {
                    list[i].skus[n].num = Number(list[i].skus[n].num);
                }
            }
            wares.wares = list;

            wares.updateWares((err, data) => {
                if (err) {
                    res.send({
                        error_code: 5003,
                        error_msg: err.message
                    })
                } else {
                    res.send({
                        error_code: 0,
                        error_msg: 'ok'
                    })
                }
            })
        } else {
            res.send({
                error_code: 5002,
                error_msg: '缺少参数'
            })
        }
    } else {
        res.send({
            error_code: 5001,
            error_msg: '无访问权限'
        })
    }
});

// 获得订阅商品详情
router.get('/', (req, res, next) => {
    if (!req.query.id) {
        return res.send({
            error_code: 5002,
            error_msg: '缺少参数'
        })
    }
    let wares = new Wares();
    wares.id = req.query.id;
    wares.getWare((err, data) => {
        if (err) {
            return res.send({
                error_code: 5003,
                error_msg: err.message
            })
        }
        if (!data) {
            return res.send({
                error_code: 5004,
                error_msg: '错误订阅商品ID'
            })
        }
        data = data.attrs;
        let skusUnUnique = [];
        for (let i = 0; i < data.wares.length; i++) {
            // 遍历所有商品
            for (let k = 0; k < data.wares[i].skus.length; k++) {
                skusUnUnique.push(data.wares[i].skus[k].sku_id);
            }
        }

        let skus = unique(skusUnUnique);

        getProductMsg.get.skusBrief({
            skus: skus,
            callback: (resp) => {
                if (resp.error_code) {
                    return res.send(resp);
                }
                let d = resp.data;
                for (let i = 0; i < data.wares.length; i++) {
                    // 遍历所有商品
                    for (let k = 0; k < data.wares[i].skus.length; k++) {
                        for (let m = 0; m < d.length; m++) {
                            if (data.wares[i].skus[k].sku_id === d[m].sku_id) {
                                data.wares[i].skus[k].cover = d[m].image;
                                data.wares[i].skus[k].goods_name = d[m].goods_name;
                                data.wares[i].skus[k].price = d[m].price;
                                data.wares[i].skus[k].type_id = d[m].type_id;
                                data.wares[i].skus[k].discount_price = d[m].discount_price;
                            }
                        }
                    }
                }
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data
                })
            }
        });
    })
});

module.exports = router;