/*
*   锦时home小程序登录
*
 */

const router = require('express').Router();
const https = require('https');
const jwt = require('jsonwebtoken');

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');
const User = require('../models/User');

let axios = require('axios');
let qs = require('querystring');

// token秘钥
const { secret,jsWaParams } = require('../config');

// 锦时+小程序登录

// 小程序第一步登录通过openid生成半账号，绑定了union_id才是全账号
router.post('/js-wa',function (req,res,next) {
    // 传入code,获取union_id,是否有用户，如果没有创建用户，成功后生成token
    let code = req.body.code;
    if (code){
        axios.get("https://api.weixin.qq.com/sns/jscode2session?appid="+jsWaParams.appid+"&secret="+jsWaParams.secret+"&js_code="+code+"&grant_type=authorization_code")
            .then((resp)=>{
                return Promise.resolve(resp.data)
            })
            .then(function (dat){
                if (dat.openid){
                    let user = new User();
                    // 查询是否存在用户
                    user.queryJsWaOpenId(dat.openid,(err,resp) => {
                        if(!err){
                            if (resp.Count){
                                let cuUser = resp.Items[0].attrs;
                                // 刷新token
                                let payload = {
                                    user_id:cuUser.user_id,
                                    avatar:cuUser.avatar,
                                    user_name:cuUser.user_name
                                };
                                jwt.sign(payload,secret,{
                                    expiresIn:60*60*24
                                },(err,token) => {
                                    if (!err){
                                        // 返回新token
                                        // 更新用户wa_session_key
                                        user.user_id = cuUser.user_id;
                                        user.wa_session_key = dat.session_key;
                                        user.union_id = dat.unionid || cuUser.union_id;
                                        let haveUnionId = false;
                                        if (dat.unionid || cuUser.union_id){
                                            haveUnionId= true;
                                        }
                                        let fwhUser = 0;
                                        if (cuUser.fwh_open_id){
                                            fwhUser = 1;
                                        }
                                        user.updateSessionKey((errr) => {
                                            if (!errr){
                                                // 返回用户是否绑定手机号
                                                res.send({
                                                    error_code:0,
                                                    error_msg:'ok',
                                                    data:{
                                                        token:token,
                                                        union_id:haveUnionId,
                                                        new_user:0,
                                                        fwh_user:fwhUser,
                                                        user_id:cuUser.user_id
                                                    }
                                                })
                                            }else {
                                                res.send({
                                                    error_code:5004,
                                                    error_msg:'更新session-key错误'
                                                });
                                            }
                                        })
                                    }
                                })
                            }else {
                                // 库中无该用户，创建新用户
                                let nUser = new User();
                                nUser.union_id = dat.unionid;
                                nUser.wa_open_id = dat.openid;
                                nUser.wa_session_key = dat.session_key;

                                let haveUnionId = false;
                                if (dat.unionid){
                                    haveUnionId = true;
                                }

                                nUser.create((err,data) => {
                                    if (!err){
                                        // 新建token
                                        let payload = {
                                            user_id:data.user_id,
                                            avatar:data.avatar,
                                            user_name:data.user_name
                                        };
                                        jwt.sign(payload,secret,{
                                            expiresIn:60*60*24
                                        },(err,token) => {
                                            if (!err){
                                                // 返回用户是否绑定手机号
                                                res.send({
                                                    error_code:0,
                                                    error_msg:'ok',
                                                    data:{
                                                        token:token,
                                                        union_id:haveUnionId,
                                                        new_user:1,
                                                        fwh_user:0,
                                                        user_id:data.user_id
                                                    }
                                                })
                                            }
                                        })
                                    }
                                });
                            }
                        }else {
                            res.send({
                                error_code: 5005,
                                error_msg: err.message
                            });
                        }
                    });
                }else{
                    res.send({
                        error_code:5002,
                        error_msg:'invalid code'
                    });
                }
        }).catch(function(err){
            res.send({
                error_code:5003,
                error_msg:err.message
            });
        })
    }else {
        res.send({
            error_code:5001,
            error_msg:'need code'
        });
    }
});

module.exports = router;