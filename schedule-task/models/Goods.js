const { awsParams } = require('../config.js');
const dynogels = require('jinshi-dynogels');
const Joi = require('joi');

dynogels.AWS.config.update({
    accessKeyId:awsParams.accessKeyId,
    secretAccessKey:awsParams.secretAccessKey,
    region:awsParams.region,
    //endpoint:awsParams.dynamoEndpoint
});

//商品详情表
const GoodsM = dynogels.define('js_p',{
    hashKey:'goods_id',
    rangeKey:'sku_id',
    timestamps:true,
    schema:{
        // spu专属
        goods_id:Joi.string(),//商品id
        sku_id:Joi.string(),// 是sku时展现sku_id，spu时展现0
        goods_name:Joi.string(),//商品名称
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
        rank_image:Joi.array(),

        // sku专属
        stock:Joi.number(),
        sh_stock:Joi.number(),
        gz_stock:Joi.number(),
        cd_stock:Joi.number()
    },
});

// if (env === 'dev') {
//     dynogels.createTables({'js_goods': { readCapacity: 1, writeCapacity: 1 }},(err) => {
//         if (err) {
//             console.log('updating tables error', err);
//         } else {
//             console.log('table updated');
//         }
//     });
// }

class Goods {
    get goods_id() { return this._goods_id };
    set goods_id(value){ this._goods_id = value };

    get sku_id() { return this._sku_id };
    set sku_id(value){ this._sku_id = value };

    get goods_name() { return this._goods_name };
    set goods_name(value){ this._goods_name = value };

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

