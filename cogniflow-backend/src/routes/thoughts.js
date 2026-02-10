const express = require('express');
const {
    getThoughts,
    getThought,
    createThought
} = require('../controllers/thoughtController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getThoughts);
router.post('/', createThought);
router.get('/:id', getThought);

module.exports = router;