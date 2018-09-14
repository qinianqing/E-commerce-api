/**
 * Created by Ziv on 2017/9/14.
 */
let express = require('express');
let router = express.Router();
let Category = require('../../models/Common');
const sort = require('../../util/util');

// list
router.get('/list', function (req, res, next) {

    // 获取商品列表
    let category = new Category();
    category.getCategory((err, data) => {
        if (err) {
            res.send({
                error_code: 5002,
                error_msg: err.message
            })
        } else {
            let lists = [];
            for (let i = 0; i < data.Count; i++) {
                let item = {};
                item.category = data.Items[i].attrs.category;
                item.index = data.Items[i].attrs.index;
                item.object_id = data.Items[i].attrs.object_id;
                item.source = data.Items[i].attrs.source;
                item.position = data.Items[i].attrs.position;
                lists.push(item);
            }
            // 返回正向排序的数据
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: sort.ascending(lists)
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
    // console.log('req', req.body.list);
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    if (req.body.type && req.body.list && req.body.source && req.body.title) {
        // 新建
        let category = new Category();
        category.getCategory((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                let index = data.Count;
                category.index = index;
                category.source = req.body.source;
                let list = [];
                for (let i = 0; i < req.body.list.length; i++) {
                    let item = {
                        content: req.body.list[i].banner.content,
                        img: req.body.list[i].banner.img,
                        name: req.body.list[i].banner.name
                    };
                    list.push(item)
                }
                let categoryS = [{
                    list:list,
                    title:req.body.title,
                    type:req.body.type
                }];
                category.category = categoryS;
                category.createCategory((err, data) => {
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
    if (req.body.type && req.body.position && req.body.list && req.body.source && req.body.title && req.body.object_id) {
        // 新建
        let category = new Category();
        category.source = req.body.source;
        category.object_id = req.body.object_id;
        category.position = req.body.position;
        let list = [];
        for (let i = 0; i < req.body.list.length; i++) {
            let item = {
                content: req.body.list[i].banner.content,
                img: req.body.list[i].banner.img,
                name: req.body.list[i].banner.name
            };
            list.push(item)
        }
        let categoryS = [{
            list:list,
            title:req.body.title,
            type:req.body.type
        }];
        // console.log('list:', list);
        category.category = categoryS;
        category.updateCategory((err, data) => {
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
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    // 删除
    if (req.body.object_id) {
        // 新建
        let banner = new Banner();
        banner.object_id = req.body.object_id;
        banner.deleteBanner((err) => {
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
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    // 批量删除
    if (req.body.items) {
        // 新建
        let items = req.body.items;
        let banner = new Banner();
        let len = items.length;
        let k = 0;
        for (let i = 0; i < len; i++) {
            banner.object_id = items[i];
            banner.deleteBanner((err) => {
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
        let banner = new Banner();
        banner.getBanners((err, data) => {
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
                            position: 'BANNER',
                            object_id: iA[i].object_id,
                            index: iA[i].index,
                            banner: iA[i].banner
                        }
                        banner.updateBannerIndex(p, (err) => {
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
                            position: 'BANNER',
                            object_id: iA[i].object_id,
                            index: iA[i].index,
                            banner: iA[i].banner
                        }
                        banner.updateBannerIndex(p, (err) => {
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