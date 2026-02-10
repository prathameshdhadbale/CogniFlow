
const express = require('express') ;
const {
    getTasks,
    getTask ,
    createTask,
    updateTask ,
    deleteTask,
    completeTask
} = require('../controllers/taskController');

const {protect} = require('../middleware/auth');

const router = express.Router() ;

router.use(protect) ;

// Routes
router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.put('/:id/complete', completeTask);

module.exports = router;