/**
 * Created by zhangwei on 17/5/1.
 */
var express = require('express');
var router = express.Router();
var AV = require('leancloud-storage');

// 页面路由
router.get('/', function(req, res, next) {
    //先判断有无current user,如果有则渲染,没有重定向到登录页
    var currentUser = req.session.current;
    if (currentUser) {
        // 跳转
        res.render('./cms/planorders', { title: '用心吃饭CMS',user_name:currentUser.user_name})
    }
    else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

// list接口
// OK
router.get('/list',function (req,res,next) {
    // { limit: '10', offset: '0', status: 'init', _: '1493913508895' }
    var currentUser = req.session.current;
    if (currentUser) {
        if (req.query.limit){
            //构造offset
            //TODO 直接采用了效率低下的skip方法
            var total = 0;
            var skipNum = req.query.limit*req.query.offset;
            var limit = req.query.limit;

            //构造条件
            var query = new AV.Query('HostPlanGoods');
            if (req.query.status == 'init'){
                query.equalTo('status','init');

            }else if(req.query.status == 'done'){
                query.equalTo('status','done');
            }else if(req.query.status == 'feedback'){
                query.equalTo('status','feedback');
            }
            //搜索参数处理
            if (req.query.search){
                var searchString = req.query.search;
                //用户名手机忌口留言站点地址联系电话
                var s1Query = new AV.Query('Unit');
                s1Query.contains('user_name',searchString);
                var s2Query = new AV.Query('Unit');
                s2Query.contains('user_mobile',searchString);
                var s3Query = new AV.Query('Unit');
                s3Query.contains('message',searchString);
                var s4Query = new AV.Query('Unit');
                s4Query.contains('order_message',searchString);
                var s5Query = new AV.Query('Unit');
                s5Query.contains('shop_address',searchString);
                var s6Query = new AV.Query('Unit');
                s6Query.contains('shop_name',searchString);
                var s7Query = new AV.Query('Unit');
                s7Query.contains('shop_phone',searchString);
                //都是或的关系
                var sQuery = AV.Query.or(s1Query,s2Query,s3Query,s4Query,s5Query,s6Query,s7Query);
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
                var unitArray = [];
                //判断是否存在
                if (results.length){
                    //拼装,并返回表单数据
                    for (var i=0;i<results.length;i++){
                        var item = {
                            startDate:results[i].attributes.startDate,
                            duration:results[i].attributes.duration,
                            code:results[i].attributes.item_code,
                            name:results[i].attributes.name,
                            time:results[i].attributes.time,
                            size:results[i].attributes.size,
                            goUpstairs:results[i].attributes.goUpstairs,
                            fb:results[i].attributes.feedback_status,
                            fc:results[i].attributes.status,
                            yz:results[i].attributes.state_str,
                            user_name:results[i].attributes.user_name,
                            mobile:results[i].attributes.user_mobile,
                            avoid:results[i].attributes.message,
                            message:results[i].attributes.order_message,
                            station:results[i].attributes.shop_name,
                            stationD:results[i].attributes.shop_city+results[i].attributes.shop_district,
                            stationA:results[i].attributes.shop_address,
                            stationP:results[i].attributes.shop_phone,
                            orderID:results[i].attributes.order_id_yz,
                            ID:results[i].id
                        }
                        unitArray.push(item);
                    }
                    var resData = {
                        total:total,
                        rows:unitArray
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

// units date list
router.get('/plandates',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        var durationNum = 0;
        if (req.query.ID){
            //先确定duration的数量
            var pQuery = new AV.Query('HostPlanGoods');
            pQuery.get(req.query.ID).then(function (plan) {
                if (plan){
                    durationNum = parseInt(plan.attributes.duration);

                    var query = new AV.Query('Unit');
                    query.equalTo('plan_ID',req.query.ID)
                    return query.find();
                }else {
                    res.send('错误参数');
                }
            }).then(function (results) {
                var resArray = [];
                if (results.length){
                    for (var i=0;i<durationNum;i++){
                        if (results[i]){
                            var dayS = results[i].attributes.day;
                            var dayY = dayS.getFullYear().toString();
                            var dayM = (dayS.getMonth()+1);
                            var dayD = dayS.getDate();

                            if (dayM < 10){
                                dayM = '0'+dayM.toString();
                            }else {
                                dayM = dayM.toString();
                            }
                            if (dayD<10){
                                dayD = '0'+dayD.toString();
                            }else {
                                dayD = dayD.toString();
                            }
                            var todayS = dayY+'-'+dayM+'-'+dayD;

                            var resItem = {
                                index:i+1,
                                detail:todayS
                            }
                        }else {
                            resItem = {
                                index:i+1,
                                detail:''
                            }
                        }
                        resArray.push(resItem)
                    }
                }else {
                    for (var i=0;i<durationNum;i++){
                        var resItem = {
                            index:i+1,
                            detail:''
                        }

                        resArray.push(resItem)
                    }
                }
                res.json(resArray)
            })
            //查找index和日期，并返回
        }else {
            res.send('错误参数');
        }
    }
    else {
        res.send('illegal')
    }
})

// handle
// OK
router.post('/handle',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        //判断用户
        var durationNum = 0;
        var plan = undefined;
        if (req.body.ID){
            if (req.body.data){
                //查询plan的信息
                var query = new AV.Query('HostPlanGoods');
                query.get(req.body.ID).then(function (thePlan) {
                    if (thePlan) {
                        durationNum = parseInt(thePlan.attributes.duration);
                        plan = thePlan;
                        // 先根据index和planID查询，没有再创建
                        var unitQuery = new AV.Query('Unit');
                        unitQuery.equalTo('plan_ID', req.body.ID);
                        var unitQuery2 = new AV.Query('Unit');
                        unitQuery2.equalTo('plan_index', req.body.data.index)

                        unitQuery = AV.Query.and(unitQuery, unitQuery2);

                        return unitQuery.find();
                    }
                }).then(function (units) {
                    if (units.length){
                        var unit = AV.Object.createWithoutData('Unit',units[0].id)
                        //处理日期参数
                        var theDayS = req.body.data.detail;
                        var theDayY = parseInt(theDayS.split('-')[0]);
                        var theDayM = parseInt(theDayS.split('-')[1])-1;
                        var theDayD = parseInt(theDayS.split('-')[2]);
                        var theDay = new Date(theDayY,theDayM,theDayD);

                        //设置参数
                        unit.set('item_code',plan.attributes.item_code);
                        unit.set('order_id_yz',plan.attributes.order_id_yz);
                        unit.set('youzan_iid',plan.attributes.youzan_iid);
                        unit.set('oid',plan.attributes.oid);

                        unit.set('name',theDayS+'当日餐食计划');
                        unit.set('day',theDay);
                        unit.set('time',plan.attributes.time);
                        unit.set('size',plan.attributes.size);
                        unit.set('goUpstairs',plan.attributes.goUpstairs);
                        unit.set('state_str',plan.attributes.state_str);
                        unit.set('status','init');
                        unit.set('feedback_status',0);
                        unit.set('price',plan.attributes.price);
                        unit.set('message',plan.attributes.message);
                        unit.set('order_message',plan.attributes.order_message);
                        unit.set('user_name',plan.attributes.user_name);
                        unit.set('user_mobile',plan.attributes.user_mobile);
                        unit.set('shop_id',plan.attributes.shop_id);
                        unit.set('shop_name',plan.attributes.shop_name);
                        unit.set('shop_phone',plan.attributes.shop_phone);
                        unit.set('shop_state',plan.attributes.shop_state);
                        unit.set('shop_city',plan.attributes.shop_city);
                        unit.set('shop_district',plan.attributes.shop_district);
                        unit.set('shop_address',plan.attributes.shop_address);
                        //构建pointer
                        //var belong_order = AV.Object.createWithoutData('Order',plan.attributes.);
                        //unit.set('belong_order',belong_order);
                        //plan专属属性
                        unit.set('plan_index',parseInt(req.body.data.index));
                        unit.set('plan_ID',req.body.ID);
                        var belong_plan = AV.Object.createWithoutData('HostPlanGoods',req.body.ID);
                        unit.set('belong_plan',belong_plan);

                        //保存
                        return unit.save();
                    }else {
                        //创建unit
                        var Unit = AV.Object.extend('Unit');
                        var unit = new Unit();

                        //处理日期参数
                        var theDayS = req.body.data.detail;
                        var theDayY = parseInt(theDayS.split('-')[0]);
                        var theDayM = parseInt(theDayS.split('-')[1])-1;
                        var theDayD = parseInt(theDayS.split('-')[2]);
                        var theDay = new Date(theDayY,theDayM,theDayD);

                        //设置参数
                        unit.set('item_code',plan.attributes.item_code);
                        unit.set('order_id_yz',plan.attributes.order_id_yz);
                        unit.set('youzan_iid',plan.attributes.youzan_iid);
                        unit.set('oid',plan.attributes.oid);

                        unit.set('name',theDayS+'当日餐食计划');
                        unit.set('day',theDay);
                        unit.set('time',plan.attributes.time);
                        unit.set('size',plan.attributes.size);
                        unit.set('goUpstairs',plan.attributes.goUpstairs);
                        unit.set('state_str',plan.attributes.state_str);
                        unit.set('status','init');
                        unit.set('feedback_status',0);
                        unit.set('price',plan.attributes.price);
                        unit.set('message',plan.attributes.message);
                        unit.set('order_message',plan.attributes.order_message);
                        unit.set('user_name',plan.attributes.user_name);
                        unit.set('user_mobile',plan.attributes.user_mobile);
                        unit.set('shop_id',plan.attributes.shop_id);
                        unit.set('shop_name',plan.attributes.shop_name);
                        unit.set('shop_phone',plan.attributes.shop_phone);
                        unit.set('shop_state',plan.attributes.shop_state);
                        unit.set('shop_city',plan.attributes.shop_city);
                        unit.set('shop_district',plan.attributes.shop_district);
                        unit.set('shop_address',plan.attributes.shop_address);
                        //构建pointer
                        //var belong_order = AV.Object.createWithoutData('Order',plan.attributes.);
                        //unit.set('belong_order',belong_order);
                        //plan专属属性
                        unit.set('plan_index',parseInt(req.body.data.index));
                        unit.set('plan_ID',req.body.ID);
                        var belong_plan = AV.Object.createWithoutData('HostPlanGoods',req.body.ID);
                        unit.set('belong_plan',belong_plan);

                        //保存
                        return unit.save();
                    }
                }).then(function (theUnit) {
                    //count总数，相同则更新状态
                    if (theUnit){
                        //count
                        var unitQuery = new AV.Query('Unit');
                        unitQuery.equalTo('plan_ID', req.body.ID);

                        return unitQuery.count()
                    }else {
                        res.send('something wrong')
                    }
                }).then(function (count) {
                    if (count == durationNum){
                        //更新状态
                        var hostPlan = AV.Object.createWithoutData('HostPlanGoods',req.body.ID);

                        hostPlan.set('status','done');
                        return hostPlan.save();
                    }else {
                        res.send('ok')
                    }
                }).then(function (hostplan) {
                    if (hostplan){
                        res.send('ok')
                    }else {
                        res.send('something wrong')
                    }
                }).catch(function (err) {
                    res.send(err.message);
                    console.error(err);
                })
            }else {
                res.send('错误参数');
            }
        }else {
            res.send('错误参数');
        }
    }
    else {
        res.send('illegal')
    }

})

module.exports = router;