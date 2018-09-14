const router = require('express').Router();

const { innerSecret,host } = require('../config');

/*
*   发起reward请求
* 
 */
router.post('/',function (req,res,next) {
    if (req.currentUser){
        // 奖励接口
        res.send({
            error_code:3000,
            error_msg:'on build'
        })
    }else {
        res.send({
            error_code:5001,
            error_msg:'no access authority'
        })
    }
})

module.exports = router;