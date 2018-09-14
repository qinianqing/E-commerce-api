var express = require('express');
var router = express.Router();
var NodePDF = require('nodepdf');
// var phantomjs = require('../phantomjs/bin/phantomjs');
var fs = require('fs');
// last argument is optional, sets the width and height for the viewport to render the pdf from. (see additional options)
var math = 0;

// let rootPath = __dirname.split('/routes')[0];

// router.get('/list', function (req, res, next) {
    console.log('输出记号====================================');
function a(){
    var goods = [];
    // var items = req.query.items;
    let items =['1','2','3']
    // var packLists = req.query.packageList;
    let packLists=[]
    if (packLists !== undefined) {
        var packList = [];
        for (let n = 0; n < packLists.length; n++) {
            let pack = JSON.parse(packLists[n]);
            packList.push(pack)
        }
        var skuDetail = [];
        for (let l = 0; l < packList.length; l++) {
            for (let m = 0; m < packList[l].sku_detail.length; m++) {
                skuDetail.push(packList[l].sku_detail[m])
            }
        }
    }
    for (let i = 0; i < items.length; i++) {
        let orders = JSON.parse(items[i]);
        goods.push(orders);
    }

    var b = goods[0].sku_name;
    math++;
    var string1 = '';
    var string2 = '';
    var string3 = '';
    var string4 = '';

    // 导入文件
    // fs.readFile(rootPath+'/bin/print.html', 'utf-8', function (err, data) {
    //     if (err) {
    //         throw err;
    //     }
    // if (req.query.province === req.query.city) {
    //     req.query.province = '';
    // }
    // string1 = data;
    // string2 = data;
    // string3 = data;
    // string4 = data;

    var allNumber = 0;
    var total = 0;
    var goodsTotal = (100 * 0.01).toFixed(2);
    for (let i = 0; i < goods.length; i++) {
        total += goods[i].num;
    }
    for (let i = 0; i < goods.length; i++) {
        string1 += '<tr class="tra' + i + '"><td style=" text-align:left; ">' + goods[i].spu_name + '</td><td style="width: 200px;">' + goods[i].sku_name + '</td><td style="width: 200px;">' + goods[i].num + '</td><td style="width: 150px;">' + goods[i].unit_price + '</td></tr>'
        allNumber += goods[i].num
    }
    if (packLists !== undefined) {
        string3 = '<div class="goods-list">订阅商品列表</div><table border="0" cellpadding="0" cellspacing="0"><tr class="tr1"><th class="num">商品名称</th><th class="name">商品规格</th><th class="price">订单数量</th><th class="rental">单价(元)</th></tr>'
        string4 = ' <tr class="goods-num"><td></td> <td></td><td></td><td></td></tr></table>';
        for (let i = 0; i < skuDetail.length; i++) {
            string2 += '<tr class="tra' + i + '"><td style=" text-align:left; ">' + skuDetail[i].goods_name + '</td><td style="width: 200px;">' + skuDetail[i].type_id + '</td><td style="width: 200px;">' + skuDetail[i].num + '</td><td style="width: 150px;">' + skuDetail[i].price + '</td></tr>'
            allNumber += goods[i].num
        }
    }
    var pdf = new NodePDF(math + '.pdf', math + '.pdf', {
        'content': `<html>
<head>
    <style>
        div{
            margin-bottom: 10px;
        }
        .jinshi-deliver{
            margin-bottom: 30px;
            height: 29px;
        }
        .deliver-contact{
            margin:30px 0 15px 20px;         
        }
        .deliver-address{
            margin: 0 0 15px 20px;
        }
        .deliver-goods{
            border:2px solid black;
            border-radius: 10px;
            font-size: 12px;
        }
        .deliver-data{
            margin: 0 0 24px 20px
        }
        .handle-date{
            position: absolute;
            right: 30px;
        }
        .goods-list{
            margin: 20px 0 15px 20px;
            font-size: 18px;
        }
        .goods-num td{
            border-top:black solid 1px;
            text-align:center;
            width: 870px;
            padding-top: 15px;

        }
        .phone{
            position: absolute;
            right: 30px;
        }
        table{
            text-align: center;
            font-size: 10px;
            margin-left: 20px;
        }
        th{
            padding:0 0 15px 0;
            font-size: 12px;
        }
        td{
            padding:0 0 10px 0;
        }
        tr{
        }
        .tr1{
            /*padding-bottom: 29px;           */
        }
        .num{
            width:40%;
            text-align: left;
        }
        .name{
            width: 200px;
        }
        .price{
            width: 200px;
        }
        .rental{
            width: 150px;
        }
        .deliver{
            font-size: 21px;
            float: right;
            display: inline-block;
        }
        .img{
            display: inline-block;
            width: 70px;
            height: 29px;
        }
    </style>
</head>
<body>
<div class="jinshi">
<div class="jinshi-deliver">
  <img class="img" src="https://cdn.jiyong365.com/%E5%8F%91%E8%B4%A7%E5%8D%95-02.png" alt="">
  <div class="deliver">发货单</div>
</div>
<div class="deliver-goods">
<div class="deliver-contact">
    <span>联 系 人 ：</span>
    <span class="phone">联系电话：456790</span>
</div>
<div class="deliver-address"><span class="address">送货地址：</span></div>
<div class="deliver-data">
    <span>订单号</span>
    <span class="handle-date">订单时间：</span>
</div>
</div>
<div class="goods-list">商品列表</div>
<table border="0" cellpadding="0" cellspacing="0">
    <tr class="tr1">
        <th class="num">商品名称</th>
        <th class="name">商品规格</th>
        <th class="price">订单数量</th>
        <th class="rental">单价(元)</th>
    </tr>
    
    <tr class="goods-num">
      <td></td>
      <td></td>
      <td>商品总数：</td>
      <td>werewr</td>
    </tr>
    <tr class="goods-price">
      <td></td>
      <td></td>
      <td>商品总价：</td>
      <td>${goodsTotal}</td>
    </tr>
    <tr class="goods-price">
      <td></td>
      <td></td>
      <td>优惠金额：</td>
      <td>$晚上发生的</td>
    </tr>
    <tr class="goods-price">
      <td></td>
      <td></td>
      <td>运&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;费&nbsp;：</td>
      <td>日2423}</td>
    </tr> 
</table>
    ${string3}
    ${string2}
    ${string4}
</div>
</body>
</html>`,
        'viewportSize': {
            'width': 1440,
            'height': 900,
        },
        'paperSize': {
            'pageFormat': 'A4',
            'margin': {
                'top': '1.5cm'
            },
        },
        'outputQuality': '80',
        'zoomFactor': 1.1
    });
    // res.send(`http://localhost:3000/${math}.pdf`);

    pdf.on('error', function (msg) {
        console.log('错错错错错错错错错错错错错错错错错错错错错错====--------====错错错错错错错错错错错错错错错错错错错错错错')
        console.log(msg);
    });
    pdf.on('done', function (pathToFile) {
        console.log('oooooooooooooo', pathToFile);
        res.send(`http://api.eatgood365.com/${math}.pdf`);
        // if (math >1){
        //     fs.unlink(pathToFile,function (err) {
        //         if (err){
        //             console.log("err")
        //         }else {
        //             console.log('OK');
        //         }
        //     });
        // }

    });
}
   a();
// listen for stdout from phantomjs
//         pdf.on('stdout', function (stdout) {
//             // handle
//         });
//
// // listen for stderr from phantomjs
//         pdf.on('stderr', function (stderr) {
//             // handle
//         });
    // });
// });
// module.exports = router;