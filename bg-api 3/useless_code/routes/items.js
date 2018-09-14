/**
 * Created by Mbb on 2017/5/29.
 */
const qingmangToken = 'd2ba26386bae41a4ab8f03c8b96491d7';

var express = require('express');
var router = express.Router();
var AV = require('leanengine');
var request = require('request');

// item列表页
router.get('/', function(req, res, next) {
    //先判断有无current user,如果有则渲染,没有重定向到登录页
    var currentUser = req.session.current;
    if (currentUser) {
        // 跳转到首页
        res.render('./cms/items', { title: '用心吃饭CMS',user_name:currentUser.user_name})
    }
    else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

// 创建新item
router.get('/new', function(req, res, next) {
    //先判断有无current user,如果有则渲染,没有重定向到登录页
    var currentUser = req.session.current;
    if (currentUser) {
        // 跳转到首页
        res.render('./cms/items-new', { title: '用心吃饭CMS',user_name:currentUser.user_name})
    }
    else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

// item详情页
router.get('/detail', function(req, res, next) {
    //先判断有无current user,如果有则渲染,没有重定向到登录页
    var currentUser = req.session.current;
    if (currentUser) {
        var pageData;
        //获取数据，有jade渲染
        var id = req.query.id;

        var query = new AV.Query('Item');
        query.include('topic');
        query.get(id).then(function (item) {
            var resResult = item.attributes;
            var typeString;
            switch (resResult.type){
                case 'pic':
                    typeString = '长图';
                    break;
                case 'audio':
                    typeString = '音频';
                    break;
                case 'page':
                    typeString = '网页';
                    break;
                case 'video':
                    typeString = '视频';
                    break;
            }
            var banner;
            if (!resResult.bannerURL){
                banner = ''
            }else {
                banner = resResult.bannerURL
            }
            // 获得实例
            pageData = {
                title:resResult.title,
                focus:resResult.focus,
                status:resResult.status,
                detail:resResult.detail,
                author:resResult.author,
                type:typeString,
                topic:item.get('topic').id,
                status:resResult.status,
                content:resResult.resourceURL,
                banner:banner,
                updateTime:item.updatedAt.toLocaleString(),
                id:item.id
            }
            // 跳转到首页
            res.render('./cms/items-detail', { title: '用心吃饭CMS',user_name:currentUser.user_name,data:pageData})
        }).catch(function (err) {
            console.error(err.message);
            res.send(err.message);
        });
    }
    else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

// items list接口
router.get('/list',function (req,res,next) {
    // { limit: '10', offset: '0', status: 'all', _: '1496114817745' }
    // { limit: '10', offset: '0', status: 'on', _: '1496114817746' }
    // { limit: '10', offset: '0', status: 'off', _: '1496114817747' }
    // { limit: '10',offset: '0',search: '呵呵',status: 'off',_: '1496114817748' }
    var currentUser = req.session.current;
    if (currentUser) {
        if (req.query.limit){
            //构造offset
            //TODO 直接采用了效率低下的skip方法
            var total = 0;
            var limit = parseInt(req.query.limit);
            //构造条件
            var query = new AV.Query('Item');
            if (req.query.status == 'on'){
                query.equalTo('status','on');
            }else if(req.query.status == 'off'){
                query.equalTo('status','off');
            }
            //搜索参数处理
            if (req.query.search){
                var searchString = req.query.search;
                //用户名手机忌口留言站点地址联系电话
                var s1Query = new AV.Query('Item');
                s1Query.contains('focus',searchString);
                var s2Query = new AV.Query('Item');
                s2Query.contains('title',searchString);
                var s3Query = new AV.Query('Item');
                s3Query.contains('detail',searchString);
                // 内嵌查询topic
                var s4Query = new AV.Query('Item');
                var innerQuery = new AV.Query('Topic');
                innerQuery.contains('title',searchString);
                s4Query.matchesQuery('Topic',innerQuery);
                // 根据ID关联查询topic
                if(searchString.length == 24){
                    var s5Query = new AV.Query('Item');
                    s5Query.contains('provider_name',searchString);
                    //都是或的关系
                    var sQuery = AV.Query.or(s1Query,s2Query,s3Query,s4Query,s5Query);
                }else {
                    //都是或的关系
                    var sQuery = AV.Query.or(s1Query,s2Query,s3Query,s4Query);
                }

                //与search是且的关系
                query = AV.Query.and(query,sQuery);
            }
            query.count().then(function (count) {
                total = count;
                if (count){
                    // 将关联的话题信息也带下来
                    query.include('topic');
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
                            type:resResult.type,
                            topic:results[i].get('topic').attributes.title,
                            status:resResult.status,
                            content:resResult.resourceURL,
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
    }
    else {
        res.send('illegal')
    }
})

// 新建item
router.post('/add',function (req,res,next) {
    var currentUser = req.session.current;
    if (currentUser) {
        var reqData = req.body;
        if (reqData.topic.length != 24){
            res.send('Bad params');
        }else {
            // 先查询topic是否存在
            var query = new AV.Query('Topic');
            query.get(reqData.topic).then(function (topic) {
                if (topic){
                    if (reqData.type == 'page'){
                        // 请求轻芒的API，来创建文章内容
                        var token = qingmangToken;
                        var postData = reqData.resourceURL;
                        return new Promise(function (resolve,reject) {
                            request({
                                method:'POST',
                                url:'https://api.qingmang.me/v2/article.fetch?token='+token,
                                body:postData
                            },function (err,response,body) {
                                console.log(body)
                                if (!err && response.statusCode == 200) {
                                    resolve(body);
                                }else {
                                    reject(err);
                                }
                            })
                        })
                    }else {
                        return new Promise(function (resolve,reject) {
                            resolve(0);
                        })
                    }
                }else {
                    res.send('错误话题ID');
                }
            }).then(function (data) {
                var Item = AV.Object.extend('Item');
                var item = new Item();
                if (data){
                    // 是文章格式
                    item.set('resource',data);
                }
                item.set('operator',currentUser.user_name);
                item.set('focus',reqData.focus);
                item.set('type',reqData.type);
                item.set('status','off');
                item.set('title',reqData.title);
                var topic = AV.Object.createWithoutData('Topic',reqData.topic);
                item.set('topic',topic);
                item.set('author',reqData.author);
                item.set('detail',reqData.detail);
                item.set('resourceURL',reqData.resourceURL);
                if (reqData.bannerURL){
                    item.set('bannerURL',reqData.bannerURL);
                }
                return item.save();
            }).then(function (result) {
                if (result){
                    res.send('ok');
                }else {
                    res.send('something wrong');
                }
            }).catch(function (err) {
                console.error(err.message);
                res.send(err.message);
            })
        }
    }else {
        res.send('illegal');
    }
})

// 更新item
router.post('/update',function (req,res,next) {
    var currentUser = req.session.current;
    if (currentUser) {
        var reqData = req.body;
        if (reqData.topic.length != 24){
            res.send('Bad params');
        }else {
            // 先查询topic是否存在
            var query = new AV.Query('Topic');
            return query.get(reqData.topic).then(function (topic) {
                if (topic){
                    if (reqData.type == 'page'){
                        // 请求轻芒的API，来创建文章内容
                        var token = qingmangToken;
                        var postData = reqData.resourceURL;
                        return new Promise(function (resolve,reject) {
                            request({
                                method:'POST',
                                url:'https://api.qingmang.me/v2/article.fetch?token='+token,
                                body:postData
                            },function (err,response,body) {
                                if (!err && response.statusCode == 200) {
                                    resolve(body);
                                }else {
                                    reject(err);
                                }
                            })
                        })
                    }else {
                        return new Promise(function (resolve,reject) {
                            resolve(0);
                        })
                    }
                }else {
                    res.send('错误话题ID');
                }
            }).then(function (data) {
                var item = AV.Object.createWithoutData('Item', reqData.id);

                if (data){
                    // 是文章格式
                    item.set('resource',data);
                }
                item.set('operator',currentUser.user_name);
                item.set('focus',reqData.focus);
                item.set('type',reqData.type);
                item.set('status',reqData.status);
                item.set('title',reqData.title);
                var topic = AV.Object.createWithoutData('Topic',reqData.topic);
                item.set('topic',topic);
                item.set('author',reqData.author);
                item.set('detail',reqData.detail);
                item.set('resourceURL',reqData.resourceURL);
                if (reqData.bannerURL){
                    item.set('bannerURL',reqData.bannerURL);
                }
                return item.save();
            }).then(function (result) {
                if (result){
                    res.send('ok');
                }else {
                    res.send('something wrong');
                }
            }).catch(function (err) {
                console.error(err.message);
                res.send(err.message);
            })
        }
    }else {
        res.send('illegal');
    }
})

// 删除item
router.post('/delete',function (req,res,next) {
    var currentUser = req.session.current;
    if (currentUser) {
        var item = AV.Object.createWithoutData('Item', req.body.id);
        item.destroy().then(function (success) {
            // 删除成功
            res.send('ok');
        }, function (error) {
            // 删除失败
            res.send(error.message);
        });
    }else {
        res.send('illegal');
    }
})

module.exports = router;