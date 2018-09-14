/**
 * Created by Ziv on 2017/5/6.
 */

// 后台系统通过session来管理请求

let express = require('express');
let app = express();
//
let session = require('express-session');
let FileStore = require('session-file-store')(session);


//let cmsUsers = require('./routes/cms/users'); //CMS用户管理
//let cmsCategories = require('./routes/cms/categories');
//let cmsOrders = require('./routes/cms/orders');
//let cmsProjects = require('./routes/cms/projects');
//let cmsUnits = require('./routes/cms/units');
//let cmsWeapp = require('./routes/cms/weapp');

// //set session
// app.use(session({
//     name:'backend',
//     secret:'cms+crm+erp',
//     store:new FileStore({
//         path:__dirname+'/sessions',
//         retries:10,
//         ttl:7200
//     }),
//     saveUninitialized:false,
//     resave:false,
//     cookie:{
//         path:'/',
//         secure:false,
//         // cookie保留1个工作日
//         maxAge:1000*60*60*24*1
//     }
// }));

// 路由转发


// 引入路由

// 登录
let login = require('./routes/login'); //登录路由

// 上传
let uploader = require('./routes/uploader');

// CMS
let banner = require('./routes/cms/banners'); // banner配置

//category
let classify = require('./routes/cms/classify');//brand配置

// 热搜词
let hot = require('./routes/cms/hot'); // 推荐配置

//商品
let goods = require('./routes/cms/goods');//商品配置

// category_level
let access = require('./routes/cms/access');//category_level配置

// brand
let brand = require('./routes/cms/brand');//brand配置

//邮包列表
let parcel = require('./routes/cms/parcel'); // 邮包配置

//订单
let order = require('./routes/cms/order');//brand配置

//退换货
let reverse = require('./routes/cms/reverse');//reverse配置

// print
let print = require('./routes/print');//print配置

// coupon template
let template = require('./routes/cms/couponTemplate');

// coupon code
let code = require('./routes/cms/couponCode');

// category_level
let category = require('./routes/cms/category');//category_level配置

// banenr_group
let small_banners = require('./routes/cms/smallBanners');

// goods_group
let goods_group = require('./routes/cms/goods_group');

// goods_group
let goods_show = require('./routes/cms/goods_show');

// package
let packages = require('./routes/cms/package');

// wares
let wares = require('./routes/cms/wares');//sub wares配置

// spu-map
let map = require('./routes/cms/spu-map');//sub map配置
// CRM

//内部查询商品
let privately = require('./routes/privately/search')
// ERP

app.use('/login',login);
app.use('/upload',uploader);
app.use('/cms/banner',banner);
app.use('/cms/smallBanners',small_banners);

app.use('/cms/classify',classify);
app.use('/cms/hot',hot);
app.use('/cms/goods',goods);
app.use('/cms/goodsgroup',goods_group);
app.use('/cms/goodsshow',goods_show);
app.use('/cms/access',access);
app.use('/cms/brand',brand);
app.use('/cms/parcel',parcel);
app.use('/cms/reverse',reverse);
app.use('/cms/order',order);
app.use('/print',print);
app.use('/cms/template',template);
app.use('/cms/code',code);
app.use('/cms/category',category);
app.use('/cms/package',packages);
app.use('/cms/wares',wares);
app.use('/cms/map',map);

//内部查询商品
app.use('/privately',privately);


/*
app.use('/categories',cmsCategories);
app.use('/orders',cmsOrders);
app.use('/units',cmsUnits);
app.use('/projects',cmsProjects);
app.use('/users',cmsUsers);
app.use('/weapp',cmsWeapp);

app.use('/',cmsOrders); //设置默认跳转
*/


module.exports = app;