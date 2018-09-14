/**
 * Created by zhangwei on 17/5/1.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var AV = require('leancloud-storage');

//fc首页路由
router.get('/', function(req, res, next) {
    var currentUser = req.session.current;

    if (currentUser) {
        // 跳转到首页
        res.render('./cms/fc', {title: '用心吃饭CMS', user_name: currentUser.user_name})
    }else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

//fc instruction配置路由
router.get('/instruction',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        // 跳转到首页
        res.render('./cms/fc-instruction', {title: '用心吃饭CMS', user_name: currentUser.user_name})
    }else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

//fc QA配置路由
router.get('/qa',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        // 跳转到首页
        res.render('./cms/fc-qa', {title: '用心吃饭CMS', user_name: currentUser.user_name})
    }else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

//fc users管理路由
router.get('/users',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        // 跳转到首页
        res.render('./cms/fc-users', {title: '用心吃饭CMS', user_name: currentUser.user_name})
    }else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

//获取motto列表
router.get('/motto',function (req,res,next) {
    //判断用户是否登录
    var currentUser = req.session.current;

    if (currentUser) {
        //查询motto表
        var query = new AV.Query('motto');
        query.find().then(function (results) {
            var mottoArray = [];
            //判断是否存在
            if (results.length) {
                //拼装,并返回表单数据
                for (var i = 0; i < results.length; i++) {
                    var item = {
                        ID: results[i].id,
                        name: results[i].attributes.mottoTarget,
                        detail: results[i].attributes.description
                    }
                    mottoArray.push(item);
                }

                res.json(mottoArray);
            }
        }).catch(function (err) {
            console.error(err);
            res.send(err.message);
        })
    }else {
        res.send('illegal');
    }
})

//编辑motto接口
router.post('/motto/edit',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        // 获取object
        var motto = AV.Object.createWithoutData('motto',req.body.ID);
        motto.set('description',req.body.detail);
        motto.save().then(function (result) {
            if (result){
                res.send('ok');
            }
        }).catch(function (err) {
            res.send(err.message);
            console.error(err);
        })
    }else {
        res.send('illegal');
    }
})

//获取info列表
router.get('/instruction/list',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        var query = new  AV.Query('FcInstruction');
        query.get('58ff6d198d6d810058a9dbc4').then(function (result) {
            if (result){
                var sections = result.attributes.sections;
                var resArray = [];
                for (var i=0;i<sections.length;i++){
                    var resItem = {
                        index:i+1,
                        type:sections[i].type,
                        content:sections[i].content,
                    }
                    resArray.push(resItem)
                }
                res.json(resArray)
            }else {
                res.send('something error')
            }
        })
    }else {
        res.send('illegal');
    }
    /*
    数据类型
    sections
     [
     {
     "type": "photo",
     "content": "http://imagedb.jiyong365.com/DSC_6428.JPG/user_firstpage_2x"
     },
     {
     "type": "text",
     "content": "text"
     },
     {
     "type": "title",
     "content": "这是个标题"
     }
     ]
     */
})

//新增info
router.post('/instruction/add',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        if (req.body.type == 'photo'){
            var picUrl;
            var imgBuf = fs.readFileSync(req.body.content);
            // 先将图片保存到leancloud
            // 构造图片名称
            var name = 'pic'+req.body.content.split('pic')[1];
            var file = new AV.File(name,imgBuf);
            file.save().then(function (file) {
                picUrl = file.url();
                // 保存至云端
                var query = new AV.Query('FcInstruction');
                return query.get('58ff6d198d6d810058a9dbc4');
            }).then(function (result) {
                if (result){
                    insArray = result.attributes.sections;

                    var item = {
                        type:req.body.type,
                        content:picUrl
                    }
                    insArray.push(item);

                    var newIns = AV.Object.createWithoutData('FcInstruction','58ff6d198d6d810058a9dbc4');
                    newIns.set('sections',insArray)
                    return newIns.save()
                }else {
                    res.send('something wrong')
                }
            }).then(function (result) {
                if (result){
                    res.send('ok')
                }else {
                    res.send('something wrong')
                }
                // 删除路径下的临时图片
                fs.unlink(req.body.content,function (err) {
                    console.error(err);
                })
            }).catch(function (err) {
                console.error(err);
                res.send('something wrong')
            })
        }else {
            // 非图片请求不影响
            var query = new AV.Query('Instruction');
            query.get('58ff6d198d6d810058a9dbc4').then(function (result) {
                if (result){
                    insArray = result.attributes.sections;

                    var item = {
                        type:req.body.type,
                        content:req.body.content
                    }
                    insArray.push(item);

                    var newIns = AV.Object.createWithoutData('FcInstruction','58ff6d198d6d810058a9dbc4');
                    newIns.set('sections',insArray)
                    return newIns.save()
                }else {
                    res.send('something wrong')
                }
            }).then(function (result) {
                if (result){
                    res.send('ok')
                }else {
                    res.send('something wrong')
                }
            })
        }
    }else {
        res.send('illegal');
    }

})

