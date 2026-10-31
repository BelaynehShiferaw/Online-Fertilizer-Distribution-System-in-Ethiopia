const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  createRecommendation,
  updateRecommendation,
} = require('../controllers/recommendationController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/', getRecommendations);
router.post('/', requireRole('agricultural_expert', 'manager'), createRecommendation);
router.patch('/:id', requireRole('agricultural_expert', 'manager'), updateRecommendation);

module.exports = router;
