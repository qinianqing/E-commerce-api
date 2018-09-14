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
                    // items: {
                    type: data.Items[i].attrs.subject.type,
                    group_id: data.Items[i].attrs.subject.group_id,
                    rec_name: data.Items[i].attrs.subject.rec_name,

                    // },
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
    // let currentUser = req.session.current;
    // if (currentUser){
    // let role = currentUser.role;
    // if (role === 0 || role === 1 || role === 4) {
    if (req.body.type && req.body.group_id && req.body.rec_name) {
    // 新建
    let productShow = new ProductShow();
    productShow.getIndexSubs((err, data) => {
        console.log('data',data);
        if (err) {
            res.send({
                error_code: 5002,
                error_msg: err.message
            })
        } else {
            let index = data.Count;
            let b = {
                type: req.body.type,
                content: req.body.content,
            };
            productShow.index = index;
            console.log('productShow.index',productShow)
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

// update
router.post('/update', function (req, res, next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    // let role = currentUser.role;
    // if (role === 0 || role === 1 || role === 4) {
    // 更新
    if (req.body.type && req.body.group_id && req.body.rec_name && req.body.object_id) {
        // 新建
        let productShow = new ProductShow();
        let b = {
            type: req.body.type,
            group_id: req.body.group_id,
            rec_name: req.body.rec_name,
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

// delete
router.post('/delete', function (req, res, next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    // let role = currentUser.role;
    // if (role === 0 || role === 1 || role === 4) {
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

// batch delete
// 批量删除
router.post('/batchDelete', function (req, res, next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    // let role = currentUser.role;
    // if (role === 0 || role === 1 || role === 4) {
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
                    console.log('bannerA:',bannerA);
                    console.log('iA:',iA);
                    console.log('bannerA[oIndex]:',bannerA[oIndex]);
                    iA.push(bannerA[oIndex]);
                    console.log('hhhhh',iA);
                    let t = 0;
                    for (let i = 0; i < iA.length; i++) {
                        let p = {
                            position: 'SUB',
                            object_id: iA[i].object_id,
                            index: iA[i].index,
                            subject: iA[i].subject
                        };
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