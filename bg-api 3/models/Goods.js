const {
    awsParams,
} = require('../config.js');
const dynogels = require('jinshi-dynogels');
const Joi = require('joi');

dynogels.AWS.config.update({
    accessKeyId: awsParams.accessKeyId,
    secretAccessKey: awsParams.secretAccessKey,
    region: awsParams.region,
    //endpoint:awsParams.dynamoEndpoint
});

//商品详情表
const GoodsM = dynogels.define('js_p', {
    hashKey: 'goods_id',
    rangeKey:'sku_id',
    timestamps: true,
    schema: {
        // spu专属
        goods_id:Joi.string(),//商品id
        sku_id:Joi.string(),// 是sku时展现sku_id，spu时展现0
        goods_name:Joi.string(),//商品名称
        op:Joi.string(),//发货商
        describe:Joi.string(),//商品描述
        brand_id:Joi.string(),//品牌id
        goods_price:Joi.string(),//商品最低价
        goods_cashback:Joi.number(),//会员返现价
        discount_price:Joi.number(),//划线价
        level3_id:Joi.array(),//商品3级id
        show:Joi.boolean(),//上下架
        service:Joi.array(),//商品服务
        tag:Joi.array(),//标签
        default_image:Joi.string(),//默认商品展示图
        carousel_image:Joi.array(),//商品详情顶部录轮播
        specification:Joi.array(),//商品详情规格信息
        top_price:Joi.number(),//商品详情页展示最高价
        mini_price:Joi.number(),//商品详情页展示最低价
        share:Joi.string(),//商品分享描述
        details_image:Joi.array(),//商品详情图
        styles:Joi.array(),//商品规格
        skus:Joi.array(),//sku具体信息,
        wa_qr_code:Joi.string(),
        direct:Joi.boolean(),//是否厂家直发
        space:Joi.array(),
        member:Joi.array(),// 这两个后台才需要用到
        priority:Joi.number(),// 商品展现优先级
        correlation:Joi.array(),//相关商品
        rank_image:Joi.array(),//商品组图
        share_image:Joi.string(),// 分享图片

        // sku专属
        stock:Joi.number(),
        sh_stock:Joi.number(),
        gz_stock:Joi.number(),
        cd_stock:Joi.number()
    }
});

// dynogels.createTables({'js_goods': {readCapacity: 5, writeCapacity: 5}}, (err) => {
//     if (err) {
//         console.log('updating tables error', err);
//     } else {
//         console.log('table updated');
//     }
// })

class Goods {
    get goods_id() { return this._goods_id };
    set goods_id(value){ this._goods_id = value };

    get sku_id() { return this._sku_id };
    set sku_id(value){ this._sku_id = value };

    get goods_name() { return this._goods_name };
    set goods_name(value){ this._goods_name = value };

    get op() { return this._op };
    set op(value){ this._op = value };

    get describe() { return this._describe };
    set describe(value){ this._describe = value };

    get brand_id() { return this._brand_id };
    set brand_id(value){ this._brand_id = value };

    get goods_price(){ return this._goods_price };
    set goods_price(value){ this._goods_price = value};

    get goods_cashback(){ return this._goods_cashback};
    set goods_cashback(value){ this._goods_cashback = value};

    get discount_price(){ return this._discount_price};
    set discount_price(value){ this._discount_price = value};

    get level3_id(){ return this._level3_id};
    set level3_id(value){ this._level3_id = value};

    get default_image(){ return this._default_image };
    set default_image(value){ this._default_image = value };

    get show(){ return this._show;}
    set show(value){ this._show = value };

    get service(){ return this._service;}
    set service(value){ this._service = value;}

    get tag(){ return this._tag;}
    set tag(value){ this._tag = value;}

    get carousel_image(){ return this._carousel_image};
    set carousel_image(value){  this._carousel_image = value};

    get top_price(){ return this._top_price};
    set top_price(value){ this._top_price = value};

    get mini_price(){ return this._mini_price};
    set mini_price(value){ this._mini_price = value};

    get share(){ return this._share};
    set share(value){ this._share = value}

