const router = require('express').Router();
const HOT = require('../models/Common');
const sort = require('../utils/utils');

router.get('/hot', (req,res,next) => {
        let hot = new HOT();
        hot.getHotSearch((err,data) => {
            if (err) {
                res.send({
                    error_code:5001,
                    error_msg:err.message
                })
            }else{
                if (data.Count) {
                    let list = [];
                    for(let i=0;i<data.Count;i++){
                        let item = {
                            query:'',
                            index:0
                        };
                        item.query = data.Items[i].attrs.query;
                        item.index = data.Items[i].attrs.index;
                        list.push(item)
                    }
                    // 返回正向排序的数据
                    list = sort.ascending(list);
                    let items = [];
                    for (let i=0;i<data.Count;i++){
                        items.push(list[i].query)
                    }
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:items
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

module.exports = router;