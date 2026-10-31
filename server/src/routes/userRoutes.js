const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUserStatus, updateMe } = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/me', (req, res) => res.json({ success: true, user: req.user }));
router.patch('/me', updateMe);

// Manager only endpoints
router.get('/', requireRole('manager', 'office_manager'), getUsers);
router.post('/', requireRole('manager'), createUser);
router.patch('/:id/status', requireRole('manager'), updateUserStatus);

module.exports = router;
