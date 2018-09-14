## 锦时API                                                  

### 注意事项

* **上线前需要更新dynamoDB和endpoint地址**

* **完善文档须按照service结构写清接口和表结构，每个表单独维护，不可重复出现,最好写清楚开发人员**

* **开发新功能all都在北京区建表，吞吐量都为1，测完，再在宁夏区建表，上线（压缩命令： zip ../API.zip -r * .[^.]*）**

* ```js
   .
   ├── Dockerfile //docker配置文件
   ├── README.md //代码注释
   ├── app.js //核心全局配置文件
   ├── bin //多线程启动 
   │   ├── run.js
   │   ├── start.js
   │   └── syncGoods2P.js
   ├── build //aws环境部署
   │   ├── deloy.js
   │   └── preview.js
   ├── config.js //锦时环境
   ├── node_modules //模块
   ├── package-lock.json 
   ├── package.json //node 模块版本信息
   ├── public //静态文件
   │   ├── image
   │   └── stylesheets
   │       └── style.css
   ├── router.js //总路由
   ├── utils //工具
   │   ├── fwhSetting //客服
   │   │   ├── fwhMenu.js
   │   │   ├── getUserInfo.js
   │   │   └── getUserList.js
   │   ├── getToken //得到token
   │   │   ├── getFwhToken.js
   │   │   └── getWaToken.js
   │   ├── getUniqueId.js
   │   ├── qrCode //得到微信小程序二维码
   │   │   ├── config.js
   │   │   └── createWaQrcode.js
   │   ├── sendMsg //发送消息
   │   │   ├── fwhCustomMsg.js
   │   │   ├── fwhTemplateMsg.js
   │   │   ├── waCustomMsg.js
   │   │   └── waTemplateMsg.js
   │   └── xml2js //xml2js文件
   │   │   ├── json2xml.js
   │   │   └── xml2json.js
   │   └──service //各个模块
   └── views
       ├── error.pug
       └── layout.pug
   ```