    get details_image(){ return this._details_image;}
    set details_image(value){ this._details_image = value;}

    get styles(){ return this._styles;}
    set styles(value){ this._styles = value;}

    get skus(){ return this._skus;}
    set skus(value){ this._skus = value;}

    get specification(){ return this._specification;}
    set specification(value){ this._specification = value;}

    get wa_qr_code(){ return this._wa_qr_code;}
    set wa_qr_code(value){ this._wa_qr_code = value;}

    get direct(){ return this._direct;}
    set direct(value){ this._direct = value; }

    get priority(){ return this._priority;}
    set priority(value){ this._priority = value; }

    get correlation(){ return this._correlation;}
    set correlation(value){ this._correlation = value;}

    get space(){ return this._space;}
    set space(value){ this._space = value}

    get member(){ return this._member;}
    set member(value){ this._member = value}

    get rank_image(){ return this._rank_image;}
    set rank_image(value){ this._rank_image = value}

    get stock() { return this._stock };
    set stock(value){ this._stock = value };

    get sh_stock() { return this._sh_stock };
    set sh_stock(value){ this._sh_stock = value };

    get gz_stock() { return this._gz_stock };
    set gz_stock(value){ this._gz_stock = value };

    get cd_stock() { return this._cd_stock };
    set cd_stock(value){ this._cd_stock = value };

    get share_image() { return this._share_image };
    set share_image(value){ this._share_image = value };

// 创建新的商品，只有主商品需要创建
    create(callback){
        GoodsM.create({
            goods_id:this.goods_id,
            sku_id:'0',// 主商品是0
            goods_name:this.goods_name,
            op:this.op,
            describe:this.describe,
            brand_id:this.brand_id,
            goods_price:this.goods_price,
            goods_cashback:this.goods_cashback,
            discount_price:this.discount_price,
            level3_id:this.level3_id,
            carousel_image:this.carousel_image,
            tag:this.tag || [],
            show:this.show,
            service:this.service,
            top_price:this.top_price,
            mini_price:this.mini_price,
            share:this.share,
            specification:this.specification,
            details_image:this.details_image,
            default_image:this.default_image,
            styles:this.styles,
            skus:this.skus,
            direct:this.direct || false,
            priority:1,// 默认优先级为1,
            correlation:this.correlation || [],
            member: this.member || [],
            space: this.space || [],
            rank_image:this.rank_image,
            share_image:this.share_image || '',
            wa_qr_code:this.wa_qr_code
        },{overwrite : false},(err,goods)=>{
            // 创建一个主商品，从商品同步SKU信息，创建只写SKU
            if (err){
                return callback(err,goods)
            }else {
                goods = goods.attrs;
                let skus = goods.skus;
                let n = 0;
                for (let i=0;i<skus.length;i++){
                    this.createSku(goods.goods_id,skus[i],(err,data)=>{
                        n++;
                        if (n === skus.length){
                            callback(err,goods)
                        }
                    })
                }
            }
        })
    }
    // 后台更新商品
    updateGoods(callback) {
        this.getSpu(this.goods_id,(err,data)=>{
            if (err !== null){
                return callback(err,data)
            }
            data = data.attrs;
            let skusOld = data.skus;
            // 先更新主商品
            GoodsM.update({
                goods_id: this.goods_id,
                sku_id: '0',
                goods_name: this.goods_name,
                op:this.op,
                goods_price: this.goods_price,
                discount_price: this.discount_price,
                top_price: this.top_price,
                mini_price: this.mini_price,
                goods_cashback: this.goods_cashback,
                carousel_image: this.carousel_image,
                share: this.share,
                describe: this.describe,
                brand_id: this.brand_id,
                show: this.show,
                service: this.service,
                tag: this.tag || [],
                correlation:this.correlation || [],
                details_image: this.details_image,
                default_image: this.default_image,
                styles: this.styles,
                skus: this.skus,
                level3_id: this.level3_id,
                direct: this.direct,
                priority: this.priority,
                member: this.member || [],
                space: this.space || [],
                rank_image:this.rank_image || [],
                share_image:this.share_image || '',
            }, (err, goods) => {
                if (err !== null){
                    callback(err,goods)
                }else {
                    let skusNew = goods.attrs.skus;
                    // 新增加的
                    let newSkus = [];
                    // 被删除的
                    let delSkus = [];
                    // 存续的
                    let extSkus = [];
                    let skuidsOld = [];
                    let skuidsNew = [];
                    for (let i=0;i<skusOld.length;i++){
                        skuidsOld.push(skusOld[i].sku_id)
                    }
                    for (let i=0;i<skusNew.length;i++){
                        skuidsNew.push(skusNew[i].sku_id)
                    }
                    for (let i=0;i<skuidsOld.length;i++){
                        if (skuidsNew.indexOf(skuidsOld[i])>=0){
                            extSkus.push(skusNew[i])
                        }else {
                            delSkus.push(skusOld[i])
                        }
                    }
                    for (let i=0;i<skuidsNew.length;i++){
                        if (skuidsOld.indexOf(skuidsNew[i])=== -1){
                            newSkus.push(skusNew[i])
                        }
                    }
                    callback(err, goods);

                    // 新sku创建
                    for (let i=0;i<newSkus.length;i++){
                        this.createSku(newSkus[i].sku_id.split('-')[0],newSkus[i],(err,data)=>{
                            if (err){
                                console.error(err.message)
                            }
                        })
                    }
                    // 存续sku直接改成新值
                    for (let i=0;i<extSkus.length;i++){
                        this.updateSku(extSkus[i].sku_id.split('-')[0],extSkus[i],(err,data)=>{
                            if (err){
                                console.error(err.message)
                            }
                        })
                    }
                    // 删除sku直接删除
                    for (let i=0;i<delSkus.length;i++){
                        this.deleteSku(delSkus[i].sku_id.split('-')[0],delSkus[i],(err,data)=>{
                            if (err){
                                console.error(err.message)
                            }
                        })
                    }
                }
            })
        })
    }
    // 核心方法，不暴露，有create的时候一定要带着createSku
    createSku(gid,sku,callback){
        GoodsM.create({
            goods_id:gid,
            sku_id:sku.sku_id,
            stock:sku.stock,
            sh_stock:sku.sh_stock,
            gz_stock:sku.gz_stock,
            cd_stock:sku.cd_stock
        },{overwrite:false},(err,data)=>{
            callback(err,data)
        })
    }
    // 更新sku
    updateSku(gid,sku,callback){
        GoodsM.update({
            goods_id:gid,
            sku_id:sku.sku_id,
            stock:sku.stock,
            sh_stock:sku.sh_stock,
            gz_stock:sku.gz_stock,
            cd_stock:sku.cd_stock
        },(err,data)=>{
            callback(err,data)
        })
    }

