const router = require('express').Router();
const Category = require('../models/Common');
const sort = require('../utils/utils');

// 获得全部分类项
router.get('/all', (req,res,next) => {
    let category = new Category();
    category.getAllCategory((err,data) => {
        if (err) {
            res.send({
                error_code:5001,
                error_msg:err.message
            })
        }else{
            if (data.Count) {
                let list = [];
                for(let i=0;i<data.Count;i++){
                    let item = {};
                    item.content = data.Items[i].attrs.category;
                    item.index = data.Items[i].attrs.index;
                    item.name = data.Items[i].attrs.source;
                    list.push(item)
                }
                // 返回正向排序的数据
                res.send({
                    error_code:0,
                    error_msg:'ok',
                    data:sort.ascending(list)
                })
            }else{
                res.send({
                    error_code:5002,
                    error_msg:'no data'
                })
            }
        }
    });
});

// 获得某个分类项详情
router.get('/detail', (req,res,next) => {
    if (req.query.category_name) {
        let category = new Category();
        category.source = String(req.query.category_name);
        category.getCategory((err,data) => {
            if (err) {
                res.send({
                    error_code:5001,
                    error_msg:err.message
                })
            }else{
                if (data.Count) {
                    let list = [];
                    for(let i=0;i<data.Count;i++){
                        let item = {};
                        item.content = data.Items[i].attrs.category;
                        item.index = data.Items[i].attrs.index;
                        item.name = data.Items[i].attrs.source;
                        list.push(item)
                    }
                    // 返回正向排序的数据
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:sort.ascending(list)
                    })
                }else{
                    res.send({
                        error_code:5002,
                        error_msg:'no data'
                    })
                }
            }
        });
    }else{
        res.send({
            error_code:5000,
            error_msg:'short category_id'
        })
    }
});

module.exports = router;