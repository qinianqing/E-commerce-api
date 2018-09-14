// 商品聚合
const router = require('express').Router();

const Group = require('../models/GoodsGroup');
const Goods = require('../models/Goods');

const getProduct = require('../interface/getProduct');

// 获取商品组详情
router.get('/', (req, res, next) => {
    if (!req.query.id) {
        return res.send({
            error_code: 5001,
            error_msg: '缺少组ID'
        })
    }
    let brief = false;
    if (req.query.limit) {
        brief = parseInt(req.query.limit);
    }
    let group = new Group();
    group.id = req.query.id;
    group.getGroup((err, data) => {
        if (err) {
            return res.send({
                error_code: 5002,
                error_msg: err.message
            })
        }
        if (!data) {
            return res.send({
                error_code: 5003,
                error_msg: '错误ID'
            })
        }
        data = data.attrs;
        let list = [];
        let sourceList = []; // 存储
        let from = parseInt(req.query.from) || 0;
        if (from >= data.list.length) {
            return res.send({
                error_code: 5004,
                error_msg: '超越列表长度'
            })
        }
        let resFrom = 0;
        if (brief) {
            for (let i = 0; i < brief; i++) {
                if (data.list[i].split('-').length === 2) {
                    list.push(data.list[i].split('-')[0]);
                    sourceList.push(data.list[i]);
                } else {
                    list.push(data.list[i]);
                    sourceList.push(data.list[i]);
                }
            }
            resFrom = 0;
        } else {
            if (from + 20 > data.list.length) {
                for (let i = from; i < data.list.length; i++) {
                    if (data.list[i]) {
                        if (data.list[i].split('-').length === 2) {
                            list.push(data.list[i].split('-')[0]);
                            sourceList.push(data.list[i]);
                        } else {
                            list.push(data.list[i]);
                            sourceList.push(data.list[i]);
                        }
                    }
                }
                resFrom = 0;
            } else {
                for (let i = from; i < from + 20; i++) {
                    if (data.list[i]) {
                        if (data.list[i].split('-').length === 2) {
                            list.push(data.list[i].split('-')[0]);
                            sourceList.push(data.list[i]);
                        } else {
                            list.push(data.list[i]);
                            sourceList.push(data.list[i]);
                        }
                    }
                }
                resFrom = from + 20;
            }
        }
        // 查询商品数据
        getProduct.get.spus({
            spus: list,
            callback: (resp) => {
                if (resp.error_code) {
                    return res.send(resp);
                }
                let newList = [];
                for (let i = 0; i < list.length; i++) {
                    for (let k = 0; k < resp.data.length; k++) {
                        if (list[i] === resp.data[k].attrs.goods_id) {
                            // resp.data[k].attrs;
                            newList[i] = {
                                goods_id: resp.data[k].attrs.goods_id,
                                spu_id: resp.data[k].attrs.goods_id,
                                goods_name: resp.data[k].attrs.goods_name,
                                goods_cashback: resp.data[k].attrs.goods_cashback,
                                goods_price: resp.data[k].attrs.goods_price,
                                default_image: resp.data[k].attrs.default_image,
                                carousel_image: resp.data[k].attrs.carousel_image,
                                describe: resp.data[k].attrs.describe,
                                tag: resp.data[k].attrs.tag,
                                show: resp.data[k].attrs.show,
                                cashback: resp.data[k].attrs.goods_cashback,
                                rank_image: resp.data[k].attrs.rank_image,
                            };
                            if (sourceList[i].split('-').length === 2) {
                                newList[i].sku_id = sourceList[i];
                                for (let t = 0; t < resp.data[k].attrs.skus.length; t++) {
                                    if (sourceList[i] === resp.data[k].attrs.skus[t].sku_id) {
                                        newList[i].type_id = resp.data[k].attrs.skus[t].type_id;
                                        newList[i].goods_cashback = resp.data[k].attrs.skus[t].cashback;
                                        newList[i].goods_price = resp.data[k].attrs.skus[t].price;
                                    }
                                }
                            } else {
                                newList[i].sku_id = '';
                                newList[i].type_id = '';
                            }
                        }
                    }
                }
                data.list = newList;
                data.nextFrom = resFrom;
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data
                })
            }
        })
    })
});
// 10012,10056,10031
let checkGoods = (goods_id) => {
    return new Promise((resolve, reject) => {
        let goods = new Goods();
        goods.goods_id = goods_id;
        goods.getGoodsExist((err, data) => {
            if (err) {
                console.error(err.message);
                reject(0);
            }
            if (data.Count === 1) {
                resolve(1);
            } else {
                reject(0);
            }
        })
    })
};

function unique(arr) {
    let result = [];
    for (let i = 0; i < arr.length; i++) {
        if (result.indexOf(arr[i]) === -1) {
            result.push(arr[i])
        }
    }
    return result;
}

