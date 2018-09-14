const router = require('express').Router();
const func = require('../utils/utils');

const getCartItems = require('../../cart/interface/getCartItems');
const getProduct = require('../../product/interface/getProduct');
const getWeekTotalCB = require('../../wallet/interface/getWeekTotalCB');

// 异步查询购物车条目
const getCartItemsFunc  = (items)=>{
    return new Promise((resolve,reject)=>{
        getCartItems({
            items:items,
            callback:(resp)=>{
                if (resp.error_code){
                    reject(resp);
                }else {
                    resolve(resp.data);
                }
            }
        })
    })
};

// 异步查询商品详细数据
const getProductFunc = (skus)=>{
    return new Promise((resolve,reject)=>{
        getProduct.get.skus({
            skus:skus,
            callback:(resp)=>{
                if (resp.error_code){
                    reject(resp);
                }else {
                    resolve(resp.data);
                }
            }
        })
    })
};

/*
获取购物车商品总价
 */
router.post('/price',(req,res,next) => {
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    if (!req.body.items){
        res.send({
            error_code:5002,
            error_msg:'缺少必要参数'
        })
    }
    let params = req.body;

    let weight = 0;
    let cashback = 0;
    let priceT = 0;

    // 防止只有一个商品时，被当做字符串处理
    if (typeof params.items === 'string') {
        params.items = [params.items];
    }
    // 最多100条数据
    if (params.items.length > 100 || params.items.length === 0) {
        return res.send({
            error_code: 5003,
            error_msg: '一次下单最多99种商品'
        })
    }
    // 构造items，查询购物车详情
    let cItems = [];
    let user_id = req.currentUser.user_id;
    for (let i = 0; i < params.items.length; i++) {
        let item = {
            user_id: user_id,
            object_id: params.items[i]
        };
        cItems.push(item);
    }
    let tItems;

    // 查询购物车
    let getCartItemEn = async ()=>{
        try {
            tItems = await getCartItemsFunc(cItems);
            // 嵌入下一个任务
            // 构建查询商品的参数
            let skuIds = [];
            for (let i = 0; i < tItems.length; i++) {
                skuIds.push(tItems[i].attrs.sku_id);
            }
            // 返回值
            let skus;
            // 查询商品信息
            skus = await getProductFunc(skuIds);
            for(let i=0;i<skus.length;i++){
                weight = weight + Number(skus[i].weight) * Number(tItems[i].attrs.num);
                cashback = cashback + Number(skus[i].cashback) * Number(tItems[i].attrs.num);
                priceT = priceT + Number(skus[i].price) * Number(tItems[i].attrs.num);
            }

            cashback = Number(cashback.toFixed(2));
            priceT = Number(priceT.toFixed(2));

            // let discount_notice = func.discount_notice(priceT);// TODO 计算该用户本周已下单金额后返回，不是这么返回的，日
            if (req.body.province){
                freight = func.freight_cal_jd(weight/1000,req.body.province);
                res.send({
                    error_code:0,
                    error_msg:'ok',
                    data:{
                        total:priceT,
                        cashback:cashback,
                        freight:freight
                    }
                })
            }else {
                res.send({
                    error_code:0,
                    error_msg:'ok',
                    data:{
                        total:priceT,
                        cashback:cashback
                    }
                })
            }
        }catch (err){
            res.send(err);
        }
    };
    getCartItemEn();
});

const queryFamilyByUserId = require('../../family/interface/queryFamilyByUserId');
const checkOnesFscOk = require('../../promote/coupon/interface/checkOnesFscOK');

let check = (family_id)=>{
    return new Promise((resolve,reject)=>{
        checkOnesFscOk({
            owner_id:family_id,
            callback:(resp)=>{
                if (resp.error_code){
                    reject(resp);
                }else {
                    resolve(resp.data);
                }
            }
        })
    })
};

