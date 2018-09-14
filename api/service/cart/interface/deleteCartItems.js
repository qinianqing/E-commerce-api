const Cart = require('../models/Cart');

module.exports = (p)=>{
    // items是object_id列表
    if (!p.user_id||!p.items){
        return p.callback({
            error_code:1001,
            error_msg:'缺少参数'
        })
    }
    let cart = new Cart();
    cart.user_id = p.user_id;
    let n = 0;
    for (let i=0;i<p.items.length;i++){
        cart.object_id = p.items[i];
        cart.deleteItem((err)=>{
            n++;
            if(n === p.items.length){
                return p.callback({
                    error_code:0,
                    error_msg:'ok'
                })
            }
        })
    }
};