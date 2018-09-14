/**
 * Created by Ziv on 2017/9/14.
 */
let express = require('express');
let router = express.Router();
let Banner = require('../../models/Common');
const sort = require('../../util/util');

// list
router.get('/list', function (req, res, next) {
    // 获取商品列表
    let banner = new Banner();
    banner.getBanners((err, data) => {
        if (err) {
            res.send({
                error_code: 5002,
                error_msg: err.message
            })
        } else {
            let list = [];
            for (let i = 0; i < data.Count; i++) {
                let item = data.Items[i].attrs.banner;
                item.index = data.Items[i].attrs.index;
                item.object_id = data.Items[i].attrs.object_id;
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
});

// add
router.post('/add', function (req, res, next) {
    if (!req.currentUser) {
        return res.sendStatus(404);
    }
    if (req.body.type >= 0 && req.body.content && req.body.cover) {
        // 新建
        let banner = new Banner();
        banner.getBanners((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                let index = data.Count;
                let b = {
                    type: Number(req.body.type),
                    content: req.body.content,
                    cover: req.body.cover
                };
                banner.index = index;
                banner.banner = b;
                banner.createBanner((err, data) => {
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
    if (!req.currentUser) {
        return res.sendStatus(404);
    }
    // 更新
    if (req.body.type >= 0 && req.body.content && req.body.cover && req.body.object_id) {
        // 新建
        let banner = new Banner();
        banner.object_id = req.body.object_id;
        banner.banner = {
            type: Number(req.body.type),
            content: req.body.content,
            cover: req.body.cover
        };
        banner.updateBanner((err, data) => {
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
    if (!req.currentUser) {
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

});

// batch delete
// 批量删除
router.post('/batchDelete', function (req, res, next) {
    if (!req.currentUser) {
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
});

// sort
router.post('/sort', function (req, res, next) {
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
                            position: 'BANNER_',
                            object_id: iA[i].object_id,
                            index: iA[i].index,
                            banner: iA[i].banner
                        };
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
                            position: 'BANNER_',
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

});


module.exports = router;