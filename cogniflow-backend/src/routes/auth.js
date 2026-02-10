

const express = require('express') ;
const {register , login , getMe} = require('../controllers/authController');

const {protect} = require('../middleware/auth'); 

const router = express.Router();

// public routes

router.post('/register',register);
router.post('/login',login);

//protected 

router.get('/me',protect,getMe);

module.exports = router;