const axios = require('axios');

let getFwhToken = require('../getToken/getFwhToken');

let sendMsgCore = (body)=>{
    return new Promise((resolve,reject)=>{
        let handle = async ()=>{
            let token = await getFwhToken();
            axios.defaults.headers.post['Content-Type'] = 'application/json';
            axios.post('https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token='+token,body).then((response)=>{
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
    /**
     * @param {String} open_id
     */
    subcribeReply:(open_id)=>{
        let msgBody = {
            "touser":open_id,
            "msgtype":"text",
            "text":
                {
                    "content":"⊙▽⊙咦~这都被你发现啦！\n" +
                    "\n" +
                    "欢迎关注【锦时HOME】！想必你也是个拒绝平淡的特别人类吧\n" +
                    "╮(╯▽╰)╭\n" +
                    "\n" +
                    "在这里，不仅有最新奇有趣的日杂良品、最实用方便的家居神器，还有更多超值会员福利等你来领。如果你正想为自己的小家增添乐趣，尽管来锦时挑选心水好物吧！\n" +
                    "\n" +
                    "致敬家庭时光，共享极致好物\n" +
                    "更多精彩内容，点击线上商店"
                }
        };
        sendMsgCore(msgBody).catch((err)=>{
            console.log(err)
        });
    },
    /**
     * @param {String} open_id
     */
    bdContact:(open_id)=>{
        let msgBody = {
            "touser":open_id,
            "msgtype":"text",
            "text":
                {
                    "content":"联系方式：\n邮箱：s@yongxin.io\n微信：JinshiHome"
                }
        };
        sendMsgCore(msgBody).catch((err)=>{
            console.log(err)
        });
    }
};