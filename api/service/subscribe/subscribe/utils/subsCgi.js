const Wares = require('../models/Subscribe-wares');
let wares = new Wares();

let addSub = ()=>{
    wares.id = String(Date.now());
    wares.show = 1;
    wares.cover = 'https://img0.jiyong365.com/pic1524107476224wic96r0ygt.jpg';
    wares.wares = [{
        id:wares.id+'#0',
        skus:[{
            sku_id:'10028-10000',
            num:2
        },{
            sku_id:'10086-10000',
            num:4
        }],
        limit:3,
        note:'7.7折',
        price:[{
            id:wares.id+'#0#0',
            stages:3,
            price:39,
            vip_price:34
        },{
            id:wares.id+'#0#1',
            stages:6,
            price:38,
            vip_price:33
        },{
            id:wares.id+'#0#2',
            stages:9,
            price:37,
            vip_price:32
        },{
            id:wares.id+'#0#3',
            stages:12,
            price:32,
            vip_price:31
        },]
    },{
        id:wares.id+'#1',
        skus:[{
            sku_id:'10068-10000',
            num:2
        }],
        limit:2,
        note:'7.7折',
        price:[{
            id:wares.id+'#1#0',
            stages:3,
            price:35,
            vip_price:31
        },{
            id:wares.id+'#1#1',
            stages:6,
            price:34,
            vip_price:32
        },{
            id:wares.id+'#1#2',
            stages:9,
            price:32,
            vip_price:33
        },{
            id:wares.id+'#1#3',
            stages:12,
            price:31,
            vip_price:34
        },]
    }];
    wares.list_cover = 'https://img0.jiyong365.com/pic1524107476224wic96r0ygt.jpg';
    wares.title = '测试订阅商品';
    wares.create((err,data)=>{
        if (err){
            console.error(err.message)
        }else {
            console.log('创建成功')
        }
    })
};

let deleteSub = ()=>{
    wares.id = '';
    wares.deleteItem((err)=>{
        if (err){
            console.error(err.message)
        }else {
            console.log('创建成功')
        }
    })
};

const updateSubMap = require('../interface/updateSpuSubsMap');
let addSpuIdMap = ()=>{
    let addIds = ['10028','10068','10086'];
    for (let i=0;i<addIds.length;i++){
        updateSubMap.addId({
            spu_id:addIds[i],
            id:'1525235406455'
        })
    }
};

let deleteSpuIdMap = ()=>{
    let deleteIDs = [];
    for (let i=0;i<deleteIDs.length;i++){
        updateSubMap.deleteId({
            spu_id:deleteIDs[i],
            id:''
        })
    }
};

addSpuIdMap();
//addSub();