//编辑info列表
router.post('/instruction/edit',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        var instuction = AV.Object.createWithoutData('FcInstruction','58ff6d198d6d810058a9dbc4');
        var insArray = [];
        var list = req.body;
        if (list.length){
            for (var i=0;i<list.length;i++){
                var item = {
                    type:list[i].type,
                    content:list[i].content
                }
                insArray.push(item)
            }
            instuction.set('sections',insArray);
            instuction.save().then(function (result) {
                if (result){
                    res.send('ok')
                }else {
                    res.send('something wrong')
                }
            })
        }else {
            var query = new AV.Query('FcInstruction');
            query.get('58ff6d198d6d810058a9dbc4').then(function (result) {
                var list = result.attributes.sections;
                for (var i=0;i<list.length;i++){
                    if (req.body.index == i+1){
                        var item = {
                            type:req.body.type,
                            content:req.body.content
                        }
                        insArray.push(item)
                    }else {
                        insArray.push(list[i])
                    }
                }
                instuction.set('sections',insArray);
                return instuction.save()
            }).then(function (result) {
                if (result){
                    res.send('ok')
                }else {
                    res.send('something wrong')
                }
            })

        }
    }else {
        res.send('illegal');
    }

})
//删除instruction
router.post('/instruction/delete',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        var instuction = AV.Object.createWithoutData('FcInstruction','58ff6d198d6d810058a9dbc4');
        var insArray = [];
        var list = req.body;
        if (list.length){
            for (var i=0;i<list.length;i++){
                if (list[i].check){
                    //break
                }else {
                    var item = {
                        type:list[i].type,
                        content:list[i].content
                    }
                    insArray.push(item)
                }
            }
            instuction.set('sections',insArray);
            instuction.save().then(function (result) {
                if (result){
                    res.send('ok')
                }else {
                    res.send('something wrong')
                }
            })
        }
    }else {
        res.send('illegal');
    }

})

//获取QA列表
router.get('/qa/list',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        var query = new AV.Query('FcQA');
        query.ascending('index').find().then(function (results) {
            if (results.length){
                var resArray = [];
                for (var i = 0;i<results.length;i++){
                    var resItem = {
                        index:results[i].attributes.index,
                        question:results[i].attributes.question,
                        answer:results[i].attributes.answer,
                        id:results[i].id
                    }
                    resArray.push(resItem)
                }
                res.json(resArray)
            }else {
                res.send('something wrong')
            }
        })
    }else {
        res.send('illegal');
    }

})

//新建QA
router.post('/qa/add',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        var num = 0;
        //先count
        var query = new AV.Query('FcQA');
        query.count().then(function (count) {
            num = count;
            var QA = new AV.Object.extend('FcQA');
            var qa = new QA();
            qa.set('index',num+1);
            qa.set('question',req.body.q);
            qa.set('answer',req.body.a);
            return qa.save()
        }).then(function (result) {
            if (result){
                res.send('ok')
            }else {
                res.send('something wrong')
            }
        })
    }else {
        res.send('illegal');
    }

})

//编辑QA列表
router.post('/qa/edit',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        if (req.body.length){
            //排序请求
            var list = req.body
            var qaArray = [];
            for (var i=0;i<req.body.length;i++){
                var qa = AV.Object.createWithoutData('FcQA',list[i].id);
                // 不包括0
                qa.set('index',i+1)

                qaArray.push(qa);
            }
            AV.Object.saveAll(qaArray).then(function (results) {
                if (results){
                    res.send('ok');
                }
            }).catch(function (err) {
                res.send(err.message)
            })
        }else {
            //更新请求
            console.log(req.body)
            var qa = AV.Object.createWithoutData('FcQA',req.body.id)

            qa.set('question',req.body.question);
            qa.set('answer',req.body.answer);

            qa.save().then(function (result) {
                if (result){
                    res.send('ok')
                }else {
                    res.send('something wrong')
                }
            }).catch(function (err) {
                res.send(err.message)
                console.error(err.message)
            })
        }
    }else {
        res.send('illegal');
    }
})

//删除QA列表
router.post('/qa/delete',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        if (req.body.length){
            //排序请求
            var list = req.body;
            var qaDeleteArray = [];
            var newQaArray = [];
            var index = 1;
            for (var i=0;i<req.body.length;i++){
                // 删除标记对象
                if (req.body[i].check){
                    // 将标记check为true的对象删除
                    var qa = AV.Object.createWithoutData('FcQA',list[i].id);
                    // 不包括0
                    qaDeleteArray.push(qa);
                }else {
                    var qa = AV.Object.createWithoutData('FcQA',list[i].id);
                    qa.set('index',index++)
                    // 不包括0
                    newQaArray.push(qa);
                }
            }
            AV.Object.destroyAll(qaDeleteArray).then(function () {
                // 更新index
                return AV.Object.saveAll(newQaArray);
            }).then(function (results) {
                if (results){
                    res.send('ok');
                }
            }).catch(function (err) {
                res.send(err.message)
            })
        }
    }else {
        res.send('illegal');
    }
})

