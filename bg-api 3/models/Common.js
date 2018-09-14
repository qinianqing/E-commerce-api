// Common model

// author by Ziv
// TODO
// 1、上线前需求务必注释掉endpoint，不能设为空
// 2、注释掉createTable方法
//
// v0.1
// 2018-01-06

const Joi = require("joi");
const dynogels = require("dynogels");
const uuid = require("uuid/v4");
const {awsParams} = require('../config');

dynogels.AWS.config.update({
    accessKeyId: awsParams.accessKeyId,
    secretAccessKey: awsParams.secretAccessKey,
    region: awsParams.region,
    //endpoint:awsParams.dynamoEndpoint
});

const CommonM = dynogels.define('js_common', {
    hashKey: 'position',
    rangeKey: 'object_id',
    timestamps: true,
    schema: {
        position: Joi.string(),// 字段展现位置
        object_id: Joi.string(),// uuid
        source: Joi.string(),// 标识来源
        index: Joi.number(),// 标明顺序
        // banner
        banner: {
            type: Joi.number(),// url或跳转商品,url是0，商品是1
            content: Joi.string(), //
            cover: Joi.string(),// 封面图
        },
        // subject，首页配置的专题
        /*
            四种subject示例:
            1、小banner横滑类型
            {
                position:'SUB',
                object_id:'xxx',
                source:'index',
                index:0,
                subject:{
                    type:2,
                    rec_name:'居住时光Live Time',
                    group_id:'',
                    content:[{
                        img:'',
                        url:'',xia
                        type:0/1 // 0跳转商品，1跳转网页
                    }]
                }
            }

            3、排行榜形式展现(商品数据来源于商品列表)
            {
                position:'SUB',
                object_id:'xxx',
                source:'index',
                index:2,// 仅用于排序
                subject:{
                    type:1,
                    group_id:'11111111',
                }
            }
            4、横滑商品展现(商品数据来源于商品列表)
            {
                position:'SUB',
                object_id:'xxx',
                source:'index',
                index:2,// 仅用于排序
                subject:{
                    type:2,
                    group_id:'11111111',
                }
            }
            5、图+横滑商品展现(商品数据来源于商品列表)
            {
                position:'SUB',
                object_id:'xxx',
                source:'index',
                index:2,// 仅用于排序
                subject:{
                    type:3,
                    group_id:'11111111',
                }
                 2、四格商品展现(商品数据来源于商品列表)
            {
                position:'SUB',
                object_id:'xxx',
                source:'index',
                index:1,
                subject:{
                    type:4,
                    group_id:'11111111',
                }
            }
            }
         */
        subject: {
            type: Joi.number(),
            rec_name: Joi.string(),// 可以不填，如果content商品列表的名字
            subtitle:Joi.string(),
            group_id: Joi.string(),
            content: Joi.array(),// 单一对象{img:'',url:''}
        },
        // rec
        rec: {
            type: Joi.number(),// 推荐种类
            rec_name: Joi.string(),
            url: Joi.string(),
            tag: Joi.string(),
            img: Joi.string(),// 封面图，只有type0有

            list: Joi.array(),
            /*
          list:[
              {
                  spu_id: Joi.string(),
                  name: Joi.string(),
                  cover: Joi.string(),
                  detail: Joi.string(),
                  price: Joi.number(),
                  crossed_price: Joi.number()
              }
          ]
          */
        },
        // hot-search
        query: Joi.string(), // 热搜词
        // category
        category: Joi.array(),
        /*
      category:[
          {
              title: Joi.string(),
              type: Joi.number(),
              list: [
                  {
                      name: Joi.string(),
                      img: Joi.string(),
                      content: Joi.string() // 网页或者category2 id
                  }
              ]
          }
      ],
      */
        product: {
            spu_id: Joi.string(),
            name: Joi.string(),
            cover: Joi.string(),
            detail: Joi.string(),
            price: Joi.number(),
            crossed_price: Joi.number()
        },
        qa: Joi.array()
        /*
      qa:[
          {
              q: Joi.string(),
              a: Joi.string()
          }
      ]
      */
    }
});

/*
dynogels.createTables({
  'js_common': {readCapacity: 5, writeCapacity: 10},
  }, function(err) {
    if (err) {
        console.log('Error creating tables: ', err);
    } else {
        console.log('Tables has been created');
    }
});
*/

class Common {
    get position() {
        return this._position;
    }

    set position(value) {
        this._position = value;
    }

    get object_id() {
        return this._object_id;
    }

    set object_id(value) {
        this._object_id = value;
    }

