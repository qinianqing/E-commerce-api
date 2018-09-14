const router = require('express').Router();
const Rec = require('../models/Common');
const sort = require('../utils/utils');

// 根据rec_id获取推荐页面列表项
router.get('/list', (req,res,next) => {
    if (req.query.rec_id) {
        let rec = new Rec();
        rec.source = String(req.query.rec_id);
        rec.getRecs((err,data) => {
            if (err) {
                res.send({
                    error_code:5001,
                    error_msg:err.message
                })
            }else{
                if (data.Count) {
                    let list = [];
                    for(let i=0;i<data.Count;i++){
                        let item = data.Items[i].attrs.rec;
                        item.index = data.Items[i].attrs.index;
                        item.rec_id = data.Items[i].attrs.source;
                        list.push(item)
                    }
                    // 返回正向排序的数据
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:sort.ascending(list)
                    })
                }else{
                    res.send({
                        error_code:5002,
                        error_msg:'no data'
                    })
                }
            }
        });
    }else{
        res.send({
            error_code:5000,
            error_msg:'short rec_id'
        })
    }
});

module.exports = router;
