/**
 * Created by zhangwei on 17/5/1.
 */
var express = require('express');
var router = express.Router();
var AV = require('leanengine');
var crypto = require('crypto');


// 页面路由
router.get('/', function(req, res, next) {
    //先判断有无current user,如果有则渲染,没有重定向到登录页
    var currentUser = req.session.current;;
    if (currentUser) {
        res.render('./cms/users', {user_name: currentUser.user_name})
    }else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
});

// list接口
// TODO 注意:用户名截断自邮箱前缀
router.get('/list',function (req,res,next) {
    //先判断用户权限
    var currentUser = req.session.current;
    if (currentUser) {
        if (req.query.limit){
            if (req.query.offset){
                //构造offset
                //因为admin较少,直接使用skip方法来实现
                var total = 0;
                var limit = req.query.limit;
                //构造条件
                var query = new AV.Query('CmsUser');
                query.count().then(function (count) {
                    total = count;
                    return query.addDescending('updatedAt').skip(req.query.offset).limit(limit).find();
                }).then(function (results) {
                    var userArray = []
                    //判断是否存在
                    if (results.length){
                        //拼装,并返回表单数据
                        for (var i=0;i<results.length;i++){
                            var item = {
                                ID:results[i].id,
                                name:results[i].attributes.Email.split('@')[0],
                                email:results[i].attributes.Email
                            }
                            userArray.push(item);
                        }
                        var resData = {
                            total:total,
                            rows:userArray
                        }
                        res.json(resData);

                    }else {
                        res.send('no data');
                    }
                },function (err) {
                    console.error(err);
                })
            }else {
                res.send('参数错误')
            }
        }else {
            res.send('参数错误')
        }
    }else {
        res.send('illegal');
    }
});

// add user post接口
// 1.0
// OK
router.post('/add',function (req,res,next) {
    var currentUser = req.session.current;
    if (currentUser){
        //先判断session
        if (req.body.email){
            if (req.body.password){
                if (req.body.email.split('@')[1] == 'eatgood365.com'){
                    //先查询有没有用过该邮箱的用户
                    var query = new AV.Query('CmsUser');
                    query.equalTo('Email',req.body.email);

                    query.find().then(function (results) {
                        if (results.length){
                            res.send('该用户已存在');
                        }else {
                            var NewUser = AV.Object.extend('CmsUser');
                            var user = new NewUser();

                            var md5 = crypto.createHash('md5');
                            md5.update(req.body.password);
                            var password = md5.digest('hex');

                            user.set('Username',req.body.email);
                            user.set('Password',password);
                            user.set('Email',req.body.email);

                            return user.save()
                        }
                    }).then(function (result) {
                        if (result){
                            res.send('OK');
                        }
                    }).catch(function (error) {
                        console.error(error);
                        //console.error(error);
                        res.send(error.message);
                    })
                }else {
                    res.send('邮箱格式不正确');
                }
            }else {
                res.send('请输入初始密码');
            }
        }else {
            res.send('请输入公司邮箱');
        }
    }else {
        res.send('illegal');
    }
})


module.exports = router;