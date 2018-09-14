/**
 * Created by Mbb on 2017/5/29.
 */
var AV = require('leanengine');
var express = require('express');
var router = express.Router();

// 页面路由
router.get('/', function(req, res, next) {
    //先判断有无current user,如果有则渲染,没有重定向到登录页
    var currentUser = req.session.current;
    if (currentUser) {
        // 跳转到首页
        res.render('./cms/topics', { title: '用心吃饭CMS',user_name:currentUser.user_name})
    }
    else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

// new页面
router.get('/new', function(req, res, next) {
    //先判断有无current user,如果有则渲染,没有重定向到登录页
    var currentUser = req.session.current;
    if (currentUser) {
        // 跳转到首页
        res.render('./cms/topics-new', { title: '用心吃饭CMS',user_name:currentUser.user_name})
    }
    else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

// detail页面
router.get('/detail', function(req, res, next) {
    //先判断有无current user,如果有则渲染,没有重定向到登录页
    var currentUser = req.session.current;
    if (currentUser) {
        // 获取数据，由jade渲染
        //获取数据，有jade渲染
        var id = req.query.id;

        var query = new AV.Query('Topic');
        query.get(id).then(function (topic) {
            var resResult = topic.attributes;
            var pageData = {
                title:resResult.title,
                focus:resResult.focus,
                author:resResult.author,
                detail:resResult.detail,
                poster:resResult.bannerURL,
                id:topic.id
            }
            res.render('./cms/topics-detail', { title: '用心吃饭CMS',user_name:currentUser.user_name,data:pageData})
        })
    }
    else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

// list接口
router.get('/list',function (req,res,next) {
    var currentUser = req.session.current;
    if (currentUser) {
        // { limit: '10', offset: '0', status: 'all', _: '1496114817745' }
        // { limit: '10', offset: '0', status: 'on', _: '1496114817746' }
        // { limit: '10', offset: '0', status: 'off', _: '1496114817747' }
        // { limit: '10',offset: '0',search: '呵呵',status: 'off',_: '1496114817748' }
        if (req.query.limit){
            //构造offset
            //TODO 直接采用了效率低下的skip方法
            var total = 0;
            var limit = parseInt(req.query.limit);
            var query = new AV.Query('Topic');
            //搜索参数处理
            if (req.query.search){
                var searchString = req.query.search;
                //用户名手机忌口留言站点地址联系电话
                var s1Query = new AV.Query('Topic');
                s1Query.contains('focus',searchString);
                var s2Query = new AV.Query('Topic');
                s2Query.contains('title',searchString);
                var s3Query = new AV.Query('Topic');
                s3Query.contains('detail',searchString);
                var sQuery = AV.Query.or(s1Query,s2Query,s3Query);

                //与search是且的关系
                query = AV.Query.and(query,sQuery);
            }
            query.count().then(function (count) {
                total = count;
                if (count){
                    return query.addDescending('updatedAt').skip(parseInt(req.query.offset)).limit(limit).find();
                }else {
                    var noData = {
                        total:0,
                        rows:[]
                    }
                    res.json(noData);
                }
            }).then(function (results) {
                var itemsArray = [];
                var resResult;
                //判断是否存在
                if (results.length){
                    //拼装,并返回表单数据
                    for (var i=0;i<results.length;i++){
                        resResult = results[i].attributes;
                        var item = {
                            title:resResult.title,
                            focus:resResult.focus,
                            detail:resResult.detail,
                            poster:resResult.bannerURL,
                            updateTime:results[i].updatedAt.toLocaleString(),
                            id:results[i].id
                        };
                        itemsArray.push(item);
                    }
                    var resData = {
                        total:total,
                        rows:itemsArray
                    }
                    res.json(resData);
                }else {
                    res.send('no data');
                }
            },function (err) {
                console.error(err);
                res.send(err.message);
            })

        }else {
            res.send('参数错误')
        }
    }else {
        res.send('illegal');
    }
})

// add接口
// 新建item
router.post('/add',function (req,res,next) {
    var currentUser = req.session.current;
    if (currentUser) {
        var reqData = req.body;
        var Topic = AV.Object.extend('Topic');
        var topic = new Topic();

        topic.set('operator',currentUser.user_name);
        topic.set('focus',reqData.focus);
        topic.set('title',reqData.title);
        topic.set('author',reqData.author);
        topic.set('detail',reqData.detail);
        topic.set('bannerURL',reqData.bannerUrl);
        return topic.save().then(function (topic) {
            if (topic){
                res.send('ok');
            }else {
                res.send('Something wrong');
            }
        }).catch(function (err) {
            console.error(err.message);
            res.send(err.message);
        })
    }else {
        res.send('illegal');
    }
})

// update
router.post('/update',function (req,res,next) {
    var currentUser = req.session.current;
    if (currentUser) {
        var reqData = req.body;
        var topic = AV.Object.createWithoutData('Topic', reqData.id);

        topic.set('operator',currentUser.user_name);
        topic.set('focus',reqData.focus);
        topic.set('title',reqData.title);
        topic.set('author',reqData.author);
        topic.set('detail',reqData.detail);
        topic.set('bannerURL',reqData.bannerUrl);
        return topic.save().then(function (topic) {
            if (topic){
                res.send('ok');
            }else {
                res.send('Something wrong');
            }
        }).catch(function (err) {
            console.error(err.message);
            res.send(err.message);
        })
    }else {
        res.send('illegal');
    }
})

module.exports = router;