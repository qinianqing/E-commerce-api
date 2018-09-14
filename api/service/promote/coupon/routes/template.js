/*
*   校验token，并获取用户信息
*
*  @params token
*
*/
const router = require('express').Router();

const { secret } = require('../config');

const CouponT = require('../models/Coupon-template');
const CouponW = require('../models/Coupon-wallet');

// 去重方法
function unique(arr){
    let result = [];
    for(let i=0;i<arr.length;i++){
        if(result.indexOf(arr[i]) === -1){
            result.push(arr[i])
        }
    }
    return result;
}


let getCT = (coupon_id)=>{
    return new Promise((resolve,reject)=>{
        let couponT = new CouponT();
        couponT.coupon_id = coupon_id;
        couponT.getCouponTbyQuery((err,data)=>{
            if (err){
                reject({
                    error_code:5002,
                    error_msg:err.message
                });
            }else {
                resolve(data)
            }
        })
    })
};

let checkUserGet = (user_id,coupon_id)=>{
    return new Promise((resolve,reject)=>{
        let conponW = new CouponW();
        conponW.owner_id = user_id;
        conponW.coupon_id = coupon_id;
        conponW.getOnesTargetCouponGetNum((err,data)=>{
            if (err){
                reject({
                    error_code:5002,
                    error_msg:err.message
                });
            }else {
                resolve(data)
            }
        })
    })
};

// 获取优惠券模板信息
router.post('/info',function (req,res,next) {
    if(!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无访问权限'
        });
    }
    if(!req.body.coupons){
        return res.send({
            error_code:5002,
            error_msg:'缺失coupons'
        });
    }
    let couponS;
    if (typeof req.body.coupons === 'string'){
        couponS = [req.body.coupons];
    }else {
        couponS = req.body.coupons;
    }
    let c = unique(couponS);
    let go = async ()=>{
        try {
            let results = [];
            for (let i=0;i<c.length;i++){
                let result = await getCT(c[i]);
                if (result.Items[0]){
                    let item = result.Items[0].attrs;
                    // 查询用户是否领过超限
                    if (item.status === 'OK'){
                        item.statusName = '去领取';
                    }else {
                        item.statusName = '券暂不可用';
                    }
                    let userI = await checkUserGet(req.currentUser.user_id,c[i]);
                    if (userI.Count >= item.limit){
                        item.statusName = '最多领取'+item.limit+'张';
                    }
                    results.push(item);
                }
            }
            return res.send({
                error_code:0,
                error_msg:'ok',
                data:results
            })
        }catch (err){
            return res.send(err);
        }
    };
    go();
});

// 优惠券模板全是内部接口

/*
    coupon_id:Joi.string(),
    limit:Joi.number(),// 一个用户限领几张
    num:Joi.number(), // 发券数量，-1为无限量状态
    active_num:Joi.number(), // 已激活数量
    mode:Joi.string(), // 券类型，RANDOM随机券，FIXED固定金额
    status:Joi.string(), // OK\INVALID,status为松散状态
    activeAt:Joi.string(),// -为领取时即生效，日期格式为激活时间
    expiredType:Joi.number(),// 券失效类型，0固定时间，1一段时间失效
    expiredInfo:Joi.string(),// 失效详情，8有效期为8天，Date&Date，第一个为起始有效时间，第二个为终止有效时间
    name:Joi.string(),// 券名称
    price:Joi.string(),// 券金额，单位元，字符串形式，注意转换，随机券为MONEY&MONEY，只能填整数，比如3&9，用户取券时会获得一张3到9元之间的优惠券
    condition:Joi.number(),// 券试用条件，0为任意条件，按实际付费计算，单位为元
    fit:Joi.array(),// 列表
    information:Joi.string() // 券信息
 */

