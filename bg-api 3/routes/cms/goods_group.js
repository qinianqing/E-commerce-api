let express = require('express');
let router = express.Router();

const goodsGroup = require('../SDK/goods_group');

goodsGroup.init('ae425cc3e4f345de8fa39fab9db8e751');

router.get('/list',(req,res,next)=>{
    let id = req.query.id;
    if (!id){
        id = '';
    }
    // 对lastkey参数需要拼合处理last_key
    // let last_key;
    // if(req.query.user_id&&req.query.order_id){
    //     last_key = {
    //         user_id:req.query.user_id,
    //         order_id:req.query.order_id
    //     }
    // }
    goodsGroup.list({
        id:id,
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
     goodsGroup.create({
         cover:req.body.cover,
         describe:req.body.describe,
         focus:req.body.focus,
         list_cover:req.body.list_cover,
         title:req.body.title,
         coupon_id:req.body.coupon_id,
         list:req.body.list,
         callback: (resp) => {
             res.send(resp)
         }
     })
 });
router.post('/update',(req,res,next)=>{
    goodsGroup.update({
        id:req.body.id,
        cover:req.body.cover,
        describe:req.body.describe,
        focus:req.body.focus,
        list_cover:req.body.list_cover,
        title:req.body.title,
        coupon_id:req.body.coupon_id,
        list:req.body.list,
        callback: (resp) => {
            res.send(resp)
        }
    })
});
// router.post('/delete',(req,res,next)=>{
//     goodsGroup.update({
//         id:req.body.id,
//         cover:req.body.cover,
//         describe:req.body.describe,
//         list_cover:req.body.list_cover,
//         title:req.body.title,
//         list:req.body.list,
//         callback: (resp) => {
//             res.send(resp)
//         }
//     })
// });
module.exports = router;