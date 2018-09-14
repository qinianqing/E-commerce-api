const Goods = require('../models/Goods');

let good = new Goods();
let last_key = ''

let list = [];

let handle = async ()=>{
    good.getGoodsCMS((err,data)=>{
        last_key = data.LastEvaluatedKey;
        console.log(last_key);
        list = list.concat(data.Items);
        // console.log(list);
        for (let i=0;i<list.length;i++){
            let item = list[i].attrs;
            let goodss = new Goods();
            goodss.goods_id = item.goods_id;
            goodss.op = 'js';
            goodss.updateOp((err,data)=>{
                if (err){
                    console.log(goodss.goods_id,err.message)
                }else {
                    console.log(goodss.goods_id,'成功')
                }
            })
            // goodss.updatePriority((err,data)=>{
            //     if (err){
            //         console.log(goodss.goods_id,err.message)
            //     }else {
            //         console.log(goodss.goods_id,'成功')
            //     }
            // })

        }
    },last_key);

    // while (last_key){
    //     last_key = '';
    //     good.getAllGoodsByScan((err,data)=>{
    //         last_key = data.LastEvaluatedKey;
    //         list = list.concat(data.Items);
    //         console.log(list);
    //         for (let i=0;i<list.length;i++){
    //             let item = list[i].attrs;
    //             let goodss = new Goods();
    //             goodss.goods_id = item.goods_id;
    //             goodss.priority = 1;
    //             goodss.updatePriority((err,data)=>{
    //                 if (err){
    //                     console.log(goodss.goods_id,err.message)
    //                 }else {
    //                     console.log(goodss.goods_id,'成功')
    //                 }
    //             })
    //
    //         }
    //     },last_key)
    // }
};

handle();