* ```js
   .
   ├── cart
   │   ├── cartRouter.js //路由分发
   │   ├── config.js //每个服务自己单独的配置
   │   ├── interface //公用接口
   │   │   ├── addCart.js
   │   │   ├── deleteCartItems.js
   │   │   └── getCartItems.js
   │   ├── models //表
   │   │   └── Cart.js
   │   ├── plugin
   │   │   └── product.js
   │   ├── routes //页面路由
   │   │   ├── cart.js
   │   │   └── checkPrice.js
   │   └── utils //工具
   │       └── utils.js
   ├── category
   │   ├── categoryRouter.js
   │   ├── config.js
   │   ├── models
   │   │   └── Category.js
   │   └── routes
   │       └── category.js
   ├── evaluate
   │   ├── config.js
   │   ├── evaluateRouter.js
   │   ├── interface
   │   │   └── getSpuEvaCount.js
   │   ├── models
   │   │   └── Evaluation.js
   │   └── routes
   │       └── evaluate.js
   ├── family
   │   ├── config.js
   │   ├── familyRouter.js
   │   ├── interface
   │   │   ├── getFamily.js
   │   │   ├── getFamilyCR.js
   │   │   ├── queryFamilyByUserId.js
   │   │   ├── updateFamilyBalance.js
   │   │   └── updateFamilyFromMember.js
   │   ├── models
   │   │   ├── AccessRisk.js
   │   │   ├── ActiveCode.js
   │   │   └── Family.js
   │   ├── routes
   │   │   ├── active_code.js
   │   │   ├── family.js
   │   │   ├── member.js
   │   │   └── reward.js
   │   └── utils
   │       └── utils.js
   ├── invite
   │   ├── config.js
   │   ├── interface
   │   │   ├── creatInvite.js
   │   │   ├── createAct.js
   │   │   └── updateAct.js
   │   ├── inviteRouter.js
   │   ├── models
   │   │   ├── Act.js
   │   │   └── Invite.js
   │   ├── routers
   │   │   └── invite.js
   │   └── utils
   │       └── utils.js
   ├── order
   │   ├── config.js
   │   ├── interface
   │   │   ├── addBuyRecord.js
   │   │   ├── addBuyRecordWithoutCB.js
   │   │   ├── getOnesWeekConsume.js
   │   │   ├── getOrder.js
   │   │   └── updateOrderByPay.js
   │   ├── models
   │   │   ├── BuyRecord.js
   │   │   ├── Order.js
   │   │   └── ReverseOrder.js
   │   ├── orderRouter.js
   │   ├── routes
   │   │   ├── order.js
   │   │   └── reverse.js
   │   └── utils
   │       └── utils.js
   ├── page
   │   ├── config.js
   │   ├── models
   │   │   └── Common.js
   │   ├── pageRouter.js
   │   ├── routes
   │   │   ├── banner.js
   │   │   ├── category.js
   │   │   ├── guess.js
   │   │   ├── hot-search.js
   │   │   ├── qa.js
   │   │   ├── rec.js
   │   │   └── wa_index.js
   │   └── utils
   │       └── utils.js
   ├── passport
   │   ├── SDK
   │   │   └── passport.js
   │   ├── config.js
   │   ├── interface
   │   │   ├── addFormIdByPay.js
   │   │   ├── getFormId.js
   │   │   ├── getUserInfo.js
   │   │   ├── getUserInfoBatch.js
   │   │   ├── getUserInfoCR.js
   │   │   ├── setUserTried.js
   │   │   ├── updateUserBalance.js
   │   │   └── verifyToken.js
   │   ├── models
   │   │   └── User.js
   │   ├── passportRouter.js
   │   ├── routes
   │   │   ├── login.js
   │   │   ├── token.js
   │   │   └── user.js
   │   └── utils
   │       └── WXBizDataCrypt.js
   ├── pay
   │   ├── config.js
   │   ├── core
   │   │   ├── payMemberCallback.js
   │   │   ├── payOrderCallback.js
   │   │   └── paySubscribeCallback.js
   │   ├── models
   │   │   └── PayOrder.js
   │   ├── payRouter.js
   │   ├── routes
   │   │   └── wechat.js
   │   └── utils
   │       ├── apiclient_cert.p12
   │       ├── getTime.js
   │       ├── getWeekSign.js
   │       ├── wxpay.js
   │       └── wxpayUtils.js
   ├── product
   │   ├── SDK
   │   │   ├── goods_group.js
   │   │   └── product.js
   │   ├── config.js
   │   ├── interface
   │   │   ├── getGoodsGroup.js
   │   │   ├── getProduct.js
   │   │   ├── getWarehouseMapping.js
   │   │   ├── updateStock.js
   │   │   └── updateStockSku.js
   │   ├── models
   │   │   ├── Sku.js
   │   │   ├── Brand.js
   │   │   ├── Goods.js
   │   │   └── GoodsGroup.js
   │   ├── productRouter.js
   │   ├── routes
   │   │   ├── brand.js
   │   │   ├── group.js
   │   │   ├── inner.js
   │   │   ├── member.js
   │   │   ├── product.js
   │   │   ├── sku.js
   │   │   └── space.js
   │   └── utils
   │       ├── passport.js
   │       └── updatePriorityBatch.js
   ├── promote
   │   ├── coupon
   │   │   ├── SDK
   │   │   │   ├── coupon.js
   │   │   │   └── syncGoods2P.js
   │   │   ├── config.js
   │   │   ├── core
   │   │   │   ├── getHighestPriceCoupon.js
   │   │   │   ├── pullCoupon.js
   │   │   │   ├── pushCoupon.js
   │   │   │   └── updateCoupon.js
   │   │   ├── interface
   │   │   │   ├── activeCoupon.js
   │   │   │   ├── checkCouponAvilable.js
   │   │   │   ├── checkOnesFscOK.js
   │   │   │   ├── getCoupon.js
   │   │   │   ├── getFscValidNum.js
   │   │   │   └── useCoupon.js
   │   │   ├── models
   │   │   │   ├── Coupon-code.js
   │   │   │   ├── Coupon-template.js
   │   │   │   └── Coupon-wallet.js
   │   │   ├── router.js
   │   │   └── routes
   │   │       ├── code.js
   │   │       ├── get.js
   │   │       ├── template.js
   │   │       ├── use.js
   │   │       └── wallet.js
   │   └── promoteRouter.js
   ├── schedule
   │   ├── config.js
   │   ├── interface
   │   │   ├── cancelSchedule.js
   │   │   ├── createSchedule.js
   │   │   └── getScheduleByContent.js
   │   └── models
   │       └── Schedule.js
   ├── search
   │   ├── routes
   │   │   └── search.js
   │   └── searchRouter.js
   ├── subscribe
   │   ├── collect
   │   │   ├── interface
   │   │   │   ├── getOnesCollect.js
   │   │   │   └── getSpuSomeoneWhetherCollect.js
   │   │   ├── models
   │   │   │   └── Collect.js
   │   │   └── routes
   │   │       └── collect.js
   │   ├── config.js
   │   ├── subcribeRouter.js
   │   └── subscribe
   │       ├── SDK
   │       │   └── subscribe.js
   │       ├── interface
   │       │   ├── checkSpuSubscribeOrNot.js
   │       │   ├── createSubsOrder.js
   │       │   ├── getSpuSubsBrief.js
   │       │   ├── getSubsWaresDetail.js
   │       │   └── updateSpuSubsMap.js
   │       ├── models
   │       │   ├── Subscribe-order.js
   │       │   ├── Subscribe-package.js
   │       │   ├── Subscribe-spu-map.js
   │       │   └── Subscribe-wares.js
   │       ├── routes
   │       │   ├── index.js
   │       │   ├── order.js
   │       │   ├── package.js
   │       │   └── wares.js
   │       └── utils
   │           ├── subsCgi.js
   │           └── utils.js
   ├── wallet
   │   ├── config.js
   │   ├── interface
   │   │   ├── addAccountBill.js
   │   │   └── getWeekTotalCB.js
   │   ├── models
   │   │   └── Account.js
   │   ├── routes
   │   │   ├── family.js
   │   │   └── user.js
   │   └── walletRouter.js
   └── wx
       ├── routes
       │   ├── fwh.js
       │   └── wa.js
       └── wxServiceRouter.js
   ```


   ```
一、数据库瓶颈
数据库吞吐及容量分析方法：
1、列出每个接口完整调用一次的预计容量单位
2、1分钟内该请求可能出现的次数
3、累加总计需要的容量单位除以60
4、综合用到该表的预置负载
5、除以70%就为预制负载，突然保证流量由auto scaling来控制

数据库表设计要求：
1、读取密集表，单条Item不要超过4KB
2、写密集表，单条Item不要超过1KB
3、query尽量返回最少的数据（用更细条件），batchGet需要的时候才用，不用scan
注意：1KB与4KB读取所需成本相同，4KB的写入的成本是读取的20倍

系统压力极点：
1、js_user表
正常流程一定调用
2、js_goods表
接口引用频繁，单条数据大

计算QPS、并发、平均连接时长：
QPS = 日活跃用户数*用户平均接口数/访问集中小时数*60
并发 = QPS/平均连接时长(s)

应对高峰流量方案：
1、配置合理容量
根据用户活跃情况/打开次数，预计系统平均负载QPS，并对数据库表容量做预置
2、减少auto scaling时间防止服务中断
在合理容量的前提下，响应时间和红线百分比在尽量减少以防止突发流量，做到合理配置

二、服务器瓶颈
1、服务器实例采用高性能M4实例
2、EB不能预先配置多实例，只能通过auto scaling从机器池子内不断取机器
3、设置好auto scaling，防止突发高峰容量
4、提高系统性能提高单机QPS极限

   ```
    ```
    购物车服务
    
    服务容量指标：
    预计峰值QPS：10q/s（预设所有接口都是10）
    购物车平均SPU数:5（预计，待统计）
    购物车平均SKU数:10 (预计，待统计)
    不需要CR
    js_cart单条0.2KB
    js_goods单条小于4KB
    js_family单条0.4KB(最多有3个家庭)
    js_coupon_wallet单条0.4KB（平均免邮券数预计为20，待统计）
    
    接口数：8
    
    读极点接口为 /cart/list /cart/check/price /cart/check/notice(query coupon)
    写极点接口为 /clear-invalid
    
    一次请求占用：
    
    POST /cart/add    // 添加购物车 
    query(js_cart) get(js_cart) get(js_goods) update/create(js_cart)
    js_goods读：1（js_sku，下一版本）
    js_cart读：最大3
    js_cart写：1
    
    POST /cart/update// 修改购物车条目
    query(js_cart) get(js_cart) get(js_goods) update(js_cart)
    js_goods读：1（js_sku，下一版本）
    js_cart读：最大3
    js_cart写：1
    
    GET  /cart/list        // 获取购物车列表 
    query(js_cart) batchGet(js_goods)
    js_goods读：最大99
    js_cart读：最大2.5
    
    POST /cart/clear-invalid // 清空时效购物车 
    query(js_cart) batchGet(js_goods) for delete(js_cart)
    js_goods读：最大99
    js_cart读：最大2.5
    js_cart写：最大99
    
    GET  /cart/skus-by-spu // 获取spu下所有sku 
    get(js_goods)
    js_goods读：0.5
    
    POST /cart/delete       // 删除购物车条目
    delete(js_cart)
    js_cart写：1
    
    POST /cart/check/price   //获取购物车商品总价 
    batchGet(js_cart) batchGet(js_goods)
    js_goods读：最大99
    js_cart读：最大99
    
    POST /cart/check/notice  //获取购物车提醒 
    query(js_family) query(js_coupon_wallet) update(js_coupon_wallet)
    js_family读：0.5
    js_coupon_wallet读：1
    js_coupon_wallet写：最大10
    
    GET  /cart/check/week-consume //获取当周的总商品消费额和notice内容 废弃
    POST /cart/check/tcb     //提供一个价格，提供总返现数据 废弃
    GET  /cart/check/aging  //订单时效
    GET  /cart/check/warehouse-mapping  //获取收货省份和发货仓的对应关系
    POST /cart/check/direct/check/  // 直发算价 batchGet(js_carts) batchGet(js_goods)
    ```


