/**
 * Created by Ziv on 2017/9/14.
 */
let express = require('express');
let router = express.Router();
let ProductShow = require('../../models/Common');
const sort = require('../../util/util');

// list
router.get('/list', function (req, res, next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    // let role = currentUser.role;
    // if (role === 0 || role === 1 || role === 4) {
    // 获取商品列表
    let productShow = new ProductShow();
    productShow.getIndexSubs((err, data) => {
        if (err) {
            res.send({
                error_code: 5002,
                error_msg: err.message
            })
        } else {
            let list = [];
            for (let i = 0; i < data.Count; i++) {
                let item = {
                    type: data.Items[i].attrs.subject.type,
                    subject: data.Items[i].attrs.subject,
                    rec_name: data.Items[i].attrs.subject.rec_name,
                    index: data.Items[i].attrs.index,
                    object_id: data.Items[i].attrs.object_id,
                    position: data.Items[i].attrs.position,
                };
                list.push(item);
            }
            // 返回正向排序的数据
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: sort.ascending(list)
            })
        }
    });
    // }else {
    //     res.send({
    //         error_code:5001,
    //         error_msg:'no authority'
    //     })
    // }
    // }else {
    //     res.send({
    //         error_code:5000,
    //         error_msg:'no authority'
    //     })
    // }
});

// add
router.post('/add', function (req, res, next) {
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    if (req.body.banners && req.body.rec_name && req.body.type >= 0) {
        // 新建
        let productShow = new ProductShow();
        productShow.getIndexSubs((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                let index = data.Count;
                let Content = [];
                for (let i = 0; i < req.body.banners.length; i++) {
                    content = req.body.banners[i].banner;
                    Content.push(content);
                }
                let b = {
                    type: req.body.type,
                    rec_name: req.body.rec_name,
                    subtitle: req.body.subtitle,
                    content: Content,
                };

                productShow.index = index;
                productShow.subject = b;
                productShow.createSub((err, data) => {
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
});

// update
router.post('/update', function (req, res, next) {
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    // 更新
    if (req.body.banners && req.body.position && req.body.rec_name && req.body.object_id) {
        // 新建
        let productShow = new ProductShow();
        let Content = [];
        for (let i = 0; i < req.body.banners.length; i++) {
            let item = req.body.banners[i].banner;
            Content.push(item);
        }
        let b = {
            rec_name: req.body.rec_name,
            subtitle: req.body.subtitle,
            type:0,
            content: Content,
        };
        productShow.position = req.body.position;
        productShow.object_id = req.body.object_id;
        productShow.subject = b;
        productShow.updateSub((err, data) => {
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
});

// delete
router.post('/delete', function (req, res, next) {
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    // 删除
    if (req.body.object_id) {
        // 新建
        let productShow = new ProductShow();
        productShow.object_id = req.body.object_id;
        productShow.deleteSub((err) => {
            if (err) {
                res.send({
                    error_code: 5002,
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
            error_code: 5003,
            error_msg: 'short object_id'
        })
    }
});

// batch delete
// 批量删除
router.post('/batchDelete', function (req, res, next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    // let role = currentUser.role;
    // if (role === 0 || role === 1 || role === 4) {
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    // 批量删除
    if (req.body.items) {
        // 新建
        let items = req.body.items;
        let productShow = new ProductShow();
        let len = items.length;
        let k = 0;
        for (let i = 0; i < len; i++) {
            productShow.object_id = items[i];
            productShow.deleteSub((err) => {
                if (err) {
                    res.send({
                        error_code: 5002,
                        error_msg: err.message
                    })
                } else {
                    k++;
                    if (k === len) {
                        res.send({
                            error_code: 0,
                            error_msg: 'ok'
                        })
                    }
                }
            })
        }
    } else {
        res.send({
            error_code: 5003,
            error_msg: 'short object_id array'
        })
    }
    // }else {
    //     res.send({
    //         error_code:5001,
    //         error_msg:'no authority'
    //     })
    // }
    // }else {
    //     res.send({
    //         error_code:5000,
    //         error_msg:'no authority'
    //     })
    // }
});

// sort
router.post('/sort', function (req, res, next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    //     let role = currentUser.role;
    //     if (role === 0 || role === 1 || role === 4) {
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    // 排序
    if (req.body.oldIndex && req.body.newIndex && req.body.object_id) {
        req.body.oldIndex = req.body.oldIndex - 1;
        req.body.newIndex = req.body.newIndex - 1;
        let productShow = new ProductShow();
        productShow.getIndexSubs((err, data) => {
            if (err) {
                res.send({
                    error_code: 5005,
                    error_msg: err.message
                })
            } else {
                let bannerA = [];
                for (let i = 0; i < data.Count; i++) {
                    bannerA.push(data.Items[i].attrs);
                }
                bannerA = sort.ascending(bannerA);// 按index正序排列
                let oIndex = Number(req.body.oldIndex);
                let nIndex = Number(req.body.newIndex);
                let iA = [];
                if (oIndex < nIndex) {
                    // 往后调
                    for (let i = oIndex + 1; i <= nIndex; i++) {
                        bannerA[i].index = bannerA[i].index - 1;
                        iA.push(bannerA[i]);
                    }
                    bannerA[oIndex].index = nIndex;
                    iA.push(bannerA[oIndex]);
                    let t = 0;
                    for (let i = 0; i < iA.length; i++) {
                        let p = {
                            position: 'SUB',
                            object_id: iA[i].object_id,
                            index: iA[i].index,
                            subject: iA[i].subject
                        }
                        productShow.updateSubIndex(p, (err) => {
                            if (err) {
                                res.send({
                                    error_code: 5004,
                                    error_msg: err.message
                                })
                            } else {
                                t++;
                                if (t === iA.length) {
                                    res.send({
                                        error_code: 0,
                                        error_msg: 'ok'
                                    })
                                }
                            }
                        })
                    }
                } else if (oIndex > nIndex) {
                    // 往前调
                    for (let i = nIndex; i < oIndex; i++) {
                        bannerA[i].index = bannerA[i].index + 1;
                        iA.push(bannerA[i]);
                    }
                    bannerA[oIndex].index = nIndex;
                    iA.push(bannerA[oIndex]);
                    let t = 0;
                    for (let i = 0; i < iA.length; i++) {
                        let p = {
                            position: 'SUB',
                            object_id: iA[i].object_id,
                            index: iA[i].index,
                            subject: iA[i].subject
                        }
                        productShow.updateSubIndex(p, (err) => {
                            if (err) {
                                res.send({
                                    error_code: 5004,
                                    error_msg: err.message
                                })
                            } else {
                                t++;
                                if (t === iA.length) {
                                    res.send({
                                        error_code: 0,
                                        error_msg: 'ok'
                                    })
                                }
                            }
                        })
                    }
                }
            }
        });
    } else {
        res.send({
            error_code: 5003,
            error_msg: 'short object_id array'
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