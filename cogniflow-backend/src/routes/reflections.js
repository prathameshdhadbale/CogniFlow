const express = require('express');
const {
    getReflections,
    getTodayReflection,
    createReflection
} = require('../controllers/reflectionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getReflections);
router.get('/today', getTodayReflection);
router.post('/', createReflection);

module.exports = router;