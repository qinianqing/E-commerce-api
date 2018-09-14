// 评价
// TODO 更新试用外部调用形式，取代最后Goods，完成model解耦
const router = require('express').Router();

const Comment = require('../models/Evaluation');
const BuyRecord = require('../../order/models/BuyRecord');


const Goods = require('../../product/models/Goods');
const getUserInfo = require('../../passport/interface/getUserInfo');
const getUserInfoBatch = require('../../passport/interface/getUserInfoBatch');

// 格式化时间
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
      "M+": this.getMonth() + 1, //月份 
      "d+": this.getDate(), //日 
      "h+": this.getHours(), //小时 
      "m+": this.getMinutes(), //分 
      "s+": this.getSeconds(), //秒 
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
      "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  }

// 新建评论

router.post('/create', (req, res, next) => {
    if (req.currentUser) {
        let params = req.body;
        let comment = new Comment();
        comment.goods_id = params.goods_id || params.spu_id;
        comment.star_num = params.star_num;
        comment.user_id = req.currentUser.user_id;
        comment.comment_content = params.comment_content;
        comment.comment_image = params.comment_image;
        comment.type_id = params.type_id;
        comment.create((err, comments) => {
            if (err) {
                res.send({
                    error_code: 4000,
                    error_msg: err.message
                })
            } else {
                res.send({
                    err_code: 0,
                    error_msg: 'ok',
                    data: {
                        comment: comments
                    }
                })
            }
        })
    } else {
        res.send({
            error_code: 5001,
            error_msg: '无访问权限'
        })
    }
});

// 根据record的oid获得评价详情
const product = require('../../product/interface/getProduct');
router.get('/detail-by-record', (req, res, next) => {
    if (!req.currentUser) {
        return res.send({
            error_code: 5001,
            error_msg: '无访问权限'
        })
    }
    let params = req.query;
    if (!params.object_id||!params.goods_id){
        return res.send({
            error_code: 5002,
            error_msg: '缺少参数'
        })
    }
    let rec = new BuyRecord();
    rec.user_id = req.currentUser.user_id;
    rec.object_id = params.object_id;
    rec.getTargetRecord((err,data)=>{
        if (err){
            return res.send({
                error_code: 5003,
                error_msg: err.message
            })
        }
        if (!data){
            return res.send({
                error_code: 5004,
                error_msg: '错误oid'
            })
        }
        data = data.attrs;
        if (!data.comment_id){
            return res.send({
                error_code: 5005,
                error_msg: '该record没有评论'
            })
        }
        let eva = new Comment();
        eva.goods_id = params.goods_id;
        eva.comment_id = data.comment_id;
        eva.getTargetEva((err,data)=>{
            if (err){
                return res.send({
                    error_code: 5006,
                    error_msg: err.message
                })
            }
            if (!data){
                return res.send({
                    error_code: 5004,
                    error_msg: '查询错误'
                })
            }
            product.get.spuBrief({
                spu_id:params.goods_id,
                callback:(resp)=>{
                    if (resp.error_code){
                        return res.send(resp)
                    }
                    let prod = resp.data;
                    data.attrs.product = {
                        spu:prod.goods_name,
                        cover:prod.default_image
                    };
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:data
                    })
                }
            })
        })
    })
});