​    

  * **js_cart(购物车)**

    ```Js
    读写压力平衡
    
    user_id:Joi.string(),        //用户ID（分区键）
    object_id:Joi.string(),       //购物车唯一标识(排序键)
    sku_id:Joi.string(),      //商品sku ID 
    spu_id:Joi.string(),         //商品spu ID 
    num:Joi.number(), //加入购物车商品数量
    ```


* **Category**
    ```
    服务容量指标：
    预计峰值QPS：10q/s（预设所有接口都是10）
    js_category单条0.2KB，无CR读取，写入少
    接口数：3
    
    读极点接口为 /category/get_peerid
    
    一次请求占用：
    
    POST /category/create-category   //录入Category数据 
    create(js_category)
    js_category写：1
    
    GET  /category/child_category    //输入一个类目ID返回子类目 
    query(js_category parentIdIndex)
    js_category读：0 parentIdIndex:0.5
    js_category写：0
    
    GET  /category/get_peerid        //请求同级id，返回同级 
    get(js_category) query(js_category parentIdIndex)
    js_category读：0.5 parentIdIndex:0.5
    js_category写：0
    
    GET  /category/get_goods         //数据来自搜索引擎
    ```

  * **js_category(商品分类)**

    ```js
    读集中，写极少
    
    id:Joi.string(),             //分类子id (分区键)
    name:Joi.string(),          //分类名
    level:Joi.number(),      //分类级别
    parent_id:Joi.string()      //分类父级id
    cover:Joi.string()//分类占位图
    ```