const {
    secret
} = require('../config');

router.post('/create', (req, res, next) => {
    if (req.body.secret === secret) {
        let p = req.body;
        const go = async () => {
            try {
                if (p.list) {
                    if (typeof p.list === 'string') {
                        p.list = [p.list];
                    }
                    let listTry = unique(p.list);
                    if (JSON.stringify(listTry) !== JSON.stringify(p.list)) {
                        return res.send({
                            error_code: 5000,
                            error_msg: 'SPU列表重复'
                        })
                    }
                    for (let i = 0; i < p.list.length; i++) {
                        let iL;
                        // console.log('p.list[i].split(\'-\')[0]',p.list[i].split('-')[0])
                        if (p.list[i].split('-').length === 2) {
                            iL = await checkGoods(p.list[i].split('-')[0]);
                        } else {
                            iL = await checkGoods(p.list[i]);
                        }
                        if (!iL) {
                            return res.send({
                                error_code: 5001,
                                error_msg: '错误SPU列表'
                            })
                        }
                    }
                }
                let group = new Group();
                group.cover = p.cover;
                group.list_cover = p.list_cover;
                group.title = p.title;
                group.focus = p.focus;
                group.describe = p.describe;
                group.list = p.list;
                group.coupon_id = p.coupon_id;
                group.create((err,data)=>{
                    if (err){
                        return res.send({
                            error_code: 5002,
                            error_msg: err.message
                        })
                    }
                    res.send({
                        error_code: 0,
                        error_msg: 'ok'
                    })
                })
            } catch (err) {
                if (err === 0) {
                    return res.send({
                        error_code: 5003,
                        error_msg: '有错误spu'
                    })
                } else {
                    return res.send({
                        error_code: 5004,
                        error_msg: err.message
                    })
                }
            }
        };
        go();
    } else {
        res.sendStatus(404);
    }
});

router.post('/update', (req, res, next) => {
    if (req.body.secret === secret) {
        let p = req.body;
        const go = async () => {
            if (p.list) {
                if (typeof p.list === 'string') {
                    p.list = [p.list];
                }
                let listTry = unique(p.list);
                if (JSON.stringify(listTry) !== JSON.stringify(p.list)) {
                    return res.send({
                        error_code: 5000,
                        error_msg: 'SPU列表重复'
                    })
                }
                for (let i = 0; i < p.list.length; i++) {
                    // let iL = await checkGoods(p.list[i]);
                    let iL;
                    // console.log('p.list[i].split(\'-\')[0]',p.list[i].split('-')[0])
                    if (p.list[i].split('-').length === 2) {
                        iL = await checkGoods(p.list[i].split('-')[0]);
                    } else {
                        iL = await checkGoods(p.list[i]);
                    }
                    if (!iL) {
                        return res.send({
                            error_code: 5001,
                            error_msg: '错误SKU列表'
                        })
                    }
                }
            }
            let group = new Group();
            group.id = p.id;
            group.getGroup((err, data) => {
                if (err) {
                    return res.send({
                        error_code: 5002,
                        error_msg: err.message
                    })
                }
                if (!data) {
                    return res.send({
                        error_code: 5003,
                        error_msg: '错误ID'
                    })
                }
                data = data.attrs;
                group.cover = p.cover || data.cover;
                group.list_cover = p.list_cover || data.list_cover;
                group.title = p.title || data.title;
                group.focus = p.focus || data.focus;
                group.describe = p.describe || data.describe;
                group.list = p.list || data.list;
                group.coupon_id = p.coupon_id;
                group.updateGroup(group,(err,data)=>{
                    if (err){
                        return res.send({
                            error_code: 5004,
                            error_msg: err.message
                        })
                    }
                    res.send({
                        error_code: 0,
                        error_msg: 'ok'
                    })
                })
            });
        };
        go();
    } else {
        res.sendStatus(404);
    }
});
router.get('/ranking/list', (req, res, next) => {
    let rankingLsit = ['1527597644894'];
    res.send({
        error_code: 0,
        error_msg: 'ok',
        data: rankingLsit
    })
});

router.post('/list', (req, res, next) => {
    if (req.body.secret === secret) {
        let group = new Group();
        let last_key = '';
        if (req.body.id) {
            last_key = {
                id: req.body.id
            }
        }
        group.getGroupList(last_key, (err, data) => {
            if (err) {
                return res.send({
                    error_code: 5001,
                    error_msg: err.message
                })
            }
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: data
            })
        })
    } else {
        res.sendStatus(404);
    }
});

router.post('/search', (req, res, next) => {
    if (req.body.secret === secret) {
        let group = new Group();
        if (!req.body.query) {
            return res.send({
                error_code: 5001,
                error_msg: '缺少query'
            })
        }
        group.searchGroup(req.body.query, (err, data) => {
            if (err) {
                return res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            }
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: data
            })
        })
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;