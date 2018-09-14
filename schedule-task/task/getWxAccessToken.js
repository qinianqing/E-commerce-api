const axios = require('axios');
const qs = require('querystring');
const { wxpayParams } = require('../config');

let token = '';

module.exports = {
    fetch:()=>{
        axios.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+wxpayParams.WEIXIN_APPID+'&secret='+wxpayParams.WEIXIN_SECRET).then((resp)=>{
            token = resp.data.access_token;
        }).catch((err)=>{
            console.log(err.message);
        })
    },
    token:()=>{
        return token;
    }
};