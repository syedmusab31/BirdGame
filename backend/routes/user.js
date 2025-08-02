const express = require('express');
const {
  getDashboard,
  collectEggs,
  getEggsToCollect,
  sellAllEggs,
  claimDailyBonus,
  getBonusHistory,
  getReferrals,
  exchangeBalance,
getSellEggs
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.get('/dashboard', getDashboard);
router.post('/collect-eggs', collectEggs);
router.get('/eggs-to-collect', getEggsToCollect);
// Get eggs to be sold
router.get('/eggs-to-sell', getSellEggs);
router.post('/sell-eggs', sellAllEggs);
router.post('/claim-bonus', claimDailyBonus);
router.get('/bonus-history', getBonusHistory);
router.get('/referrals', getReferrals);

router.post('/exchange-balance', [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
], exchangeBalance);

module.exports = router;