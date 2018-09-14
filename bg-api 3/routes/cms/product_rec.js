// ziv

var express = require('express');
var router = express.Router();

var ProRec = require('../../objects/ProductRec');

// list
router.get('/list',function (req,res,next) {
    var currentUser = req.session.current;;
    if (currentUser) {
        // 调用对象方法，获取列表
        ProRec.list().then(function (results) {
            res.send(results);
        },function (error) {
            res.send(error);
        })
    }else {
        res.redirect('/login')
    }
})

// add
router.post('/add',function (req,res,next) {
    var currentUser = req.session.current;;
    if (currentUser) {
        // 调用对象方法，获取列表
        ProRec.add(req.body).then(function (result) {
            var resMsg = {
                code:200,
                message:'ok'
            }
            res.send(resMsg);
        },function (error) {
            res.send(error);
        })
    }else {
        res.redirect('/login')
    }
})

// update
router.post('/update',function (req,res,next) {
    var currentUser = req.session.current;;
    if (currentUser) {
        // 调用对象方法，获取列表
        ProRec.update(req.body).then(function (result) {
            res.send(result);
        },function (error) {
            res.send(error);
        })
    }else {
        res.redirect('/login')
    }
})

// delete
router.post('/delete',function (req,res,next) {
    var currentUser = req.session.current;;
    if (currentUser) {
        // 调用对象方法，获取列表
        ProRec.delete(req.body.id).then(function (result) {
            if (result == req.body.id){
                var resMsg = {
                    code:200,
                    message:'ok'
                }
                res.send(resMsg);
            }
        },function (error) {
            res.send(error);
        })
    }else {
        res.redirect('/login')
    }
})

// batch delete
// 批量删除
router.post('/batchdelete',function (req,res,next) {
    var currentUser = req.session.current;
    if (currentUser) {
        // 调用对象方法，获取列表
        var ids = req.body.ids;
        var n = 0;
        for (var i=0;i<ids.length;i++){
            ProRec.delete(ids[i]).then(function (result) {
                if (result == req.body.id){
                    n++;
                    if (n == ids.length){
                        var resMsg = {
                            code:200,
                            message:'ok'
                        }
                        res.send(resMsg);
                    }
                }
            },function (error) {
                res.send(error);
            })
        }

    }else {
        res.redirect('/login')
    }
})

// sort
router.post('/sort',function (req,res,next) {
    var currentUser = req.session.current;;
    if (currentUser) {
        // 调用对象方法，获取列表
        ProRec.sort(req.body.osequence,req.body.nsequence).then(function (result) {
            if (result == 1){
                var resMsg = {
                    code:200,
                    message:'ok'
                }
                res.send(resMsg);
            }
        },function (error) {
            res.send(error);
        })
    }else {
        res.redirect('/login')
    }
})


module.exports = router;