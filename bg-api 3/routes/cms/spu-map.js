let express = require('express');
let router = express.Router();

const subscribe = require('../SDK/spu-map');

subscribe.init('8294850807894c40b65d76d199b72a7e');
// package
router.get('/list',(req,res,next)=>{
    subscribe.list({
        spu_id:req.query.spu_id,
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

// 根据id查询
router.get('/create-list',(req,res,next)=>{
    subscribe.CreateAtList({
        id:req.query.id,
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
        spu_id:req.body.spu_id,
        subscribe_ids:req.body.subscribe_ids,
        callback: (resp) => {
            res.send(resp)
        }
    })
});

router.post('/update',(req,res,next)=>{
    console.log('req',req.body);
    subscribe.update({
        spu_id:req.body.spu_id,
        subscribe_ids:req.body.subscribe_ids,
        callback: (resp) => {
            res.send(resp)
        }
    })
});

module.exports = router;