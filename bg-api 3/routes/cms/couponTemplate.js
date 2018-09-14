let express = require('express');
let router = express.Router();

const Coupon = require('../SDK/coupon');

Coupon.init('6bac8008717948769a15be2e7def4714');
// package
router.get('/list',(req,res,next)=>{
    // 对lastkey参数需要拼合处理last_key
    let last_key;
    if(req.query.coupon_id&&req.query.createdAt){
        last_key = {
            coupon_id:req.query.coupon_id,
            createdAt:req.query.createdAt
        }
    }
    Coupon.template.list({
        callback:(resp)=>{
            res.send(resp)
            // if (err){
            //     res.send({
            //         error_code:5002,
            //         error_msg:err.message
            //     })
            // }else {
            //     res.send(resp.data)
            // }
        }
    })
});

router.post('/add',(req,res,next)=>{
    Coupon.template.create({
        num:req.body.num,
        limit:req.body.limit,
        mode:req.body.mode,
        status:req.body.status,
        activeAt:req.body.activeAt,
        expiredType:req.body.expiredType,
        expiredInfo:req.body.expiredInfo,
        name:req.body.name,
        price:req.body.price,
        background:req.body.background,
        condition:req.body.condition,
        fit:req.body.fit,
        information:req.body.information,
        callback: (resp) => {
            res.send(resp)
        }
    })
});
router.post('/update',(req,res,next)=>{
    Coupon.template.update({
        coupon_id:req.body.coupon_id,
        createdAt:req.body.createdAt,
        num:Number(req.body.num),
        limit:req.body.limit,
        mode:req.body.mode,
        status:req.body.status,
        activeAt:req.body.activeAt,
        expiredType:req.body.expiredType,
        expiredInfo:req.body.expiredInfo,
        name:req.body.name,
        price:req.body.price,
        background:req.body.background,
        condition:req.body.condition,
        fit:req.body.fit,
        information:req.body.information,
        callback: (resp) => {
            res.send(resp)
        }
    })
});
router.post('/update-ExecStages',(req,res,next)=>{
    Coupon.template.updateStages({
        subs_order_id:req.body.subs_order_id,
        user_id:req.body.user_id,
        exec_stages:Number(req.body.exec_stages),
        callback: (resp) => {
            res.send(resp)
        }
    })
});
module.exports = router;