const express = require('express');
const clova = require('../clova');
const sensor = require('../sensor');
const router = express.Router();

router.post(`/clova`, clova);
router.get(`/sensor`, sensor);

router.get('/chart', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
  

module.exports = router;
