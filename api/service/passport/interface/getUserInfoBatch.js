const User = require('../models/User');

// 去重方法
function unique(arr){
    let result = [];
    for(let i=0;i<arr.length;i++){
        if(result.indexOf(arr[i]) === -1){
            result.push(arr[i])
        }
    }
    return result;
}

module.exports = (p)=> {
    if (!p.users){
        return p.callback({
            error_code:5002,
            error_msg:'缺少参数'
        })
    }
    let users = unique(p.users);
    let user = new User();
    user.getUsers(users,(err,resp)=>{
        if (err){
            return p.callback({
                error_code:5003,
                error_msg:err.message
            })
        }
        let items = [];
        for (let i=0;i<resp.length;i++){
            // 构造返回的数据结构
            let u = resp[i].attrs;
            let userItem = {
                user_id:u.user_id,
                avatar:u.avatar,
                user_name:u.user_name,
                gender:u.gender,// 1是男
            };
            items.push(userItem);
        }
        p.callback({
            error_code:0,
            error_msg:'ok',
            data:items
        })
    })
};