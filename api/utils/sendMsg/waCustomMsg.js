const axios = require('axios');

let getWaToken = require('../getToken/getWaToken');

let sendMsgCore = (body)=>{
    return new Promise((resolve,reject)=>{
        let handle = async ()=>{
            let token = await getWaToken();
            axios.defaults.headers.post['Content-Type'] = 'application/json';
            axios.post('https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token='+token,body).then((response)=>{
                if (response.data.errcode){
                    console.error(response.data.errcode);
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
    fwhPage:(open_id)=>{
        let msgBody = {
            "touser":open_id,
            "msgtype":"link",
            "link": {
                "title": "关注锦时HOME公众号",
                "description": "不再丢失任何重要通知",
                "url":"http://mp.weixin.qq.com/s?__biz=MzUyOTAyNzE2Ng==&mid=100000068&idx=1&sn=30bc796bcf5e6c1caeff24a07b9a6264&chksm=7a6618754d1191639f1ed18fa398b574beba1ef0ed69791edb1b7192cef65496b6c5d32695c6#rd",
                // "thumb_url": "https://cdn.jiyong365.com/395124906619167020.jpg"
                "thumb_url": "https://cdn.jiyong365.com/jixiangwu.png"
           }
        };
        // let msgBody = {
        //     "touser":open_id,
        //     "msgtype":"text",
        //     "text": {
        //         "content":"Hello world"
        //     }
        // };
        // let msgBody = {
        //     "touser":open_id,
        //     "msgtype":"image",
        //     "image":
        //         {
        //             "media_id":"Z4nKXRU2VmITkOv-GUgF4TT-1elMeERUEYH_wW2Ly466xrG07o9H2OdCUACYQ-gf"
        //         }
        // };
        sendMsgCore(msgBody).catch((err)=>{
            console.error(err)
        });
    },
};