/**
 * Created by Ziv on 2017/9/14.
 */

// TODO 列表需要根据units表格式来更新字段
var express = require('express');
var router = express.Router();

var AV = require('leanengine');

router.get('/', function(req, res, next) {
    //先判断有无current user,如果有则渲染,没有重定向到登录页
    var currentUser = req.session.current;
    var todayDetail = new Date();
    var todayY = todayDetail.getFullYear().toString();
    if (currentUser) {
        // 跳转到首页
        var todayDetail = new Date();
        if ((todayDetail.getMonth()+1) < 10){
            var todayM = '0'+(todayDetail.getMonth()+1).toString();
        }else {
            var todayM = (todayDetail.getMonth()+1).toString();
        }
        if (todayDetail.getDate()<10){
            var todayD = '0'+todayDetail.getDate().toString();
        }else {
            var todayD = todayDetail.getDate().toString();
        }
        var todayS = todayY+'-'+todayM+'-'+todayD;

        res.render('./cms/units', { user_name:currentUser.user_name,today:todayS})
    }
    else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})

// list接口
// 数据统一降序排列
router.get('/list', function(req, res, next) {
    //先判断有无current user,如果有则渲染,没有重定向到登录页
    var currentUser = req.session.current;

    if (currentUser) {
        //构造offset
        //TODO 直接采用了效率低下的skip方法
        var total = 0;
        // 兼容不带任何参数,只有日期的请求
        // 将limit设置成一个无穷大的数
        if (req.query.limit){
            var limit = req.query.limit;
        }else {
            var limit = 100000000;
        }
        if (req.query.offset){
            var offset = req.query.offset;
        }else {
            var offset = 0;
        }
        var todayS = undefined;


        if (req.query.date){
            //按date进行筛选
            var dateString = req.query.date;
            todayS = new Date(parseInt(dateString.split('-')[0]),(parseInt(dateString.split('-')[1])-1),parseInt(dateString.split('-')[2]))
        }else {
            // 无date参数时，返回当日数据
            var todayDetail = new Date();
            var todayY = todayDetail.getFullYear();
            var todayM = todayDetail.getMonth();
            var todayD = todayDetail.getDate();

            todayS = new Date(todayY,todayM,todayD);
        }
        //构造条件
        var query = new AV.Query('Unit');
        query.equalTo('day',todayS);
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
                return query.addDescending('updatedAt').skip(offset).limit(limit).find();
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
                    var todayY = results[i].attributes.day.getFullYear().toString();
                    if ((results[i].attributes.day.getMonth()+1) < 10){
                        var todayM = '0'+(results[i].attributes.day.getMonth()+1).toString();
                    }else {
                        var todayM = (results[i].attributes.day.getMonth()+1).toString();
                    }
                    if (results[i].attributes.day.getDate()<10){
                        var todayD = '0'+results[i].attributes.day.getDate().toString();
                    }else {
                        var todayD = results[i].attributes.day.getDate().toString();
                    }
                    var todayS = todayY+'-'+todayM+'-'+todayD;

                    var item = {
                        date:todayS,
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
                        ID:results[i].id,
                        //https://www.eatgood365.com/flowcontrol/show?id=ddfsdfsdfsdfsd
                        QRString:'https://www.eatgood365.com/flowcontrol/show?id='+results[i].id
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
        res.send('illegal');
    }
})

// edit接口
router.post('/edit',function (req,res,next) {
    var currentUser = req.session.current;

    if (currentUser) {
        if (req.body){
            var newDay = new Date(parseInt(req.body.date.split('-')[0]),(parseInt(req.body.date.split('-')[1])-1),parseInt(req.body.date.split('-')[2]))
            var unit = AV.Object.createWithoutData('Unit',req.body.ID);
            unit.set('day',newDay);//需要转化成date对象
            unit.set('name',req.body.name);
            unit.set('feedback_status',parseInt(req.body.fb));
            unit.set('user_name',req.body.user_name);
            unit.set('user_mobile',req.body.mobile);
            unit.set('shop_name',req.body.station);
            unit.set('shop_city',req.body.stationD.split('市')[0]+'市');
            unit.set('shop_district',req.body.stationD.split('市')[1]);
            unit.set('shop_address',req.body.stationA);
            unit.set('shop_phone',req.body.stationP);
            unit.save().then(function (result) {
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

module.exports = router;