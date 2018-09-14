/**
 *
 * Created by Ziv on 2017/9/14.
 */
let express = require('express');
let router = express.Router();
let Goods = require('../../models/Goods');
const sort = require('../../util/util');
const uuid = require('uuid/v4');

// list
router.get('/list', function (req, res, next) {

    let last_key;
    if (req.query.goods_id) {
        last_key = {
            goods_id: req.query.goods_id,
            sku_id:req.query.goods_id
        }
    }
    // 获取商品列表
    let goods = new Goods();
    goods.getAllGoods((err, datas) => {
        goods.getGoodsCMS((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                let list = [];
                for (let i = 0; i < data.Count; i++) {

                    let items = {
                        brand_id: data.Items[i].attrs.brand_id,
                        discount_price: data.Items[i].attrs.discount_price,
                        top_price: data.Items[i].attrs.top_price,
                        mini_price: data.Items[i].attrs.mini_price,
                        goods_cashback: data.Items[i].attrs.goods_cashback,
                        default_image: data.Items[i].attrs.default_image,
                        carousel_image: data.Items[i].attrs.carousel_image,
                        share: data.Items[i].attrs.share,
                        describe: data.Items[i].attrs.describe,
                        details_image: data.Items[i].attrs.details_image,
                        goods_id: data.Items[i].attrs.goods_id,
                        level3_id: data.Items[i].attrs.level3_id,
                        goods_name: data.Items[i].attrs.goods_name,
                        goods_price: data.Items[i].attrs.goods_price,
                        service: data.Items[i].attrs.service,
                        show: data.Items[i].attrs.show,
                        styles: data.Items[i].attrs.styles,
                        tag: data.Items[i].attrs.tag,
                        skus: data.Items[i].attrs.skus,
                        direct: data.Items[i].attrs.direct,
                    };
                    list.push(items)
                }
                // 返回正向排序的数据
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    dataCount: datas.Count,
                    data: data
                    // data: sort.ascending(list)
                })
            }
        }, last_key);
    })

});

router.get('/show-list', function (req, res, next) {
    console.log('req',req.query)
    let last_key;
    if (req.query.goods_id) {
        last_key = {
            goods_id: req.query.goods_id,
            sku_id:req.query.goods_id
        }
    }
    // 获取商品列表
    let goods = new Goods();
    goods.sku_id= '0';
    // goods.show = req.query.show;
    let Show = JSON.parse(req.query.show);
    console.log('goods:',goods);

    goods.getAllGoods((err, datas) => {
        goods.getGoodsCMSShow(Show,(err, data) => {
            console.log('data',data);
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                let list = [];
                for (let i = 0; i < data.Count; i++) {
                    let items = {
                        brand_id: data.Items[i].attrs.brand_id,
                        discount_price: data.Items[i].attrs.discount_price,
                        top_price: data.Items[i].attrs.top_price,
                        mini_price: data.Items[i].attrs.mini_price,
                        goods_cashback: data.Items[i].attrs.goods_cashback,
                        default_image: data.Items[i].attrs.default_image,
                        carousel_image: data.Items[i].attrs.carousel_image,
                        share: data.Items[i].attrs.share,
                        describe: data.Items[i].attrs.describe,
                        details_image: data.Items[i].attrs.details_image,
                        goods_id: data.Items[i].attrs.goods_id,
                        level3_id: data.Items[i].attrs.level3_id,
                        goods_name: data.Items[i].attrs.goods_name,
                        goods_price: data.Items[i].attrs.goods_price,
                        service: data.Items[i].attrs.service,
                        show: data.Items[i].attrs.show,
                        styles: data.Items[i].attrs.styles,
                        tag: data.Items[i].attrs.tag,
                        skus: data.Items[i].attrs.skus,
                        direct: data.Items[i].attrs.direct,
                    };
                    list.push(items)
                }
                // 返回正向排序的数据
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    dataCount: datas.Count,
                    data: data
                    // data: sort.ascending(list)
                })
            }
        }, last_key);
    })

});

