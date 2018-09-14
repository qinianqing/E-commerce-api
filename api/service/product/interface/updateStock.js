const Goods = require('../models/Goods');
const WarehoseMapping = require('./getWarehouseMapping');

// 需要的信息包括sku_id和数量

// 批量处理
//去重
function unique(arr){
    let result = [];
    for(let i=0;i<arr.length;i++){
        if(result.indexOf(arr[i])===-1){
            result.push(arr[i])
        }
    }
    return result;
}

let warehouseStockName = '';

let methods = {
    setWarehouseByProvince:(direct,province)=>{
        if (direct){
            warehouseStockName = 'stock';
        }else {
            warehouseStockName = WarehoseMapping[province];
        }
    },
    setWarehouse:(stockName)=>{
        if (stockName === 'stock' || stockName === 'sh_stock' || stockName === 'gz_stock' || stockName === 'cd_stock'){
            warehouseStockName = stockName;
        }
    },
    // 增加库存
    add:(p)=>{
        let list = p.list;
        let g = new Goods;
        let n = 0;
        for (let i=0;i<list.length;i++){
            let spu_id = list[i].sku_id.split('-')[0];
            g.addSkuStock(list[i].sku_id,list[i].num,(err,data)=>{
                n++;
                if (err){
                    console.error('<<<',list[i].sku_id+'/'+list[i].num+'/'+err.message)
                }
                if (n === list.length){
                    p.callback({
                        error_code:0,
                        error_msg:'ok'
                    })
                }
            },warehouseStockName)
        }
    },
    // 扣减库存
    minus:(p)=>{
        let list = p.list;
        let g = new Goods;
        let n = 0;
        for (let i=0;i<list.length;i++){
            let spu_id = list[i].sku_id.split('-')[0];
            g.delSkuStock(list[i].sku_id,list[i].num,(err,data)=>{
                n++;
                if (err){
                    console.error('<<<',list[i].sku_id+'/'+list[i].num+'/'+err.message)
                }
                if (n === list.length){
                    p.callback({
                        error_code:0,
                        error_msg:'ok'
                    })
                }
            },warehouseStockName)
        }
    }
};

module.exports = methods;