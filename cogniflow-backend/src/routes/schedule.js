const express = require('express');
const {
    getTodaySchedule,
    getSchedule,
    generateSchedule,
    adjustSchedule
} = require('../controllers/scheduleController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/today', getTodaySchedule);
router.get('/:date', getSchedule);
router.post('/generate', generateSchedule);
router.put('/adjust', adjustSchedule);

module.exports = router;