// list
router.get('/query-list', function (req, res, next) {
    // 获取商品列表
    let goods = new Goods();
    goods.queryGoods(req.query.goods_name, (err, data) => {
        if (err) {
            res.send({
                error_code: 5002,
                error_msg: err.message
            })
        } else {
            // 返回正向排序的数据
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: data
            })
        }
    });

});

//
router.get('/allList', function (req, res, next) {
    // 获取商品列表
    let goods = new Goods();
    goods.AllGoods((err, data) => {
        if (err) {
            res.send({
                error_code: 5002,
                error_msg: err.message
            })
        } else {
            // 返回正向排序的数据
            res.send({
                error_code: 0,
                error_msg: 'ok',
                data: data
            })
        }
    });
});

// add
router.post('/add', function (req, res, next) {
    if (!req.currentUser) {
        return res.sendStatus(404);
    }
    if (req.body.goods_id && req.body.brand_id && req.body.op && req.body.discount_price >= 0 && req.body.goods_cashback >= 0 && req.body.describe && req.body.default_image &&
        req.body.details_image.length>0 && req.body.goods_name && req.body.level3_id && req.body.carousel_image.length>0 && req.body.share
        && req.body.goods_price && req.body.tag && req.body.service && req.body.specPrices && req.body.rank_image) {
        // 新建
        let goods = new Goods();
        goods.getGoods((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                let sku = [];
                let b = 9999;
                goods.goods_id = req.body.goods_id;
                goods.brand_id = req.body.brand_id;
                goods.describe = req.body.describe;
                goods.op = req.body.op;
                goods.share = req.body.share;
                goods.correlation = req.body.correlation;
                goods.goods_cashback = req.body.goods_cashback;
                goods.top_price = req.body.top_price;
                goods.mini_price = req.body.mini_price;
                goods.carousel_image = req.body.carousel_image;
                goods.discount_price = req.body.discount_price;
                goods.default_image = req.body.default_image;
                goods.details_image = req.body.details_image;
                goods.goods_name = req.body.goods_name;
                goods.level3_id = req.body.level3_id;
                goods.goods_price = req.body.goods_price;
                goods.share_image = req.body.share_image || '';
                if (req.body.tag.length === 0){
                    goods.tag = [];
                }else{
                    goods.tag = req.body.tag;
                }
                goods.show = true;
                goods.service = req.body.service;
                goods.rank_image = req.body.rank_image;

                if (req.body.member.length !== 0) {
                    goods.member = req.body.member;
                }
                if (req.body.space.length !== 0) {
                    goods.space = req.body.space;
                }
                for (let i = 0; i < req.body.specPrices.length; i++) {
                    b++;
                    let type = req.body.specPrices[i].spec0 + ' ' + req.body.specPrices[i].spec1 + ' ' + req.body.specPrices[i].spec2;
                    let types = type.replace("undefined", "");
                    let type2 = types.replace("undefined", "");
                    let typess = type2.replace(/(\s*$)/g, "");
                    let goodsId2 = String(goods.goods_id + "-" + b);
                    let item = {
                        price: req.body.specPrices[i].prices.price,
                        cashback: Number(req.body.specPrices[i].prices.cashback),
                        image: req.body.specPrices[i].prices.image,
                        participation: req.body.specPrices[i].prices.participation,
                        number: Number(req.body.specPrices[i].prices.number),
                        show: true,
                        sku_id: goodsId2,
                        stock: Number(req.body.specPrices[i].prices.stock),
                        barcode: req.body.specPrices[i].prices.barcode,
                        sh_stock: Number(req.body.specPrices[i].prices.sh_stock),
                        gz_stock: Number(req.body.specPrices[i].prices.gz_stock),
                        cd_stock: Number(req.body.specPrices[i].prices.cd_stock),
                        type_id: typess,
                        weight: Number(req.body.specPrices[i].prices.weight),
                        specification: req.body.specPrices[i].prices.specification,
                    };
                    sku.push(item);
                }
                goods.skus = sku;
                let style = [];
                for (let n = 0; n < req.body.specs.length; n++) {
                    let items = {
                        id: uuid().replace(/-/g, ''),
                        name: req.body.specs[n].type,
                        namelist: req.body.specs[n].children
                    };
                    style.push(items)
                }
                goods.styles = style;
                goods.create((err, data) => {
                    if (err) {
                        res.send({
                            error_code: 5002,
                            error_msg: err.message
                        })
                    } else {

                        res.send({
                            error_code: 0,
                            error_msg: 'ok',
                            data: data.attrs
                        })
                    }
                })
            }
        });
    } else {
        res.send({
            error_code: 5003,
            error_msg: 'short param'
        })
    }
});

