const router = require('express').Router();
const Access = require('../../models/Access');

const uuid = require('uuid/v4');
//创建id
router.post('/create',(req,res,next)=>{
    let access = new Access();
    let items = [];
    for(var i = 10000;i < 11500;i++){
        let item = {
            num:i,
            status:0
        };
        items.push(item)
    }
    access.create(items,(err,accounts)=>{
        if(err){
            res.send({
                error_code:4000,
                error_msg:err.message
            })
        }else{
            res.send({
                error_code:0,
                error_msg:'ok'
            })
        }
    })
})
//随机得到一个未被使用的id
router.get('/getid',(req,res,next)=>{
    let params = req.query;
    let access = new Access();
    access.status = params.status;
    access.getOnenum((err,data)=>{
        if(err){
            res.send({
                error_code:4000,
                error_msg:err.message
            })
        }else{
            res.send({
                error_code:0,
                error_msg:data
            })
        }
    })
})
//使用id后更新这个id的状态
router.post('/getupdate',(req,res,next)=>{
    let params = req.body;
    let access = new Access();
    access.num = params.num;
    access.getUpdateStatus((err,data)=>{
        if(err){
            res.send({
                error_code:4000,
                error_msg:err.message
            })
        }else{
            res.send({
                error_code:0,
                error_msg:'ok'
            })
        }
    })
});
//使用id后删除这个id的状态
router.post('/delete',(req,res,next)=>{
    let params = req.body;
    let access = new Access();
    access.num = params.num;
    access.deleteGetid((err,data)=>{
        if(err){
            res.send({
                error_code:4000,
                error_msg:err.message
            })
        }else{
            res.send({
                error_code:0,
                error_msg:'ok'
            })
        }
    })

})
module.exports = router;
