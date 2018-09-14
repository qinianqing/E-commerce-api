// 券包

const router = require('express').Router();

const pullCoupon = require('../core/pullCoupon');
const Wallet = require('../models/Coupon-wallet');
// 获取某个用户的优惠券列表
router.get('/user-list',function (req,res,next) {
    if (req.currentUser){
        pullCoupon(req.currentUser.user_id,0,(resp)=>{
            res.send(resp);
        })
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

// 获取某个家庭的优惠券列表
router.get('/family-list',function (req,res,next) {
    if (req.currentUser){
        if(req.query.family_id){
            pullCoupon(req.query.family_id,1,(resp)=>{
                res.send(resp);
            })
        }else {
            res.send({
                error_code:5002,
                error_msg:'无访问权限'
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

//获取某一用户拥有某一类型的券，当前可用券的数量和券的总数量
router.get('/one-type-coupon',(req,res,next)=>{
    if(req.currentUser){
  let wallet = new Wallet();
  wallet.owner_id = req.currentUser.user_id;
  wallet.coupon_id = req.query.coupon_id;
  wallet.getOnesTargetCouponGetNum((err,data)=>{
      if(err){
          res.send({
              error_code:5002,
              error_msg:err.message
          })
      }else{
          let n = 0;
          let nowTime = new Date();
          nowTime = nowTime.getTime();
          for (let i=0;i<data.Count;i++){
              // 判断当前可用券数量
              let item = data.Items[i].attrs;
              if (!item.order_id && nowTime >= item.activeAt && nowTime <item.expiredAt){
                  n++;
              }
          }
          res.send({
             error_code:0,
             error_msg:'ok',
             data:{
                 valid:n,
                 count:data.Count
             }
          })
      }
  })
    }else{
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

module.exports = router;
