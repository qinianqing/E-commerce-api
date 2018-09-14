const Family = require('../models/Family');

let last_key1 = 1;
let last_key2 = 1;

const updateFamily = (user_id,family_id)=>{
    return new Promise((resolve,reject)=>{
        let f = new Family();
        f.user_id = user_id;
        f.family_id = family_id;
        f.vip = 0;
        f.vip_expiredAt = -1;
        f.updateFamilyVipStatus((err,data)=>{
            if (err){
                console.error('更新家庭错误',err.message);
            }
            resolve(1);
        })
    })
};

const getFamily = (status,last_key)=>{
    return new Promise((resolve,reject)=>{
        let family = new Family();
        family.getFamilyByVipStatusExpired(status,(err,data)=>{
            if (err){
                console.log(err.message)
            }
            if(data.LastEvaluatedKey){
                last_key = data.LastEvaluatedKey;
            }else {
                last_key = '';
            }
            let go = async ()=>{
                for (let i=0;i<data.Count;i++){
                    await updateFamily(data.Items[i].attrs.user_id,data.Items[i].attrs.family_id);
                }
                resolve(last_key);
            };
            go();
        },last_key);
    })
};

module.exports = () => {
    // 获取家庭
    // 处理试用
    const goHandle = async ()=>{
        while (last_key1){
            last_key1 = '';
            // 检索家庭
            last_key1 = await getFamily(1,last_key1);
        }
        // 处理正式
        while (last_key2){
            last_key2 = '';
            last_key2 = await getFamily(2,last_key2);
        }
    };
    goHandle();
};