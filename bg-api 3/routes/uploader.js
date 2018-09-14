/**
 * Created by Mbb on 2017/5/29.
 */
var express = require('express');
var formidable = require('formidable');
const { qiniuConfig } = require('../config');
// 文件系统
var fs = require('fs');

var router = express.Router();

var qiniu = require("qiniu");

qiniu.conf.ACCESS_KEY = qiniuConfig.ACCESS_KEY;
qiniu.conf.SECRET_KEY = qiniuConfig.SECRET_KEY;

var mac = new qiniu.auth.digest.Mac(qiniu.conf.ACCESS_KEY,qiniu.conf.SECRET_KEY);
//要上传的空间
var bucket = 'jinshi-product';

//构建上传策略函数
function uptoken(bucket, key) {
    var options = {
        scope:bucket+":"+key
    }
    var putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(mac);
}

//构造上传函数
function uploadFile(uptoken, key, localFile) {
    return new Promise(function (resolve,reject) {
        var extra = new qiniu.form_up.PutExtra();
        var formUploader = new qiniu.form_up.FormUploader();
        formUploader.putFile(uptoken, key, localFile, extra, function(err, ret) {
            if(!err) {
                // 上传成功， 处理返回值
                //console.log(ret.hash, ret.key, ret.persistentId);
                resolve(ret.hash);
            } else {
                // 上传失败， 处理返回代码
                reject(err);
            }
        });
    })
}

router.post('/', function(req, res, next) {
    // console.log('1111')
    // var currentUser = req.session.current;
    // if (!req.currentUser){
    //     return res.sendStatus(404);
    // }
    // if (currentUser) {
        // 开始上传
        var form = new formidable.IncomingForm(); //创建上传表单
        form.encoding = 'utf-8'; //设置编码格式

        form.keepExtensions = true; //保留后缀
        form.maxFieldsSize = 500 * 1024 * 1024; //文件大小
        form.type = true;
        form.parse(req, function(err, fields, files) {
            files.upload = files.file
            if (err) {
                res.send(err);
                return;
            }
            var extName = ''; //后缀名
            extName = files.upload.name;
            extName = extName.substring(extName.lastIndexOf('.')+1, extName.length);
            //console.log(extName)
            switch (files.upload.type) {
                // 图片
                case 'image/pjpeg':
                    extName = 'jpg';
                    break;
                case 'image/jpeg':
                    extName = 'jpg';
                    break;
                case 'image/png':
                    extName = 'png';
                    break;
                case 'image/x-png':
                    extName = 'png';
                    break;
                case 'image/gif':
                    extName = 'gif';
                    break;
                // 视频
                case 'video/x-msvideo':
                    extName = 'avi';
                    break;
                case 'video/quicktime':
                    extName = 'mov';
                    break;
                case 'video/x-sgi-movie':
                    extName = 'movie';
                    break;
                // 音频
                case 'audio/mpeg':
                    extName = 'mp3';
                    break;
                case 'audio/x-wav':
                    extName = 'wav';
                    break;
            }
            if (extName.length === 0) {
                res.send({
                    code: 202,
                    msg: '不支持的文件类型'
                });
                return;
            } else {
                var randomStr = Math.random().toString(36).substr(2);
                var picName = 'pic' + Date.now() + randomStr + '.' + extName;
                //var newPath = form.uploadDir + picName;
                //fs.renameSync(files.upload.path, newPath); //重命名
                // 开始向七牛上传
                //上传到七牛后保存的文件名
                var key = picName;

                //生成上传 Token
                var token = uptoken(bucket, key);
                //要上传文件的本地路径
                var filePath = files.upload.path;

                //调用uploadFile上传
                uploadFile(token, key, filePath).then((resp)=>{
                        res.send({
                            error_code: 0,
                            error_msg:'ok',
                            data: 'https://img0.jiyong365.com/'+picName
                        });
                        // 删除路径下的临时图片
                        fs.unlink(filePath, function (err) {
                            if(err){
                                console.error(err);
                            }
                        })

                },(err)=>{
                    res.send({
                        error_code: 500,
                        error_msg:err.message
                    });
                    fs.unlink(filePath, function (err) {
                        if (err){
                            console.error(err);
                        }
                    })
                })
            }
        })
    // }
    // else {
    //     //currentUser 为空时，可打开用户注册界面…
    //     res.send({
    //         error_code: 5000,
    //         error_msg:'not login'
    //     });
    // }
});



module.exports = router;