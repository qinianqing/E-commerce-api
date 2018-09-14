/**
 * Created by zhangwei on 17/5/1.
 */
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    //先判断有无current user,如果有则渲染,没有重定向到登录页
    var currentUser = req.session.current;
    if (currentUser) {
        // 跳转到首页
        //res.status(200);
        res.render('./cms/index', { title: '用心吃饭CMS',user_name:currentUser.user_name})
    }
    else {
        //currentUser 为空时，可打开用户注册界面…
        res.redirect('/login')
    }
})


module.exports = router;