// 联名卡路由
const router = require('express').Router();

const getCardDetail = require('../interface/getCardDetail');

const getUserCardNum = require('../interface/getCardActiveNum');
let getCardActNum = (card_id,user_id)=>{
    return new Promise((resolve,reject)=>{
        getUserCardNum({
            card_id:card_id,
            user_id:user_id,
            card_type:'1001', // 联名卡
            callback:(resp)=>{
                if (resp.error_code){
                    reject(resp)
                }else {
                    resolve(resp)
                }
            }
        })
    })
};

const activeCard = require('../interface/activeCard');

router.post('/active',(req,res,next) => {
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    if (req.body.id && req.body.family_id){

    }else {
        return res.send({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
    activeCard({
        user_id:req.currentUser.user_id,
        id:req.body.id,
        family_id:req.body.family_id,
        callback:(resp)=>{
            return res.send(resp)
        }
    })
});

// 获取联名卡详情
router.get('/',(req,res,next)=>{
    if (!req.currentUser){
        return res.send({
            error_code:5001,
            error_msg:'无调用权限'
        })
    }
    if (!req.query.id){
        return res.send({
            error_code:5002,
            error_msg:'需要id'
        })
    }
    getCardDetail({
        id:req.query.id,
        callback:(resp)=>{
            if (resp.error_code){
                return res.send(resp);
            }
            let data = resp.data;
            let statusName = '立即领取';
            if (data.status === 0){
                statusName = '暂不能领取';
            }
            let now = Date.now();
            if (now >= data.expiredAt){
                statusName = '该卡已经失效';
            }
            if (data.active_num > data.num){
                statusName = '该卡已领完';
            }
            let getUAN = async ()=> {
                try {
                    let numb = await getCardActNum(req.query.id, req.currentUser.user_id);
                    if (numb.data >= data.limit) {
                        statusName = '您已经领取' + data.limit + '张';
                    }
                    return res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:{
                            card:data,
                            status:statusName
                        }
                    })
                } catch (err) {
                    return res.send(err)
                }
            };
            getUAN();
        }
    })
});



module.exports = router;