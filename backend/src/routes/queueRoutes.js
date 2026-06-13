const express = require('express');
const router = express.Router();

const {
    createQueue,
    getQueues,
    joinQueue,
    nextCustomer,
    getMyPosition,
    cancelQueue,
    getQueueDetails,
    getMyQueues,
} = require('../controllers/queueController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createQueue);
router.get('/', protect, getQueues);
router.post('/join', protect, joinQueue);
router.put('/next', protect, nextCustomer);
router.get('/:queueId/position', protect, getMyPosition);
router.put('/:queueId/cancel', protect, cancelQueue);
router.get('/:queueId/details', protect, getQueueDetails);
router.get('/my-queues', protect, getMyQueues);

module.exports = router;

