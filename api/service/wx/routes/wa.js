const consToken = 'Yongxin12345';
const mp = require('wechat-mp')(consToken);
const router = require('express').Router();

const crypto = require('crypto');
router.use('/',mp.start());

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
const sendCustomMsg = require('../../../utils/sendMsg/waCustomMsg');
router.post('/',(req,res,next)=>{
    let p = req.body;
    switch (p.type){
        case 'text':
        // 接收到文本消息
            if (p.text === '1' || p.text === 1){
                res.send('success');
                sendCustomMsg.fwhPage(p.uid);

                // res.body = {
                //     msgType: 'image',
                //     content: {
                //         mediaId:''
                //     }
                // };
                // setTimeout(()=>{
                // },500);
                // next();
            }else {
                // 将用户消息转发到微信客服平台上
                res.body = {
                    msgType:'transfer_customer_service',
                };
                next();
            }
        break;
        default:
            // 将用户消息转发到微信客服平台上
            res.body = {
                msgType:'transfer_customer_service',
            };
            next();
    }

},mp.end());


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