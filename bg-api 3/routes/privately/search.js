let express = require('express');
let router = express.Router();
let Goods = require('../../models/Goods');
let Brand = require('../../models/Brand');
//查询内部接口
router.get('/goods-msg',(req,res,next)=>{
let goods = new Goods();
goods.goods_id = req.query.goods_id;
goods.getGoodsMsg((err,goods)=>{
    if(err){
        res.send({
        error_code:4001,
        error_msg:err.message
        })
    }else{
        if(goods.Count  > 0){
            res.send({
                error_code:0,
                error_msg:'ok',
                data:goods
             })
        }else{
            res.send({
                error_code:0,
                error_msg:'ok',
                data:[]
             })
        }
      
    }
})
})
//得到相关商品
router.get('/get/correlation',(req,res,next)=>{
    let goods = new Goods();
    let params = req.query;
    goods.goods_id = params.goods_id;
    goods.getGoodsCorrelationId((err,data)=>{
        if(err){
            res.send({
                error_code:4001,
                error_msg:err.message
            })
        }else{
           if(data.Items[0].attrs.correlation){
               let list = data.Items[0].attrs.correlation;
              let newList = [];
               for(var i = 0;i < list.length;i++){
                   let item = {
                       goods_id:list[i]
                   }
                   newList.push(item)
               }
               goods.getSpus(newList,(err,lists)=>{
                     if(err){
                         res.send({
                             error_code:4002,
                             error_msg:err.message
                         })
                     }else{
                         res.send({
                             error_code:0,
                             error_msg:'ok',
                             data:lists
                         })
                     }
               })
           }else{
               res.send({
                   error_code:0,
                   error_msg:'ok',
                   data:[]
               })
           }
        }
       
    })
})
//得到商品具体信息
router.get('/', (req, res, next) => {
    let params = req.query;
    let goods = new Goods();
    goods.goods_id = String(params.goods_id);
    goods.getGoodsMsg((err, goods) => {
        if (err) {
            res.send({
                error_code: 4000,
                error_msg: err.message
            })
        } else {
            if (goods.Count > 0) {
                let brand = new Brand();
                brand.brand_id = goods.Items[0].attrs.brand_id;
                brand.getBrandDetails((err, brands) => {
                    if (err) {
                        res.send({
                            error_code: 4001,
                            error_msg: err.message
                        })
                    } else {
                        if (brands.Count > 0) {
                            goods.Items[0].attrs.from = brands.Items[0].attrs.from;
                            goods.Items[0].attrs.name = brands.Items[0].attrs.name;
                            goods.Items[0].attrs.introduce = brands.Items[0].attrs.introduce;
                            goods.Items[0].attrs.is_collect = false;
                            res.send({
                                error_code: 0,
                                error_msg: 'ok',
                                data: goods.Items
                            })
                        } else {
                            res.send({
                                error_code: 4002,
                                error_msg: 'the brand is miss'
                            })
                        }
                    }
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'the goods is null',
                    data: []
                })
            }
        }
    })
});

module.exports = router;