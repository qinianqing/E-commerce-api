const router = require('express').Router();

const ReverseOrder = require('../models/ReverseOrder');
const Order = require('../models/Order');

// 获取退换货地址
router.get('/return-address', (req,res,next) => {
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    res.send({
        error_code:0,
        error_msg:'ok',
        data:{
            address:'北京市朝阳区建国路88号SOHO现代城A座905室',
            contact:'锦时售后服务部',
            phone:'010-57102310'
        }
    })
});

// 物流品牌和代码对照表
router.get('/express-brand2code', (req,res,next) => {
    res.send({
        error_code:0,
        error_msg:'ok',
        data: {
            list:['京东快递','顺丰速递','申通快递','圆通快递','中通快递','韵达快递','EMS','中国邮政','德邦物流','如风达','天天快递','全峰快递','国通快递','百世快递','安能物流'],
            code:{
                '京东快递':'jd',
                '顺丰速递':'sf-express',
                '申通快递':'sto',
                '圆通快递':'yto',
                '中通快递':'zto',
                '韵达快递':'yunda',
                'EMS':'china-ems',
                '中国邮政':'china-post',
                '德邦物流':'deppon',
                '如风达':'rufengda',
                '天天快递':'ttkd',
                '全峰快递':'qfkd',
                '国通快递':'cess',
                '百世快递':'bestex',
                '安能物流':'ane66',
            }
        }
    })
});