// 创建一个优惠券模板
router.post('/create',function (req,res,next) {
    if(req.body.secret === secret){
        let p = req.body;
        if (p.num&&p.limit>0&&p.mode&&p.status&&p.activeAt&&p.expiredType>=0&&p.expiredInfo&&p.name&&p.price&&p.condition>=0&&p.fit&&p.information){
            if (p.fit === '*'){
                p.fit = ['*'];
            }
            if (typeof p.fit === 'string'){
                p.fit = [p.fit];
            }
            let couponT = new CouponT();
            couponT.num = Number(p.num);
            couponT.limit = Number(p.limit);
            couponT.mode = p.mode;
            couponT.status = p.status;
            couponT.activeAt = p.activeAt;
            couponT.expiredType = p.expiredType;
            couponT.expiredInfo = p.expiredInfo;
            couponT.background = p.background || '-';
            couponT.name = p.name;
            couponT.price = p.price;
            couponT.condition = Number(p.condition);
            couponT.fit = p.fit;
            couponT.information = p.information;
            couponT.create((err,data)=>{
                if (err){
                    res.send({
                        error_code:5003,
                        error_msg:err.message
                    })
                }else {
                    res.send({
                        error_code:0,
                        error_msg:'ok'
                    })
                }
            })
        }else {
            res.send({
                error_code:5002,
                error_msg:'缺少参数'
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

// 更新优惠券模板信息
router.post('/update',function (req,res,next) {
    if(req.body.secret === secret){
        let p = req.body;
        if (p.coupon_id&&p.createdAt){
            let couponT = new CouponT();
            couponT.coupon_id = p.coupon_id;
            couponT.createdAt = p.createdAt;

            couponT.getCouponT((err,data) =>{
                if (err){
                    res.send({
                        error_code:5004,
                        error_msg:err.message
                    })
                }else {
                    if(data){
                        let item = data.attrs;

                        // 赋值与修改
                        if (p.num){
                            couponT.num = Number(p.num);
                        }else {
                            couponT.num = item.num;
                        }
                        if(p.limit){
                            couponT.limit = Number(p.limit);
                        }else {
                            couponT.limit = item.limit;
                        }
                        if (p.mode){
                            couponT.mode = p.mode;
                        }else {
                            couponT.mode = item.mode;
                        }
                        if (p.status){
                            couponT.status = p.status;
                        }else {
                            couponT.status = item.status;
                        }
                        if (p.activeAt){
                            couponT.activeAt = p.activeAt;
                        }else {
                            couponT.activeAt = item.activeAt;
                        }
                        if (p.expiredType){
                            couponT.expiredType = p.expiredType;
                        }else {
                            couponT.expiredType = item.expiredType;
                        }
                        if (p.expiredInfo){
                            couponT.expiredInfo = p.expiredInfo;
                        }else {
                            couponT.expiredInfo = item.expiredInfo;
                        }
                        if (p.background){
                            couponT.background = p.background;
                        }else {
                            couponT.background = item.background;
                        }
                        if (p.name){
                            couponT.name = p.name;
                        }else {
                            couponT.name = item.name;
                        }
                        if (p.price){
                            couponT.price = p.price;
                        }else {
                            couponT.price = item.price;
                        }
                        if (p.condition){
                            couponT.condition = Number(p.condition);
                        }else {
                            couponT.condition = item.condition;
                        }
                        if(p.fit !== '*' && p.fit !== ''){
                            couponT.fit = p.fit;
                        }else if(p.fit === '*'){
                            couponT.fit = ['*'];
                        } else {
                            couponT.fit = item.fit;
                        }
                        if(p.information){
                            couponT.information = p.information;
                        }else {
                            couponT.information = item.information;
                        }
                        couponT.updateCouponT((err,data)=>{
                            if (err){
                                res.send({
                                    error_code:5003,
                                    error_msg:err.message
                                })
                            }else {
                                res.send({
                                    error_code:0,
                                    error_msg:'ok'
                                })
                            }
                        })
                    }else {
                        res.send({
                            error_code:5005,
                            error_msg:err.message
                        })
                    }
                }
            });
        }else {
            res.send({
                error_code:5002,
                error_msg:'缺少参数'
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

// 获取优惠券模板列表
router.get('/list',function (req,res,next) {
    if(req.query.secret === secret){
        // 对lastkey参数需要拼合处理last_key
        let last_key;
        if(req.query.coupon_id&&req.query.createdAt){
            last_key = {
                coupon_id:req.query.coupon_id,
                createdAt:req.query.createdAt
            }
        }
        let couponT = new CouponT();
        couponT.getCouponTList((err,data)=>{
            if (err){
                res.send({
                    error_code:5002,
                    error_msg:err.message
                })
            }else {
                res.send(data)
            }
        },last_key)
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

// 检索优惠模板
router.post('/search',function (req,res,next) {
    if(req.body.secret === secret){
        if(req.body.query){
            let couponT = new CouponT();
            couponT.queryCouponTDetail(req.body.query,(err,data)=>{
                if (err){
                    res.send({
                        error_code:5002,
                        error_msg:err.message
                    })
                }else {
                    res.send(data)
                }
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

// 删除一个优惠券模板
router.post('/delete',function (req,res,next) {
    if(req.body.secret === secret){
        res.send({
            error_code:5002,
            error_msg:'本接口不能使用'
        })
    }else {
        res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
});

module.exports = router;
