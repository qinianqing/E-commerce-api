let express = require('express');
let router = express.Router();

const subscribe = require('../SDK/subscribe');

subscribe.init('8294850807894c40b65d76d199b72a7e');
// package
router.get('/list',(req,res,next)=>{
    let id = req.query.user_id;

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
    subscribe.list({
        user_id:id,
        n:Number(req.query.n),
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
//sub order
router.get('/order-list',(req,res,next)=>{
    let id = req.query.user_id;
    let subs_order_id = req.query.subs_order_id;
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
    subscribe.orderList({
        user_id:id,
        subs_order_id:subs_order_id,
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
    subscribe.create({
        cover:req.body.cover,
        describe:req.body.describe,
        focus:req.body.focus,
        list_cover:req.body.list_cover,
        title:req.body.title,
        list:req.body.list,
        callback: (resp) => {
            res.send(resp)
        }
    })
});
router.post('/update',(req,res,next)=>{
    subscribe.update({
        subs_order_id:req.body.subs_order_id,
        express_id:req.body.express_id,
        week:req.body.week,
        express_brand:req.body.express_brand,
        relation_order_id:req.body.relation_order_id,
        callback: (resp) => {
            res.send(resp)
        }
    })
});
router.post('/update-ExecStages',(req,res,next)=>{
    subscribe.updateStages({
        subs_order_id:req.body.subs_order_id,
        user_id:req.body.user_id,
        exec_stages:Number(req.body.exec_stages),
        callback: (resp) => {
            res.send(resp)
        }
    })
});
module.exports = router;