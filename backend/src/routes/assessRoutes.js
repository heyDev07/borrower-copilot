const express = require('express');
const { postAssess } = require('../controllers/assessController');

const router = express.Router();

router.post('/', postAssess);

module.exports = router;
