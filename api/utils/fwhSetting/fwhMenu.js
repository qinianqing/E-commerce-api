const axios = require('axios');

// TODO 格式构建

let menuBody = {
    "button":[
        {
            "type":"miniprogram",
            "name":"线上商店",
            "url":"http://jinshi.life",
            "appid":"wx4bcc5cb5de9dc705",
            "pagepath":"/page/index/index"
        },
        {
            "name":"ABOUT US",
            "sub_button":[
                {
                    "type":"view",
                    "name":"🏠关于锦时",
                    "url": "http://mp.weixin.qq.com/s?__biz=MzUyOTAyNzE2Ng==&mid=100000057&idx=1&sn=9280596338047c6cea5cecc8fffaab06&chksm=7a6618084d11911e023d6dcd53ac22864a4bd8135e7801afa86d77edf9fbaad6ef448eb9ea01#rd"
                },
                // {
                //     "type":"click",
                //     "name":"☎️商务合作",
                //     "key":"busness_join_click"
                // },
                {
                    "type":"view",
                    "name":"☎️商务合作",
                    "url":"https://jinshuju.net/f/ktckRR"
                },
                {
                    "type":"view",
                    "name":"👏加入我们",
                    "url":"http://mp.weixin.qq.com/s?__biz=MzUyOTAyNzE2Ng==&mid=100000070&idx=1&sn=9dc31811a89dbeb6811d8496b69a2fc3&chksm=7a6618774d11916161d535ee4c64bcfc09a6143efcc951dc899d5ea01b18bd617d181b2dd31f#rd"
                }]
        }]
};

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

let setMenu = (fwh_access_token,body)=>{
    return new Promise((resolve,reject)=>{
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        axios.post('https://api.weixin.qq.com/cgi-bin/menu/create?access_token='+fwh_access_token,body).then((response)=>{
            if (response.data.errcode){
                reject(response.data.errmsg);
            }else {
                resolve('ok');
            }
        },(err)=>{
            reject(err.message);
        });
    })
};

let handle = async ()=>{
    try {
        let token = await getFwhToken();
        await setMenu(token,menuBody);
    }catch (err){
        console.error(err)
    }
};

handle();