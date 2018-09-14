const router = require('express').Router();

const Map = require('../models/Subscribe-spu-map');
const {secret} = require('../../config');

const getSubsWares = require('../interface/getSubsWaresDetail');
const getProduct = require('../../../product/interface/getProduct');

const getSkusBrief = (sku_ids) => {
    return new Promise((resolve, reject) => {
        getProduct.get.skusBrief({
            skus: sku_ids,
            callback: (resp) => {
                if (resp.error_code) {
                    reject(resp)
                } else {
                    resolve(resp)
                }
            }
        })
    })
};
// cms后台获得maplist
router.get('/map-list', (req, res, next) => {
    if (req.query.secret === secret) {
        if (!req.query.spu_id) {
            return res.send({
                error_code: 5001,
                error_msg: '缺少参数'
            })
        }
        let map = new Map();
        map.spu_id = req.query.spu_id;
        map.getSpu2Sub((err, data) => {
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
    }
});
// 获得订阅商品列表
router.get('/list', (req, res, next) => {
    if (!req.query.spu_id) {
        return res.send({
            error_code: 5001,
            error_msg: '缺少参数'
        })
    }
    let map = new Map();
    map.spu_id = req.query.spu_id;
    map.getSpu2Sub((err, data) => {
        if (err) {
            res.send({
                error_code: 5003,
                error_msg: err.message
            })
        } else {
            if (data === null) {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: []
                })
            } else {
                data = data.attrs;
                let handle = async () => {
                    let list = [];
                    try {
                        for (let i = 0; i < data.subscribe_ids.length; i++) {
                            let result = await getSubsWares({
                                id: data.subscribe_ids[i]
                            });
                            list = list.concat(result.data.wares);
                        }
                        let temp = [];
                        let results = [];
                        for (let i = 0; i < list.length; i++) {
                            temp = temp.concat(list[i].skus);
                            results.push({
                                note: list[i].note,
                                skus: list[i].skus,
                                id: list[i].id.split('#')[0]
                            })
                        }
                        let skus = [];
                        for (let i = 0; i < temp.length; i++) {
                            skus.push(temp[i].sku_id)
                        }
                        let skuResults = await getSkusBrief(skus);
                        skuResults = skuResults.data;

                        for (let i = 0; i < results.length; i++) {
                            for (let m = 0; m < results[i].skus.length; m++) {
                                for (let k = 0; k < skuResults.length; k++) {
                                    if (skuResults[k].sku_id === results[i].skus[m].sku_id) {
                                        let num = results[i].skus[m].num;
                                        results[i].skus[m] = skuResults[k];
                                        results[i].skus[m].num = num;
                                        break;
                                    }
                                }
                            }
                        }
                        res.send({
                            error_code: 0,
                            error_msg: 'ok',
                            data: results
                        })
                    } catch (err) {
                        res.send(err)
                    }
                };
                handle();
            }
        }
    })
});

router.post('/create', function (req, res, next) {
    if (req.body.secret === secret) {
        let p = req.body;
        if (p.spu_id && p.subscribe_ids) {
            let map = new Map();
            map.spu_id = req.body.spu_id;
            map.subscribe_ids = [req.body.subscribe_ids];
            map.create((err, data) => {
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
        if (p.spu_id && p.subscribe_ids) {
            let map = new Map();
            map.spu_id = req.body.spu_id;
            map.subscribe_ids = req.body.subscribe_ids;
            map.updateSpu2Subs((err, data) => {
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


module.exports = router;