const consume_notice = func.discount;
router.post('/notice',(req,res,next)=>{
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }

    // 获取一周消费总金额
    // let week = func.cal_this_week_first_second(0);
    // getWeekTotalCB({
    //     user_id:req.currentUser.user_id,
    //     week:week,
    //     callback:(resp)=>{
    //         if (resp.error_code){
    //             return res.send(resp);
    //         }
    //         let consume = resp.data.consume;
    //         let consume_notice = resp.data.notice;

            // fsc_notice 免邮券提示
            // 3个会员家庭免邮券已激活
            // 无会员家庭，无法使用免邮券
            // 暂未创建家庭

            // 查询user_id下的家庭
            queryFamilyByUserId({
                user_id:req.currentUser.user_id,
                callback:(resp)=>{
                    if (resp.error_code){
                        return res.send(resp);
                    }
                    let data = resp.data;
                    if (data.Count){
                        let vipF = [];
                        for(let i=0;i<data.Count;i++){
                            let item = data.Items[i].attrs;
                            if (item.vip === 1 || item.vip === 2){
                                vipF.push(item);
                            }
                        }
                        if (vipF.length){
                            let fscB = [];
                            let go = async ()=>{
                                try {
                                    for(let i=0;i<vipF.length;i++){
                                        let result = await check(vipF[i].family_id);
                                        if (result){
                                            fscB.push(vipF[i].name);
                                        }
                                    }
                                    if (fscB.length>1){
                                        res.send({
                                            error_code:0,
                                            error_msg:'ok',
                                            data:{
                                                fsc_notice:fscB[0]+'等'+fscB.length+'个家庭邮券已激活',
                                                consume_notice:consume_notice
                                            }
                                        })
                                    }else if (fscB.length === 1){
                                        res.send({
                                            error_code:0,
                                            error_msg:'ok',
                                            data:{
                                                fsc_notice:fscB[0]+'邮券已激活',
                                                consume_notice:consume_notice
                                            }
                                        })
                                    }else {
                                        res.send({
                                            error_code:0,
                                            error_msg:'ok',
                                            data:{
                                                fsc_notice:vipF[0].name+'邮券已使用',
                                                consume_notice:consume_notice
                                            }
                                        })
                                    }
                                }catch (err){
                                    res.send(err);
                                }
                            };
                            go();
                        }else {
                            res.send({
                                error_code:0,
                                error_msg:'ok',
                                data:{
                                    fsc_notice:'无会员家庭，无法激活邮券',
                                    consume_notice:consume_notice
                                }
                            })
                        }
                    }else {
                        res.send({
                            error_code:0,
                            error_msg:'ok',
                            data:{
                                fsc_notice:'暂未创建家庭',
                                consume_notice:consume_notice
                            }
                        })
                    }
                }
            })
        // }
    // });
});

// 获取当周的总商品消费额和notice内容
router.get('/week-consume',(req,res,next)=>{
    if (req.currentUser){
        // 获取一周消费总金额
        let week = func.cal_this_week_first_second(0);
        getWeekTotalCB({
            user_id:req.currentUser.user_id,
            week:week,
            callback:(resp)=>{
                res.send(resp)
            }
        })
    }else {
        res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
});

// 提供一个价格，提供总返现数据
router.post('/tcb',(req,res,next)=>{
    if (req.body.secret === 'eee2dd8b3b394f1d9b4963b48f6103e2') {
        if (req.body.total) {
            let total = Number(req.body.total);
            let cashback = func.discount_cal(total);
            res.send({
                error_code:0,
                error_msg:'ok',
                data:cashback
            })
        }else{
            res.send({
                error_code:5002,
                error_msg:'缺少总价'
            });
        }
    }else{
        res.send(404);
    }
});

router.get('/aging',(req,res,next)=>{
    res.send({
        error_code:0,
        error_msg:'ok',
        data:{
            aging:func.packageAging,
            handle:1 // 需额外处理1个工作日
        }
    })
});

// 对应关系维护在product服务下的interface中
const warehouseMapping = require('../../product/interface/getWarehouseMapping');
// 获取收货省份和发货仓的对应关系
router.get('/warehouse-mapping',(req,res,next)=>{
    res.send({
        error_code:0,
        error_msg:'ok',
        data:warehouseMapping
    })
});

// 获取当前地址信息的版本号
router.get('/region-version',(req,res,next)=>{
    res.send({
        error_code:0,
        error_msg:'ok',
        data:1
    })
});

// 获取地理信息
router.get('/region',(req,res,next)=>{
    res.send({
        error_code:0,
        error_msg:'ok',
        data:{
            province:func.province,
            city:func.city,
            county:func.county
        }
    })
});

router.post('/direct/check',(req,res,next)=>{
    let getCartItemEn = async ()=>{
        let skus;
        let skuIds = [];
        skuIds.push(req.body.sku);
        let cashback = 0;
        let priceT = 0;
        let weight = 0;
        let freight = 0;
        // 查询商品信息
        skus = await getProductFunc(skuIds);
        for(let i=0;i<skus.length;i++){
            weight = weight + Number(skus[i].weight) * Number(req.body.num);
            cashback = cashback + Number(skus[i].cashback) * Number(req.body.num);
            priceT = priceT + Number(skus[i].price) * Number(req.body.num);
        }
        cashback = Number(cashback.toFixed(2));
        priceT = Number(priceT.toFixed(2));

        // let discount_notice = func.discount_notice(priceT);// TODO 计算该用户本周已下单金额后返回，不是这么返回的，日
        if (req.body.province){
            freight = func.freight_cal_jd(weight/1000,req.body.province);
            res.send({
                error_code:0,
                error_msg:'ok',
                data:{
                    total:priceT,
                    cashback:cashback,
                    freight:freight
                }
            })
        }else {
            res.send({
                error_code:0,
                error_msg:'ok',
                data:{
                    total:priceT,
                    cashback:cashback
                }
            })
        }

    };
    getCartItemEn();
});

module.exports = router;