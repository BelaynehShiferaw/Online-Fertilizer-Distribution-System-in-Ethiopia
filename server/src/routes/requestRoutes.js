const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getRequestById,
  submitDraftRequest,
  reviewRequestByExpert,
} = require('../controllers/requestController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.post('/', requireRole('farmer'), createRequest);
router.get('/', getRequests);
router.get('/:id', getRequestById);
router.post('/:id/submit', requireRole('farmer'), submitDraftRequest);
router.post('/:id/review', requireRole('agricultural_expert'), reviewRequestByExpert);

module.exports = router;
