const Group = require('../models/GoodsGroup');
const getProduct = require('../interface/getProduct');

/**
 *  @param {string} group_id
 *  @param {number} limit
 *  @param {number} from
 *  @return {promise}
 */

module.exports = (group_id,limit,from)=>{
    // 分流逻辑
    return new Promise((resolve,reject)=>{
        if (!group_id){
            reject({
                error_code:5001,
                error_msg:'缺少组ID'
            });
        }
        let brief = false;
        if (limit){
            brief = parseInt(limit);
        }
        let group = new Group();
        group.id = group_id;
        group.getGroup((err,data)=>{
            if (err){
                reject({
                    error_code:5002,
                    error_msg:err.message
                })
            }
            if (!data){
                reject({
                    error_code:5003,
                    error_msg:'错误ID'
                })
            }
            data = data.attrs;
            let list = [];
            let sourceList = [];// 存储
            let from_ = parseInt(from) || 0;
            if (from_>=data.list.length){
                reject({
                    error_code:5004,
                    error_msg:'超越列表长度'
                })
            }
            let resFrom = 0;
            if (brief){
                for (let i=0;i<brief;i++){
                    if (data.list[i]){
                        if(data.list[i].split('-').length === 2){
                            list.push(data.list[i].split('-')[0]);
                            sourceList.push(data.list[i]);
                        }else {
                            list.push(data.list[i]);
                            sourceList.push(data.list[i]);
                        }
                    }
                }
                resFrom = 0;
            }else {
                if (from_+20>data.list.length){
                    for (let i=from_;i<data.list.length;i++){
                        if (data.list[i]){
                            if(data.list[i].split('-').length === 2){
                                list.push(data.list[i].split('-')[0]);
                                sourceList.push(data.list[i]);
                            }else {
                                list.push(data.list[i]);
                                sourceList.push(data.list[i]);
                            }
                        }
                    }
                    resFrom = 0;
                }else {
                    for (let i=from;i<from+20;i++){
                        if (data.list[i]){
                            list.push(data.list[i]);
                        }
                    }
                    resFrom = from+20;
                }
            }
            // 查询商品数据
            getProduct.get.spusBrief({
                spus:list,
                callback:(resp)=>{
                    if(resp.error_code){
                        reject(resp);
                    }
                    let newList = [];
                    for (let i=0;i<list.length;i++){
                        for (let k=0;k<resp.data.length;k++){
                            if (list[i] === resp.data[k].goods_id){
                                newList[i] = resp.data[k];
                                if (sourceList[i].split('-').length === 2){
                                    newList[i].sku_id = sourceList[i];
                                }else {
                                    newList[i].sku_id = '';
                                }
                            }
                        }
                    }
                    data.list = newList;
                    data.nextFrom = resFrom;
                    resolve({
                        error_code:0,
                        error_msg:'ok',
                        data:data
                    })
                }
            })
        })
    })
};