    // 删除sku
    deleteSku(gid,sku,callback){
        GoodsM.destroy({
            goods_id:gid,
            sku_id:sku.sku_id
        },(err,data)=>{
            callback(err,data)
        })
    }

    // 直接取商品，非强一致性读取
    getSpu(spu,callback){
        this.getGoodsByParam(spu,(err,data)=>{
            if (err !== null){
                return callback(err,data)
            }else {
                if (data.Count){
                    callback(null,data.Items[0])
                }else {
                    callback(null,null)
                }
            }
        })
    }
// 通过query查询商品，只查询一个商品
    getGoodsByParam(spu_id,callback){
        GoodsM
            .query(spu_id)
            .exec((err,goods)=>{
                // 整理返回数据
                if (err){
                    return callback(err,{})
                }else {
                    if (goods.Count){
                        const respTemplate = goods.Items[0];
                        let skus = [];
                        let g = '';
                        for (let i=0;i<goods.Count;i++){
                            if (goods.Items[i].attrs.sku_id === '0'){
                                g = goods.Items[i].attrs;
                            }else {
                                skus.push(goods.Items[i].attrs);
                            }
                        }
                        let result = g;
                        for (let i=0;i<result.skus.length;i++){
                            for (let k=0;k<skus.length;k++){
                                if (result.skus[i].sku_id === skus[k].sku_id){
                                    result.skus[i].stock = skus[k].stock;
                                    result.skus[i].sh_stock = skus[k].sh_stock;
                                    result.skus[i].gz_stock = skus[k].gz_stock;
                                    result.skus[i].cd_stock = skus[k].cd_stock;
                                    break;
                                }
                            }
                        }
                        let t = respTemplate;
                        t.attrs = result;
                        result = [t];
                        callback(null,{
                            Count:1,
                            Items:result
                        })
                    }else {
                        callback(null,{
                            Count:0,
                            Items:[]
                        })
                    }
                }
            })
    }

