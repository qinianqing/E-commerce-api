// search总路由

let express = require('express');
let router = express.Router();

let se = require('./routes/search');

router.use('/',se);

module.exports = router;