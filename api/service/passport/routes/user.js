const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const { secret,jsWaParams,secretKey } = require('../config');

// 内部接口

// 获取单个用户信息
router.post('/sdk/info',function (req,res,next) {
    if (req.body.secret !== secretKey){
        return res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
    if (!req.body.user_id){
        return res.send({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
    let user = new User();
    user.getUser(req.body.user_id,(err,resp)=>{
        if (err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        // 构造返回的数据结构
        let u = resp.attrs;
        let userItem = {
            user_id:u.user_id,
            avatar:u.avatar,
            user_name:u.user_name,
            gender:u.gender,// 1是男
        };
        res.send({
            error_code:0,
            error_msg:'ok',
            data:userItem
        })
    })
});
// 批量获取用户信息
router.post('/sdk/info-batch',function (req,res,next) {
    if (req.body.secret !== secretKey){
        return res.send({
            error_code:5001,
            error_msg:'无访问权限'
        })
    }
    if (!req.body.users){
        return res.send({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
    let users = unique(req.body.users);
    let user = new User();
    user.getUsers(users,(err,resp)=>{
        if (err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        let items = [];
        for (let i=0;i<resp.length;i++){
            // 构造返回的数据结构
            let u = resp[i].attrs;
            let userItem = {
                user_id:u.user_id,
                avatar:u.avatar,
                user_name:u.user_name,
                gender:u.gender,// 1是男
            };
            items.push(userItem);
        }
        res.send({
            error_code:0,
            error_msg:'ok',
            data:items
        })
    })
});

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


/*
*   获取用户信息
*
 */
router.get('/info',function (req,res,next) {
    let token = req.header('x-access-token') || req.params.token;
    if (token){
        jwt.verify(token,secret,function (err,decoded) {
            if (err){
                res.send({
                    error_code:5002,
                    error_msg:'无效token'
                })
            }else {
                let user = new User();
                user.getUser(decoded.user_id,(error,resp) => {
                    if (error){
                        res.send({
                            error_code:5003,
                            error_msg:error.message
                        })
                    }else {
                        // 构造返回的数据结构
                        let user = resp.attrs;
                        let userItem = {
                            user_id:user.user_id,
                            avatar:user.avatar,
                            user_name:user.user_name,
                            gender:user.gender,// 1是男
                        };
                        if (resp){
                            res.send({
                                error_code:0,
                                error_msg:'ok',
                                data:{
                                    user:userItem
                                }
                            })
                        }else {
                            res.send({
                                error_code:5004,
                                error_msg:'用户不存在'
                            })
                        }
                    }
                })
            }
        })
    }else {
        res.send({
            error_code:5001,
            error_msg:'需要token'
        })
    }
});

/*
*   获取用户是否完成试用
*   1已经使用过，0没有试用过
*
 */
router.get('/is-tried',function (req,res,next) {
    let token = req.header('x-access-token') || req.params.token;
    if (token){
        jwt.verify(token,secret,function (err,decoded) {
            if (err){
                res.send({
                    error_code:5002,
                    error_msg:'失效token'
                })
            }else {
                let user = new User();
                user.getUser(decoded.user_id,(error,resp) => {
                    if (error){
                        res.send({
                            error_code:5003,
                            error_msg:error.message
                        })
                    }else {
                        if (resp){
                            let tried =1;
                            if(resp.attrs.member_tried){
                                tried = 1;
                            }else {
                                tried = 0;
                            }
                            res.send({
                                error_code:0,
                                error_msg:'ok',
                                data:{
                                    tried:tried
                                }
                            })
                        }else {
                            res.send({
                                error_code:5004,
                                error_msg:'用户不存在'
                            })
                        }
                    }
                })
            }
        })
    }else {
        res.send({
            error_code:5001,
            error_msg:'需要token'
        })
    }
});

/*
*   更新用户信息
*
 */
router.post('/update',function (req,res,next) {
    let token = req.header('x-access-token') || req.body.token;

    if (token){
        jwt.verify(token,secret,function (err,decoded) {
            if (err){
                res.send({
                    error_code:5002,
                    error_msg:'失效token'
                })
            }else {
                let params = req.body;
                let user = new User();
                user.user_id = decoded.user_id;
                user.avatar = params.avatar || '';
                user.user_name = params.user_name || '';
                user.gender = parseInt(params.gender) || 0;
                user.updateUserInfo((error,resp) => {
                    if (error){
                        res.send({
                            error_code:5003,
                            error_msg:error.message
                        })
                    }else {
                        if (resp){
                            // 构造返回的数据结构
                            let u = resp.attrs;
                            let userItem = {
                                user_id:u.user_id,
                                avatar:u.avatar,
                                user_name:u.user_name,
                                gender:u.gender,// 1是男
                            };
                            res.send({
                                error_code:0,
                                error_msg:'ok',
                                data:{
                                    user:userItem
                                }
                            })
                        }else {
                            res.send({
                                error_code:5003,
                                error_msg:'更新失败'
                            })
                        }
                    }
                })
            }
        })
    }else {
        res.send({
            error_code:5001,
            error_msg:'需要token'
        })
    }
});

// 校验是否有union_id
router.post('/have-unionid',function (req,res,next) {
    let token = req.header('x-access-token') || req.body.token;

    if (token){
        jwt.verify(token,secret,function (err,decoded) {
            if (err){
                res.send({
                    error_code:5002,
                    error_msg:'失效token'
                })
            }else {
                let user = new User();
                user.user_id = decoded.user_id;

                user.getTargetUser((error,resp) => {
                    if (error){
                        res.send({
                            error_code:5003,
                            error_msg:error.message
                        })
                    }else {
                        if (resp) {
                            resp = resp.attrs;
                            let is_union_id_binded = 1;
                            if (!resp.union_id){
                                is_union_id_binded = 0;
                            }
                            res.send({
                                error_code:0,
                                error_msg:'ok',
                                data:{
                                    union_id:is_union_id_binded
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
            error_msg:'需要token'
        })
    }
});

// 校验是否关注公众号
router.post('/is_fwh_user',function (req,res,next) {
    let token = req.header('x-access-token') || req.body.token;

    if (token){
        jwt.verify(token,secret,function (err,decoded) {
            if (err){
                res.send({
                    error_code:5002,
                    error_msg:'失效token'
                })
            }else {
                let user = new User();
                user.user_id = decoded.user_id;

                user.getTargetUser((error,resp) => {
                    if (error){
                        res.send({
                            error_code:5003,
                            error_msg:error.message
                        })
                    }else {
                        if (resp) {
                            resp = resp.attrs;
                            let is_fwh_user = 0;
                            if (resp.fwh_open_id){
                                is_fwh_user = 1;
                            }
                            res.send({
                                error_code:0,
                                error_msg:'ok',
                                data:{
                                    is_fwh_user:is_fwh_user
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
            error_msg:'需要token'
        })
    }
});

const sendCustomMsg = require('../../../utils/sendMsg/waCustomMsg');

router.post('/wa_follow_fwh_callback',function (req,res,next) {
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    let user = new User();
    user.user_id = req.currentUser.user_id;
    user.getTargetUser((err,data)=>{
        if (err){
            return res.send({
                error_code:5002,
                error_msg:err.message
            })
        }
        data = data.attrs;
        res.send({
            error_code:0,
            error_msg:'ok'
        });
        sendCustomMsg.fwhPage(data.wa_open_id);
    });
});

// 解析并获取union_id
let WXBizDataCrypt = require('../utils/WXBizDataCrypt');

router.post('/bind-unionid-wa',function (req,res,next) {
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    let union_id = '';
    let params = req.body;
    let iv = params.iv;
    let encryptedData = params.encryptedData;

    // if(iv&&encryptedData){
    //
    // }else {
    //     return res.send({
    //         error_code:5010,
    //         error_msg:'缺少参数'
    //     })
    // }

    // 查询session key
    let user = new User();
    user.user_id = req.currentUser.user_id;
    user.getTargetUser((err,resp) => {

        resp = resp.attrs;
        if(!resp.union_id){
            // 解码信息
            let pc = new WXBizDataCrypt(jsWaParams.appid,resp.wa_session_key);
            let data = pc.decryptData(encryptedData,iv);

            union_id = data.unionId;
            // 更新用户的基本信息
            let avatar = data.avatarUrl;
            let user_name = data.nickName;
            let gender = data.gender;
            if (!gender){
                gender = 0;
            }
            // 更新union_id
            user.union_id = union_id;
            user.queryUnionId((err,data)=>{
                if (err){
                    res.send({
                        error_code:5004,
                        error_msg:err.message
                    })
                }else {
                    if (data.Count){
                        // 已经将小程序信息合并，并删除这个半账号
                        let oU = new User();
                        oU.user_id = data.Items[0].attrs.user_id;
                        oU.wa_open_id = resp.wa_open_id;
                        oU.wa_form_id = resp.wa_form_id;
                        oU.wa_session_key = resp.wa_session_key;
                        oU.avatar = avatar;
                        oU.user_name = user_name;
                        oU.gender = gender;
                        oU.updateWAInfo((err,data)=>{
                            if (err){
                                res.send({
                                    error_code:5005,
                                    error_msg:err.message
                                })
                            }else {
                                // 更新成功删除原账号
                                user.deleteUser(req.currentUser.user_id,(err)=>{
                                    if (err){
                                        res.send({
                                            error_code:5006,
                                            error_msg:err.message
                                        })
                                    }else {
                                        // 返回成功，在小程序端重新登录
                                        res.send({
                                            error_code:0,
                                            error_msg:'ok',
                                            data: data.attrs.user_id
                                        })
                                    }
                                })
                            }
                        })

                    }else {
                        // 直接更新
                        user.updateUserUnionId((err,data)=>{
                            if (err){
                                res.send({
                                    error_code:5003,
                                    error_msg:err.message
                                })
                            }else {
                                // 返回成功，在小程序端重新登录
                                res.send({
                                    error_code:0,
                                    error_msg:'ok',
                                    data:data.attrs.user_id
                                });
                                user.avatar = avatar;
                                user.user_name = user_name;
                                user.gender = gender;
                                user.updateUserInfo((err)=>{
                                    if (err){
                                        console.error(err.message);
                                    }
                                })
                            }
                        })
                    }
                }
            });
        }else {
            res.send({
                error_code:0,
                error_msg:'ok',
                data:resp.user_id
            })
        }
    })

});

// 更新用户绑定的手机号
// 使用频率低
router.post('/tel-update-wa',function (req,res,next) {
    let token = req.header('x-access-token') || req.body.token;
    let tel = '';
    let encodeTel = '';

    if (token){
        jwt.verify(token,secret,function (err,decoded) {
            if (err){
                res.send({
                    error_code:5002,
                    error_msg:'invalid token'
                })
            }else {
                let params = req.body;
                let iv = params.iv;
                let encryptedData = params.encryptedData;
                // 查询session key
                let user = new User();
                user.getUser({user_id:decoded.user_id},(err,resp) => {
                    // 解码信息
                    let pc = new WXBizDataCrypt(jsWaParams.appid,resp.attrs.wa_session_key);
                    let data = pc.decryptData(encryptedData,iv);
                    tel = data.countryCode+'-'+data.phoneNumber;
                    for (let i=0;i<data.phoneNumber.length;i++){
                        if (i>2 && i<7){
                            encodeTel = encodeTel + '*';
                        }else {
                            encodeTel = encodeTel + data.phoneNumber[i];
                        }
                    }
                    // 更新tel
                    user.user_id = decoded.user_id;
                    user.tel = tel;
                    user.updateUserTel((error,resp) => {
                        if (error){
                            res.send({
                                error_code:5003,
                                error_msg:error.message
                            })
                        }else {
                            if (resp){
                                resp.attrs.tel = encodeTel;
                                res.send({
                                    error_code:0,
                                    error_msg:'ok',
                                    data:{
                                        user:resp
                                    }
                                })
                            }else {
                                res.send({
                                    error_code:5004,
                                    error_msg:'更新错误'
                                })
                            }
                        }
                    })
                })
            }
        })
    }else {
        res.send({
            error_code:5001,
            error_msg:'需要token'
        })
    }
});

// 增加form_id
/*
let form_id_template = {
    form_id:'xxxx',
    quota:1,
    expiredAt:'2018-03-04T17:01:40.491Z'
};
*/
router.post('/add-form-id-wa',function (req,res,next) {
    let token = req.header('x-access-token') || req.body.token;
    let p = req.body;

    if (token){
        jwt.verify(token,secret,function (err,decoded) {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: '失效token'
                })
            } else {
                let user = new User();
                user.user_id = decoded.user_id;
                user.getTargetUser((err,data) =>{
                    if (err){
                        res.send({
                            error_code:5003,
                            error_msg:err.message
                        })
                    }else {
                        data = data.attrs;
                        let formItem = {
                            form_id:p.form_id,
                            quota:p.quota,
                            expiredAt:p.expiredAt
                        };
                        let items = [];
                        if(data.wa_form_id){
                            items = data.wa_form_id;
                        }
                        items.push(formItem);
                        user.wa_form_id = items;
                        user.updateFormId((err)=>{
                            if (err){
                                res.send({
                                    error_code:5004,
                                    error_msg:err.message
                                })
                            }else {
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
    }
});

// 支付上报form_id
router.post('/add-form-id-pay',function (req,res,next) {
    let p = req.body;
    if (p.secret === secretKey){
        let user = new User();
        user.user_id = p.user_id;
        user.getTargetUser((err,data) =>{
            if (err){
                res.send({
                    error_code:5003,
                    error_msg:err.message
                })
            }else {
                data = data.attrs;
                let formItem = {
                    form_id:p.form_id,
                    quota:p.quota,
                    expiredAt:p.expiredAt
                };
                let items = [];
                if(data.wa_form_id){
                    items = data.wa_form_id;
                }
                items.push(formItem);
                user.wa_form_id = items;
                user.updateFormId((err)=>{
                    if (err){
                        res.send({
                            error_code:5004,
                            error_msg:err.message
                        })
                    }else {
                        res.send({
                            error_code:0,
                            error_msg:'ok'
                        })
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

// 使用form_id
router.post('/get-form-id-wa',function (req,res,next) {
    let p = req.body;
    if (p.secret === secretKey){
        if (p.user_id){
            let user = new User();
            user.user_id = p.user_id;
            user.getTargetUser((err,data) =>{
                if (err){
                    res.send({
                        error_code:5003,
                        error_msg:err.message
                    })
                }else {
                    // 遍历wa_form_id
                    let formIDs = data.attrs.wa_form_id;
                    let now = new Date();
                    now = now.getTime();
                    if (formIDs.length>0){
                        let formIdList = [];
                        let targetFormId = '';
                        for (let i=0;i<formIDs.length;i++){
                            // 清理过期form_id
                            let expiredData = new Date(formIDs[i].expiredAt);
                            expiredData = expiredData.getTime();
                            if (expiredData > now){
                                // 时效
                                if (!targetFormId){
                                    if (formIDs[i].quota>0){
                                        targetFormId = formIDs[i].form_id;
                                        if ((formIDs[i].quota-1) >0){
                                            let tItem = {
                                                form_id:formIDs[i].form_id,
                                                quota:formIDs[i].quota-1,
                                                expiredAt:formIDs[i].expiredAt
                                            };
                                            formIdList.push(tItem);
                                        }
                                    }
                                }else {
                                    if (formIDs[i].quota>0){
                                        formIdList.push(formIDs[i]);
                                    }
                                }
                            }
                        }
                        res.send({
                            error_code:0,
                            error_msg:'ok',
                            data:{
                                form_id:targetFormId
                            }
                        });
                        user.wa_form_id = formIdList;
                        user.updateFormId((err)=>{
                            if(err){
                                console.error(err.message)
                            }
                        })
                    }else {
                        res.send({
                            error_code:0,
                            error_msg:'ok',
                            data:{
                                form_id:''
                            }
                        })
                    }
                }
            })
        }else {
            res.send({
                error_code:5002,
                error_msg:'需要用户ID'
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