// update
router.post('/update', function (req, res, next) {
    console.log('2222')
    if (!req.currentUser) {
        return res.sendStatus(404);
    }
    // 更新
    if (req.body.goods_id && req.body.brand_id && req.body.op && req.body.describe && req.body.default_image && req.body.details_image.length>0 &&
        req.body.discount_price >= 0 && req.body.goods_cashback >= 0 && req.body.goods_name && req.body.level3_id && req.body.carousel_image.length>0 &&
        req.body.share && req.body.goods_price && req.body.tag && req.body.service && req.body.priority >= 0 && req.body.specPrices && req.body.rank_image) {
        // 更新
        let goods = new Goods();
        let sku = [];
        goods.goods_id = req.body.goods_id;
        goods.brand_id = req.body.brand_id;
        goods.share = req.body.share;
        goods.op = req.body.op;
        goods.goods_cashback = Number(req.body.goods_cashback);
        goods.top_price = Number(req.body.top_price);
        goods.mini_price = Number(req.body.mini_price);
        goods.carousel_image = req.body.carousel_image;
        goods.correlation = req.body.correlation;
        goods.discount_price = Number(req.body.discount_price);
        goods.describe = req.body.describe;
        goods.default_image = req.body.default_image;
        goods.details_image = req.body.details_image;
        goods.goods_name = req.body.goods_name;
        goods.level3_id = req.body.level3_id;
        goods.goods_price = req.body.goods_price;
        goods.tag = req.body.tag;
        goods.show = req.body.show;
        goods.service = req.body.service;
        goods.rank_image = req.body.rank_image;
        goods.direct = req.body.direct;
        goods.priority = Number(req.body.priority);
        goods.share_image = req.body.share_image || '';

        if (req.body.member.length !== 0) {
            goods.member = req.body.member;
        }
        if (req.body.space.length !== 0) {
            goods.space = req.body.space;
        }
        let b = 9999;
        for (let i = 0; i < req.body.specPrices.length; i++) {
            b++;
            let type = req.body.specPrices[i].spec0 + ' ' + req.body.specPrices[i].spec1 + ' ' + req.body.specPrices[i].spec2;
            let types = type.replace("undefined", "");
            let type2 = types.replace("undefined", "");
            let typess = type2.replace(/(\s*$)/g, "");
            let goodsId2 = String(goods.goods_id + "-" + b);

            // let arr = [];
            // if (req.body.specPrices[i].prices.sku_id){
            //     arr.push(req.body.specPrices[i].prices.sku_id)
            // }
            // function getCaption(obj){
            //     var index=obj.lastIndexOf("\-");
            //     obj=obj.substring(index+1,obj.length);
            //     return obj;
            // }
            // var str="执法办案流程-立案审批";
            // getCaption(str);
            //
            // var max = Math.max.apply(null,arr);
            // console.log(max);
            // if (!req.body.specPrices[i].prices.sku_id){
            //
            // }

            let item = {
                price: req.body.specPrices[i].prices.price,
                cashback: Number(req.body.specPrices[i].prices.cashback),
                image: req.body.specPrices[i].prices.image,
                participation: req.body.specPrices[i].prices.participation,
                number: Number(req.body.specPrices[i].prices.number),
                show: req.body.specPrices[i].prices.show,
                sku_id: goodsId2,
                stock: Number(req.body.specPrices[i].prices.stock),
                barcode: req.body.specPrices[i].prices.barcode,
                sh_stock: Number(req.body.specPrices[i].prices.sh_stock),
                gz_stock: Number(req.body.specPrices[i].prices.gz_stock),
                cd_stock: Number(req.body.specPrices[i].prices.cd_stock),
                type_id: typess,
                weight: Number(req.body.specPrices[i].prices.weight),
                specification: req.body.specPrices[i].prices.specification,
            };
            sku.push(item);
        }
        goods.skus = sku;
        let style = [];
        for (let n = 0; n < req.body.specs.length; n++) {
            let items = {
                id: uuid().replace(/-/g, ''),
                name: req.body.specs[n].type,
                namelist: req.body.specs[n].children
            };
            style.push(items)
        }
        goods.styles = style;

        goods.updateGoods((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data.attrs
                })
            }
        })
    } else {
        res.send({
            error_code: 5003,
            error_msg: 'short param'
        })
    }
});
// update show
router.post('/update-show', function (req, res, next) {
    if (!req.currentUser) {
        return res.sendStatus(404);
    }
    // 更新
    if (req.body.goods_id) {
        // 更新
        let goods = new Goods();
        goods.goods_id = req.body.goods_id;
        goods.show = req.body.show;
        goods.updateGoodsShow((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data.attrs
                })
            }
        })
    } else {
        res.send({
            error_code: 5003,
            error_msg: 'short param'
        })
    }
});

