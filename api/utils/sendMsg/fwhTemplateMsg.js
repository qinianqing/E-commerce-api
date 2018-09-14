const axios = require('axios');

let getFwhToken = require('../getToken/getFwhToken');

let sendMsgCore = (body)=>{
    return new Promise((resolve,reject)=>{
        let handle = async ()=>{
            let token = await getFwhToken();
            axios.defaults.headers.post['Content-Type'] = 'application/json';
            axios.post('https://api.weixin.qq.com/cgi-bin/message/template/send?access_token='+token,body).then((response)=>{
                if (response.data.errcode){
                    reject(response.data.errmsg);
                }else {
                    resolve('ok');
                }
            },(err)=>{
                reject(err.message);
            });
        };
        handle();
    })
};

module.exports = {
    // 分流逻辑
    /**
     * @param {String} openid
     * @param {String} highlight
     * @param {String} orderid
     * @param {String} express_brand
     * @param {String} express_id
     * @param {String} remark
     * @param {String} wa_page_path
     * @param {String} url
     */
    deliveryMsg:(openid,highlight,orderid,express_brand,express_id,remark,wa_page_path,url)=> {
        let msgBody = {
            "touser":openid,
            "template_id":"PnhUhr62Pg1iDUKNjtyKf_GeVLMbQY_5ZbHdlOB0Hnk",
            "url":url,
            "miniprogram":{
                "appid":"wx4bcc5cb5de9dc705",
                "pagepath":wa_page_path
            },
            "data":{
                "first": {
                    "value":highlight,
                    "color":"#173177"
                },
                "keyword1":{
                    "value":orderid,
                    "color":"#173177"
                },
                "keyword2": {
                    "value":express_brand,
                    "color":"#173177"
                },
                "keyword3": {
                    "value":express_id,
                    "color":"#173177"
                },
                "remark":{
                    "value":remark,
                    "color":"#173177"
                }
            }
        };
        sendMsgCore(msgBody).catch((err)=>{
            console.error(err)
        });
    },
    /**
     * @param {String} openid
     * @param {String} highlight
     * @param {String} time
     * @param {String} money
     * @param {String} balance
     * @param {String} remark
     * @param {String} wa_page_path
     * @param {String} url
     */
    accountChangeMsg:(openid,highlight,time,money,balance,remark,wa_page_path,url)=>{
        let msgBody = {
            "touser":openid,
            "template_id":"batZyeSGuQuguax6ArcWQ02ECxHacl83FUQQxi62Y0g",
            "url":url,
            "miniprogram":{
                "appid":"wx4bcc5cb5de9dc705",
                "pagepath":wa_page_path
            },
            "data":{
                "first": {
                    "value":highlight,
                    "color":"#173177"
                },
                "keyword1":{
                    "value":time,
                    "color":"#173177"
                },
                "keyword2": {
                    "value":money,
                    "color":"#173177"
                },
                "keyword3": {
                    "value":balance,
                    "color":"#173177"
                },
                "remark":{
                    "value":remark,
                    "color":"#173177"
                }
            }
        };
        sendMsgCore(msgBody).catch((err)=>{
            console.error(err)
        });
    },
    /**
     * @param {String} openid
     * @param {String} highlight
     * @param {String} old_class
     * @param {String} new_class
     * @param {String} remark
     * @param {String} wa_page_path
     * @param {String} url
     */
    vipChangeMsg:(openid,highlight,old_class,new_class,remark,wa_page_path,url)=>{
        let msgBody = {
            "touser":openid,
            "template_id":"hXHJOL7IlpLm7KNnOV18YglYj5voUduRyJ2P6rEqLyc",
            "url":url,
            "miniprogram":{
                "appid":"wx4bcc5cb5de9dc705",
                "pagepath":wa_page_path
            },
            "data":{
                "first": {
                    "value":highlight,
                    "color":"#173177"
                },
                "keyword1":{
                    "value":old_class,
                    "color":"#173177"
                },
                "keyword2": {
                    "value":new_class,
                    "color":"#173177"
                },
                "remark":{
                    "value":remark,
                    "color":"#173177"
                }
            }
        };
        sendMsgCore(msgBody).catch((err)=>{
            console.error(err)
        });
    },
    /**
     * @param {String} openid
     * @param {String} highlight
     * @param {String} orderid
     * @param {String} goods_name
     * @param {String} express_brand
     * @param {String} express_id
     * @param {String} time
     * @param {String} remark
     * @param {String} wa_page_path
     * @param {String} url
     */
    expressRecipt:(openid,highlight,orderid,goods_name,express_brand,express_id,time,remark,wa_page_path,url)=>{
        let msgBody = {
            "touser":openid,
            "template_id":"k6R91YYKfZWUE7VBwNsJjZ7H30PqX2PEyP93E5r2avQ",
            "url":url,
            "miniprogram":{
                "appid":"wx4bcc5cb5de9dc705",
                "pagepath":wa_page_path
            },
            "data":{
                "first": {
                    "value":highlight,
                    "color":"#173177"
                },
                "keyword1":{
                    "value":goods_name,
                    "color":"#173177"
                },
                "keyword2": {
                    "value":orderid,
                    "color":"#173177"
                },
                "keyword3": {
                    "value":express_brand,
                    "color":"#173177"
                },
                "keyword4": {
                    "value":express_id,
                    "color":"#173177"
                },
                "keyword5": {
                    "value":time,
                    "color":"#173177"
                },
                "remark":{
                    "value":remark,
                    "color":"#173177"
                }
            }
        };
        sendMsgCore(msgBody).catch((err)=>{
            console.error(err)
        });
    }
};