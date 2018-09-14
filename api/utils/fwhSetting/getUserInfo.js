const axios = require('axios');

let openid = 'oXq5Y0k3-JGpZDNiCEUbT7un_1TM';

let getFwhToken = ()=>{
    return new Promise((resolve,reject)=>{
        axios.get('http://task.jiyong365.com/schedule/fwh-access-token').then((response)=>{
            let fwh_access_token = response.data;
            resolve(fwh_access_token);
        },(err)=>{
            reject(err.message);
        })
    })
};

let getUserInfo = (fwh_access_token)=>{
    return new Promise((resolve,reject)=>{
        if (!openid){
            reject('需要open_id')
        }
        axios.get('https://api.weixin.qq.com/cgi-bin/user/info?access_token='+fwh_access_token+'&openid='+openid+'&lang=zh_CN').then((response)=>{
            console.log('<<<',response.data);
            resolve(response.data);
        },(err)=>{
            reject(err.message);
        })
    })
};

let handle = async ()=>{
    try {
        let token = await getFwhToken();
        let userinfo =await getUserInfo(token);
    }catch (err){
        console.error(err)
    }
};

handle();