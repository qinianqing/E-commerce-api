// 校验token
const jwt = require('jsonwebtoken');
const { secret } = require('../config');

module.exports = (token,callback)=>{
    jwt.verify(token,secret,function (err,decoded) {
        if (!err){
            callback({
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
            callback({
                error_code:1000,
                error_msg:err.message
            });
        }
    })
};