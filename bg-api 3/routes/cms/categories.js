/**
 * Created by Ziv on 2017/9/14.
 */
var express = require('express');
var router = express.Router();

var AV = require('leanengine');

router.get('/', function(req, res, next) {
    //先判断有无current user,如果有则渲染,没有重定向到登录页
    var currentUser = req.session.current;
    if (currentUser) {
        // 跳转到首页
        res.render('./cms/categories', {user_name:currentUser.user_name})
    }
    else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

router.get('/level2', function(req, res, next) {
    //先判断有无current user,如果有则渲染,没有重定向到登录页
    var currentUser = req.session.current;
    if (currentUser) {
        // 跳转到首页
        res.render('./cms/categories_level2', { category0:req.query.name,user_name:currentUser.user_name})
    }
    else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

// Category0 增加/查看

// list接口
// 获取所有一级类目

router.get('/list0',function (req,res,next) {
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
                var query = new AV.Query('Category0');
                query.count().then(function (count) {
                    total = count;
                    return query.addDescending('updatedAt').skip(req.query.offset).limit(limit).find();
                }).then(function (results) {
                    var cArray = []
                    //判断是否存在
                    if (results.length){
                        //拼装,并返回表单数据
                        for (var i=0;i<results.length;i++){
                            var item = {
                                ID:results[i].id,
                                name:results[i].attributes.name,
                                describe:results[i].attributes.describe
                            }
                            cArray.push(item);
                        }
                        var resData = {
                            total:total,
                            rows:cArray
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

// add post接口
// 通过本接口可以添加一个一级类目
// 1.0
// OK
router.post('/add0',function (req,res,next) {
    var currentUser = req.session.current;
    if (currentUser){
        //先判断session
        if (req.body.name){
            if (req.body.describe){
                var nameLen = req.body.name.length()
                if (nameLen >= 2 && nameLen <=10){
                    //先查询有没有用过该邮箱的用户
                    var query = new AV.Query('Category0');
                    query.equalTo('name',req.body.name);

                    query.find().then(function (results) {
                        if (results.length){
                            res.send('已存在该类目');
                        }else {
                            var NewCategory = AV.Object.extend('Category0');
                            var cate = new NewCategory();

                            cate.set('name',req.body.name);
                            cate.set('describe',req.body.describe);
                            cate.set('Email',req.body.email);

                            return cate.save()
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
                    res.send('类目字数应在2至10个字之间');
                }
            }else {
                res.send('请输入类目描述');
            }
        }else {
            res.send('请输入类目名称');
        }
    }else {
        res.send('illegal');
    }
})

// Category 增加/查看
// list接口
// 获取所有一级类目

router.get('/list',function (req,res,next) {
    //先判断用户权限
    var currentUser = req.session.current;
    if (currentUser) {
        if(req.query.category0){
            var param = req.query.category0.toString();
            if (req.query.limit){
                if (req.query.offset){
                    //构造offset
                    //因为admin较少,直接使用skip方法来实现
                    var total = 0;
                    var limit = req.query.limit;
                    //构造条件
                    var query = new AV.Query('Category');
                    query.equalTo('category0',param);
                    query.count().then(function (count) {
                        total = count;
                        return query.addDescending('updatedAt').skip(req.query.offset).limit(limit).find();
                    }).then(function (results) {
                        var cArray = []
                        //判断是否存在
                        if (results.length){
                            //拼装,并返回表单数据
                            for (var i=0;i<results.length;i++){
                                var item = {
                                    ID:results[i].id,
                                    name:results[i].attributes.name,
                                    describe:results[i].attributes.describe
                                }
                                cArray.push(item);
                            }
                            var resData = {
                                total:total,
                                rows:cArray
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
        if (req.body.category0){
            if (req.body.name){
                if (req.body.describe){
                    var nameLen = req.body.name.length()
                    if (nameLen >= 2 && nameLen <=10){
                        //先查询有没有用过该邮箱的用户
                        var query = new AV.Query('Category');
                        query.equalTo('name',req.body.name);

                        query.find().then(function (results) {
                            if (results.length){
                                res.send('已存在该类目');
                            }else {
                                var NewCategory = AV.Object.extend('Category');
                                var cate = new NewCategory();

                                cate.set('category0',req.body.category0)
                                cate.set('name',req.body.name);
                                cate.set('describe',req.body.describe);
                                cate.set('Email',req.body.email);

                                return cate.save()
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
                        res.send('类目字数应在2至10个字之间');
                    }
                }else {
                    res.send('请输入类目描述');
                }
            }else {
                res.send('请输入类目名称');
            }
        }else {
            res.send('无一级类目信息');
        }
    }else {
        res.send('illegal');
    }
})

module.exports = router;