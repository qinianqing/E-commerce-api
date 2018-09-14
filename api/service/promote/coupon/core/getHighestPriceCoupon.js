// 获取某个用户/家庭中价格最高的优惠券

const pullCoupon = require('./pullCoupon');

//去重
function unique(arr) {
    let result = [];
    for (let i = 0; i < arr.length; i++) {
        if (result.indexOf(arr[i]) === -1) {
            result.push(arr[i])
        }
    }
    return result;
}


let checkAvaliable = (fit,spus,condition,skus)=>{
    spus = unique(spus);// 去重
    if (fit[0] === '*'){
        return true;
    }else {
        // condition为0，则只要有就可以用
        if (condition === 0){
            let n = 0;
            for (let i=0;i<fit.length;i++){
                for (let k=0;k<spus.length;k++){
                    if (fit[i] === spus[k]){
                        n++;
                        break;
                    }
                }
            }
            if (n>0) {
                return true;
            }else {
                return false;
            }
        }else {
            // condition不为0,则必须要计算总值
            let p = 0;
            for (let i=0;i<fit.length;i++){
                for (let k=0;k<spus.length;k++){
                    if (fit[i] === spus[k]){
                        for (let t=0;t<skus.length;t++){
                            if (skus[t].sku_id.split('-')[0] === spus[k]){
                                p = p+skus[t].price*skus[t].num;
                            }
                        }
                        break;
                    }
                }
            }
            if (p>=condition) {
                return true;
            }else {
                return false;
            }
        }
    }
};

let sku2spu = (skus)=>{
    let spus = [];
    for (let i=0;i<skus.length;i++){
        spus.push(skus[i].sku_id.split('-')[0]);
    }
    return spus;
};

// @param owner_id

let getHighestPriceCoupon = (owner_id,payment,skus,callback) => {
    if (owner_id&&payment){
        let spus = sku2spu(skus);
        pullCoupon(owner_id,0,(resp)=>{
            if (resp.error_code === 0){
                if (resp.data.valid&&resp.data.valid.Count){
                    decending(resp.data.valid.Items);
                    for (let i=0;i<resp.data.valid.Count;i++){
                        let ava = checkAvaliable(resp.data.valid.Items[i].fit,spus,resp.data.valid.Items[i].condition,skus);
                        if (ava){
                            let item = resp.data.valid.Items[i];
                           
                            // 单位是元
                            if (item.condition<=payment&&payment>=item.price){
                                return callback({
                                    error_code:0,
                                    error_msg:'ok',
                                    data:item
                                });
                            }
                        }
                    }
                    return callback({
                        error_code:0,
                        error_msg:'ok',
                        data:''
                    });
                }else {
                    return callback({
                        error_code:0,
                        error_msg:'ok',
                        data:''
                    })
                }
            }else {
                return callback(resp);
            }
        })
    }else {
        return callback({
            error_code:2001,
            error_msg:'缺少owner_id或payment'
        });
    }
};

let decending = (list) => {
    if (list.length) {
    // 按index属性，倒序排列
    const sortFun = (a,b) => {
    return b.amount-a.amount
    };
    return list.sort(sortFun)
        }else{
        return 'need an array'
    }
};

module.exports = getHighestPriceCoupon;