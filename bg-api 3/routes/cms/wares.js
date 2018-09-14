let express = require('express');
let router = express.Router();

const subscribe = require('../SDK/sub-wares');

subscribe.init('8294850807894c40b65d76d199b72a7e');
// package
router.get('/list',(req,res,next)=>{
    // let id = req.query.user_id;
    // if (!id){
    //     id = '';
    // }
    // 对lastkey参数需要拼合处理last_key
    // let last_key;
    // if(req.query.user_id&&req.query.order_id){
    //     last_key = {
    //         user_id:req.query.user_id,
    //         order_id:req.query.order_id
    //     }
    // }
    subscribe.list({
        // user_id:id,
        // n:Number(req.query.n),
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
//查询id
router.get('/id-list',(req,res,next)=>{
    let id = req.query.id;
    subscribe.idList({
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
    console.log('req',req.body);
    subscribe.create({
        id:req.body.id,
        cover:req.body.cover,
        show:req.body.show,
        focus:req.body.focus,
        list_cover:req.body.list_cover,
        title:req.body.title,
        share_cover:req.body.share_cover,
        banners:req.body.banners,
        callback: (resp) => {
            res.send(resp)
        }
    })
});

router.post('/update',(req,res,next)=>{
    console.log('req',req.body);
    subscribe.update({
        id:req.body.id,
        cover:req.body.cover,
        show:req.body.show,
        focus:req.body.focus,
        list_cover:req.body.list_cover,
        title:req.body.title,
        share_cover:req.body.share_cover,
        banners:req.body.banners,
        priority: req.body.priority,
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