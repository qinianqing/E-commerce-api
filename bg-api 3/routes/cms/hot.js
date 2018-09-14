/**
 * Created by Ziv on 2017/9/14.
 */
let express = require('express');
let router = express.Router();
let Hot = require('../../models/Common');
const sort = require('../../util/util');

// list
router.get('/list', function (req, res, next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    // let role = currentUser.role;
    // if (role === 0 || role === 1 || role === 4) {
    // 获取商品列表
    let hot = new Hot();
    hot.getHotSearch((err, data) => {
        if (err) {
            res.send({
                error_code: 5002,
                error_msg: err.message
            })
        } else {
            let list = [];
            for (let i = 0; i < data.Count; i++) {
                let item =
                    {
                        position: data.Items[i].attrs.position,
                        index: data.Items[i].attrs.index,
                        query: data.Items[i].attrs.query,
                        object_id: data.Items[i].attrs.object_id,
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
    console.log('adddd',req.body)
    // let currentUser = req.session.current;
    // if (currentUser){
    // let role = currentUser.role;
    // if (role === 0 || role === 1 || role === 4) {
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    if (req.body.query) {
        // 新建
        let hot = new Hot();
        hot.getHotSearch((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                let index = data.Count;
                hot.query = req.body.query;
                hot.index = index;
                hot.createHotSearch((err, data) => {
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
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    // 更新
    if (req.body.query && req.body.position && req.body.index >=0 && req.body.object_id) {
        // 新建
        let hot = new Hot();
        hot.object_id = req.body.object_id;
        hot.position = req.body.position;
        hot.query = req.body.query;
        hot.index = req.body.index;
        hot.updateHotSearch((err, data) => {
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
        let hot = new Hot();
        hot.object_id = req.body.object_id;
        hot.deleteHotSearch((err) => {
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
        let hot = new Hot();
        let len = items.length;
        let k = 0;
        for (let i = 0; i < len; i++) {
            hot.object_id = items[i];
            hot.deleteHotSearch((err) => {
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
        let hot = new Hot();
        hot.getHotSearch((err, data) => {
            if (err) {
                res.send({
                    error_code: 5005,
                    error_msg: err.message
                })
            } else {
                let hotA = [];
                for (let i = 0; i < data.Count; i++) {
                    hotA.push(data.Items[i].attrs);
                }
                hotA = sort.ascending(hotA);// 按index正序排列
                let oIndex = Number(req.body.oldIndex);
                let nIndex = Number(req.body.newIndex);
                let iA = [];
                if (oIndex < nIndex) {
                    // 往后调
                    for (let i = oIndex + 1; i <= nIndex; i++) {
                        hotA[i].index = hotA[i].index - 1;
                        iA.push(hotA[i]);
                    }
                    hotA[oIndex].index = nIndex;
                    iA.push(hotA[oIndex]);
                    let t = 0;
                    for (let i = 0; i < iA.length; i++) {
                        let p = {
                            position: 'SEARCH',
                            object_id: iA[i].object_id,
                            index: iA[i].index,
                            query: iA[i].query
                        }
                        hot.updateHotIndex(p, (err) => {
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
                        hotA[i].index = hotA[i].index + 1;
                        iA.push(hotA[i]);
                    }
                    hotA[oIndex].index = nIndex;
                    iA.push(hotA[oIndex]);
                    let t = 0;
                    for (let i = 0; i < iA.length; i++) {
                        let p = {
                            position: 'SEARCH',
                            object_id: iA[i].object_id,
                            index: iA[i].index,
                            query: iA[i].query
                        }
                        hot.updateHotIndex(p, (err) => {
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