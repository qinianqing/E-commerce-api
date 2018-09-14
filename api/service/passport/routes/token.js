/*
*   校验token，并获取用户信息
*
*  @params token
*
*/
const router = require('express').Router();

const jwt = require('jsonwebtoken');
const { secret } = require('../config');

router.post('/verify',function (req,res,next) {
    let token = req.body.token || req.header('x-access-token');
    jwt.verify(token,secret,function (err,decoded) {
        if (!err){
            res.send({
                error_code:0,
                error_msg:'ok',
                data:{
                    user:{
                        user_id:decoded.user_id,
                        avatar:decoded.avatar,
                        user_name:decoded.user_name
                    }
                }
            });
        }else {
            res.send({
                error_code:4000,
                error_msg:err.message
            })
        }
    })
});

module.exports = router;