// update show
router.post('/update-shows', function (req, res, next) {
    if (!req.currentUser) {
        return res.sendStatus(404);
    }
    // 更新
    if (req.body.goods_id) {
        // 更新
        let goods = new Goods();
        goods.goods_id = req.body.goods_id;
        goods.show = req.body.show;
        let arr = [];
        for (let i =0; i<req.body.skus.length; i++){
            let item = {
                price: req.body.skus[i].price,
                cashback: Number(req.body.skus[i].cashback),
                image: req.body.skus[i].image,
                participation: req.body.skus[i].participation,
                number: Number(req.body.skus[i].number),
                show: false,
                sku_id: req.body.skus[i].sku_id,
                stock: Number(req.body.skus[i].stock),
                barcode: '条形编码',
                sh_stock: 0,
                gz_stock: 0,
                cd_stock: 0,
                type_id: req.body.skus[i].type_id,
                weight: Number(req.body.skus[i].weight),
                specification: req.body.skus[i].specification,
            };
            arr.push(item)
        }
        goods.skus = arr;
        goods.updateGoodsShow((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data.attrs
                })
            }
        })
    } else {
        res.send({
            error_code: 5003,
            error_msg: 'short param'
        })
    }
});

//carousel_image排序
router.post('/carousel-image',function(req,res,next){
    if (!req.currentUser) {
        return res.sendStatus(404);
    }
    if (req.body.goods_id && req.body.carousel_image && Number(req.body.oldIndex)>=0 && Number(req.body.newIndex)>=0){
        let goods = new Goods();
        goods.goods_id = req.body.goods_id;
        //如果当前元素在拖动目标位置的下方，先将当前元素从数组拿出，数组长度-1，我们直接给数组拖动目标位置的地方新增一个和当前元素值一样的元素，
        //我们再把数组之前的那个拖动的元素删除掉，所以要len+1
        let arr = req.body.carousel_image;
        // index是当前元素下标，tindex是拖动到的位置下标。
        let index = req.body.oldIndex;
        let tindex = req.body.newIndex;
        if (index > tindex) {
            arr.splice(tindex, 0, arr[index]);
            arr.splice(index + 1, 1);
        } else {
            //如果当前元素在拖动目标位置的上方，先将当前元素从数组拿出，数组长度-1，我们直接给数组拖动目标位置+1的地方新增一个和当前元素值一样的元素，
            //这时，数组len不变，我们再把数组之前的那个拖动的元素删除掉，下标还是index
            arr.splice(tindex + 1, 0, arr[index]);
            arr.splice( index, 1)
        }
        goods.carousel_image = arr;
        goods.sortCarouselImage((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data.attrs
                })
            }
        })
    }else {
        res.send({
            error_code: 5003,
            error_msg: 'short param'
        })
    }

});