    //update
    updateGoodsShow(callback) {
        GoodsM.update({
            goods_id: this.goods_id,
            sku_id: '0',
            show: this.show,
        }, (err, goods) => {
            callback(err, goods)
        })
    }
//通过ID得到商品
    getGoodsMsg(callback){
        GoodsM
            .query(this.goods_id)
            .exec((err,goods)=>{
                callback(err,goods)
            })
    }

    // contains
    queryGoods(goodsName,callback) {
        GoodsM
            .scan()
            .where('goods_name').contains(goodsName)
            .exec((err,data) => {
                callback(err, data)
            });
    }
    /* 得到整张goods表 */
    AllGoods(callback) {
        GoodsM
            .scan()
            // .select('COUNT')
            .loadAll()
            .exec((err, data) => {
                callback(err, data)
            })
    }

    /* 得到整张goods表 */
    getAllGoods(callback) {
        GoodsM
            .scan()
            .select('COUNT')
            .exec((err, data) => {
                callback(err, data)
            })
    }

    /* 获取所有goods */
    getGoods(callback, lastkey) {
        if (lastkey) {
            GoodsM.scan()
                .startKey(lastkey)
                .limit(20)
                // .loadAll()
                .exec((err, data) => {
                    callback(err, data)
                })
        } else {
            GoodsM.scan()
                .limit(20)
                // .loadAll()
                .exec((err, data) => {
                    callback(err, data)
                })
        }

    }

    // 后台获取商品列表
    getGoodsCMS(callback, lastkey) {
        if (lastkey) {
            GoodsM.scan()
                .where('sku_id').equals('0')
                .startKey(lastkey)
                .limit(20)
                // .loadAll()
                .exec((err, data) => {
                    callback(err, data)
                })
        } else {
            GoodsM.scan()
                .where('sku_id').equals('0')
                .limit(20)
                // .loadAll()
                .exec((err, data) => {
                    callback(err, data)
                })
        }
    }

    getGoodsCMSShow(Show,callback, lastkey) {
        if (lastkey) {
            GoodsM.query(this.sku_id)
                .filter('show').equals(Show)
                .startKey(lastkey)
                .limit(20)
                .exec((err, data) => {
                    callback(err, data)
                })
        } else {
            GoodsM.query(this.sku_id)
                .filter('show').equals(Show)
                .limit(20)
                .exec((err, data) => {
                    callback(err, data)
                })
        }
    }
     //查找相关商品
     getGoodsCorrelationId(callback){
        GoodsM.query(this.goods_id)
        .attributes(['correlation'])
              .exec((err,data)=>{
                callback(err,data)
              })
    }
 // 批量取商品，非强一致性读取
 getSpus(spus,callback){
    GoodsM.getItems(spus,(err,data)=>{
        callback(err,data)
    })
}

    // 更新图片顺序
    sortCarouselImage(callback) {
        GoodsM.update({
            goods_id: this.goods_id,
            sku_id: '0',
            carousel_image: this.carousel_image,
        }, (err, goods) => {
            callback(err, goods)
        })
    }
    // 更新详情图顺序
    sortDetailsImage(callback) {
        GoodsM.update({
            goods_id: this.goods_id,
            sku_id: '0',
            details_image: this.details_image,
        }, (err, goods) => {
            callback(err, goods)
        })
    }

    // 更新商品组图顺序
    sortRankImage(callback) {
        GoodsM.update({
            goods_id: this.goods_id,
            sku_id: '0',
            rank_image: this.rank_image,
        }, (err, goods) => {
            callback(err, goods)
        })
    }

}


module.exports = Goods;
