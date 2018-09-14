let express = require('express');

let app = express();

// health check
app.get('/health-check',function (req,res,next) {
    res.status(200).send('ok');
});

let f = require('./task/getWxAccessToken');
let fwh = require('./task/getFwhAccessToken');

// 向外部接口提供微信小程序token
app.get('/schedule/wx-access-token',function (req,res,next) {
    res.send(f.token())
});

// 向外部接口提供服务号token
app.get('/schedule/fwh-access-token',function (req,res,next) {
    res.send(fwh.token())
});

app.post('/schedule/reset-token',(req,res,next)=>{
    if (req.body.secret !== '1314'){
        res.sendStatus(404);
    }
    fwh.fetch();
    f.fetch();
    res.sendStatus(200);
});

module.exports = app;