    // 创建新的商品，只有主商品需要创建
    create(callback){
        GoodsM.create({
            goods_id:this.goods_id,
            sku_id:'0',// 主商品是0
            goods_name:this.goods_name,
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
            correlation:this.correlation,
            rank_image:this.rank_image,
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
        GoodsM.create({
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

    // 查询一个产品下所有sku
    onlyQuerySku(spu_id,callback){
        GoodsM.query(spu_id.split('-')[0])
            .exec((err,data)=>{
                if (err !== null){
                    callback(err,data)
                }else {
                    let skus = [];
                    if (data.Count){
                        for (let i=0;i<data.Count;i++){
                            if (data.Items[i].attrs.sku_id === '0'){

                            }else {
                                skus.push(data.Items[i])
                            }
                        }
                        callback(null,{
                            Count:data.Count-1,
                            Items:skus
                        })
                    }else {
                        callback(null,[])
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
                correlation:this.correlation,
                details_image: this.details_image,
                default_image: this.default_image,
                styles: this.styles,
                skus: this.skus,
                level3_id: this.level3_id,
                direct: this.direct,
                priority: this.priority,
                member: this.member || [],
                space: this.space || [],
                rank_image:this.rank_image || []
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



    // 按商品名检索
    queryGoods(goodsName,callback) {
        GoodsM
            .scan()
            .where('sku_id').equals('0')
            .where('goods_name').contains(goodsName)
            .exec((err,data) => {
                callback(err, data)
            });
    }

    // 后台获取商品列表
    getGoodsCMS(callback, lastkey) {
        if (lastkey) {
            GoodsM.scan()
                .where('sku_id').equals('0')
                .startKey(lastkey)
                .limit(100)
                // .loadAll()
                .exec((err, data) => {
                    callback(err, data)
                })
        } else {
            GoodsM.scan()
                .where('sku_id').equals('0')
                .limit(100)
                // .loadAll()
                .exec((err, data) => {
                    callback(err, data)
                })
        }
    }

    // 更新商品上下架
    updateGoodsShow(callback) {
        GoodsM.update({
            goods_id: this.goods_id,
            sku_id:'0',
            show: this.show,
            skus: this.skus,
        }, (err, goods) => {
            callback(err, goods)
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

    // 通过query查询商品，只查询一个商品
    getGoods(callback){
        GoodsM
            .query(this.goods_id)
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

    // 通过query查询商品，只查询一个商品
    getGoodsCRByParam(spu,callback){
        GoodsM
            .query(spu)
            .consistentRead(true)
            .exec((err,goods)=>{
                // 整理返回数据
                if (err){
                    return callback(err,undefined)
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

    // 通过query查询商品，只查询一个商品
    getGoodsCR(callback){
        GoodsM
            .query(this.goods_id)
            .consistentRead(true)
            .exec((err,goods)=>{
                // 整理返回数据
                if (err){
                    return callback(err,undefined)
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

    // 通过query查询商品数
    getGoodsExist(callback){
        GoodsM
            .query(this.goods_id)
            .where('sku_id').equals('0')
            .select('COUNT')
            .exec((err,goods)=>{
                callback(err,goods)
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

    // 直接取商品，强一致性读取
    getSpuCR(spu,callback){
        this.getGoodsCRByParam(spu,(err,data)=>{
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

    // 批量取商品，非强一致性读取
    getSpus(spus,callback){
        // 先获取再排序
        let handle = async ()=>{
            let results = [];
            for (let i=0;i<spus.length;i++){
                let re = await getSpuBySync(spus[i]);
                if (re.err !== null){

                }else {
                    results.push(re.data)
                }
            }
            callback(null,results)
        };
        handle();
    }

    // 批量取商品，强一致性读取
    getSpusCR(spus,callback){
        // 先获取再排序
        let results = [];
        let handle = async ()=>{
            for (let i=0;i<spus.length;i++){
                let re = await getSpuCRBySync(spus[i]);
                if (re.err !== null){

                }else {
                    results.push(re.data)
                }
            }
            callback(null,results)
        };
        handle();
    }

    // 更新wa_qr_code
    updateWaQrCode(callback){
        GoodsM.update({
            goods_id:this.goods_id,
            sku_id:'0',
            wa_qr_code:this.wa_qr_code
        },(err,data)=>{
            callback(err,data)
        })
    }

    // 增加商品库存
    addSkuStock(sku_id,num,callback,position){
        if (position === 'stock' || !position){
            GoodsM.update({
                goods_id:sku_id.split('-')[0],
                sku_id:sku_id,
                stock:{$add:num}
            },(err,data)=>{
                callback(err)
            })
        }
        if (position === 'sh_stock'){
            GoodsM.update({
                goods_id:sku_id.split('-')[0],
                sku_id:sku_id,
                sh_stock:{$add:num}
            },(err,data)=>{
                callback(err)
            })
        }
        if (position === 'gz_stock'){
            GoodsM.update({
                goods_id:sku_id.split('-')[0],
                sku_id:sku_id,
                gz_stock:{$add:num}
            },(err,data)=>{
                callback(err)
            })
        }
        if (position === 'cd_stock'){
            GoodsM.update({
                goods_id:sku_id.split('-')[0],
                sku_id:sku_id,
                cd_stock:{$add:num}
            },(err,data)=>{
                callback(err)
            })
        }
    }

    // 消耗商品库存
    delSkuStock(sku_id,num,callback,position){
        if (position === 'stock' || !position){
            GoodsM.update({
                goods_id:sku_id.split('-')[0],
                sku_id:sku_id,
                stock:{$add:num*-1}
            },(err,data)=>{
                callback(err)
            })
        }
        if (position === 'sh_stock'){
            GoodsM.update({
                goods_id:sku_id.split('-')[0],
                sku_id:sku_id,
                sh_stock:{$add:num*-1}
            },(err,data)=>{
                callback(err)
            })
        }
        if (position === 'gz_stock'){
            GoodsM.update({
                goods_id:sku_id.split('-')[0],
                sku_id:sku_id,
                gz_stock:{$add:num*-1}
            },(err,data)=>{
                callback(err)
            })
        }
        if (position === 'cd_stock'){
            GoodsM.update({
                goods_id:sku_id.split('-')[0],
                sku_id:sku_id,
                cd_stock:{$add:num*-1}
            },(err,data)=>{
                callback(err)
            })
        }
    }

    // 更新优先级
    updatePriority(callback){
        GoodsM.update({
            goods_id:this.goods_id,
            sku_id:'0',
            priority:this.priority
        },(err,data)=>{
            callback(err,data)
        })
    }

    //查找相关商品
    getGoodsCorrelationId(callback){
        GoodsM.query(this.goods_id)
            .where('sku_id').equals('0')
            .attributes(['correlation'])
            .exec((err,data)=>{
                callback(err,data)
            })
    }
}

let getSpuBySync = (spu)=>{
    return new Promise((resolve,reject)=>{
        let g = new Goods();
        g.getSpu(spu,(err,data)=>{
            resolve({
                err:err,
                data:data
            })
        })
    })
};


let getSpuCRBySync = (spu)=>{
    return new Promise((resolve,reject)=>{
        let g = new Goods();
        g.getSpuCR(spu,(err,data)=>{
            resolve({
                err:err,
                data:data
            })
        })
    })
};


module.exports = Goods;