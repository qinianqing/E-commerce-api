const router = require('express').Router();

const Family = require('../models/Family');
const getUser = require('../../passport/interface/getUserInfo');

/*
*   获取默认家庭
*
 */
router.get('/default',function (req,res,next) {
    if (req.currentUser){
        let family = new Family();
        family.user_id = req.currentUser.user_id;
        family.getOnesDefaultFamily((err, family) => {
            if (err) {
                res.send({
                    error_code: 4000,
                    error_msg: err.message
                })
            } else {
                if (family.Count){
                    res.send({
                        error_code: 0,
                        error_msg: 'ok',
                        data: {
                            family: family.Items[0]
                        }
                    })
                }else {
                    res.send({
                        error_code: 0,
                        error_msg:'ok',
                        data: {
                            family:{}
                        }
                    })
                }
            }
        })
    }else {
        res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
});

/*
*   创建一个家庭信息
*
 */
router.post('/create',function (req,res,next) {
    if (req.currentUser){
        // if (!req.body.name){
        //     return res.send({
        //         error_code:4004,
        //         error_msg:'家庭分支需要一个名字'
        //     })
        // }
        // 直接count
        let family = new Family();
        family.user_id = req.currentUser.user_id;
        // 不再创建
        family.getOnesFamilies((err,items) => {
            if (items.Count >= 3){
                res.send({
                    error_code:4005,
                    error_msg:'最多可创建3个家庭',
                });
            }else {
                getUser({
                    user_id:req.currentUser.user_id,
                    callback:(resp)=>{
                        if (resp.error_code){
                            return res.send(resp)
                        }
                        let user_name = resp.data.user_name || '锦时';
                        // 一个家庭必须要有name
                        let params = req.body;
                        const chars = ['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z'];
                        let char1 = chars[Math.ceil(Math.random()*23)];
                        let char2 = chars[Math.ceil(Math.random()*23)];
                        let char3 = chars[Math.ceil(Math.random()*23)];
                        if (params.default === 1) {
                            // 勾选默认家庭
                            for (let i = 0; i < items.Count; i++) {
                                // 将原有defaul置为0
                                family.family_id = items.Items[i].family_id;
                                family.updateDefaultFamily(0,(err,f) => {
                                    if (err) {
                                        res.send({
                                            error_code:4000,
                                            error_msg:'置为默认错误'
                                        })
                                    }else{
                                        if (i === items.Count-1) {
                                            // 创建
                                            family.family_id = String(new Date().getTime())+char1+char2+char3; // 加三位字母
                                            if(items.Count === 0){
                                                family.name = user_name+'的家';
                                            }else if(items.Count === 1){
                                                family.name = user_name+'的家I';
                                            }else{
                                                family.name = user_name+'的家II';
                                            }    
                                            family.default = 1;
                                            family.address = params.address;
                                            family.contact = params.contact;
                                            family.city = params.city;
                                            family.phone = params.phone;
                                            family.province = params.province;
                                            family.county = params.county;
                                            family.remark = params.remark || '-';
                                            family.members = params.members || {};
                                            family.create((err)=>{
                                                if (err) {
                                                    res.send({
                                                        error_code:4000,
                                                        error_msg:err.message
                                                    })
                                                }else{
                                                    res.send({
                                                        error_code:0,
                                                        error_msg:'ok',
                                                        data:family.family_id
                                                    })
                                                }
                                            })
                                        }
                                    }
                                })
                            }

                        }else{
                            // 直接创建
                            // 创建
                            family.family_id = String(new Date().getTime())+char1+char2+char3;
                            family.name = user_name+'的家'+(items.Count+1);
                            family.default = 1;
                            family.address = params.address;
                            family.contact = params.contact;
                            family.city = params.city;
                            family.phone = params.phone;
                            family.province = params.province;
                            family.county = params.county;
                            family.remark = params.remark || '-';
                            family.members = params.members || {};
                            family.create((err)=>{
                                if (err) {
                                    res.send({
                                        error_code:4000,
                                        error_msg:err.message
                                    })
                                }else{
                                    res.send({
                                        error_code:0,
                                        error_msg:'ok',
                                        data:family.family_id
                                    })
                                }
                            })
                        }
                    }
                })
            }
        })
    }else {
        res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
});

/*
*   更新一个家庭基本信息
*   除default以外
*
 */
router.post('/update',function (req,res,next) {
    if (req.currentUser){
        let params = req.body;
        if (params.family_id) {
            let family = new Family();
            family.user_id = req.currentUser.user_id;
            family.family_id = req.body.family_id;
            family.getOnesTargetFamily((err,data) => {
                if(err){
                    res.send({
                        error_code:5003,
                        error_msg:err.message
                    })
                }else {
                    if (data){
                        data = data.attrs;
                        if (params.name){
                            data.name = params.name;
                        }
                        if (params.address){
                            data.address = params.address;
                        }
                        if (params.contact){
                            data.contact = params.contact;
                        }
                        if (params.phone){
                            data.phone = params.phone;
                        }
                        if (params.province) {
                            data.province = params.province;
                        }
                        if (params.city){
                            data.city = params.city;
                        }
                        if (params.county) {
                            data.county = params.county;
                        }
                        if (params.remark){
                            data.remark = params.remark;
                        }
                        if (params.members){
                            data.members = params.members;
                        }
                        family.updateFamilyInfo(data,(err,f) => {
                            if (err) {
                                res.send({
                                    error_code:5003,
                                    error_msg:err.message
                                })
                            }else{
                                res.send({
                                    error_code:0,
                                    error_msg:'ok',
                                    data:{
                                        family:f
                                    }
                                })
                            }
                        })
                    }else {
                        res.send({
                            error_code:5004,
                            error_msg:'family_id错误'
                        })
                    }
                }
            })
        }else{
            res.send({
                error_code:5002,
                error_msg:'缺少family_id'
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
*  查看用户或者家庭有一个试用过就显示试用过
*/
router.post('/check-tried',function (req,res,next) {
    if (req.currentUser){
        if (req.body.family_id){
            let family = new Family();
            family.user_id = req.currentUser.user_id;
            family.family_id = req.body.family_id;
            family.getOnesTargetFamily((err,data) => {
                data = data.attrs;
                if (data.tried === 1){
                    return res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:1
                    })
                }
                getUser({
                    user_id:req.currentUser.user_id,
                    callback:(resp)=>{
                        if (resp.error_code){
                            return res.send(resp)
                        }
                        if (resp.data.member_tried === 1){
                            return res.send({
                                error_code:0,
                                error_msg:'ok',
                                data:1
                            })
                        }
                        res.send({
                            error_code:0,
                            error_msg:'ok',
                            data:0
                        })
                    }
                })
            })
        }else {
            res.send({
                error_code:5002,
                error_msg:'需要family_id'
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
});

// 以下两个接口暂时没有用到

/*
*  将家庭置为默认家庭
*/
router.post('/set-default',function (req,res,next) {
    if (req.currentUser){
        if (req.body.family_id){
            let family = new Family();
            family.user_id = req.currentUser.user_id;
            family.family_id = req.body.family_id;
            family.getOnesFamilies((err,items) => {
                if (items.Count === 1) {
                    // 只有一个
                    res.send({
                        error_code:0,
                        error_msg:'ok'
                    })
                }else if (items.Count >1){
                    items = items.Items;
                    let defaultFamilyID = '';
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].attrs.default === 1){
                            defaultFamilyID = items[i].attrs.family_id;
                        }
                    }
                    // 将原有defaul置为0
                    family.family_id = defaultFamilyID;
                    family.updateDefaultFamily(0,(err,f) => {
                        if (err) {
                            res.send({
                                error_code:4000,
                                error_msg:err.message
                            })
                        }else{
                            // 创建
                            family.family_id = req.body.family_id;
                            family.updateDefaultFamily(1,(err,family)=>{
                                if (err) {
                                    res.send({
                                        error_code:4001,
                                        error_msg:err.message
                                    })
                                }else{
                                    res.send({
                                        error_code:0,
                                        error_msg:'ok'
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }else {
            res.send({
                error_code:5002,
                error_msg:'需要family_id'
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
* 获取家庭列表
*
*/
const getFscValidNum = require('../../promote/coupon/interface/getFscValidNum');
let getFscValidNumFunc = (family_id)=>{
    return new Promise((resove,reject)=>{
        getFscValidNum({
            family_id:family_id,
            callback:(resp)=>{
                if (resp.error_code){
                    reject(resp)
                }else {
                    resove(resp.data);
                }
            }
        })
    })
};

router.get('/list',function(req,res,next){
    if (req.currentUser){
        let family = new Family();
        family.user_id = req.currentUser.user_id;
        // 返回家庭列表
        family.getOnesFamilies((err,families) => {
            if (err){
                res.send({
                    error_code:4000,
                    error_msg:err.message
                })
            }else {
                let getFscValidNumEn = async ()=>{
                    for (let i=0;i<families.Items.length;i++){
                        families.Items[i].attrs.fsc_num = await getFscValidNumFunc(families.Items[i].attrs.family_id)
                    }
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:families

                    })
                };
                getFscValidNumEn();
            }
        })
    }else {
        res.send({
            error_code:5001,
            error_msg:'no access authority'
        })
    }
});

/*
* 获取指定家庭信息
*
*/
router.get('/',function(req,res,next){
    if (req.currentUser){
        if (req.query.family_id){
            let family = new Family();
            family.user_id = req.currentUser.user_id;
            family.family_id = req.query.family_id;
            family.getOnesTargetFamily((err,family) => {
                if (err){
                    res.send({
                        error_code:4000,
                        error_msg:err.message
                    })
                }else {
                    if (family){
                        res.send({
                            error_code:0,
                            error_msg:'ok',
                            data:{
                                family:family
                            }
                        })
                    }else {
                        res.send({
                            error_code:4001,
                            error_msg:'错误的family_id'
                        })
                    }
                }
            })
        }else {
            res.send({
                error_code:5002,
                error_msg:'缺少family_id'
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
});

module.exports = router;
