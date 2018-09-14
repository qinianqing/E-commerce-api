const router = require('express').Router();
const DB = require('../models/Common');
const sort = require('../utils/utils');

let getGroup = require('../../product/interface/getGoodsGroup');

// 构造ES客户端
const AWS = require('aws-sdk');
// 配置es客户端
const options = {
    host:['https://search-se-jinshi-capoiecpteku4kivjhdxtp3nr4.cn-northwest-1.es.amazonaws.com.cn'],
    connectionClass: require('http-aws-es'),
    awsConfig:new AWS.Config({
        region:'cn-northwest-1',
        credentials: new AWS.Credentials('AKIAPQWLZ4KQYR7HGJ3Q','gcrf3r9jtZNCc47oBzin54wmWOHozmAl7dy/bGO2')
    }),
};
const es = require('elasticsearch').Client(options);

router.get('/guess',(req,res,next)=>{
    // 向ES服务发起请求
    const size = 16;
    es.search({
        index:'product',
        type:'goods',
        body:{
            "query": {
                "bool":{
                    "must":[
                        {
                            "term":
                                {"show":true}
                        },
                        {
                            "term":{
                                "direct":false
                            }
                        }
                    ]
                }
            },
            "sort":{
                "_script":{
                    "script":"Math.random()",
                    "type":"number",
                    //"params":{},
                    "order":"asc"
                }
            }
        },
        size:size,
        from:parseInt(req.query.from),
    },(err,resp)=>{
        if (err){
            res.send({
                error_code:5001,
                error_msg:err
            })
        }else {
            res.send({
                error_code:0,
                error_msg:'ok',
                data:resp.hits
            })
        }
    })
});

/*

    banners数据类型
    [
  {
    pic: 'https://cdn.jiyong365.com/1S.png',
    type: 0,// 0为网址
    content: 'https://www.baidu.com'// 微信小程序后台备案域名下的网页
  },
  {
    pic: 'https://cdn.jiyong365.com/1S.png',
    type: 1,// 1为小程序页面地址
    content: '/page/user/mine/mine'// 前面需要带/
  },
  {
    pic: 'https://cdn.jiyong365.com/1S.png',
    type: 2,// 2为具体商品
    content: '10018'// 商品ID（spu_id/goods_id）
  },
  {
    pic: 'https://cdn.jiyong365.com/1S.png',
    type: 3,// 3为商品组聚合
    content: '1999100344'// 商品组ID
  },
    {
    pic: 'https://cdn.jiyong365.com/1S.png',
    type: 4,// 4为订阅商品页
    content: '1999100344'// 订阅商品ID
  },
]

  // 单个subject item数据类型

  type: 4,
  title: '理想之家',
  focus: '理想之家是什么样子',
  content: [],
  cover: '',
  group_id:'1234567',
  list: [{
    default_image: "https://img0.jiyong365.com/pic1524135256930bdn1prys1bm.jpg",
    describe: "便携代餐银耳羹 不炖也能出胶",
    discount_price: "42",
    goods_cashback: "3.3",
    goods_id: "10113",
    goods_name: "方家铺子红枣枸杞银耳汤",
    goods_price: "32.9",
    level3_id: ["15175763530209094622fd525407bb136931e20d827d9"],
    show: true,
    tag: ["爆品"],
  }]
 */

let groupData = '';
let groupIds = '';

router.get('/', (req,res,next) => {
    // 获取banner
    // 获取商品组
    // 再从商品组获取消息
    let db = new DB();
    db.getBanners((err,data) => {
        if (err) {
            return res.send({
                error_code:5001,
                error_msg:err.message
            })
        }
        if (data.Count === 0) {
            return res.send({
                error_code:5002,
                error_msg:'no data'
            })
        }
        let list = [];
        for(let i=0;i<data.Count;i++){
            let item = data.Items[i].attrs.banner;
            item.index = data.Items[i].attrs.index;
            list.push(item)
        }
        let bannerList = sort.ascending(list);
        // 返回正向排序的数据
        db.getIndexSubs((err,subData)=>{
            if (err){
                return res.send({
                    error_code:5003,
                    error_msg:err.message
                })
            }
            let subL = [];
            for(let i=0;i<subData.Count;i++){
                let item = subData.Items[i].attrs.subject;
                item.index = subData.Items[i].attrs.index;
                subL.push(item)
            }
            if (subL.length){
                subL = sort.ascending(subL);
            }
            let subString = '';
            for (let i = 0;i<subL.length;i++){
                subString = subString + subL[i].index;
                if (subL[i].group_id){
                    subString = subString + subL[i].group_id;
                }
            }
            if (subString === groupIds){
                res.send({
                    error_code:0,
                    error_msg:'ok',
                    data:{
                        banner:bannerList,
                        subject:groupData
                    }
                })
            }else {
                groupIds = subString;
                let getGroupMsg = async ()=>{
                    for(let i=0;i<subL.length;i++){
                        if (subL[i].type === 0){

                        }
                        if (subL[i].type === 1){
                            let g = await getGroup(subL[i].group_id,5,0);
                            g = g.data;
                            subL[i].list = g.list;
                            subL[i].title = subL[i].rec_name||g.title;
                            subL[i].group_title = g.title;
                            subL[i].list_cover = g.list_cover;
                            subL[i].focus = subL[i].rec_focus||g.focus;
                            subL[i].cover = subL[i].cover || g.cover || g.list_cover;
                            subL[i].describe = subL[i].describe || g.describe;
                        }
                        if (subL[i].type === 2 || subL[i].type === 3){
                            let g = await getGroup(subL[i].group_id,10,0);
                            g = g.data;
                            subL[i].list = g.list;
                            subL[i].title = subL[i].rec_name||g.title;
                            subL[i].group_title = g.title;
                            subL[i].list_cover = g.list_cover;
                            subL[i].focus = subL[i].focus||g.focus;
                            subL[i].cover = subL[i].cover || g.cover || g.list_cover;
                            subL[i].describe = subL[i].describe || g.describe;
                        }
                        if (subL[i].type === 4){
                            let g = await getGroup(subL[i].group_id,4,0);
                            g = g.data;
                            subL[i].list = g.list;
                            subL[i].title = subL[i].rec_name||g.title;
                            subL[i].group_title = g.title;
                            subL[i].list_cover = g.list_cover;
                            subL[i].focus = subL[i].focus||g.focus;
                            subL[i].cover = subL[i].cover || g.cover || g.list_cover;
                            subL[i].describe = subL[i].describe || g.describe;
                        }
                        if (subL[i].type === 5){
                            let g = await getGroup(subL[i].group_id,2,0);
                            g = g.data;
                            subL[i].list = g.list;
                            subL[i].title = subL[i].rec_name||g.title;
                            subL[i].group_title = g.title;
                            subL[i].list_cover = g.list_cover;
                            subL[i].focus = subL[i].focus||g.focus;
                            subL[i].cover = subL[i].cover || g.cover || g.list_cover;
                            subL[i].describe = subL[i].describe || g.describe;
                        }
                    }
                    groupData = subL;
                    res.send({
                        error_code:0,
                        error_msg:'ok',
                        data:{
                            banner:bannerList,
                            subject:subL
                        }
                    })
                };
                getGroupMsg();
            }
        })
    });
});

module.exports = router;