const express = require('express');
const clova = require('../clova');
const sensor = require('../sensor');
const router = express.Router();

router.post(`/clova`, clova);
router.get(`/sensor`, sensor);

module.exports = router;
