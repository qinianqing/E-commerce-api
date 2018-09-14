// 领券接口

const router = require('express').Router();

const pushCoupon = require('../core/pushCoupon');
const getHighestPriceCoupon = require('../core/getHighestPriceCoupon');

const { secret } = require('../config');

// 新用户赠券
router.post('/new-user',function (req,res,next) {
    if (req.currentUser){
        let user_id = req.currentUser.user_id;
        // 发给用户的券列表
        let coupon_ids = ['468f14e63ae348c79ac1cde44c088ab7'];
        let n=0;
        let b=0;
        //console.log(coupon_ids.length);
        for (let i=0;i<coupon_ids.length;i++){
            pushCoupon(user_id,coupon_ids[i],(resp)=>{
                n++;
                if (resp.error_code === 0){
                    b++;
                }
                if (n === coupon_ids.length){
                    if (b === n){
                        res.send({
                            error_code:0,
                            error_msg:'ok'
                        })
                    }else {
                        res.send({
                            error_code:5002,
                            error_msg:'插入券出现错误'
                        });
                    }
                }
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

// 通过user_id领券
router.post('/by-userid',function (req,res,next) {
    if (req.currentUser){
        if (req.body.coupon_id){
            pushCoupon(req.currentUser.user_id,req.body.coupon_id,(resp)=>{
                res.send(resp);
            })
        }else {
            res.send({
                error_code:5002,
                error_msg:'缺少优惠券码'
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

// 根据订单信息查询可优惠额最大的优惠券
router.post('/best-coupon',function (req,res,next) {
    if (req.currentUser){
        if (req.body.payment&&req.body.skus){
            getHighestPriceCoupon(req.currentUser.user_id,req.body.payment,req.body.skus,(resp)=>{
                return res.send(resp);
            })
        }else {
            res.send({
                error_code:5002,
                error_msg:'缺少实付参数'
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

// 为家庭激活免邮券
router.post('/active-myq',function (req,res,next) {
    if (req.body.secret === secret){
        if (req.body.family_id&&req.body.weeks){
            pushCoupon(req.body.family_id,0,(resp)=>{
                res.send(resp);
            },parseInt(req.body.weeks));
        }else {
            res.send({
                error_code:5002,
                error_msg:'缺少family_id'
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

// 通过手机号领券
router.post('/by-tel',function (req,res,next) {
    if (req.currentUser){
        res.send({
            error_code:5002,
            error_msg:'本接口暂未启用'
        })
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

module.exports = router;
