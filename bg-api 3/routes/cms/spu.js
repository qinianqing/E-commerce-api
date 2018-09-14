/**
 * Created by Ziv on 2017/9/14.
 */
let express = require('express');
let router = express.Router();
let Spu = require('../../models/Spu');
const sort = require('../../util/util');

// list
router.get('/list',function (req,res,next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    //     let role = currentUser.role;
    //     if (role === 0 || role === 1 || role === 4) {
            // 获取商品列表
            let spu = new Spu();
            spu.getAllSpu((err,data) => {
                if (err) {
                    res.send({
                        error_code:5002,
                        error_msg:err.message
                    })
                }else{
                    let list = [];
                    for(let i=0;i<data.Count;i++){

                        let items = {
                            spu_id:data.Items[i].attrs.spu_id,
                            brand_id:data.Items[i].attrs.brand_id,
                            spu_name:data.Items[i].attrs.spu_name,
                            default_describe:data.Items[i].attrs.default_describe,
                            default_price:data.Items[i].attrs.default_price,
                            default_discountprice:data.Items[i].attrs.default_discountprice,
                            default_image:data.Items[i].attrs.default_image,
                            details_image:data.Items[i].attrs.details_image,
                            show:data.Items[i].attrs.show,
                            level3_id:data.Items[i].attrs.level3_id,
                        };
                        list.push(items);
                    }

                    // 返回正向排序的数据
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:sort.ascending(list)
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

// add
router.post('/add',function (req,res,next) {

    // let currentUser = req.session.current;
    // if (currentUser){
    //     let role = currentUser.role;
    //     if (role === 0 || role === 1 || role === 4) {

            if ( req.body.brand_id && req.body.level3_id && req.body.spu_name && req.body.default_image && req.body.details_image && req.body.default_price &&
                req.body.default_discountprice && req.body.default_describe ){
                // 新建
                let spu = new Spu();
            spu.getAllSpu((err,data) => {
                    if (err) {
                        res.send({
                            error_code:5002,
                            error_msg:err.message
                        })
                    }else{
                        let index = data.Count;
                        spu.brand_id = req.body.brand_id;
                        spu.level3_id = req.body.level3_id;
                        spu.spu_name = req.body.spu_name;
                        spu.default_describe = req.body.default_describe;
                        spu.default_image = req.body.default_image;
                        spu.details_image = req.body.details_image;
                        spu.default_price = Number(req.body.default_price);
                        spu.default_discountprice = Number(req.body.default_discountprice);
                        spu.createSpu((err,data)=>{
                            if (err){
                                res.send({
                                    error_code:5002,
                                    error_msg:err.message
                                })
                            }else {
                                res.send({
                                    error_code:0,
                                    error_msg:'ok',
                                    data:data.attrs
                                })
                            }
                        })
                    }
                });
            }else {
                res.send({
                    error_code:5003,
                    error_msg:'short param'
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
router.post('/update',function (req,res,next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    //     let role = currentUser.role;
    //     if (role === 0 || role === 1 || role === 4) {
            // 更新
            if ( req.body.spu_id && req.body.brand_id && req.body.level3_id && req.body.spu_name && req.body.default_image && req.body.details_image && req.body.default_price &&
                req.body.default_discountprice && req.body.default_describe ){
                // 新建
                let spu = new Spu();
                spu.spu_id = req.body.spu_id;
                spu.brand_id = req.body.brand_id;
                spu.level3_id = req.body.level3_id;
                spu.spu_name = req.body.spu_name;
                spu.default_describe = req.body.default_describe;
                spu.default_image = req.body.default_image;
                spu.details_image = req.body.details_image;
                spu.default_price = Number(req.body.default_price);
                spu.default_discountprice = Number(req.body.default_discountprice);
                spu.updateSpu((err,data)=>{
                    if (err){
                        res.send({
                            error_code:5002,
                            error_msg:err.message
                        })
                    }else {
                        res.send({
                            error_code:0,
                            error_msg:'ok',
                            data:data.attrs
                        })
                    }
                })
            }else {
                res.send({
                    error_code:5003,
                    error_msg:'short param'
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