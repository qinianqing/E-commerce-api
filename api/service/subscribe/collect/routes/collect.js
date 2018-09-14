const router = require('express').Router();

const Collect = require('../models/Collect');

//去重
function unique(arr){
    let result = [];
    for(let i=0;i<arr.length;i++){
        if(result.indexOf(arr[i])===-1){
            result.push(arr[i])
        }
    }
    return result;
}
/*
收藏
*/
router.post('/add', (req, res, next) => {
    if (req.currentUser) {
        if (req.body.goods_id) {
            let params = req.body;
            let collect = new Collect();
            collect.goods_id = params.goods_id;
            collect.is_collect = params.is_collect;
            collect.user_id = req.currentUser.user_id;
            collect.create((err, collect) => {
                if (err) {
                    res.send({
                        error_code: 4000,
                        error_msg: err.message
                    })
                } else {
                    res.send({
                        error_code: 0,
                        error_msg: 'ok',
                        data: {
                            collect: collect,
                            up:true
                        }
                    })
                }
            })
        } else {
            res.send({
                error_code: 5002,
                error_msg: 'short params'
            })
        }
    } else {
        res.send({
            error_code: 0,
            error_msg: 'ok',
            data: {
                up:false
            }
        })

    }

});

/*
 取消收藏
*/
router.post('/delete', (req, res, next) => {
    if (req.currentUser) {
        let params = req.body;
        if (params.collect_id) {
            let collect = new Collect();
            collect.collect_id = params.collect_id;
            collect.user_id = req.currentUser.user_id;
            collect.delect((err) => {
                if (err) {
                    res.send({
                        error_code: 4000,
                        error_msg: err.message
                    })
                } else {
                    res.send({
                        error_code: 0,
                        error_msg: 'ok',
                    })
                }
            })
        } else {
            res.send({
                error_code: 5001,
                error_msg: 'short coolect_id'
            })
        }

    } else {
        res.send({
            error_code: 5001,
            error_msg: 'no access authority'
        })
    }

});

const product = require('../../../product/interface/getProduct');

//收藏列表
router.get('/list', (req, res, next) => {
    if (req.currentUser) {
        let params = req.query;
        let collect = new Collect();
        collect.user_id = req.currentUser.user_id;
        collect.getCollectList((err, data) => {
            if (err) {
                res.send({
                    error_code: 4000,
                    error_msg: err.message
                })
            } else {
                if (data.Count) {
                    let spuids = [];
                    for(let i = 0;i < data.Count;i++){
                        spuids.push(data.Items[i].attrs.goods_id);
                    }
                    product.get.spus({
                        spus:spuids,
                        callback:(resp)=>{
                            if (resp.error_code){
                                return res.send(resp);
                            }
                            let goodsdetail = resp.data;
                            let collectArray = [];
                            let dataA = [];

                            for(let k = 0;k < data.Count;k++){
                                for(let l = 0;l < goodsdetail.length;l++){
                                    if(goodsdetail[l].attrs.goods_id === data.Items[k].attrs.goods_id){
                                        goodsdetail[l].attrs.collect_id = data.Items[k].attrs.collect_id;
                                    }
                                }
                            }
                            for(let j = 0;j < goodsdetail.length;j++){
                                dataA.push(goodsdetail[j])
                            }
                            for(let m = 0;m < dataA.length;m++){
                                if(dataA[m].show === true){

                                    collectArray.push(dataA[m])

                                }else{
                                    dataA[m].notice = '下架';
                                    collectArray.push(dataA[m]);
                                }
                            }
                            // 排序
                            let sortItems = [];
                            for (let k=0;k<spuids.length;k++){
                                for (let i=0;i<collectArray.length;i++){
                                    if(spuids[k] === collectArray[i].attrs.goods_id){
                                        sortItems.push(collectArray[i]);
                                        break;
                                    }
                                }
                            }
                            res.send({
                                error_code:0,
                                data:{
                                    collectArray:sortItems
                                }
                            })
                        }
                    });
                } else {
                    res.send({
                        error_code: 0,
                        error_msg: 'ok',
                        data: {
                            count: 0
                        }
                    })
                }
            }
        }, params.last_key)
    } else {
        res.send({
            error_code: 5001,
            error_msg: 'no access authority'
        })
    }
});

//删除所有
router.post('/clear-all', (req, res, next) => {
    if (req.currentUser) {
        let params = req.body;
        let collect = new Collect();
        collect.user_id = req.currentUser.user_id;
        collect.getCollectList((err, data) => {
            if (err) {
                res.send({
                    error_code: 4000,
                    error_msg: err.message
                })
            } else {
                if (data.Count) {
                    let dataA = [];
                    for(let i = 0;i < data.Count;i++){
                        dataA.push(data.Items[i].attrs)
                    }

                    let collectList = [];
                    for (let i = 0; i < data.Count; i++) {
                        collectList.push(dataA[i])
                    }
                    if(collectList.length){
                        let delect = [];
                        for(let m = 0;m < collectList.length;m++){
                            let collectD = new Collect();
                            collectD.user_id = req.currentUser.user_id;
                            collectD.collect_id = collectList[m].collect_id;
                            collectD.delect((err)=>{
                                if(!err){
                                    delect.push('d');
                                    if(delect.length === collectList.length){
                                        res.send({
                                            error_code: 0,
                                            error_msg: 'ok'
                                        })

                                    }
                                }
                            })
                        }
                    }else{
                        res.send({
                            error_code: 7000,
                            error_msg: 'no invalid item'
                        })

                    }
                } else {
                    res.send({
                        error_code: 0,
                        error_msg: 'ok',
                        data: {
                            count: 0
                        }
                    })
                }
            }
        })

    } else {
        res.send({
            error_code: 5001,
            error_msg: 'no access authority'

        })
    }

});

//删除所选
router.post('/collect/select', (req, res, next) => {
    if (req.currentUser) {
        let params = req.body;
        let collect = new Collect();
        let skuList = params.skuList;
        collect.getCollects(skuList, (err, collects) => {
            if (err) {
                res.send({
                    error_code: 4001,
                    error_msg: err.message
                })
            } else {
                let collectLists = [];
                for (let m = 0; m < collects.Count; m++) {
                    collectLists[m].collect_id = collects[m].attrs.collect_id;
                    collectLists[m].user_id = collects[m].attrs.user_id;
                    collect.delect((err) => {
                        if (err) {
                            res.send({
                                error_code: 4000,
                                error_msg: err.message
                            })
                        } else {
                            res.send({
                                error_code: 0,
                                error_msg: 'ok',
                            })
                        }
                    })
                }

            }
        })


    } else {
        res.send({
            error_code: 5001,
            error_msg: 'no access authority'

        })

    }
});

module.exports = router;
