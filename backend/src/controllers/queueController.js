const asyncHandler = require('express-async-handler');
const Queue = require('../models/Queue');
const QueueEntry = require('../models/QueueEntry');

// Create Queue
const createQueue = asyncHandler(async (req, res) => {
    const { queueName } = req.body;

    const queue = await Queue.create({
        queueName,
        createdBy: req.user._id,
    });

    res.status(201).json(queue);
});

// Get All Queues
const getQueues = asyncHandler(async (req, res) => {
    const queues = await Queue.find({ status: 'active' });
    res.json(queues);
});
const joinQueue = asyncHandler(async (req, res) => {
    const { queueId } = req.body;

    const queue = await Queue.findById(queueId);

    if (!queue) {
        res.status(404);
        throw new Error('Queue not found');
    }

    queue.lastToken += 1;
    await queue.save();

    const entry = await QueueEntry.create({
        queue: queue._id,
        user: req.user._id,
        tokenNumber: queue.lastToken,
    });
    const io = req.app.get('io');
    io.emit('queueUpdated', { queueId });
    const position = entry.tokenNumber - queue.currentToken;
    const estimatedWaitTime = position * 5;

    res.status(201).json({
        message: 'Joined queue successfully',
        tokenNumber: entry.tokenNumber,
        currentToken: queue.currentToken,
        position,
        estimatedWaitTime,
        entry,
    });


});
const nextCustomer = asyncHandler(async (req, res) => {
    const { queueId } = req.body;

    const queue = await Queue.findById(queueId);

    if (!queue) {
        res.status(404);
        throw new Error('Queue not found');
    }

    queue.currentToken += 1;
    await queue.save();

    await QueueEntry.findOneAndUpdate(
        {
            queue: queueId,
            tokenNumber: queue.currentToken,
            status: 'waiting',
        },
        {
            status: 'served',
        }
    );
    const io = req.app.get('io');
    io.emit('queueUpdated', { queueId });

    res.json({
        message: 'Moved to next customer',
        currentToken: queue.currentToken,
    });
});
const getMyPosition = asyncHandler(async (req, res) => {
    const { queueId } = req.params;

    const queue = await Queue.findById(queueId);

    if (!queue) {
        res.status(404);
        throw new Error('Queue not found');
    }

    const entry = await QueueEntry.findOne({
        queue: queueId,
        user: req.user._id,
        status: 'waiting',
    });

    if (!entry) {
        res.status(404);
        throw new Error('You are not in this queue');
    }
    const position = entry.tokenNumber - queue.currentToken;
    const estimatedWaitTime = position * 5;
    res.json({
        queueName: queue.queueName,
        tokenNumber: entry.tokenNumber,
        currentToken: queue.currentToken,
        position,
        estimatedWaitTime,
        status: entry.status,
    });


});
const cancelQueue = asyncHandler(async (req, res) => {
    const { queueId } = req.params;

    const entry = await QueueEntry.findOne({
        queue: queueId,
        user: req.user._id,
        status: 'waiting',
    });

    if (!entry) {
        res.status(404);
        throw new Error('Queue entry not found');
    }

    entry.status = 'cancelled';
    await entry.save();
    const io = req.app.get('io');
    io.emit('queueUpdated', { queueId });

    res.json({
        message: 'Queue cancelled successfully',
    });
});
const getQueueDetails = asyncHandler(async (req, res) => {
    const { queueId } = req.params;

    const queue = await Queue.findById(queueId);

    if (!queue) {
        res.status(404);
        throw new Error('Queue not found');
    }

    const waitingCount = await QueueEntry.countDocuments({
        queue: queueId,
        status: 'waiting',
    });

    const servedCount = await QueueEntry.countDocuments({
        queue: queueId,
        status: 'served',
    });

    const cancelledCount = await QueueEntry.countDocuments({
        queue: queueId,
        status: 'cancelled',
    });

    res.json({
        queueName: queue.queueName,
        currentToken: queue.currentToken,
        lastToken: queue.lastToken,
        status: queue.status,
        waitingCount,
        servedCount,
        cancelledCount,
    });
});
const getMyQueues = asyncHandler(async (req, res) => {
    const queues = await Queue.find({
        createdBy: req.user._id,
    });

    res.json(queues);
});
module.exports = {
    createQueue,
    getQueues,
    joinQueue,
    nextCustomer,
    getMyPosition,
    cancelQueue,
    getQueueDetails,
    getMyQueues,


};



