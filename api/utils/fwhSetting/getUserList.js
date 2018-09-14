const axios = require('axios');

let next_open_id = '';

let list = [];

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

let getUserList = (fwh_access_token)=>{
    return new Promise((resolve,reject)=>{
        axios.get('https://api.weixin.qq.com/cgi-bin/user/get?access_token='+fwh_access_token+'&next_openid='+next_open_id).then((response)=>{
            console.log('total',response.data.total);
            console.log('<<<<<,',response.data.data.openid);
            list = list.concat(response.data.data.openid);
            resolve(response.data.data.next_openid);
        },(err)=>{
            reject(err.message);
        })
    })
};

let getUserInfo = (access_token,open_id)=>{
    return new Promise((resolve,reject)=>{
        axios.get('https://api.weixin.qq.com/cgi-bin/user/info?access_token='+access_token+'&openid='+open_id+'&lang=zh_CN').then((response)=>{
            let data = response.data;
            if (data.errcode){
                reject(response.data.errmsg)
            }
            resolve(data);
        },(err)=>{
            reject(err.message);
        })
    })
};

const User = require('../../service/passport/models/User');

let checkIsUser = (union_id)=>{
    return new Promise((resolve,reject)=>{
        let user = new User();
        user.union_id = union_id;
        user.queryUnionId((err,data)=>{
            if (err){
                reject(err.message)
            }
            if (data.Count === 1){
                resolve(data.Items[0].attrs.user_id);
            }else {
                resolve(0);
            }
        })
    })
};

let saveUser = (d)=>{
    return new Promise((resolve,reject)=>{
        let user = new User();
        user.avatar = d.headimgurl;
        user.user_name = d.nickname;
        user.union_id = d.unionid;
        user.gender = d.sex;
        user.fwh_open_id = d.openid;
        user.createFromFwh((err,data)=>{
            if(err){
                reject(err.message);
            }
            resolve(1);
        })
    })
};

let updateUser = (user_id,open_id)=>{
    return new Promise((resolve,reject)=>{
        let user = new User();
        user.user_id = user_id;
        user.fwh_open_id = open_id;
        user.updateFromFwh((err,data)=>{
            if(err){
                reject(err.message);
            }
            resolve(1);
        })
    })
};

let handle = async ()=>{
    try {
        let token = await getFwhToken();
        next_open_id = 1;
        while (next_open_id){
            next_open_id = '';
            next_open_id = await getUserList(token);
        }
        for (let i=0;i<list.length;i++){
            let userInfo = await getUserInfo(token,list[i]);
            if (userInfo.subscribe === 1){
                let isUser = await checkIsUser(userInfo.unionid);
                if(isUser){
                    // 已经是用户
                    await updateUser(isUser,list[i]);
                }else {
                    // 不是用户
                    await saveUser(userInfo);
                }
            }
        }
    }catch (err){
        console.error(err)
    }
};

handle();