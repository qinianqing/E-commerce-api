/**
 * Created by Mbb on 2017/5/29.
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var AV = require('leanengine');

router.get('/', function(req, res, next) {
    //先判断有无current user,如果有则渲染,没有重定向到登录页
    var currentUser = req.session.current;
    if (currentUser) {
        // 跳转到首页
        res.render('./cms/weapp', { user_name:currentUser.user_name})
    }
    else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

//QA配置路由
router.get('/qa',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        // 跳转到首页
        res.render('./cms/qa', {title: '用心吃饭CMS', user_name: currentUser.user_name})
    }else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

// weapp 的instruction配置
//获取info列表
router.get('/instruction/list',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        var query = new  AV.Query('Instruction');
        query.get('592bcd2e0ce463006b328fee').then(function (result) {
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
            // 先将图片保存到leancloud
            // 构造图片名称
            var name = 'pic'+'.'+req.body.content.split('.')[1];
            //var name = 'instructionPic'
            var imgBuf = fs.readFileSync(req.body.content);
            var file = new AV.File(name,imgBuf);
            file.save().then(function (file) {
                picUrl = file.url();
                // 保存至云端
                var query = new AV.Query('Instruction');
                return query.get('592bcd2e0ce463006b328fee');
            }).then(function (result) {
                if (result){
                    insArray = result.attributes.sections;

                    var item = {
                        type:req.body.type,
                        content:picUrl
                    }
                    insArray.push(item);

                    var newIns = AV.Object.createWithoutData('Instruction','592bcd2e0ce463006b328fee');
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
            query.get('592bcd2e0ce463006b328fee').then(function (result) {
                if (result){
                    insArray = result.attributes.sections;

                    var item = {
                        type:req.body.type,
                        content:req.body.content
                    }
                    insArray.push(item);

                    var newIns = AV.Object.createWithoutData('Instruction','592bcd2e0ce463006b328fee');
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
        var instuction = AV.Object.createWithoutData('Instruction','592bcd2e0ce463006b328fee');
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
            var query = new AV.Query('Instruction');
            query.get('592bcd2e0ce463006b328fee').then(function (result) {
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
        var instuction = AV.Object.createWithoutData('Instruction','592bcd2e0ce463006b328fee');
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

// QA处理

//获取QA列表
router.get('/qa/list',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        var query = new AV.Query('Qa');
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
        var query = new AV.Query('Qa');
        query.count().then(function (count) {
            num = count;
            var QA = new AV.Object.extend('Qa');
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
                var qa = AV.Object.createWithoutData('Qa',list[i].id);
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
            var qa = AV.Object.createWithoutData('Qa',req.body.id)

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
                    var qa = AV.Object.createWithoutData('Qa',list[i].id);
                    // 不包括0
                    qaDeleteArray.push(qa);
                }else {
                    var qa = AV.Object.createWithoutData('Qa',list[i].id);
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

module.exports = router;