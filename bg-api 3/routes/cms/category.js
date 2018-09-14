// 分类
const router = require('express').Router();
const Category = require('../../models/Category');
const sort = require('../../util/util');

router.get('/list', function (req, res, next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    //     let role = currentUser.role;
    //     if (role === 0 || role === 1 || role === 4) {

    // 获取商品列表
    let category = new Category();
    category.getAllCategory((err, data) => {
        if (err) {
            res.send({
                error_code: 5002,
                error_msg: err.message
            })
        } else {
            let list = [];
            for (let i = 0; i < data.Count; i++) {
                let items = {
                    id: data.Items[i].attrs.id,
                    name: data.Items[i].attrs.name,
                    parent_id: data.Items[i].attrs.parent_id,
                    cover: data.Items[i].attrs.cover,
                    level: data.Items[i].attrs.level,
                };
                list.push(items)
            }
            // 返回正向排序的数据
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: sort.ascending(list)
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


//录入Category数据
router.post('/create-category', (req, res, next) => {
    console.log('req.body',req.body);
    let p = req.body;
    // if (p.secret === secret){
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    if (p.name && p.level) {
        let category = new Category();
        category.name = p.name;
        category.level = p.level;
        if (req.body.parent_id == "" || req.body.parent_id == undefined) {
            category.parent_id = ' '

        } else {
            category.parent_id = p.parent_id
        }
        if (req.body.cover == "" || req.body.cover == undefined) {
            category.cover = ' '
        } else {
            category.cover = p.cover
        }

        category.create((err, data) => {
            if (err) {
                res.send({
                    error_code: 4000,
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
    // }else {
    //     res.send({
    //         error_code: 4001,
    //         error_msg: '错误secret'
    //     })
    // }
});

//修改Category数据
router.post('/update', (req, res, next) => {
    let p = req.body;
    // if (p.secret === secret){
    if (!req.body.token) {
        return res.sendStatus(404);
    }
    if (p.id && p.name && p.level) {
        let category = new Category();
        category.name = p.name;
        category.level = p.level;
        category.id = p.id;
        if (req.body.parent_id == "" || req.body.parent_id == undefined) {
            category.parent_id = ' '
        } else {
            category.parent_id = p.parent_id
        }
        if (req.body.cover == "" || req.body.cover == undefined) {
            category.cover = ' '
        } else {
            category.cover = p.cover
        }
        category.update((err, data) => {
            if (err) {
                res.send({
                    error_code: 4000,
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
    // }else {
    //     res.send({
    //         error_code: 4001,
    //         error_msg: '错误secret'
    //     })
    // }
});

// 输入一个类目ID返回子类目
router.get('/child_category', (req, res, next) => {
    let params = req.query;
    if (!params.id) {
        return res.send({
            error_code: 5002,
            error_msg: '缺少ID'
        })
    }
    let category = new Category();
    category.getChildCategory(params.id, (err, data) => {
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
    });
});

module.exports = router;