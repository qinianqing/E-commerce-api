const router = require('express').Router();

const order = require('./order');
const wares = require('./wares');
const pack = require('./package');
const map = require('./spu-map');

router.use('/order',order);
router.use('/wares',wares);
router.use('/package',pack);
router.use('/spu-map',map);

module.exports = router;