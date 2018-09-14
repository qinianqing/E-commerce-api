let axios = require('axios');
let getWxAccessTokenFunc = () => {
    return new Promise((resolve, reject) => {
        axios.get('http://task.jiyong365.com' + '/schedule/wx-access-token').then((response) => {
            let wx_access_token = response.data;
            resolve(wx_access_token);
        }, (err) => {
            reject(err.message);
        })
    })
};
let a = async()=>{
  console.log(await getWxAccessTokenFunc())  
}
console.log(a())