* **Family**
  ```
  服务容量指标：
  预计峰值QPS：10q/s（预设所有接口都是10）
  js_family单条0.4KB(最多有3个家庭)，无CR读取，写入较读少
  js_coupon_wallet单条0.4KB（平均免邮券数预计为20，待统计）
  
  接口数：6
  
  一次请求占用：
  
  POST  /family/member/try      //人和家庭需要同时没有试用过才可以 
  get(js_user) query(js_family) create(js_coupon_wallet)
  js_family读：0.5
  js_family写：0
  js_user读：0.5
  js_user写：0
  js_coupon_wallet读：1
  js_coupon_wallet写：4
  
  POST /family/create          //创建一个家庭信息 
  query(js_family) create(js_family)
  js_family读：0.5
  js_family写：1
  
  POST /family/update          //更新一个家庭基本信息,除default以外 
  get(js_family) update(js_family)
  js_family读：0.5
  js_family写：1
  
  POST /family/check-tried     //查看用户或者家庭有一个试用过就显示试用过 
  query(js_family) get(js_user)
  js_family读：0.5
  js_family写：0
  js_user读：0.5
  js_user写：0
  
  GET  /family/list            //更新family状态，可以做在任务里
  query(js_family) query(js_coupon_wallet) query(js_coupon_wallet)
  js_family读：0.5
  js_family写：0
  js_coupon_wallet读：1
  js_coupon_wallet写：4
  
  GET  /family/                //获取指定家庭信息
  get(js_family)
  js_family读：0.5
  js_family写：0
  
  以下接口未使用
  GET  /family/member/price    //当前年度会员零售价
  GET  /family/default         ///获取默认家庭
  POST /family/set-default     //将家庭置为默认家庭          
  ```

     * **js_family(家庭基本信息)**

       ```js
        user_id:Joi.string(),  //创建家庭人信息(分区键 )
        family_id:Joi.string(), //家庭Id(排序键)
        name:Joi.string(), //家庭name
        default:Joi.number(), //是否是默认家庭
        address:Joi.string(),// 1是男
        contact:Joi.string(), // 姓名
        phone:Joi.string(), //电话
        province:Joi.string(), //省份
        city:Joi.string(), //城市
        county:Joi.string(), //镇
        remark:Joi.string(), //备注
        vip:Joi.number(),// 0非会员，1正式会员，2试用会员
        vip_expiredAt:Joi.number(), // vip 时间
        tried:Joi.number(),// 0，没有试用过，1，试用过
        members:Joi.object(),//家庭成员
        balance:Joi.number()// 家庭储值额度
       ```

     * **js_active_code(会员码激活)**

       ```js
        active_code:Joi.string(),//会员激活码
        cyc:Joi.number(), // 周期
        batch:Joi.string(),// 激活码批次
        type:Joi.number(),// 位数
        status:Joi.string(),// OK、USED、CANCELED
        user_id:Joi.string(),//用户Id
        ip:Joi.string(),//电脑地址 ip 
        active_date:Joi.string(),//参加时间
        purpose:Joi.string()// 标明用途
       ```

     * **js_access_risk(会员激活码mapping)**

        ```js
        path:Joi.string(), // 获得会员码的途径
        user_id:Joi.string(), //获得码的人
        object_id:dynogels.types.uuid(), //唯一Id
        ip: Joi.string() //唯一ip
        ```

