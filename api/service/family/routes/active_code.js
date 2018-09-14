const router = require('express').Router();
const ActiveCode = require('../models/ActiveCode');
const ActiveRisk = require('../models/AccessRisk');
const Family = require('../models/Family');
const func = require('../utils/utils');
const uuid = require('uuid');

const { innerSecret } = require('../config');

/*
*   用锦时激活码激活
 */
router.post('/active',function (req,res,next) {
    if (req.currentUser){
    	let params = req.body;
        if (params.family_id && params.code) {
            // 查询5分钟内的user_id和ip的访问数量，一旦超限，直接拒绝请求
            let ar = new ActiveRisk();
            ar.path  = '/member/active';
            ar.user_id = req.currentUser.user_id;
            ar.ip = req.clientIPAddress;
            let now = new Date().toISOString();
            let minago3 = new Date(new Date().getTime() - 3*60*1000).toISOString();
            return new Promise((resolve,reject) => {
                // 创建一条记录
                ar.create((err) => {
                    if (err){
                        reject(err.message)
                    }else {
                        resolve(1);
                    }
                })
            }).then((d) =>{
                return new Promise((resolve,reject) => {
                    ar.getAccessNumByUserid(minago3,now,(err,data) => {
                        if (err) {
                            reject(err.message)
                        }else{
                            if (data.Count > 6) {
                                res.send({
                                    error_code:5000,
                                    error_msg:'too many request'
                                })
                            }else{
                                resolve(1)
                            }
                        }
                    })
                })
            },(err) => {
                res.send({
                    error_code:6002,
                    error_msg:err
                })
            }).then((d)=>{
                return new Promise((resolve,reject) => {
                    ar.getAccessNumByIp(minago3,now,(err,data) => {
                        if (err) {
                            reject(err.message)
                        }else{
                            if (data.Count > 6) {
                                res.send({
                                    error_code:5000,
                                    error_msg:'too many request'
                                })
                            }else{
                                resolve(1)
                            }
                        }
                    })
                })
            },(err)=>{
                res.send({
                    error_code:6001,
                    error_msg:err
                })
            }).then((d)=>{
                return new Promise((resolve,reject) => {
                    // 查询有没有家庭
                    let family = new Family();
                    family.family_id = params.family_id;
                    family.user_id = req.currentUser.user_id;
                    family.getOnesTargetFamily((err,f) => {
                        if (err){
                            reject(err.message)
                        }else {
                            if (f){
                                resolve(1)
                            }else {
                                reject('wrong family id')
                            }
                        }
                    })
                })
            },(err)=>{
                res.send({
                    error_code:6002,
                    error_msg:err
                })
            }).then((d)=>{
                // 先查询有没有code
                return new Promise((resolve,reject) => {
                    if (String(params.code).length == 10){
                        let code = new ActiveCode();
                        code.active_code = String(params.code);
                        code.getActiveCodeDetail((err,data) => {
                            if (err){
                                reject(err)
                            }else {
                                if (data){
                                    resolve(data.attrs)
                                }else {
                                    reject('no such code')
                                }
                            }
                        })
                    }else {
                        res.send({
                            error_code:5004,
                            error_msg:'wrong code'
                        })
                    }
                }).then((d)=>{
                    // 激活
                    return new Promise((resolve,reject) => {
                        if (d.status == 'OK'){
                            let code = new ActiveCode();
                            code.active_code = String(params.code);
                            code.user_id = req.currentUser.user_id;
                            code.ip = req.clientIPAddress;
                            let year = new Date().getFullYear();
                            let month = new Date().getMonth()+1;
                            let day = new Date().getDate();
                            code.active_date = year+'-'+month+'-'+day;
                            code.active((err,data) => {
                                if (err){
                                    reject(err.message)
                                }else {
                                    if (data){
                                        resolve(data.attrs)
                                    }else {
                                        res.send({
                                            error_code:5006,
                                            error_msg:'no target code'
                                        })
                                    }
                                }
                            })
                        }else {
                            reject('invalid code')
                        }
                    })
                },(err) => {
                    res.send({
                        error_code:5008,
                        error_msg:err
                    })
                }).then((d)=>{
                    let family = new Family();
                    family.family_id = params.family_id;
                    family.user_id = req.currentUser.user_id;
                    family.member = 1;
                    family.parcels = d.cyc;
                    family.weeks = d.cyc;
                    family.updateFamilyMembershipByCode((err,f) => {
                        if (err){
                            res.send({
                                error_code:5005,
                                error_msg:err.message
                            })
                        }else {
                            res.send({
                                error_code:0,
                                error_msg:'ok',
                                data:{
                                    cyc:d.cyc
                                }
                            })
                        }
                    })

                },(err) => {
                    res.send({
                        error_code:5007,
                        error_msg:err
                    })
                })
            },(err)=>{
                res.send({
                    error_code:6002,
                    error_msg:err
                })
            })
        }else {
            res.send({
                error_code:5003,
                error_msg:'short params'
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'no access authority'
        })
    }
})


/*
*   创建10位锦时激活码，保证只能内部调用
 */
router.post('/create',function (req,res,next) {
    if (req.body.secret_key === innerSecret){
    	let params = req.body;
        // 需要有一张激活码的相关后台来验证激活信息
        if (params.cyc && params.purpose && params.num) {
            params.batch = uuid().replace(/-/g, '');
            params.type = 10;
            return new Promise((resolve,reject) => {
                cycGo10(generateCodeType10(params)).then((codes) => {
                    if (codes.length == Number(params.num)){
                        res.send({
                            '批次':params.batch,
                            '数量':codes.length,
                            '周期':params.cyc+'周',
                            '激活码列表':codes
                        })
                    }else {
                        res.send('激活码生成错误');
                    }
                })
            })
        }else {
            res.send({
                error_code:5002,
                error_msg:'short params'
            })
        }
    }else {
        res.send({
            error_code:5001,
            error_msg:'no access authority'
        })
    }
})

/* 10位激活码 */
const cycGo10 = (p) => {
    return p.then((pp) => {
        let codesA = [];
        codesA = codesA.concat(pp.codes);
        if (pp.wrong){
            pp.params.num = pp.wrong;
            cycGo10(generateCodeType10(pp.params))
        }else {
            return Promise.resolve(codesA);
        }
    })
};

const generateCodeType10 = (params)=>{
    let code = new ActiveCode();
    code.batch = params.batch;
    code.cyc = Number(params.cyc);
    code.purpose = params.purpose;
    code.type = params.type;
    let wrongNum = 0;
    let codes = [];
    return new Promise((resolve,reject) => {
        for (let i = 0; i<Number(params.num); i++) {
            code.active_code = func.get_random_code_10();

            code.create((err, code) => {
                if (!err) {
                    codes.push(code.attrs.active_code);
                    if (codes.length + wrongNum === Number(params.num)) {
                        // 达到最后一个
                        let p = {
                            wrong: wrongNum,
                            codes: codes,
                            params: params
                        };
                        resolve(p)
                    }
                } else {
                    wrongNum++;
                    if (codes.length + wrongNum === Number(params.num)) {
                        // 达到最后一个
                        let p = {
                            wrong: wrongNum,
                            codes: codes,
                            params: params
                        };
                        resolve(p)
                    }
                }
            })
        }
    })
};

module.exports = router;