// 评价之后回调
// /callback
router.post('/callback',(req,res,next)=>{
    if(!req.currentUser) {
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    if(!req.body.object_id){
        res.send({
            error_code:5002,
            error_msg:'需要object_id'
        })
    }
    if(!req.body.comment_id){
        res.send({
            error_code:5003,
            error_msg:'需要comment_id'
        })
    }
    // status 0 未评价，1 已评价
    let buyRecord = new BuyRecord();
    buyRecord.user_id = req.currentUser.user_id;
    buyRecord.object_id = req.body.object_id;
    buyRecord.comment_id = req.body.comment_id;
    buyRecord.setRecordEva((err)=>{
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
});

//重构comment
router.get('/product/list',(req,res,next)=>{
    if(req.currentUser){
        if(req.query.last_key){
            req.query.last_key  = decodeURIComponent(req.query.last_key);
            req.query.last_key = JSON.parse(req.query.last_key);
        }
        let params = req.query;
        let spu_id = params.goods_id;

        let comment = new Comment();
        let commentArray = [];
        comment.getAllSkusByTargetComments(spu_id,(err,comments)=>{
            if(err){
                res.send({
                    error_code:4001,
                    error_msg:err.message
                })
            }else{
                if(comments.Count > 0){
                    let userIDs = [];
                    let allUsers = [];
                    let starUser = [];

                    for(let i = 0;i < comments.Count;i++){
                        allUsers.push(comments.Items[i].attrs.user_id);
                    }
                    starUser.push(comments.Items[0].attrs.user_id);
                    for(let j =0; j < allUsers.length;j++){
                        for(let k = 0;k < starUser.length;k++){
                            if(allUsers[j] === starUser[k]){
                                break;
                            }
                            starUser.push(allUsers[j]);
                        }
                    }
                    for(let m =0;m < starUser.length;m++){
                        let item = {
                            user_id:starUser[m]
                        };
                        userIDs.push(starUser[m])
                    }
                    getUserInfoBatch({
                        users:userIDs,
                        callback:(resp)=>{
                            if (resp.error_code>0){
                                return res.send(resp);
                            }
                            let userArray = resp.data;
                            let num = 0;
                            let goods = new Goods();
                            goods.getSpu(spu_id,(err,d)=>{
                                if (err){
                                    return res.send({
                                        error_code:4002,
                                        error_msg:err.message
                                    })
                                }
                                d = d.attrs;
                                skuArray = d.skus;
                                for(let i = comments.Count-1;i > -1;i--){
                                    num +=  comments.Items[i].attrs.star_num;
                                    // comments.Items[i].attrs.createdAt = (new Date()).Format("yyyy-MM-dd hh:mm:ss")
                                    for(let r = 0;r < skuArray.length;r++){
                                        if(comments.Items[i].attrs.sku_id === skuArray[r].sku_id){
                                            comments.Items[i].attrs.sku_name = skuArray[r].sku_name
                                        }
                                    }
                                    // 反去重
                                    let userArrayNotUnique = userArray;
                                    for(let j = 0;j < userArray.length;j++){
                                        if(comments.Items[i].attrs.user_id === userArrayNotUnique[j].user_id){
                                            comments.Items[i].attrs.user_name = userArrayNotUnique[j].user_name;
                                            comments.Items[i].attrs.avatar = userArrayNotUnique[j].avatar;
                                            if(comments.Count < 100){
                                                comments.Items[i].attrs.stars_num = 5;
                                                comments.Items[i].attrs.fen = 99 + '%';
                                            }else{
                                                let nums = comments.Count * 5;
                                                comments.Items[i].attrs.stars_num =  Math.ceil(num / comments.Count);
                                                comments.Items[i].attrs.fen = Math.ceil(Math.round(((num / nums) * 10000) / 100)) + "%";
                                            }
                                        }
                                    }

                                    commentArray.push(comments.Items[i].attrs)

                                }
                                res.send({
                                    err_code:0,
                                    error_msg:'ok',
                                    data:{
                                        commentArray:commentArray,
                                        last_key: comments.LastEvaluatedKey
                                    }
                                })
                            });
                        }
                    });
                }else{
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:{
                            commentArray:0
                        }

                    })
                }

            }
        },req.query.last_key)

    }else{
        res.send({
            error_code: 5001,
            error_msg: '无访问权限'
        })
    }
});

// 针对用户维度是否评价完成
// 用户购买列表
// 用于评价
// LastEvaluatedKey
router.get('/user/list',(req,res,next)=>{
    if(!req.currentUser) {
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    if (!req.query.eva_status) {
        return res.send({
            error_code:5002,
            error_msg:'需要status'
        })
    }
    if(req.query.last_key){
        req.query.last_key  = decodeURIComponent(req.query.last_key);
        req.query.last_key = JSON.parse(req.query.last_key);
    }
    // status 0 未评价，1 已评价
    let buyRecord = new BuyRecord();
    buyRecord.user_id = req.currentUser.user_id;
    buyRecord.eva_status = Number(req.query.eva_status);
    buyRecord.getRecordList((err,data)=>{
        if (err){
            res.send({
                error_code:5003,
                error_msg:err.message
            })
        }else {
            res.send({
                error_code:0,
                error_msg:'ok',
                data:data
            })
        }
    },req.query.last_key)
});

module.exports = router;
