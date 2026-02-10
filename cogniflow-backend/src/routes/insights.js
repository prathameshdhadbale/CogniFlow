const express = require('express');
const {
    getInsights,
    getPatterns
} = require('../controllers/insightController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getInsights);
router.get('/patterns', getPatterns);

module.exports = router;