* **Invite**

  ```
  服务容量指标：
  预计峰值QPS：10q/s（预设所有接口都是10）
  js_invite单条0.25KB，无CR读取，写入较读少
  js_act单条0.2KB
  js_invite InviteIndex
  
  接口数：13
  
  一次请求占用：
  
  POST /wx/invite/create         //创建邀请信息
  query(js_invite) query(js_invite) update(js_invite) 
  js_invite读：1
  js_invite写：1
  
  POST /wx/invite/create/old     //老用户
  create(js_invite) 
  js_invite写：1
  
  GET  /wx/invite/ranking        //获得排行榜
  query(js_invite) batchGet(js_user)
  js_invite读：0.5
  js_user读：0.5*项目数(最多10)
  
  GET  /wx/invite/myself         //我的邀请
  query(js_invite) batchGet(js_user)
  js_invite读：0.5
  js_user读：0.5*项目数(最大10)
  
  GET  /wx/invite/random/coupon  //拼手气红包
  get(js_coupon_template) create(js_coupon_wallet) query(js_invite) 
  js_coupon_template读：0.5
  js_coupon_wallet写：1
  js_invite读：0.5
  
  GET  /wx/invite/new/coupon     //创建一个新人红包
  get(js_coupon_template) create(js_coupon_wallet)
  js_coupon_template读：0.5
  js_coupon_wallet写：1
  
  GET  /wx/invite/check/same     //朋友手气
  query(js_invite)
  js_invite读：0.5
  
  GET  /wx/invite/day/coupon     //得到某用户一天得到的拼手气红包
  query(js_coupon_wallet)
  js_coupon_wallet读：0.5
  
  GET  /wx/invite/money/ranking  //得到某一红包排行
  query(js_invite) batchGet(js_user)
  js_invite读：0.5
  js_user读：0.5*项目数(最大5)
  
  GET  /wx/invite/coupon/num     //分享10人后，发5元现金券
  query(js_invite) 
  js_invite读：0.5
  
  GET  /wx/invite/act/list       //福利列表
  query(js_act)
  js_act读：0.5
  
  GET  /wx/invite/get/act/num    //拼手气红包数量
  query(js_invite) get(js_act) create(js_schedule) create(js_account) update(js_act)
  js_invite读：0.5
  js_act读：0.5
  js_schedule写：1
  js_account写：1
  js_act写：1
  
  GET  /wx/invite/send/user/num  //发券人红包数量
  query(js_invite) 
  js_invite读：0.5
  
  POST /wx/invite/get/wx_code    //获取小程序二维码,并加上经过base64转码加七牛云水印
  ```

  ​

  * **js_invite(邀请好友)**

    ```js
     object_id: Joi.string(), //作为全局索引查询的分区键,value固定,查询是否是排行榜
     user_id: Joi.string(), //邀请人用户ID
     invite_user: Joi.string(), //被邀请用户ID
     invite_num: Joi.number(), //邀请用户数量
     invite_history: Joi.string(), //邀请用户历史
     order_id:Joi.string(),
     invite_money:Joi.number()
    ```


* **Evaluate**

  ```
  服务容量指标：
  预计峰值QPS：10q/s
  
  js_evaluation单条0.25KB，可能超过1KB，预估2KB为一个极限，无CR读取，写入较读少
  js_buy_record单条0.5KB
  
  接口数：13
  高频读接口：/evaluate/product/list
  
  一次请求占用：
  
  POST /evaluate/create           //新建评论
  create(js_evaluation)
  js_evaluation写：1
  
  GET  /evaluate/detail-by-record  // 根据record的oid获得评价详情
  query(js_buy_record) get(js_evaluation) get(js_goods)
  js_evaluation读：0.5
  js_buy_record读：0.5
  js_goods读：0.5
  
  POST /evaluate/callback          //评价之后回调
  update(js_evaluation) 
  js_evaluation写：1
  
  GET  /evaluate/product/list      //重构comment
  query(js_evaluation) batchGet(js_user)
  js_evaluation读：2.5（按每条1KB）
  js_user读：10
  
  GET  /evaluate/user/list
  query(js_evaluation)
  js_evaluation读：2。5
  
  ```

  ​

  * **js_evaluation(评价)**

    ```js
    goods_id     //商品 spu_id(分区键)
    star_num     //获得商品星星数量
    user_id     //评价人
    comment_id   //评论ID 
    comment_content  // 评价内容
    comment_image    // 评论图片
    type_id         // 商品sku_id
    ```


