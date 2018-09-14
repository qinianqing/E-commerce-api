/**
 * Created by Ziv on 2017/9/14.
 */
let express = require('express');
let router = express.Router();
let Sku = require('../../models/Sku');
const sort = require('../../util/util');
const uuid = require('uuid/v4');

// list
router.get('/list',function (req,res,next) {
    // let currentUser = req.session.current;
    // // if (currentUser){
    //     let role = currentUser.role;
    //     if (role === 0 || role === 1 || role === 4) {
            // 获取商品列表
            let sku = new Sku();
            sku.getAllSku((err,data) => {
                if (err) {
                    res.send({
                        error_code:5002,
                        error_msg:err.message
                    })
                }else{
                    let list = [];
                    for(let i=0;i<data.Count;i++){

                        let items = {
                            sku_id:data.Items[i].attrs.sku_id,
                            spu_id:data.Items[i].attrs.spu_id,
                            tag_id:data.Items[i].attrs.tag_id,
                            service_id:data.Items[i].attrs.service_id,
                            sku_name:data.Items[i].attrs.sku_name,
                            price:data.Items[i].attrs.price,
                            number:data.Items[i].attrs.number,
                            cashback:data.Items[i].attrs.cashback,
                            specifications:data.Items[i].attrs.specification.specifications,
                            pack:data.Items[i].attrs.specification.pack,
                            storage:data.Items[i].attrs.specification.storage,
                            specification_id:data.Items[i].attrs.specification.specification_id,
                            guarantee_time:data.Items[i].attrs.specification.guarantee_time,
                            production_place:data.Items[i].attrs.specification.production_place,
                            weight:data.Items[i].attrs.specification.weight,
                            discount_price:data.Items[i].attrs.discount_price,
                            carousel_image:data.Items[i].attrs.carousel_image,
                            default_image:data.Items[i].attrs.default_image,
                            joinTotalCashback:data.Items[i].attrs.joinTotalCashback
                        };
                        list.push(items)
                    }
                    // 返回正向排序的数据
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:sort.ascending(list)
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
router.post('/add',function (req,res,next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    //     let role = currentUser.role;
    //     if (role === 0 || role === 1 || role === 4) {

            let fanxian = req.body.cashback == 0 ? true : req.body.cashback;
            if (req.body.sku_name && req.body.spu_id && req.body.carousel_image && req.body.default_image && req.body.price &&
                fanxian && req.body.number &&req.body.specification.guarantee_time && req.body.specification.specifications &&
                req.body.specification.pack && req.body.specification.production_place && req.body.specification.storage && req.body.specification.weight &&
                req.body.tag_id && req.body.service_id && req.body.discount_price ){
            // 新建
            let sku = new Sku();
            sku.getAllSku((err,data) => {
                if (err) {
                    res.send({
                        error_code:5002,
                        error_msg:err.message
                    })
                }else{
                    let index = data.Count;
                    sku.spu_id = req.body.spu_id;
                    sku.sku_name = req.body.sku_name;
                    sku.carousel_image = req.body.carousel_image;
                    sku.default_image = req.body.default_image;
                    sku.price = Number(req.body.price);
                    sku.cashback = Number(req.body.cashback);
                    sku.number = Number(req.body.number);
                    sku.specification = {
                        specification_id:uuid().replace(/-/g, ''),
                        specifications:req.body.specification.specifications,
                        guarantee_time: req.body.specification.guarantee_time,
                        pack:req.body.specification.pack,
                        production_place: req.body.specification.production_place,
                        storage: req.body.specification.storage,
                        weight:Number(req.body.specification.weight)
                    };
                    sku.tag_id = req.body.tag_id;
                    sku.service_id = req.body.service_id;
                    sku.discount_price = Number(req.body.discount_price);
                    sku.joinTotalCashback = req.body.joinTotalCashback;

                    sku.createSku((err,data)=>{
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
    let fanxian = req.body.cashback == 0 ? true : req.body.cashback;
    if ( req.body.sku_id && req.body.sku_name && req.body.spu_id && req.body.carousel_image && req.body.default_image &&
                req.body.price && fanxian && req.body.number && req.body.specification.specification_id && req.body.specification.specifications &&
                req.body.specification.guarantee_time && req.body.specification.pack && req.body.specification.production_place && req.body.specification.storage && req.body.specification.weight &&
                req.body.tag_id && req.body.service_id && req.body.discount_price ){
            // 新建
            let sku = new Sku();
            sku.sku_id = req.body.sku_id;
            sku.spu_id = req.body.spu_id;
            sku.sku_name = req.body.sku_name;
            sku.carousel_image = req.body.carousel_image;
            sku.default_image = req.body.default_image;
            sku.price = Number(req.body.price);
            sku.cashback = req.body.cashback;
            sku.number = Number(req.body.number);
            sku.specification = {
                specification_id:req.body.specification.specification_id,
                specifications:req.body.specification.specifications,
                guarantee_time: req.body.specification.guarantee_time,
                pack:req.body.specification.pack,
                production_place: req.body.specification.production_place,
                storage: req.body.specification.storage,
                weight:Number(req.body.specification.weight)
            };
            sku.tag_id = req.body.tag_id;
            sku.service_id = req.body.service_id;
            sku.discount_price = Number(req.body.discount_price);
            sku.joinTotalCashback = req.body.joinTotalCashback;
            sku.updateSku((err,data)=>{
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