// 发起售后
router.post('/create',(req,res,next)=>{
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    // 校验参数
    let params = req.body;
    if (!params.order_id || !params.item || !params.type ||!params.reason || !params.content || !params.pics){
        return res.send({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
   
        if (params.item.sku_id&&params.item.num){

        }else {
            return res.send({
                error_code:5003,
                error_msg:'items格式错误'
            })
        }
    
    /*
        user_id:this.user_id,
        reverse_id:Date.now(),
        order_id:this.order_id,
        items:this.items,
        status:this.status,
        messages:this.messages,
        reason:this.reason,
        content:this.content,
        pics:this.pics,
 */
    let reverseOrder = new ReverseOrder();
    reverseOrder.user_id = req.currentUser.user_id;
    reverseOrder.order_id = params.order_id;
    reverseOrder.item = params.item;
    reverseOrder.status = '_INIT';
    reverseOrder.type = params.type;//REFUND（退款）、RETURN（退货）、RECHANGE（换货)
    let typeName = '';
    let statusName = '';
    switch (params.type){
        case 'REFUND':
            typeName = '退款';
            statusName = 'REFUNDING';
            break;
        case 'RETURN':
            typeName = '退货';
            statusName = 'RETURNING';
            break;
        case 'RECHANGE':
            typeName = '换货';
            statusName = 'RECHANGING';
            break;
    }
    reverseOrder.messages = [{
        msg:'您发起了'+typeName+'申请',
        time:Date.now()
    }];
    reverseOrder.reason = params.reason;
    reverseOrder.content = params.content;
    reverseOrder.pics = params.pics;
    reverseOrder.create((err,data)=>{
        if (err){
            return res.send({
                error_code:5004,
                error_msg:err.message
            })
        }
        data = data.attrs;
        let rid = data.reverse_id;
        // 更新订单
        let order = new Order();
        order.user_id = req.currentUser.user_id;
        order.order_id = params.order_id;
        order.getOrder((err,data)=>{
            if(err){
                return res.send({
                    error_code:5005,
                    error_msg:err.message
                })
            }
            if(!data){
                return res.send({
                    error_code:5006,
                    error_msg:'错误订单号'
                })
            }
            let re = data.attrs.reverse_id;
            if(re){
                re = re.push(rid);
            }else{
                re = [rid];
            }
            order.reverse_ids = re;
            order.status = statusName;
            order.updateStatusByReverse((err,data)=>{
                if (err){
                    return res.send({
                        error_code:5007,
                        error_msg:err.message
                    })
                }
                return res.send({
                    error_code:0,
                    error_msg:'ok',
                    data:rid
                })
            })
        })
    })
});

// 用户创建逆向物流信息
router.post('/update-express',(req,res,next)=>{
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    let params = req.body;
    if (!params.reverse_id || !params.express_id || !params.express_brand){
        return res.send({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
    let reverseOrder = new ReverseOrder();
    reverseOrder.user_id = req.currentUser.user_id;
    reverseOrder.reverse_id = params.reverse_id;
    reverseOrder.express_id = params.express_id;
    reverseOrder.express_brand = params.express_brand;
    reverseOrder.logistics_pic = params.logistics_pic;
    reverseOrder.tel = params.tel;
    reverseOrder.reverse_detail = params.reverse_detail;
    let item = {
        msg:'您填写了逆向物流信息，物流单号为'+params.express_id,
        time:Date.now()
    };
    reverseOrder.getReverseOrder((err,data)=>{
       
        if(err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        if (!data){
            return res.send({
                error_code:5004,
                error_msg:'reverse_id不正确'
            })
        }
        data = data.attrs;
        reverseOrder.status = '_SENDBACK';
        let message = [];
        message.push(item)
        reverseOrder.msg = message;
        reverseOrder.updateReverseOrderForExpress((err,data)=>{
            if(err){
                return res.send({
                    error_code:5005,
                    error_msg:err.message
                })
            }
            res.send({
                error_code:0,
                error_msg:'ok'
            })
        })
    })
});

// 补充信息，只允许在客服端操作

// 更新状态，审批通过、审批不通过（需要填写说明）、补充资料（需要填写说明）


// 撤销售后
router.post('/revoke',(req,res,next)=>{
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    let params = req.body;
    if (!params.reverse_id){
        return res.send({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
    let reverseOrder = new ReverseOrder();
    reverseOrder.user_id = req.currentUser.user_id;
    reverseOrder.reverse_id = params.reverse_id;
    reverseOrder.getReverseOrder((err,data)=>{
        if(err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        if (!data){
            return res.send({
                error_code:5004,
                error_msg:'reverse_id不正确'
            })
        }
        data = data.attrs;
        reverseOrder.status = '*CANCEL';
        let typeName = '';
        let statusName = '';
        switch (data.type){
            case 'REFUND':
                typeName = '退款';
                statusName = 'REFUNDED';
                break;
            case 'RETURN':
                typeName = '退货';
                statusName = 'RETURNED';
                break;
            case 'RECHANGE':
                typeName = '换货';
                statusName = 'RECHANGED';
                break;
        }
        let item = {
            msg:'您撤销了'+typeName+'申请',
            time:Date.now()
        };
        let messages = [];
        messages.push(item);
        reverseOrder.msg =  messages;
        reverseOrder.updateReverseOrder((err,data)=>{
          
            if(err){
                return res.send({
                    error_code:5005,
                    error_msg:err.message
                })
            }
            // 更新订单
            data = data.attrs;
            let order = new Order();
            order.user_id = data.user_id;
            order.order_id = data.order_id;
            order.status = statusName;
            //order.reverse_id = data.reverse_id;
            order.updateStatus((err)=>{
                if (err){
                    return res.send({
                        error_code:5006,
                        error_msg:err.message
                    })
                }
                res.send({
                    error_code:0,
                    error_msg:'ok'
                })
            })
        })
    })
});

// 获取售后列表
router.get('/list',(req,res,next)=>{
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    if(req.query.last_key){
        req.query.last_key  = decodeURIComponent(req.query.last_key);
        req.query.last_key = JSON.parse(req.query.last_key);
    }
    let params = req.query;
    if (!params.type){
        return res.send({
            error_code:5002,
            error_msg:'缺少type参数'
        })
    }
    let reverseOrder = new ReverseOrder();
    reverseOrder.user_id = req.currentUser.user_id;
    if (params.type === 'ing'){
        reverseOrder.getReverseIngOrderList((err,data)=>{
            if(err){
                return res.send({
                    error_code:5003,
                    error_msg:err.message
                })
            }
            res.send({
                error_code:0,
                error_msg:'ok',
                data:data
            })
        });
    }else if (params.type === 'ed'){
        reverseOrder.getReverseEdOrderList((err,data)=>{
            if(err){
                return res.send({
                    error_code:5004,
                    error_msg:err.message
                })
            }
            res.send({
                error_code:0,
                error_msg:'ok',
                data:data
            })
        },req.query.last_key)
    }else {
        return res.send({
            error_code:5005,
            error_msg:'错误type'
        })
    }
});

// 查询售后详情
router.get('/',(req,res,next)=>{
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    let params = req.query;
    if (!params.reverse_id){
        return res.send({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
    let reverseOrder = new ReverseOrder();
    reverseOrder.user_id = req.currentUser.user_id;
    reverseOrder.reverse_id = params.reverse_id;
    reverseOrder.getReverseOrder((err,data)=>{
        if(err){
            return res.send({
                error_code:5003,
                error_msg:err.message
            })
        }
        if (!data){
            return res.send({
                error_code:5004,
                error_msg:'reverse_id不正确'
            })
        }
        res.send({
            error_code:0,
            error_msg:'ok',
            data:data
        })
    })
});

module.exports = router;