// 获取用户列表
router.get('/users/list',function (req,res,next) {
    /*
     { limit: '10',
     offset: '0',
     search: '6',
     type: 'all',
     _: '1493979070050' }
     */
    var currentUser = req.session.current;

    if (currentUser) {
        if (req.query.limit){
            //构造offset
            //TODO 直接采用了效率低下的skip方法
            var total = 0;
            var limit = req.query.limit;

            //构造条件
            var query = new AV.Query('partner_user');
            //构造authID筛选
            if (req.query.type == '0'){
                query.equalTo('authID',0)
            }else if (req.query.type == '1'){
                query.equalTo('authID',1)
            }else if (req.query.type == '2'){
                query.equalTo('authID',2)
            }

            //搜索参数处理
            if (req.query.search){
                var searchString = req.query.search;
                //用户名手机忌口留言站点地址联系电话
                var s1Query = new AV.Query('partner_user');
                s1Query.contains('name',searchString);
                var s2Query = new AV.Query('partner_user');
                s2Query.contains('phoneNumber',searchString);
                var s3Query = new AV.Query('partner_user');
                s3Query.contains('belongPartner',searchString);

                //都是或的关系
                var sQuery = AV.Query.or(s1Query,s2Query,s3Query);
                //与search是且的关系
                query = AV.Query.and(query,sQuery);
            }
            query.count().then(function (count) {
                total = count;
                if (count){
                    return query.addDescending('updatedAt').skip(req.query.offset).limit(limit).find();
                }else {
                    var noData = {
                        total:0,
                        rows:[]
                    }
                    res.json(noData);
                }

            }).then(function (results) {
                var itemArray = [];
                //判断是否存在
                if (results.length){
                    //拼装,并返回表单数据
                    for (var i=0;i<results.length;i++){
                        var type = '';
                        var partner = '';

                        if (results[i].attributes.authID == '0'){
                            type = '即趣运营';
                            partner = '即趣运营中心';
                        }else if (results[i].attributes.authID == '1'){
                            type = '供应商';
                            partner = results[i].attributes.belongPartner;
                        }else if (results[i].attributes.authID == '2'){
                            type = '站点';
                            partner = results[i].attributes.belongPartner;
                        }

                        var item = {
                            type:type,
                            belongPartner:partner,
                            phoneNumber:results[i].attributes.phoneNumber,
                            name:results[i].attributes.name,
                            ID:results[i].id,
                        }
                        itemArray.push(item);
                    }
                    var resData = {
                        total:total,
                        rows:itemArray
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

// 添加用户
router.post('/users/add',function (req,res,next) {
    //创建用户
    var currentUser = req.session.current;
    if (currentUser){
        var  newUser = null;
        //先判断session
        if (req.body.authID){
            if (req.body.belongPartner){
                if (req.body.name){
                    if (req.body.phoneNumber.length == 11){
                        //手机号不能重复
                        var query = new AV.Query('partner_user');
                        query.equalTo('phoneNumber',req.body.phoneNumber);
                        query.find().then(function (results) {
                            if (results.length){
                                res.send('手机号重复');
                            }else {
                                var User = new AV.Object.extend('partner_user');
                                var user = new User();

                                user.set('authID',parseInt(req.body.authID));
                                user.set('belongPartner',req.body.belongPartner);
                                user.set('phoneNumber',req.body.phoneNumber);
                                user.set('name',req.body.name);

                                return user.save()
                            }
                        }).then(function (result) {
                            if (result){
                                res.send('ok');
                            }else {
                                res.send('something wrong');
                            }
                        }).catch(function (error) {
                            console.error(error);
                            //console.error(error);
                            res.send(error.message);
                        })
                    }else {
                        res.send('参数不正确');
                    }
                }else {
                    res.send('参数不正确');
                }
            }else {
                res.send('参数不正确');
            }
        }else {
            res.send('参数不正确');
        }
    }else {
        res.send('illegal');
    }
})

// 编辑用户
router.post('/users/edit',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        if (req.body){
            var user = AV.Object.createWithoutData('partner_user',req.body.ID);

            user.set('belongPartner',req.body.belongPartner);
            user.set('phoneNumber',req.body.phoneNumber);
            user.set('name',req.body.name);

            user.save().then(function (result) {
                if (result){
                    res.send('ok');
                }
            }).catch(function (err) {
                res.send(err.message);
            })
        }else {
            res.send('参数错误');
        }
    }else {
        res.send('illegal');
    }
})

// 删除用户 
router.post('/users/delete',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        if (req.body.length){
            //排序请求
            var list = req.body;
            var qaDeleteArray = [];

            for (var i=0;i<req.body.length;i++){
                // 删除标记对象
                if (req.body[i].check){
                    // 将标记check为true的对象删除
                    var qa = AV.Object.createWithoutData('partner_user',list[i].ID);
                    qaDeleteArray.push(qa);
                }
            }
            AV.Object.destroyAll(qaDeleteArray).then(function (success) {
                res.send('ok');
            }).catch(function (err) {
                console.error(err.message)
                res.send(err.message)
            })
        }
    }else {
        res.send('illegal');
    }
})

module.exports = router;