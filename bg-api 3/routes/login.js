/**
 * Created by zhangwei on 17/5/1.
 * 2017-10-19
 */

const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const jwt = require('jsonwebtoken');
// 引入对象方法
const User = require('../models/BGUser');
router.get('/health-check',(req,res,next)=>{
    res.send(200);
})

//获取用户信息
router.get('/list', function (req, res, next) {
    // if(req.query.secret === secret){
    let user = new User();
    // order.status =
    user.email = req.query.email;
    user.getUser((err, data) => {
        if (err) {
            res.send({
                error_code: 5002,
                error_msg: err.message
            })
        } else {
            // res.send(data)
            res.send({
                data: data,
            })
        }
    },)
    // }else {
    //     res.send({
    //         error_code:5001,
    //         error_msg:'无访问权限'
    //     })
    // }
});
// 后台
router.post('/login-in', function (req, res, next) {
    // console.log('reqlll', req.body);
    if (req.body.email && req.body.password) {
        let user = new User();
        user.email = req.body.email;
        user.getUser((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                if (data) {
                    let md5 = crypto.createHash('md5');
                    md5.update(req.body.password);
                    let p = md5.digest('hex');
                    let secret = 'Jinshi-bgUser';
                    const token = jwt.sign({
                        name: req.body.email
                    }, secret, {
                        expiresIn: 43200//7200秒到期时间
                    });
                    data = data.attrs;
                    if (p === data.password) {
                        data.password = '';

                        res.send({
                            error_code: 0,
                            error_msg: 'ok',
                            data: token
                        })
                    } else {
                        res.send({
                            error_code: 5002,
                            error_msg: 'ok',
                            data: '密码错误'
                        })
                    }
                } else {
                    res.send({
                        error_code: 5003,
                        error_msg: 'ok',
                        data: '邮箱错误'
                    })
                }
            }
        })
    } else {
        res.send({

            error_code: 5004,
            error_msg: '请填写完整',
        })
    }
});
//后台
router.get('/check-token', (req, res, next) => {
    var token = req.query.token;

    var secret = 'Jinshi-bgUser';
    jwt.verify(token, secret, function (err, decoded) {
        if (err) {
            res.send({
                error_code: 5002,
                error_msg: 'ok',
                data: 'invail'
            })
        } else {
            // console.log(decoded.name);  //会输出123，如果过了60秒，则有错误。
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: decoded
            })
        }

    })
});

// 用户登录的请求
// /login/in
router.post('/in', function (req, res, next) {
    if (req.body.email && req.body.password) {
        let user = new User();
        user.email = req.body.email;
        user.getUser((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                if (data) {
                    let md5 = crypto.createHash('md5');
                    md5.update(req.body.password);
                    let p = md5.digest('hex');
                    let secret = 'Jinshi-bgUser';
                    const token = jwt.sign({
                        name: req.body.email
                    }, secret, {
                        expiresIn: 7200//7200秒到期时间
                    });
                    data = data.attrs;
                    if (p === data.password) {
                        data.password = '';

                        res.send({
                            error_code: 0,
                            error_msg: 'ok',
                            data: token
                        })
                    } else {
                        res.send({
                            error_code: 5003,
                            error_msg: '密码错误',

                        })
                    }
                } else {
                    res.send({
                        error_code: 5004,
                        error_msg: '邮箱错误',

                    })
                }
            }
        })
    } else {
        res.send({
            error_code: 5005,
            error_msg: '请填写完整',

        })
    }
});
router.get('/check/token', (req, res, next) => {
    var token = req.query.token;
    var secret = 'Jinshi-bgUser';
    jwt.verify(token, secret, function (err, decoded) {
        if (err) {
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: 'invail'
            })
        } else {
            console.log(decoded.name);  //会输出123，如果过了60秒，则有错误。
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: decoded
            })
        }

    })
})
// 使用邮箱重置密码
// login/updatepassword
router.post('/update-password', function (req, res, next) {
    // 该接口不要求登录
    if (req.body.email && req.body.old_password && req.body.new_password) {
        let user = new User();
        user.email = req.body.email;
        user.getUser((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                if (data) {
                    let md5 = crypto.createHash('md5');
                    md5.update(req.body.old_password);
                    let p = md5.digest('hex');

                    data = data.attrs;
                    if (p === data.old_password) {
                        md5.update(req.body.new_password);
                        let pass = md5.digest('hex');
                        // update
                        let options = {
                            email: req.body.email,
                            password: pass
                        }
                        user.update(options, (err, data) => {
                            if (err) {
                                res.send({
                                    error_code: 5003,
                                    error_msg: err.message
                                })
                            } else {
                                res.send({
                                    error_code: 0,
                                    error_msg: 'ok'
                                })
                            }
                        })

                    } else {
                        res.send({
                            error_code: 5005,
                            error_msg: 'wrong password'
                        })
                    }
                } else {
                    res.send({
                        error_code: 5006,
                        error_msg: 'invalid email'
                    })
                }
            }
        })
    } else {
        res.send({
            error_code: 5000,
            error_msg: 'short param'
        })
    }
});

// 用户登出请求
// login/out
router.get('/out', function (req, res, next) {
    if (req.session) {
        req.session.destroy(function (err) {
            if (err) {
                res.send({
                    error_code: 5001,
                    error_msg: err.message
                })
            } else {
                res.clearCookie('backend');
                res.send({
                    error_code: 0,
                    error_msg: 'ok'
                })
            }
        });
    } else {
        res.send({
            error_code: 5000,
            error_msg: 'no authority'
        })
    }
});

module.exports = router;