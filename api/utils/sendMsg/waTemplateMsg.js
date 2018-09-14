const axios = require('axios');

let getWaToken = require('../getToken/getWaToken');

// 获取form_id
const getFormId = require('../../service/passport/interface/getFormId');
/**
 *  @param {String} user_id
 *  @return {Promise} form_id
 */
let getFormIdFunc = (user_id)=>{
    return new Promise((resolve,reject)=>{
        getFormId({
            user_id:user_id,
            callback:(resp)=>{
                if (resp.error_code){
                    reject(resp);
                }else {
                    resolve(resp.data);// 直接返回form_id
                }
            }
        })
    })
};

// 获取微信小程序用户open_id
const getUserInfo = require('../../service/passport/interface/getUserInfo');
/**
 *  @param {String} user_id
 *  @return {Promise} wa_open_id
 */
let getUserOpenIdFunc = (user_id)=>{
    return new Promise((resolve,reject)=>{
        getUserInfo({
            user_id:user_id,
            callback:(resp)=>{
                if (resp.error_code){
                    reject(resp);
                }else {
                    resolve(resp.data);// 直接返回open_id
                }
            }
        })
    })
};



let sendMsgCore = (user_id,template_id,wa_path,msg_body)=>{
    return new Promise((resolve,reject)=>{
        let handle = async ()=>{
            let token = await getWaToken();
            let open_id = await getUserOpenIdFunc(user_id);
            let form_id = await getFormIdFunc(user_id);
            axios.defaults.headers.post['Content-Type'] = 'application/json';
            axios.post('https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token='+token,{
                touser:open_id,
                template_id:template_id,
                page:wa_path,// 跳转小程序页面
                form_id:form_id,
                data:msg_body,
                emphasis_keyword:'keyword1.DATA'
            }).then((response)=>{
                if (response.data.errcode){
                    reject(response.data.errmsg);
                }else {
                    resolve(1);
                }
            },(err)=>{
                reject(err.message);
            });
        };
        handle();
    })
};

module.exports = {
    // 对模板消息模块进行封装
    /**
     * @param {String} user_id
     * @param {String} member_type
     * @param {String} content
     * @param {String} expiredAt
     */
    buyMember:(user_id,member_type,content,expiredAt)=> {
        let msgBody = {
            "keyword1": {
                "value": member_type,
                "color": "#000000"
            },
            "keyword2": {
                "value": content,
                "color": "#173177"
            },
            "keyword3": {
                "value": expiredAt,
                "color": "#173177"
            }
        };
        let path = 'page/user/mine/mine';
        sendMsgCore(user_id,'fLe5JryGwRFw0mf1lZP3SYH3zSgC_oiVHltFTNo9iUE',path,msgBody).catch((err)=>{
            console.error(err)
        });
    },
    /**
     * @param {String} user_id
     * @param {String} order_id
     * @param {String} total
     */
    payOrder:(user_id,order_id,total)=>{
        let msgBody = {
            "keyword1": {
                "value": order_id,
                "color": "#000000"
            },
            "keyword2": {
                "value": total,
                "color": "#173177"
            },
            "keyword3": {
                "value": "单品返现将于支付后7天充入账户，累计返现将于支付后第二周周一充入账户",
                "color": "#173177"
            }
        };
        let path = 'page/order/detail/detail?order_id='+order_id;
        sendMsgCore(user_id,'Q2EH4KhcJCn60HKqDSFkFW3FGEPiF0pygLtf9irfQrg',path,msgBody).catch((err)=>{
            console.error(err)
        });
    },
    /**
     * @param {String} user_id
     * @param {String} express_id
     * @param {String} express_name
     * @param {String} order_id
     */
    orderDelivery:(user_id,express_id,express_name,order_id)=>{
        let msgBody = {
            "keyword1": {
                "value": express_id,
                "color": "#000000"
            },
            "keyword2": {
                "value": express_name,
                "color": "#173177"
            },
            "keyword3": {
                "value": order_id,
                "color": "#173177"
            },
            "keyword4": {
                "value": "您的家庭补给品已在路上，点击查看物流信息",
                "color": "#173177"
            }
        };
        let path = 'page/order/logistic/logistic?order_id='+order_id;
        sendMsgCore(user_id,'2dNpvxYGyzHXFd4LlC0rYnLcom0tXrseNOSYJ-sbyi0',path,msgBody).catch((err)=>{
            console.error(err)
        });
    },
    /**
     * @param {String} user_id
     * @param {String} express_id
     * @param {String} express_name
     * @param {String} order_id
     */
    subOrderDelivery:(user_id,express_id,express_name,order_id)=>{
        let msgBody = {
            "keyword1": {
                "value": express_id,
                "color": "#000000"
            },
            "keyword2": {
                "value": express_name,
                "color": "#173177"
            },
            "keyword3": {
                "value": order_id,
                "color": "#173177"
            },
            "keyword4": {
                "value": "您的订阅家庭补给品已在路上，点击查看详情",
                "color": "#173177"
            }
        };
        let path = 'page/subscribe/order/detail?id='+order_id;
        sendMsgCore(user_id,'2dNpvxYGyzHXFd4LlC0rYnLcom0tXrseNOSYJ-sbyi0',path,msgBody).catch((err)=>{
            console.error(err)
        });
    },
    /**
     * @param {String} user_id
     * @param {String} express_id
     * @param {String} express_name
     * @param {String} order_id
     */
    orderSign:(user_id,express_id,express_name,order_id)=>{
        let msgBody = {
            "keyword1": {
                "value": express_id,
                "color": "#000000"
            },
            "keyword2": {
                "value": express_name,
                "color": "#173177"
            },
            "keyword3": {
                "value": order_id,
                "color": "#173177"
            },
            "keyword4": {
                "value": "确认收货后7天将为您的家庭结算返现",
                "color": "#173177"
            }
        };
        let path = 'page/order/detail/detail?order_id='+order_id;
        sendMsgCore(user_id,'bcCUDhjQLaJszUaDehzNbYtv9-NhIhxmep1kHa2pwOs',path,msgBody).catch((err)=>{
            console.error(err)
        });
    },
};