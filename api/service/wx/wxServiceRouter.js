const router = require('express').Router();

const fwh = require('./routes/fwh');
const wa = require('./routes/wa');

router.use('/fwh',fwh);
router.use('/wa',wa);

module.exports = router;