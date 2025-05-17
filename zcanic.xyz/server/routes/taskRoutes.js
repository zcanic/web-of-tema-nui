const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken } = require('../middleware/authMiddleware');

// 所有任务路由都需要身份验证
router.use(verifyToken);

// 获取单个任务状态
router.get('/:taskId', taskController.getTaskStatus);

// 批量获取任务状态
router.post('/batch', taskController.batchGetTasksStatus);

module.exports = router; 