//details_image排序
router.post('/details-image',function(req,res,next){
    if (!req.currentUser) {
        return res.sendStatus(404);
    }
    if (req.body.goods_id && req.body.details_image && Number(req.body.oldIndex)>=0 && Number(req.body.newIndex)>=0){
        let goods = new Goods();
        goods.goods_id = req.body.goods_id;
        //如果当前元素在拖动目标位置的下方，先将当前元素从数组拿出，数组长度-1，我们直接给数组拖动目标位置的地方新增一个和当前元素值一样的元素，
        //我们再把数组之前的那个拖动的元素删除掉，所以要len+1
        let arr = req.body.details_image;
        // index是当前元素下标，tindex是拖动到的位置下标。
        let index = req.body.oldIndex;
        let tindex = req.body.newIndex;
        if (index > tindex) {
            arr.splice(tindex, 0, arr[index]);
            arr.splice(index + 1, 1);
        } else {
            //如果当前元素在拖动目标位置的上方，先将当前元素从数组拿出，数组长度-1，我们直接给数组拖动目标位置+1的地方新增一个和当前元素值一样的元素，
            //这时，数组len不变，我们再把数组之前的那个拖动的元素删除掉，下标还是index
            arr.splice(tindex + 1, 0, arr[index]);
            arr.splice( index, 1)
        }
        goods.details_image = arr;
        goods.sortDetailsImage((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data.attrs
                })
            }
        })
    }else {
        res.send({
            error_code: 5003,
            error_msg: 'short param'
        })
    }

});

//rank_image排序
router.post('/rank-image',function(req,res,next){
    if (!req.currentUser) {
        return res.sendStatus(404);
    }
    if (req.body.goods_id && req.body.rank_image && Number(req.body.oldIndex)>=0 && Number(req.body.newIndex)>=0){
        let goods = new Goods();
        goods.goods_id = req.body.goods_id;
        //如果当前元素在拖动目标位置的下方，先将当前元素从数组拿出，数组长度-1，我们直接给数组拖动目标位置的地方新增一个和当前元素值一样的元素，
        //我们再把数组之前的那个拖动的元素删除掉，所以要len+1
        let arr = req.body.rank_image;
        // index是当前元素下标，tindex是拖动到的位置下标。
        let index = req.body.oldIndex;
        let tindex = req.body.newIndex;
        if (index > tindex) {
            arr.splice(tindex, 0, arr[index]);
            arr.splice(index + 1, 1);
        } else {
            //如果当前元素在拖动目标位置的上方，先将当前元素从数组拿出，数组长度-1，我们直接给数组拖动目标位置+1的地方新增一个和当前元素值一样的元素，
            //这时，数组len不变，我们再把数组之前的那个拖动的元素删除掉，下标还是index
            arr.splice(tindex + 1, 0, arr[index]);
            arr.splice( index, 1)
        }
        goods.rank_image = arr;
        goods.sortRankImage((err, data) => {
            if (err) {
                res.send({
                    error_code: 5002,
                    error_msg: err.message
                })
            } else {
                res.send({
                    error_code: 0,
                    error_msg: 'ok',
                    data: data.attrs
                })
            }
        })
    }else {
        res.send({
            error_code: 5003,
            error_msg: 'short param'
        })
    }

});

module.exports = router;
