const router = require('express').Router();
const QA = require('../models/Common');
const sort = require('../utils/utils');

// 获取所有QA topics ,及首屏需要展现的内容
router.get('/topics', (req,res,next) => {
    let qa = new QA();
    qa.getQAs((err,data) => {
        if (err) {
            res.send({
                error_code:5001,
                error_msg:err.message
            })
        }else{
            if (data.Count) {
              	let list = [];
              	let firstPage;
                for(let i=0;i<data.Count;i++){
                    let item = {
                    	topic:data.Items[i].attrs.source,
                    	topic_id:data.Items[i].attrs.object_id,
                    	index:data.Items[i].attrs.index
                    };
                    if (data.Items[i].attrs.index === 0) {
                    	firstPage = data.Items[i].attrs.qa
                    }
                    list.push(item)
                }
               	// 返回正向排序的数据
                res.send({
                    error_code:0,
                    error_msg:'ok',
                    data:{
                    	topics:sort.ascending(list),
                    	firstPage:firstPage
                    }
                })
            }else{
                res.send({
                    error_code:5002,
                    error_msg:'no data'
                })
            }
        }
    });
});

// 针对性的获取某个QA
router.get('/detail', (req,res,next) => {
    if (req.query.topic_id) {
        let qa = new QA();
        qa.object_id = String(req.query.topic_id);
        qa.getTargetQA((err,data) => {
            if (err) {
                res.send({
                    error_code:5001,
                    error_msg:err.message
                })
            }else{
                if (data){
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:data.attrs.qa
                    })
                }else {
                    res.send({
                        error_code:5002,
                        error_msg:'no data',
                    })
                }
            }
        });
    }else{
        res.send({
            error_code:5000,
            error_msg:'short topic_id'
        })
    }
});

module.exports = router;