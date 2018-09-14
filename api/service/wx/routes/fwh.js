const router = require('express').Router();

const consToken = 'Yongxin12345';
const crypto = require('crypto');
const mp = require('wechat-mp')(consToken);
router.use('/',mp.start());

const axios = require('axios');

const sha1 = crypto.createHash('sha1');

// 方法引用
const xml2json = require('../../../utils/xml2js/xml2json');
const json2xml = require('../../../utils/xml2js/json2xml');

let getFwhToken = require('../../../utils/getToken/getFwhToken');

let getUserInfo = (access_token,open_id)=>{
    return new Promise((resolve,reject)=>{
        axios.get('https://api.weixin.qq.com/cgi-bin/user/info?access_token='+access_token+'&openid='+open_id+'&lang=zh_CN').then((response)=>{
            let data = response.data;
            if (data.errcode){
                reject(response.data.errmsg)
            }
            resolve(data);
        },(err)=>{
            reject(err.message);
        })
    })
};

const User = require('../../passport/models/User');

let checkIsUser = (union_id)=>{
    return new Promise((resolve,reject)=>{
        let user = new User();
        user.union_id = union_id;
        user.queryUnionId((err,data)=>{
            if (err){
                reject(err.message)
            }
            if (data.Count === 1){
                resolve(data.Items[0].attrs.user_id);
            }else {
                resolve(0);
            }
        })
    })
};

let saveUser = (d)=>{
    return new Promise((resolve,reject)=>{
        let user = new User();
        user.avatar = d.headimgurl;
        user.user_name = d.nickname;
        user.union_id = d.unionid;
        user.gender = d.sex;
        user.fwh_open_id = d.openid;
        user.createFromFwh((err,data)=>{
            if(err){
                reject(err.message);
            }
            resolve(1);
        })
    })
};

let updateUser = (user_id,open_id)=>{
    return new Promise((resolve,reject)=>{
        let user = new User();
        user.user_id = user_id;
        user.fwh_open_id = open_id;
        user.updateFromFwh((err,data)=>{
            if(err){
                reject(err.message);
            }
            resolve(1);
        })
    })
};

/*
{
  uid: 'xahfai2oHaf2ka2M41',      // FromUserName
  sp: 'gh_xmfh2b32tmgkgagsagf',   // ToUserName
  type: '',                       // MsgType
  createTime: new Date(2014-12..) // CreateTime
  text: 'Hi.',                    // when it's a text message
  param: {
    lat: '34.193819105',          // for a "LOCATION" message's Location_X
    lng: '120.2393849201',        // Location_Y
  }
}
 */

router.post('/',(req,res,next)=>{
    let p = req.body;
    switch (p.type){
        case 'event':
            switch (p.param.event){
                case 'subscribe':
                    const handle = async ()=>{
                        try{
                            let token = await getFwhToken();
                            let userInfo = await getUserInfo(token,p.uid);
                            if (userInfo.subscribe === 1){
                                let isUser = await checkIsUser(userInfo.unionid);
                                if(isUser){
                                    // 已经是用户
                                    await updateUser(isUser,p.uid);
                                }else {
                                    // 不是用户
                                    await saveUser(userInfo);
                                }
                            }
                        }catch (err){
                            console.error('===',err)
                        }
                    };
                    handle();
                    res.body = {
                        msgType:'text',
                        content:"⊙▽⊙咦~这都被你发现啦！\n" +
                        "\n" +
                        "欢迎关注【锦时HOME】！想必你也是个拒绝平淡的特别人类吧\n" +
                        "╮(╯▽╰)╭\n" +
                        "\n" +
                        "在这里，不仅有最新奇有趣的日杂良品、最实用方便的家居神器，还有更多超值会员福利等你来领。如果你正想为自己的小家增添乐趣，尽管来锦时挑选心水好物吧！\n" +
                        "\n" +
                        "致敬家庭时光，共享极致好物\n" +
                        "更多精彩内容，点击线上商店"
                    };
                    next();
                    break;
                case 'CLICK':
                    if (p.param.eventKey === 'busness_join_click'){
                        res.body = {
                            msgType:'text',
                            content:"联系方式：\n邮箱：s@yongxin.io\n微信：JinshiHome"
                        };
                        next();
                    }
                    break;
            }
            break;
        // case 'text':
        // 接收到文本消息
        // TODO 对接收到的消息进行处理
        // TODO 对字典遍历，进行indexOf处理
        // TODO 需要对各种各样的客服消息种类进行封装

        //break;
        default:
            // 将用户消息转发到微信客服平台上
            res.body = {
                msgType:'transfer_customer_service',
            };
            next();
            break;
    }
},mp.end());

let sendTemplateMsg = require('../../../utils/sendMsg/fwhTemplateMsg');
router.post('/send-user-balance-change-msg',(req,res,next)=>{
    if (req.body.secret === '199187'){
        if (req.body.fwh_open_id && req.body.balance && req.body.amount){
            res.sendStatus(200);
            let openid = req.body.fwh_open_id;
            let highlight = req.body.msg;
            let time = new Date().toLocaleString();
            let money = req.body.amount;
            let balance = req.body.balance;
            let remark = req.body.remark;
            let wa_page_path = 'page/wallet/wallet';
            let url = 'http://jinshi.life';
            sendTemplateMsg.accountChangeMsg(openid,highlight,time,money,balance,remark,wa_page_path,url);
        }
    }else {
        res.sendStatus(404);
    }
});

router.get('/',(req,res,next)=>{
    let params = req.query;
    let signature = params.signature;
    let timestamp = params.timestamp;
    let nonce = params.nonce;
    let echostr = params.echostr;
    if (signature && timestamp && nonce && echostr){
        let dictA = [consToken,timestamp,nonce];
        dictA = dictA.sort();
        let dict = '';
        for (let i=0;i<dictA.length;i++){
            dict = dict+dictA[i];
        }
        sha1.update(dict);
        let signature2 = sha1.digest('hex');
        if (signature2 === signature){
            res.send(echostr);
        }else {
            res.sendStatus(404);
        }
    }else {
        res.sendStatus(404);
    }
});

module.exports = router;