* **Order**

  ```
  //订单
  服务容量指标：
  预计峰值QPS：10q/s（预设所有接口都是10）
  js_order单条1KB，可能超过1KB，预估2KB为一个极限，无CR读取，写入较读少
  js_cart单条0.2KB
  
  接口数：11
  平台级高消耗接口：/order/create
  
  一次请求占用：
  
  POST /order/create-sku-direct     //直接由SKU创建新订单(低频)
  POST /order/create                //创建新订单
  batchGet(js_cart，最大99) query(js_coupon_wallet)*2 batchGet(js_goods) batchGet(js_sku) create(js_order) create(js_schedule) update(js_sku batch) update(js_cart batch)
  js_cart读：最大50
  js_coupin_wallet读：最大10（两次都算上）
  js_goods读：最大50（所有spu都不一样）
  js_sku读：最大99
  js_order写：1
  js_schedule写：1
  js_sku写：1*99(最大)
  js_cart写：1*99（最大）
  
  POST /order/delete-order          //删除订单
  get(js_order) delete(js_order)
  js_order读:1
  js_order写：1/2
  
  POST /order/cancel-order          //将订单置为取消，把券状态消除
  get(js_order) update(js_order)
  js_order读:1
  js_order写：1/2
  
  POST /order/buy-again             //再次购买
  get(js_order) create/update(js_cart batch)
  js_order读:1
  js_cart写：最大99
  
  POST /order/receipt               //用户主动确认收货
  get(js_order) update(js_order) create(js_buy_record batch) create(js_schedule) query(js_schedule) create(js_schedule) create(js_account)
  js_order读：0.5
  js_order写：1/2
  js_buy_record写：1*99(最大)
  
  GET  /order/logistic              //获取快递物流信息
  get(js_order)
  js_order读：0.5
  
  GET  /order/list                  //获取订单列表，一次20条
  query(js_order)
  js_order读：最大5
  
  GET  /order/                      //获取订单详情信息
  get(js_order) query(js_family) 
  js_order:0.5
  js_family:0.5
  
  GET  /order/dfk/num               //得到代付款的数量
  query(js_order)
  js_order:5(按照20个待付)
  
  GET  /order/dsh/num               //待收货
  query(js_order)
  js_order:5(按照20个待收货)
  
  POST /order/logistic-hook         //物流信息更新回调(仅发送模板消息)
  ```

  ```
  //退换货
  服务容量指标：
  预计峰值QPS：10q/s（预设所有接口都是10）
  js_reverse_order单条0.6KB，无CR读取，写入较读少
  
  接口数：7
  
  POST /order/reverse/create            //发起售后
  create(js_reverse_order) get(js_order) update(js_order)
  js_reverse_order读：0.5
  js_order:0.5
  js_order:1
  
  POST /order/reverse/update-express    //用户创建逆向物流信息
  query(js_reverse_order) update(js_reverse_order) 
  js_reverse_order读:0.5
  js_reverse_order写：1
  
  POST /order/reverse/revoke            //撤销售后
  js_reverse_order读：0.5
  js_reverse_order写：1
  js_order写：1
  
  GET  /order/reverse/list              //获取售后列表
  js_reverse_order读：1
  
  GET  /order/reverse                   //查询售后详情
  js_reverse_order读：0.5
  
  GET  /order/reverse/return-address    //获取退换货地址
  GET  /order/reverse/express-brand2code //物流品牌和代码对照表
  ```

* **Common**

  ```
  //wa_index
  GET  /page/wa/index/guess
  GET  /page/wa/index/        //获取banner,获取商品组,再从商品组获取消息
  js_common:0.5
  js_goods:变动（更新后第一次请求为首页展现商品数）
  //QA
  GET  /page/wa/qa/topics     //获取所有QA topics ,及首屏需要展现的内容
  js_common:0.5
  GET  /page/wa/qa/detail     //针对性的获取某个QA
  js_common:0.5
  //分类
  GET  /page/wa/classify/all  //获得全部分类项
  js_common:1(8KB数据)
  
  GET  /page/wa/classify/detail  //获得某个分类项详情
  
  //推荐
  GET  /page/wa/rec/list      //根据rec_id获取推荐页面列表项
  //热搜
  GET  /page/wa/search/hot    //
  //banner
  GET  /page/wa/banner        //
  //猜你喜欢
  GET  /page/wa/guess         //
  GET  /page/wa/guess/random  //  
  ```

* **Passport**

  ```
  //用户接口
  GET  /passport/user/info           //获取用户信息
  js_user读:0.5
  
  GET  /passport/user/is-tried   //获取用户是否完成试用
  js_user读:0.5
  
  POST /passport/user/update  //更新用户信息
  js_user写:1
  
  POST /passport/user/have-unionid  //校验是否有union_id
  js_user读:0.5
  
  POST /passport/user/is_fwh_user  //校验是否关注服务号
  js_user读:0.5
  
  POST /passport/user/wa_follow_fwh_callback  //关注公众号
  js_user读:0.5
  
  POST /passport/user/bind-unionid-wa  //解析并获取union_id
  js_user读:0.5
  js_user(union_id_index)读:0.5
  js_user写:1
  
  POST /passport/user/tel-update-wa  //更新用户绑定的手机号
  js_user读:0.5
  js_user写:1
  
  POST /passport/user/add-form-id-wa  //
  js_user读:0.5
  js_user写:1
  
  POST /passport/user/add-form-id-pay  //支付上报form_id，暂未使用
  POST /passport/user/get-form-id-wa  //使用form_id
  js_user读:0.5
  js_user写:1
  
  POST /passport/user/sdk/info  //获取单个用户信息
  POST /passport/user/sdk/info-batch  //批量获取用户信息
  ```

  ```
  //登陆登出
  POST /passport/login/js-wa  // 小程序第一步登录通过openid生成半账号，绑定了union_id才是全账号
  js_user(open_id_index)： 0.5
  js_user写：1
  ```

