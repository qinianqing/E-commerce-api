const router = require('express').Router();
// Model对象
const Family = require('../models/Family');

const getUserInfo = require('../../passport/interface/getUserInfo');
const activeCoupon = require('../../promote/coupon/interface/activeCoupon');
const setUserTried = require('../../passport/interface/setUserTried');

/*
*   试用家庭会员接口，校验权限通过后为用户激活2张免邮券
*
 */

// 人和家庭需要同时没有试用过才可以
router.post('/try',function (req,res,next) {
    // 1、查询用户是否试用过
    // 2、试用直接返回错误
    // 3、更新家庭信息
    // 通过定时任务查询将家庭置为非会员状态
    if (req.currentUser){
        let params = req.body;
        if (params.family_id) {
            getUserInfo({
                user_id: req.currentUser.user_id,
                callback: (resp) => {
                    if (resp.error_code) {
                        return res.send(resp);
                    }
                    let d = resp.data;
                    if (d.member_tried) {
                        return res.send({
                            error_code: 7001,
                            error_msg: '您已经试用过'
                        })
                    }
                    // 家庭是否试用过
                    let family = new Family();
                    family.user_id = req.currentUser.user_id;
                    family.family_id = params.family_id;
                    family.getOnesTargetFamily((err, data) => {
                        if (err) {
                            return res.send({
                                error_code: 5002,
                                error_msg: err.message
                            })
                        }
                        data = data.attrs;
                        if (data.tried) {
                            return res.send({
                                error_code: 5003,
                                error_msg: '该家庭分支已经试用过'
                            })
                        }
                        // 为家庭添加4张免邮券
                        activeCoupon.freeShipCoupon({
                            family_id: params.family_id,
                            weeks: 2,
                            callback: (resp) => {
                                if (resp.error_code) {
                                    return res.send(resp)
                                }
                                // 将用户置为已试用
                                setUserTried({
                                    user_id: req.currentUser.user_id,
                                    callback: (resp) => {
                                        if (resp.error_code) {
                                            return res.send(resp)
                                        }
                                        // 将家庭置为已试用
                                        let now = new Date();
                                        now.setHours(0);
                                        now.setMinutes(0);
                                        now.setSeconds(0);
                                        now.setMilliseconds(0);
                                        now = now.getTime();
                                        let days = 15*1000*60*60*24;
                                        let tDate = new Date(now+days);
                                        family.vip_expiredAt = Number(tDate.getTime());
                                        family.setFamilyTried((err) => {
                                            if (err) {
                                                return res.send({
                                                    error_code: 5004,
                                                    error_msg: err.message
                                                })
                                            }
                                            res.send({
                                                error_code: 0,
                                                error_msg: 'ok'
                                            })
                                        })
                                    }
                                });
                            }
                        })
                    })
                }
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
});

/*
* 当前年度会员零售价
*
*/
router.get('/price',function(req,res,next){
    res.send({
        error_code:0,
        error_msg:'ok',
        data:[
            {
                id:'y',
                giftInfo:[{
                    cover:'https://cdn.jiyong365.com/i3.png',
                    name:'芭提亚听装芒果汁1箱',
                    describe:'就像在吃芒果 还不用嚼哦！',
                    price:'139',
                    num:'1',
                    sku_id:''
                },{
                    cover:'https://cdn.jiyong365.com/i2.png',
                    name:'皇家碧域比尔森啤酒1箱',
                    describe:'夏季畅饮 和足球更配哦！',
                    price:'144',
                    num:'1',
                    sku_id:''
                },
                ],
                bg:'https://cdn.jiyong365.com/1vv.png',
                title:'年度会员',
                lose:12,
                num:60,
                send:267,
                image:'https://cdn.jiyong365.com/%E5%B9%B4%E5%BA%A6%E4%BC%9A%E5%91%98%E7%A4%BC%E5%8C%85.png',
                payment:'252.00',
                discount:'360.00'
            },
            {
                id:'h',
                giftInfo:[{
                    cover:'https://cdn.jiyong365.com/i2.png',
                    name:'皇家碧域比尔森啤酒',
                    describe:'夏季畅饮 和足球更配哦！',
                    price:'128',
                    num:'1',
                    sku_id:''
                }],
                bg: 'https://cdn.jiyong365.com/2vv.png',
                title: '半年度会员',
                lose: 6,
                num: 30,
                send: 128,
                image: 'https://cdn.jiyong365.com/%E5%8D%8A%E5%BA%A6%E4%BC%9A%E5%91%98.png',
                payment: '144.00',
                discount: '180.00'
            },
            {
                id:'q',
                giftInfo:[{
                    cover:'https://cdn.jiyong365.com/i1.png',
                    name:'妮飘卷纸',
                    describe:'比云朵还纯净柔软！',
                    price:'29.9',
                    num:'1',
                    sku_id:''
                },{
                    cover:'https://cdn.jiyong365.com/i7.png',
                    name:'佳能中号垃圾袋',
                    describe:'结实的垃圾“收藏家”！',
                    price:'28.9',
                    num:'2',
                    sku_id:''
                },{
                    cover:'https://cdn.jiyong365.com/i8.png',
                    name:'佳能平口保鲜袋中号',
                    describe:'除了食物就只剩新鲜了！',
                    price:'13.9',
                    num:'1',
                    sku_id:'10099-10000'
                },],
                bg: 'https://cdn.jiyong365.com/3vv.png',
                title: '季度会员',
                lose: 3,
                num: 15,
                send: 101.6,
                image: 'https://cdn.jiyong365.com/%E5%AD%A3%E5%BA%A6%E4%BC%9A%E5%91%98%E7%A4%BC%E5%8C%85.png',
                payment: '81.00',
                discount: '90.00'
            },
            {
                id:'m',
                giftInfo:[{
                    cover:'https://cdn.jiyong365.com/i4.png',
                    name:'泰国芭提亚芒果汁',
                    describe:'就像在吃芒果 还不用嚼哦！',
                    price:'5.9',
                    num:'1',
                    sku_id:''
                },{
                    cover:'https://cdn.jiyong365.com/i5.png',
                    name:'露澳牌意大利面',
                    describe:'意大利的味道 家中也能尝到！',
                    price:'14.2',
                    num:'1',
                    sku_id:''
                },{
                    cover:'https://cdn.jiyong365.com/i6.png',
                    name:'亿收得甜辣椒酱',
                    describe:'小小一勺 超浓美味',
                    price:'15.8',
                    num:'1',
                    sku_id:''
                },],
                bg: 'https://cdn.jiyong365.com/4vv.png',
                title: '月度会员',
                lose: 1,
                num: 5,
                send: 35.9,
                image: 'https://cdn.jiyong365.com/%E6%9C%88%E4%BC%9A%E5%91%98%E7%A4%BC%E5%8C%85.png',
                payment: '30.00',
                discount: '35.00'
            },
        ]
    })
});

module.exports = router;

// // 路由
// const activecoder = require('./active_code');
// const rewarder = require('./reward');
//
// // 所有/member/code请求分发至active_code.js
// router.use('/code',activecoder);
// // 所有/member/reward请求分发至reward.js
// router.use('/reward',rewarder);