    get source() {
        return this._source;
    }

    set source(value) {
        this._source = value;
    }

    get index() {
        return this._index;
    }

    set index(value) {
        this._index = value;
    }

    get banner() {
        return this._banner;
    }

    set banner(value) {
        this._banner = value;
    }

    get subject() {
        return this._subject;
    }

    set subject(value) {
        this._subject = value;
    }

    get rec() {
        return this._rec;
    }

    set rec(value) {
        this._rec = value;
    }

    get query() {
        return this._query;
    }

    set query(value) {
        this._query = value;
    }

    get category() {
        return this._category;
    }

    set category(value) {
        this._category = value;
    }

    get product() {
        return this._product;
    }

    set product(value) {
        this._product = value;
    }

    get qa() {
        return this._qa;
    }

    set qa(value) {
        this._qa = value;
    }

    // banner

    /* 获取所有banner */
    getBanners(callback) {
        CommonM.query('BANNER_')
            .loadAll()
            .attributes(['index', 'banner', 'object_id'])
            .exec((err, data) => {
                callback(err, data);
            })
    }

    /* 获取某条banner */
    getTargetBanner(callback) {
        CommonM.get({
            position: 'BANNER_',
            object_id: this.object_id
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 新建banner */
    createBanner(callback) {
        CommonM.create({
            position: 'BANNER_',
            object_id: uuid().replace(/-/g, ''),
            index: this.index,
            banner: this.banner
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 修改banner */
    updateBanner(callback) {
        CommonM.update({
            position: 'BANNER_',
            object_id: this.object_id,
            //index:this.index,
            banner: this.banner
        }, (err, data) => {
            callback(err, data)
        })
    }

    updateBannerIndex(p, callback) {
        CommonM.update(p, (err, data) => {
            callback(err, data)
        })
    }

    /* 删除banner */
    deleteBanner(callback) {
        CommonM.destroy({
            position: 'BANNER_',
            object_id: this.object_id
        }, (err) => {
            callback(err)
        })
    }




    // 首页推荐
    /* 获取所有首页推荐 */
    getIndexSubs(callback) {
        CommonM.query('SUB')
            .loadAll()
            .exec((err, data) => {
                callback(err, data);
            })
    }

    /* 获取某条推荐详情 */
    getTargetSub(callback) {
        CommonM.get({
            position: 'SUB',
            object_id: this.object_id
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 新建首页推荐 */
    createSub(callback) {
        CommonM.create({
            position: 'SUB',
            object_id: uuid().replace(/-/g, ''),
            index: this.index,
            subject: this.subject,
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 修改首页推荐 */
    updateSub(callback) {
        CommonM.update({
            position: 'SUB',
            object_id: this.object_id,
            // index:this.index,
            subject: this.subject,
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 删除一条首页推荐 */
    deleteSub(callback) {
        CommonM.destroy({
            position: 'SUB',
            object_id: this.object_id
        }, (err) => {
            callback(err)
        })
    }

    updateSubIndex(p, callback) {
        CommonM.update(p, (err, data) => {
            callback(err, data)
        })
    }

    // 首页推荐

    /* 获取首页推荐商品 */
    getRecs(callback) {
        CommonM.query('REC')
            .filter('source').equals(this.source)
            .loadAll()
            .attributes(['source', 'object_id', 'index', 'rec'])
            .exec((err, data) => {
                callback(err, data);
            })
    }

    /* 获取某个推荐项详情 */
    getTargetRec(callback) {
        CommonM.get({
            position: 'REC',
            object_id: this.object_id
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 新建推荐项 */
    createRec(callback) {
        CommonM.create({
            position: 'REC',
            object_id: uuid().replace(/-/g, ''),
            source: this.source,
            index: this.index,
            rec: this.rec
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 修改推荐项 */
    updateRec(callback) {
        CommonM.update({
            position: 'REC',
            object_id: this.object_id,
            source: this.source,
            index: this.index,
            rec: this.rec
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 删除一条推荐项 */
    deleteRec(callback) {
        CommonM.destroy({
            position: 'REC',
            object_id: this.object_id
        }, (err) => {
            callback(err)
        })
    }

    // hot-search

    /* 获得所有热搜词 */
    getHotSearch(callback) {
        CommonM.query('SEARCH')
            .loadAll()
            .attributes(['index', 'query', 'position', 'object_id'])
            .exec((err, data) => {
                callback(err, data);
            })
    }

    /* 获取某个热搜词 */
    getTargetHotSearch(callback) {
        CommonM.get({
            position: 'SEARCH',
            object_id: this.object_id
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 新建推荐项 */
    createHotSearch(callback) {
        CommonM.create({
            position: 'SEARCH',
            object_id: uuid().replace(/-/g, ''),
            index: this.index,
            query: this.query
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 修改推荐项 */
    updateHotSearch(callback) {
        CommonM.update({
            position: 'SEARCH',
            object_id: this.object_id,
            index: this.index,
            query: this.query
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 删除一条推荐项 */
    deleteHotSearch(callback) {
        CommonM.destroy({
            position: 'SEARCH',
            object_id: this.object_id
        }, (err) => {
            callback(err)
        })
    }

    // 排序
    updateHotIndex(p, callback) {
        CommonM.update(p, (err, data) => {
            callback(err, data)
        })
    }

    // category页面

    /* 获得分类信息 */
    getCategory(callback) {
        CommonM.query('CATEGORY')
        // .filter('source').equals(this.source)
            .loadAll()
            .attributes(['source', 'index', 'object_id','position', 'category'])
            .exec((err, data) => {
                callback(err, data);
            })
    }
    /*获取分类页长度*/
    // getAllGoods(callback) {
    //     GoodsM
    //         .scan()
    //         .select('COUNT')
    //         .exec((err, data) => {
    //             callback(err, data)
    //         })
    // }

    /* 获取某个分类详细信息 */
    getTargetCategory(callback) {
        CommonM.get({
            position: 'CATEGORY',
            object_id: this.object_id
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 新建推荐项 */
    createCategory(callback) {
        CommonM.create({
            position: 'CATEGORY',
            object_id: uuid().replace(/-/g,''),
            source: this.source,
            index: this.index,
            category: this.category
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 修改推荐项 */
    updateCategory(callback) {
        CommonM.update({
            position: 'CATEGORY',
            object_id: this.object_id,
            source: this.source,
            // index: this.index,
            category: this.category
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 删除一条分类项 */
    deleteCategory(callback) {
        CommonM.destroy({
            position: 'CATEGORY',
            object_id: this.object_id
        }, (err) => {
            callback(err)
        })
    }

    // 猜你喜欢

    /* 获得某一项猜你喜欢 */
    getGuess(callback) {
        CommonM.query('GUESS')
            .filter('source').equals(this.source)
            .loadAll()
            .attributes(['source', 'index', 'product'])
            .exec((err, data) => {
                callback(err, data);
            })
    }

    /* 获取某个猜你喜欢项 详细信息 */
    getTargetGuess(callback) {
        CommonM.get({
            position: 'GUESS',
            object_id: this.object_id
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 新建一个猜你喜欢条目 */
    createGuess(callback) {
        CommonM.create({
            position: 'GUESS',
            object_id: this.object_id,
            source: this.source,
            index: this.index,
            product: this.product
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 修改猜你喜欢 */
    updateGuess(callback) {
        CommonM.update({
            position: 'GUESS',
            object_id: this.object_id,
            source: this.source,
            index: this.index,
            product: this.product
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 删除一条猜你喜欢 */
    deleteGuess(callback) {
        CommonM.destroy({
            position: 'GUESS',
            object_id: this.object_id
        }, (err) => {
            callback(err)
        })
    }

    // QA

    /* 获得所有QA */
    getQAs(callback) {
        CommonM.query('QA')
            .loadAll()
            .attributes(['source', 'index', 'qa', 'object_id'])
            .exec((err, data) => {
                callback(err, data);
            })
    }

    getTargetQAbySource(callback) {
        CommonM.query('QA')
            .filter('source').equals(this.source)
            .attributes(['qa'])
            .exec((err, data) => {
                callback(err, data)
            })
    }

    /* 获取某个猜你喜欢项 详细信息 */
    getTargetQA(callback) {
        CommonM.get({
            position: 'QA',
            object_id: this.object_id
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 新建一个猜你喜欢条目 */
    createQA(callback) {
        CommonM.create({
            position: 'QA',
            object_id: this.object_id,
            source: this.source,
            index: this.index,
            qa: this.qa
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 修改猜你喜欢 */
    updateQA(callback) {
        CommonM.update({
            position: 'QA',
            object_id: this.object_id,
            source: this.source,
            index: this.index,
            qa: this.qa
        }, (err, data) => {
            callback(err, data)
        })
    }

    /* 删除一条猜你喜欢 */
    deleteQA(callback) {
        CommonM.destroy({
            position: 'QA',
            object_id: this.object_id
        }, (err) => {
            callback(err)
        })
    }

}

module.exports = Common;