const express = require('express');
const {
  createDeposit,
  getDepositHistory,
  createWithdrawal,
  getWithdrawalHistory,
  getConversionRates
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { depositValidation, withdrawalValidation } = require('../middleware/validationMiddleware');

const router = express.Router();

// All payment routes require authentication
router.use(protect);

router.get('/rates', getConversionRates);

// Deposit routes
router.post('/deposit', depositValidation, createDeposit);
router.get('/deposits', getDepositHistory);

// Withdrawal routes
router.post('/withdraw', withdrawalValidation, createWithdrawal);
router.get('/withdrawals', getWithdrawalHistory);

module.exports = router;