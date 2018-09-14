const Cart = require('../models/Cart');

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

module.exports = (p)=>{
    // items是object_id列表
    if (!p.items){
        return p.callback({
            error_code:1001,
            error_msg:'缺少参数'
        })
    }
    let items = unique(p.items);
    let cart = new Cart();
    cart.getCartItems(items,(err,data)=>{
        if (err){
            return p.callback({
                error_code:1002,
                error_msg:err.message
            })
        }
        p.callback({
            error_code:0,
            error_msg:'ok',
            data:data
        })
    })
};