* **Pay**

  ```
  POST /pay/wx/order        // 支付订单
  js_order读：0.5
  js_family读：1
  js_user读：1
  js_coupon_wallet读：1*2
  js_coupon_wallet写：1/0
  js_pay_order写：1
  
  POST /pay/wx/order-callback   //订单支付回调
  js_pay_order读：0.5
  js_pay_order写：1
  js_coupon_wallet写：2
  js_schedule写：1
  js_user写：1
  js_family写：1
  js_acount写：1+sku数目+1
  js_schedule写：1
  js_user读：0.5
  js_act写：1
  
  POST /pay/wx/subscribe   //支持家庭余额支付，支持用户余额支付,订阅订单支付
  js_subscribe_wares读：0.5
  js_family读：1
  js_user读：1
  js_goods读：0.5*n
  js_sku读：1*n
  js_pay_order写：1
  
  POST /pay/wx/subscribe-callback   //订单支付回调
  js_pay_order读：0.5
  js_pay_order写：1
  js_subscribe_order写：1
  js_user写：1
  js_family写：1
  
  POST /pay/wx/member      //家庭会员卡支付
  js_pay_order写：1
  js_user读：0.5
  
  POST /pay/wx/member-callback   //订单支付回调
  js_pay_order读：1
  js_pay_order写：1
  js_coupon_wallet写：最大120
  js_family写：1
  js_account写：1
  js_user写：1
  js_user读：1
  
  ```

* **product**

  ```
  //spu
  POST /product/sdk/spu-brief     //获取SPU简要信息
  js_goods读：0.5
  
  POST /product/sdk/spu           //获取SPU详细信息
  js_goods读：0.5
  
  POST /product/sdk/spu-batch     // 批量获取SPU信息，最多100个
  js_goods读：0.5*n(最多50，CR乘以2)
  
  POST /product/sdk/spu-brief-batch   //批量获取SPU简要信息，最多100个
  js_goods读：0.5*n(最多50，CR乘以2)
  ```

  ```
  //brand
  GET  /product/brand/list-by-brand  //根据品牌获取商品列表
  //space
  GET  /product/space/list-by-space  //
  //member
  GET  /product/member/list-by-member  //
  //group
  GET  /product/group        //根据品牌获取商品列表
  js_goods_group读：1
  js_goods读：最大10
  
  POST /product/group/create       //
  js_goods_group写：1
  
  GET /product/group/ranking/list
  
  POST /product/group/update       //
  js_goods_group写：1
  
  POST /product/group/list       //
  js_goods_group读：10
  
  POST /product/group/search       //
  ```

  ```
  //product
  POST /product/list-by-tag    //通过tag列举
  GET  /product/untoken        //不带token
  GET  /product                //更改商品数据结构
  js_goods读：1
  js_brand读：1
  js_evaulation读:0.25*n/8
  js_collect:0.5
  
  GET  /product/share/wx/code  //生成微信分享二维码
  js_goods读：0.5
  js_goods写：1
  
  GET  /product/getSku         //单独的sku
  GET  /product/get/correlation  //得到相关商品
  js_goods读：0.5+n*0.5
  
  
  //sku
  GET  /product/sku/get-by-sku      //查(通过sku查信息)
  GET  /product/sku/get-by-barcode  //查（通过barcode查新）
  ```

* **Promote**

  ```
  //优惠券接口
  POST /promote/coupon/code/exchange   //优惠码兑换成优惠券
  js_coupon_template:0.5
  js_coupon_wallet:1
  
  POST /promote/coupon/code/create     //新建优惠码
  POST /promote/coupon/code/updtae     //编辑优惠码
  GET /promote/coupon/code/list        //优惠码列表
  GET /promote/coupon/code/delete      //删除优惠码
  //优惠券模板接口
  POST /promote/coupon/template/info    //获取优惠券模板信息
  POST /promote/coupon/template/create  //创建一个优惠券模板
  POST /promote/coupon/template/update  //更新一个优惠券模板
  GET  /promote/coupon/template/list    //获取优惠券模板列表
  POST /promote/coupon/template/search  //检索优惠模板
  POST /promote/coupon/template/delete  //删除一个优惠券模板
  //券包接口
  GET  /promote/coupon/wallet/user-list  //获取某个用户的优惠券列表
  js_coupon_wallet:0.5+1
  
  GET  /promote/coupon/wallet/family-list  //获取某个家庭的优惠券列表
  js_coupon_wallet:0.5+1
  
  //用户领券接口
  POST /promote/coupon/get/new-user      //新用户赠券
  POST /promote/coupon/get/by-userid     //通过user_id领券
  POST /promote/coupon/get/best-coupon   //根据订单信息查询可优惠额最大的优惠券
  POST /promote/coupon/get/active-myq    //为家庭激活免邮券
  POST /promote/coupon/get/by-tel        //为家庭激
  //用券接口
  POST /promote/coupon/use/fit-list     //
  js_coupon_wallet:1
  
  POST /promote/coupon/use/free-ship-coupon     //内部接口调用，使用代金券
  POST /promote/coupon/use/coupon       //
  
  ```

  * **js_copon_template(存储优惠券模板信息)**

    ```js
    coupon_id       //优惠券模板ID (分区键)
    limit           //一个用户限领几张
    num             //发券数量，-1为无限量状态
    active_num      //优惠券，已激活数量
    mode            //券类型，RANDOM随机券，FIXED固定金额
    status          //优惠券模板状态：OK\INVALID
    activeAt        //-为领取时即生效，日期格式为激活时间戳
    expiredType     //券失效类型，0固定时间，1一段时间失效
    expiredInfo     //失效详情，8有效期为8天，Date&Date，第一个为起始有效期，第二个为终止有效期
    name            //优惠券名称
    price           //券金额，单位元，字符串形式，注意转换
    condition       //券使用条件，0为任意条件，按实际付费计算
    fit             //券适用的商品列表
    information     //券信息
    createdAt       //（排序键）
    ```

  * **js_coupon_wallet(存储优惠券信息至个人账户或者家庭账户中)**

    ```js
    owner_id        //券所有账户，user_id或者family_id (分区键)
    type            //0，代金券，1，免邮券
    code            //券码，uuid64位
    coupon_id       //券模板ID，券所属的模板
    status          //优惠券的状态，OK\INVALID
    order_id:Joi.string(),// 使用该券的订单号
    activeAt:Joi.string(),// 生效时间戳
    expiredAt:Joi.string(),// 券失效时间戳
    name:Joi.string(),// 券名称
    amount:Joi.number(),// 券金额，单位分
    price:Joi.number(),// 券金额，单位元
    condition:Joi.number(),// 券试用条件，0为任意条件，按实际付费计算
    fit:Joi.array(),// 列表
    information:Joi.string() // 券信息
    createdAt      //（排序键）
    ```

  * **js_coupon_code(存储优惠码与优惠券模板的对应关系)**

      ```js
      id              //优惠码的ID
      coupon_code     //对应的优惠码名字
      coupon_id       //对应优惠码的模板ID
      status          //优惠码的状态，OK\INVALID
      activeAt        //激活时间戳
      expiredAt       //激活口令失效时间
      num             //码领券数量，-1为无限量状态
      active_num      //优惠码已激活数量
      createdAt       //（排序键） 

      ```

