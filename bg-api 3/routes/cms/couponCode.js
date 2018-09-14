let express = require('express');
let router = express.Router();

const Coupon = require('../SDK/coupon');

Coupon.init('6bac8008717948769a15be2e7def4714');
// package
router.get('/list',(req,res,next)=>{
    // 对lastkey参数需要拼合处理last_key
    let last_key;
    if(req.query.id&&req.query.createdAt){
        last_key = {
            id:req.query.id,
            createdAt:req.query.createdAt
        }
    }
    Coupon.code.list({
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
    Coupon.code.create({
        coupon_code:req.body.coupon_code,
        status:req.body.status,
        activeAt:req.body.activeAt,
        expiredAt:req.body.expiredAt,
        num:req.body.num,
        coupon_id:req.body.coupon_id,
        callback: (resp) => {
            res.send(resp)
        }
    })
});
router.post('/update',(req,res,next)=>{
    Coupon.code.update({
        id:req.body.id,
        createdAt:req.body.createdAt,
        active_num:req.body.active_num,
        coupon_code:req.body.coupon_code,
        status:req.body.status,
        activeAt:req.body.activeAt,
        expiredAt:req.body.expiredAt,
        num:req.body.num,
        coupon_id:req.body.coupon_id,
        callback: (resp) => {
            res.send(resp)
        }
    })
});
router.post('/update-ExecStages',(req,res,next)=>{
    Coupon.code.updateStages({
        subs_order_id:req.body.subs_order_id,
        user_id:req.body.user_id,
        exec_stages:Number(req.body.exec_stages),
        callback: (resp) => {
            res.send(resp)
        }
    })
});
module.exports = router;