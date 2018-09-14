/**
 * Created by Ziv on 2017/9/14.
 */
let express = require('express');
let router = express.Router();
let Brand = require('../../models/Brand');
const sort = require('../../util/util');

// list
router.get('/list', function (req, res, next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    //     let role = currentUser.role;
    //     if (role === 0 || role === 1 || role === 4) {
    // if (!req.currentUser) {
    //     return res.sendStatus(404);
    // }
    let last_key;
    if (req.query.brand_id) {
        last_key = {
            brand_id: req.query.brand_id,
        }
    }
    // 获取品牌列表
    let brand = new Brand();
    brand.getAllBrand((err, data) => {
        if (err) {
            res.send({
                error_code: 5002,
                error_msg: err.message
            })
        } else {
            let list = [];
            for (let i = 0; i < data.Count; i++) {

                let items = {
                    brand_id: data.Items[i].attrs.brand_id,
                    name: data.Items[i].attrs.name,
                    from: data.Items[i].attrs.from,
                    introduce: data.Items[i].attrs.introduce,
                };
                list.push(items)
            }
            // 返回正向排序的数据
            res.send({
                error_code: 0,
                error_msg: 'ok',
                // data: sort.ascending(list)
                data:data
            })
        }
    },last_key);
    //     }else {
    //         res.send({
    //             error_code:5001,
    //             error_msg:'no authority'
    //         })
    //     }
    // }else {
    //     res.send({
    //         error_code:5000,
    //         error_msg:'no authority'
    //     })
    // }
});

// goods brand
router.get('/lists', function (req, res, next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    //     let role = currentUser.role;
    //     if (role === 0 || role === 1 || role === 4) {
    // if (!req.currentUser) {
    //     return res.sendStatus(404);
    // }
    // 获取商品列表
    let brand = new Brand();
    brand.getAllBrands((err, data) => {
        if (err) {
            res.send({
                error_code: 5002,
                error_msg: err.message
            })
        } else {
            let list = [];
            for (let i = 0; i < data.Count; i++) {

                let items = {
                    brand_id: data.Items[i].attrs.brand_id,
                    name: data.Items[i].attrs.name,
                    from: data.Items[i].attrs.from,
                    introduce: data.Items[i].attrs.introduce,
                };
                list.push(items)
            }
            // 返回正向排序的数据
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: sort.ascending(list)
                // data:data
            })
        }
    });
    //     }else {
    //         res.send({
    //             error_code:5001,
    //             error_msg:'no authority'
    //         })
    //     }
    // }else {
    //     res.send({
    //         error_code:5000,
    //         error_msg:'no authority'
    //     })
    // }
});

router.get('/query-list', function (req, res, next) {
    // 获取品牌列表
    let brand = new Brand();
    brand.queryBrand(req.query.brand_name, (err, data) => {
        if (err) {
            res.send({
                error_code: 5002,
                error_msg: err.message
            })
        } else {
            // 返回正向排序的数据
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: data
            })
        }
    });
});

// add
router.post('/add', function (req, res, next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    //     let role = currentUser.role;
    //     if (role === 0 || role === 1 || role === 4) {
    if (!req.currentUser) {
        return res.sendStatus(404);
    }
    if (req.body.name && req.body.from && req.body.introduce) {
        // 新建
        let brand = new Brand();
        brand.getAllBrand((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                let index = data.Count;

                brand.name = req.body.name;
                brand.from = req.body.from;
                brand.introduce = req.body.introduce;
                brand.createBrand((err, data) => {
                    if (err) {
                        res.send({
                            error_code: 5002,
                            error_msg: err.message
                        })
                    } else {
                        res.send({
                            error_code: 0,
                            error_msg: 'ok',
                            data: data.attrs
                        })
                    }
                })
            }
        });
    } else {
        res.send({
            error_code: 5003,
            error_msg: 'short param'
        })
    }
    //     }else {
    //         res.send({
    //             error_code:5001,
    //             error_msg:'no authority'
    //         })
    //     }
    // }else {
    //     res.send({
    //         error_code:5000,
    //         error_msg:'no authority'
    //     })
    // }
});

// update
router.post('/update', function (req, res, next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    //     let role = currentUser.role;
    //     if (role === 0 || role === 1 || role === 4) {
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    // 更新
    if (req.body.brand_id && req.body.name && req.body.from && req.body.introduce) {
        // 新建
        let brand = new Brand();

        brand.brand_id = req.body.brand_id;
        brand.name = req.body.name;
        brand.from = req.body.from;
        brand.introduce = req.body.introduce;
        brand.updateBrand((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data.attrs
                })
            }
        })
    } else {
        res.send({
            error_code: 5003,
            error_msg: 'short param'
        })
    }
    //     }else {
    //         res.send({
    //             error_code:5001,
    //             error_msg:'no authority'
    //         })
    //     }
    // }else {
    //     res.send({
    //         error_code:5000,
    //         error_msg:'no authority'
    //     })
    // }
});

module.exports = router;