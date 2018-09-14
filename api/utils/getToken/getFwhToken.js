const axios = require('axios');

module.exports = ()=>{
    return new Promise((resolve,reject)=>{
        axios.get('http://task.jiyong365.com/schedule/fwh-access-token').then((response)=>{
            let wx_access_token = response.data;
            resolve(wx_access_token);
        },(err)=>{
            reject(err.message);
        })
    })
};