* **Search**

  ```
  GET  /search/       //搜索主入口
  GET  /search/random 猜你喜欢    
  ```

* **Subscribe**

  ```
  //商品收藏
  POST /subscribe/collect/add         // 
  POST /subscribe/collect/delete      //取消收藏
  GET /subscribe/collect/list         //收藏列表
  POST /subscribe/collect/clear-all   //删除所有
  POST /subscribe/collect//collect/select   //删除所选
  ```

  ```
  //订阅购买
    //order
    GET  /subscribe/scene/order/price         //收藏列表
    GET  /subscribe/scene/order/list          //获得订单列表
    POST /subscribe/scene/order/reverse       //取消订阅单
    GET  /subscribe/scene/order               //获得订阅订单详情
    POST /subscribe/scene/order/update        //更新
    GET  /subscribe/scene/order/erp-list      //后台获得订阅订单详情
    //wares
    GET  /subscribe/scene/wares/id-list       //cms获得某个订阅商品详情
    GET  /subscribe/scene/wares/list          //
    GET  /subscribe/scene/wares/cms-list      //获得订阅商品列表
    GET  /subscribe/scene/wares/create-list   //根据id获得订阅商品列表
    GET  /subscribe/scene/wares/spu-wares     // 获取某个spu_id下的所有可订阅的商品列表，只包括列表展现的基本信息
    GET  /subscribe/scene/wares/wx/code       //获得订阅分享二维码
    POST /subscribe/scene/wares/create        //
    POST /subscribe/scene/wares/update        //更新优惠券信息
    GET  /subscribe/scene/wares               //获得订阅商品详情
    //package
    POST /subscribe/scene/package/send-delivery-msg  //发货通知，向服务号发信息  
    POST /subscribe/scene/package/receipt      //签收
    GET  /subscribe/scene/package/week-list    //根据week获取某周的邮包列表
    GET  /subscribe/scene/package/logistic     //获取包裹物流详情
    POST /subscribe/scene/package/update       //
    POST /subscribe/scene/package/update-status   //erp更新接口
    GET  /subscribe/scene/package/list         //erp后台获取用户全部订阅   
    GET  /subscribe/scene/package              //获取包裹详情
    //spu-map
    GET  /subscribe/scene/spu-map/list         //获得订阅商品列表
    POST /subscribe/scene/spu-map/create       //
    POST /subscribe/scene/spu-map/update       //更新优惠券信息
  ```


* **wallet**

  ```
  //user
  GET  /wallet/user/balance        //获取用户账户总金额
  js_user读：1
  GET  /wallet/user/bills          //获取用户账目列表,获取用户账户总金额
  js_account读：1
  //family
  GET  /wallet/family/balance        //获取用户账户总金额
  js_family读：1
  GET  /wallet/family/bills          //获取用户账目列表,获取用户账户总金额
  js_account读：1
  ```

* **Wx**

  ```
  //fwh
  POST  /wx/fwh              //
  GET  /wx/fwh              //
  //wa
  POST  /wx/wa              //
  GET  /wx/wa              //
  ```

