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
        res.render('./cms/projects', { user_name:currentUser.user_name})
    }
    else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

// 创建新产品
router.get('/new', function(req, res, next) {
    //先判断有无current user,如果有则渲染,没有重定向到登录页
    var currentUser = req.session.current;
    if (currentUser) {
        // 跳转到首页
        res.render('./cms/projects-new', { user_name:currentUser.user_name})
    }
    else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

// 查看商品详情
// item详情页
router.get('/detail', function(req, res, next) {
    //先判断有无current user,如果有则渲染,没有重定向到登录页
    var currentUser = req.session.current;
    if (currentUser) {
        var pageData;
        //获取数据，有jade渲染
        var id = req.query.id;

        var query = new AV.Query('Project');
        query.get(id).then(function (item) {
            var resResult = item.attributes;

            // TODO 对数据进行逆向处理，这个是根据编辑展现形式而变的
            var category;
            if (resResult.category.length){
                for (var i=0;i<resResult.category.length;i++){
                    if (i == 0){
                        category = resResult.category[0].ID;
                    }else {
                        category = category + '\n' +resResult.category[i].ID
                    }
                }
            }

            var price;
            for (var i=0;i<5;i++){
                if (resResult.price[i].add == -1){
                    resResult.price[i].add = 'A'
                }
                if (resResult.price[i].add_describe == ""){
                    resResult.price[i].add_describe = 'M'
                }
            }
            for (var i=0;i<5;i++){
                if (i == 0){
                    price = resResult.price[i].times+'次'+resResult.price[i].price+'元加'+resResult.price[i].add+'元送'+resResult.price[i].add_describe;
                }else {
                    price = price +'，'+resResult.price[i].times+'次'+resResult.price[i].price+'元加'+resResult.price[i].add+'元送'+resResult.price[i].add_describe;
                }
            }

            var types;
            if (resResult.types.length){
                for (var i=0;i<resResult.types.length;i++){
                    if (i == 0){
                        types = resResult.types[0];
                    }else {
                        types = types + '\n' +resResult.types[i]
                    }
                }
            }

            var photos;
            if (resResult.photos.length){
                for (var i=0;i<resResult.photos.length;i++){
                    if (i == 0){
                        photos = resResult.photos[0];
                    }else {
                        photos = photos+'\n'+resResult.photos[i]
                    }
                }
            }
            console.log(photos)

            // 获得实例
            pageData = {
                title:resResult.title,
                recommend:resResult.recommend,
                status:resResult.status,
                category:category,
                banner:resResult.banner,
                video:resResult.video,
                cyc:resResult.cyc,
                price:price,
                normalPrice:resResult.normalPrice,
                types:types,
                statement:resResult.statement,
                photos:photos,
                updateTime:item.updatedAt.toLocaleString(),
                id:item.id
            }
            // 跳转到首页
            res.render('./cms/projects-detail', { user_name:currentUser.user_name,data:pageData})
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
            var query = new AV.Query('Project');
            if (req.query.status == 'on'){
                query.equalTo('status','on');
            }else if(req.query.status == 'off'){
                query.equalTo('status','off');
            }
            //搜索参数处理
            if (req.query.search){
                var searchString = req.query.search;
                //用户名手机忌口留言站点地址联系电话
                var sQuery = new AV.Query('Project');
                sQuery.contains('title',searchString);

                //与search是且的关系
                query = AV.Query.and(query,sQuery);
            }
            query.count().then(function (count) {
                total = count;
                if (count){
                    // 将关联的话题信息也带下来
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
                            recommend:resResult.recommend,
                            status:resResult.status,
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

// 新建project
router.post('/add',function (req,res,next) {
    var currentUser = req.session.current;
    if (currentUser) {
        var reqData = req.body;

        var isError = false;
        // 校验品类是否满足要求
        // TODO 没有做同一级类目校验
        var categoryIDS = [];
        // category不为空且不含回车符，这种情况必须要加上
        if (reqData.category){
            var categoryIDReq = reqData.category.split('\n');
            if (categoryIDReq.length == 0){
                categoryIDS.push(reqData.category);
            }else {
                // 有回车的情况
                var n = 0;
                for (var i=0;i<categoryIDReq.length;i++){
                    // 遍历用户上传内容，进行切割
                    if (categoryIDReq[i].toString().length == 24){
                        n++;
                    }
                }
                if (n == 0){
                    res.send('需要填写一个正确的类目');
                }
                // 二次查询，指查询
                for (var i=0;i<categoryIDReq.length;i++){
                    var m = 0;
                    // 校验二级类目数据库中是否存在
                    if (categoryIDReq[i].toString().length == 24){
                        m++;
                        var query = new AV.Query('Category');
                        query.get(categoryIDReq[i]).then(function (result) {
                            if (result){
                                var item = {
                                    ID:result.id,
                                    name:result.attributes.name,
                                    decribe:result.attributes.describe
                                }
                                categoryIDS.push(item);

                                if (m == n){
                                    //全部查完了
                                    // TODO 对图片的格式也没有严格校验，只校验了字段是否为空
                                    var photos = [];
                                    if (reqData.photos){
                                        var photosReq = reqData.photos.split('\n');
                                        if (photosReq.length == 0){
                                            photos.push(reqData.photos);
                                        }else {
                                            for (var i=0;i<photosReq.length;i++){
                                                if (photosReq[i].toString().length > 0){
                                                    photos.push(photosReq[i]);
                                                }
                                            }
                                        }
                                    }else {
                                        isError = true;
                                    }

                                    var prices = [];
                                    // 根据价格模板，生成价格价格对象
                                    // TODO 只能按照字段的模板来改，比较容易出错
                                    var priceString = reqData.price;
                                    for (var i=0;i<5;i++){
                                        var st = priceString.split('，')[i];
                                        // 正则匹配出次数、价格、加价、赠送文案
                                        var times = parseInt(st.split('次')[0]);
                                        var price = parseFloat(st.split('元加')[0].split('次')[1]);
                                        var addPrice = st.split('元加')[1].split('元送')[0];
                                        var addCom = st.split('元送')[1];

                                        if (addPrice != 'A' && addCom != 'M'){
                                            addPrice = parseFloat(addPrice);

                                            // 组合价格数组
                                            var item = {
                                                times: times,
                                                price: price,
                                                add: addPrice,
                                                add_describe:addCom
                                            }
                                            prices.push(item);
                                        }else if (addPrice != 'A' && addCom == 'M'){
                                            isError = true;
                                        }else {
                                            if (addCom == 'M'){
                                                var item = {
                                                    times: times,
                                                    price: price,
                                                    add: -1,
                                                    add_describe: ''
                                                }
                                                prices.push(item);
                                            }else {
                                                var item = {
                                                    times: times,
                                                    price: price,
                                                    add: -1,
                                                    add_describe:addCom
                                                }
                                                prices.push(item);
                                            }
                                        }
                                    }

                                    // 处理types
                                    var types = [];
                                    if (reqData.types){
                                        // 不为空
                                        var typesReq = reqData.types.split('\n');
                                        if (typesReq.length == 0){
                                            types.push(reqData.types);
                                        }else {
                                            for (var i=0;i<typesReq.length;i++){
                                                if (typesReq[i].toString().length > 0){
                                                    types.push(typesReq[i]);
                                                }
                                            }
                                        }
                                    }

                                    if (!isError){
                                        var Project = AV.Object.extend('Project');
                                        var project = new Project();

                                        project.set('status','off');
                                        project.set('operator',currentUser.user_name);
                                        project.set('title',reqData.title);
                                        project.set('recommend',reqData.recommend);
                                        project.set('category',categoryIDS);
                                        project.set('banner',reqData.banner);
                                        project.set('video',reqData.video);
                                        project.set('cyc',parseInt(reqData.cyc));
                                        project.set('price',prices);
                                        project.set('normalPrice',parseFloat(reqData.normalPrice));
                                        project.set('types',types);
                                        project.set('statement',reqData.statement);
                                        project.set('photos',photos);

                                        return project.save().then(function (result) {
                                            if (result){
                                                res.send('ok');
                                            }else {
                                                res.send('something wrong');
                                            }
                                        }).catch(function (err) {
                                            console.error(err.message);
                                            res.send(err.message);
                                        })
                                    }else {
                                        res.send('参数有错误');
                                    }
                                }
                            }
                        },function (error) {
                            console.log('error',error);
                        })
                    }
                }
            }
        }else {
            res.send('类目错误');
        }


    }else {
        res.send('illegal');
    }
})

// 更新project
router.post('/update',function (req,res,next) {
    var currentUser = req.session.current;
    if (currentUser) {
        var reqData = req.body;

        //var isError = false;
        // 校验品类是否满足要求
        // TODO 没有做同一级类目校验
        var categoryIDS = [];
        // category不为空且不含回车符，这种情况必须要加上
        if (reqData.category){
            var categoryIDReq = reqData.category.split('\n');
            if (categoryIDReq.length == 0){
                categoryIDS.push(reqData.category);
            }else {
                // 有回车的情况
                var n = 0;
                for (var i=0;i<categoryIDReq.length;i++){
                    // 遍历用户上传内容，进行切割
                    if (categoryIDReq[i].toString().length == 24){
                        n++;
                    }
                }
                if (n == 0){
                    res.send('需要填写一个正确的类目');
                }
                // 二次查询，指查询
                for (var i=0;i<categoryIDReq.length;i++){
                    var m = 0;
                    // 校验二级类目数据库中是否存在
                    if (categoryIDReq[i].toString().length == 24){
                        m++;
                        var query = new AV.Query('Category');
                        query.get(categoryIDReq[i]).then(function (result) {
                            if (result){
                                var item = {
                                    ID:result.id,
                                    name:result.attributes.name,
                                    decribe:result.attributes.describe
                                }
                                categoryIDS.push(item);

                                if (m == n){
                                    //全部查完了
                                    // TODO 对图片的格式也没有严格校验，只校验了字段是否为空
                                    var photos = [];
                                    if (reqData.photos){
                                        var photosReq = reqData.photos.split('\n');
                                        console.log(photosReq);
                                        if (photosReq.length == 0){
                                            photos.push(reqData.photos);
                                        }else {
                                            for (var i=0;i<photosReq.length;i++){
                                                if (photosReq[i].toString().length > 0){
                                                    photos.push(photosReq[i]);
                                                }
                                            }
                                        }
                                    }
                                    //else {
                                    //    isError = true;
                                    //}

                                    var prices = [];
                                    // 根据价格模板，生成价格价格对象
                                    // TODO 只能按照字段的模板来改，比较容易出错
                                    var priceString = reqData.price;
                                    for (var i=0;i<5;i++){
                                        var st = priceString.split('，')[i];
                                        // 正则匹配出次数、价格、加价、赠送文案
                                        var times = parseInt(st.split('次')[0]);
                                        var price = parseFloat(st.split('元加')[0].split('次')[1]);
                                        var addPrice = st.split('元加')[1].split('元送')[0];
                                        var addCom = st.split('元送')[1];

                                        if (addPrice != 'A' && addCom != 'M'){
                                            addPrice = parseFloat(addPrice);

                                            // 组合价格数组
                                            var item = {
                                                times: times,
                                                price: price,
                                                add: addPrice,
                                                add_describe:addCom
                                            }
                                            prices.push(item);
                                        }else if (addPrice != 'A' && addCom == 'M'){
                                            isError = true;
                                        }else {
                                            if (addCom == 'M'){
                                                var item = {
                                                    times: times,
                                                    price: price,
                                                    add: -1,
                                                    add_describe: ''
                                                }
                                                prices.push(item);
                                            }else {
                                                var item = {
                                                    times: times,
                                                    price: price,
                                                    add: -1,
                                                    add_describe:addCom
                                                }
                                                prices.push(item);
                                            }
                                        }
                                    }

                                    // 处理types
                                    var types = [];
                                    if (reqData.types){
                                        // 不为空
                                        var typesReq = reqData.types.split('\n');
                                        if (typesReq.length == 0){
                                            types.push(reqData.types);
                                        }else {
                                            for (var i=0;i<typesReq.length;i++){
                                                if (typesReq[i].toString().length > 0){
                                                    types.push(typesReq[i]);
                                                }
                                            }
                                        }
                                    }

                                    //if (!isError){
                                        var project = AV.Object.createWithoutData('Project', reqData.id);

                                        project.set('status',reqData.status);
                                        project.set('operator',currentUser.user_name);
                                        project.set('title',reqData.title);
                                        project.set('recommend',reqData.recommend);
                                        project.set('category',categoryIDS);
                                        project.set('banner',reqData.banner);
                                        project.set('video',reqData.video);
                                        project.set('cyc',parseInt(reqData.cyc));
                                        project.set('price',prices);
                                        project.set('normalPrice',parseFloat(reqData.normalPrice));
                                        project.set('types',types);
                                        project.set('statement',reqData.statement);
                                        project.set('photos',photos);

                                        return project.save().then(function (result) {
                                            if (result){
                                                res.send('ok');
                                            }else {
                                                res.send('something wrong');
                                            }
                                        }).catch(function (err) {
                                            console.error(err.message);
                                            res.send(err.message);
                                        })
                                    //}else {
                                    //    res.send('参数有错误');
                                    //}
                                }
                            }
                        },function (error) {
                            console.log('error',error);
                        })
                    }
                }
            }
        }else {
            res.send('类目错误');
        }

    }else {
        res.send('illegal');
    }
})

// 删除item
router.post('/delete',function (req,res,next) {
    var currentUser = req.session.current;
    if (currentUser) {
        var project = AV.Object.createWithoutData('Project', req.body.id);
        project.destroy().then(function (success) {
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