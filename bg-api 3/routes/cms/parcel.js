/**
 * Created by Ziv on 2017/9/14.
 */
let express = require('express');
let router = express.Router();
let Parcel = require('../../models/Parcel');
const sort = require('../../util/util');

// list
router.get('/list',function (req,res,next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    // let role = currentUser.role;
    // if (role === 0 || role === 1 || role === 4) {
    // 获取商品列表
    let parcel = new Parcel();
    parcel.getBindParcel((err,data) => {
        if (err) {
            res.send({
                error_code:5002,
                error_msg:err.message
            })
        }else{
            let list = [];
            for(let i=0;i<data.Count;i++){
                let items = {
                    able:data.Items[i].attrs.able,
                    address:data.Items[i].attrs.address,
                    contact:data.Items[i].attrs.contact,
                    family_id:data.Items[i].attrs.family_id,
                    free:data.Items[i].attrs.free,
                    name:data.Items[i].attrs.name,
                    parcel_id:data.Items[i].attrs.parcel_id,
                    phone:data.Items[i].attrs.phone,
                    province:data.Items[i].attrs.province,
                    user_id:data.Items[i].attrs.user_id,
                    status:data.Items[i].attrs.status,
                    handle_date:data.Items[i].attrs.handle_date,
                    week:data.Items[i].attrs.week,
                    orders:data.Items[i].attrs.orders,
                    total:data.Items[i].attrs.total
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

// update状态
router.post('/updateStatus',function (req,res,next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    // let role = currentUser.role;
    // if (role === 0 || role === 1 || role === 4) {

    // if (!req.body.token) {
    //     return res.sendStatus(404);
    // }
    // 更新
    // if (req.body.type&&req.body.content&&req.body.cover&&req.body.object_id){
    // 新建
    let parcel = new Parcel();
    parcel.status = req.body.status;
    parcel.user_id = req.body.user_id;
    parcel.parcel_id = req.body.parcel_id;
    parcel.express_id = req.body.express_id;
    parcel.express_brand = req.body.express_brand;
    parcel.updateStatus((err,data)=>{
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
    // }else {
    //     res.send({
    //         error_code:5003,
    //         error_msg:'short param'
    //     })
    // }
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

// update订单信息
router.post('/updateOrder',function (req,res,next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    // let role = currentUser.role;
    // if (role === 0 || role === 1 || role === 4) {
    // if (!req.body.token) {
    //     return res.sendStatus(404);
    // }
    // 更新
    // if (req.body.type&&req.body.content&&req.body.cover&&req.body.object_id){
    // 新建
    let parcel = new Parcel();
    parcel.status = req.body.status;
    parcel.user_id = req.body.user_id;
    parcel.parcel_id = req.body.parcel_id;
    parcel.express_id = req.body.express_id;
    parcel.express_brand = req.body.express_brand;
    parcel.setExpressID((err,data)=>{
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
    // }else {
    //     res.send({
    //         error_code:5003,
    //         error_msg:'short param'
    //     })
    // }
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
router.post('/delete',function (req,res,next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    // let role = currentUser.role;
    // if (role === 0 || role === 1 || role === 4) {
    // if (!req.body.token) {
    //     return res.sendStatus(404);
    // }
    // 删除
    if (req.body.object_id){
        // 新建
        let rec = new Rec();
        rec.object_id = req.body.object_id;
        rec.deleteRec((err)=>{
            if (err){
                res.send({
                    error_code:5002,
                    error_msg:err.message
                })
            }else {
                res.send({
                    error_code:0,
                    error_msg:'ok'
                })
            }
        })
    }else {
        res.send({
            error_code:5003,
            error_msg:'short object_id'
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
router.post('/batchDelete',function (req,res,next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    // let role = currentUser.role;
    // if (role === 0 || role === 1 || role === 4) {
    // 批量删除
    if (req.body.items){
        // 新建
        let items = req.body.items;
        let rec = new Rec();
        let len = items.length;
        let k = 0;
        for (let i=0;i<len;i++){
            rec.object_id = items[i];
            rec.deleteRec((err)=>{
                if (err){
                    res.send({
                        error_code:5002,
                        error_msg:err.message
                    })
                }else {
                    k++;
                    if (k === len){
                        res.send({
                            error_code:0,
                            error_msg:'ok'
                        })
                    }
                }
            })
        }
    }else {
        res.send({
            error_code:5003,
            error_msg:'short object_id array'
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

// update状态
router.post('/updateStatus',function (req,res,next) {
    // let currentUser = req.session.current;
    // if (currentUser){
    // let role = currentUser.role;
    // if (role === 0 || role === 1 || role === 4) {
    // 更新
    // if (req.body.type&&req.body.content&&req.body.cover&&req.body.object_id){
    // 新建
    let parcel = new Parcel();
    parcel.updateStatus((err,data)=>{
        // if (err){
        //     res.send({
        //         error_code:5002,
        //         error_msg:err.message
        //     })
        // }else {
            res.send({
                error_code:0,
                error_msg:'ok',
                data:sort.cal_this_week_first_second(n)
            })
        // }
    })
    // }else {
    //     res.send({
    //         error_code:5003,
    //         error_msg:'short param'
    //     })
    // }
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

module.exports = router;