const router = require('express').Router();
const Banner = require('../models/Common');
const sort = require('../utils/utils');

router.get('/', (req,res,next) => {
        let banner = new Banner();
        banner.getBanners((err,data) => {
            if (err) {
                res.send({
                    error_code:5001,
                    error_msg:err.message
                })
            }else{
                if (data.Count) {
                    let list = [];
                    for(let i=0;i<data.Count;i++){
                        let item = data.Items[i].attrs;
                        item.index = data.Items[i].attrs.index;
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
});

module.exports = router;