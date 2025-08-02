const express = require('express');
const {
  getDashboard,
  createBird,
  getAllBirds,
  updateBird,
  getAllUsers,
  getAllDeposits,
  updateDepositStatus,
  getAllWithdrawals,
  updateWithdrawalStatus,
  getConversionRates,
  updateConversionRates
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const { birdValidation } = require('../middleware/validationMiddleware');
const { body } = require('express-validator');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(protect, admin);

router.get('/dashboard', getDashboard);

// Bird management
router.post('/birds', birdValidation, createBird);
router.get('/birds', getAllBirds);
router.put('/birds/:id', birdValidation, updateBird);

// User management
router.get('/users', getAllUsers);

// Deposit management
router.get('/deposits', getAllDeposits);
router.put('/deposits/:id', [
  body('status').isIn(['pending', 'approved', 'declined']).withMessage('Invalid status'),
], updateDepositStatus);

// Withdrawal management
router.get('/withdrawals', getAllWithdrawals);
router.put('/withdrawals/:id', [
  body('status').isIn(['pending', 'approved', 'declined']).withMessage('Invalid status'),
], updateWithdrawalStatus);

// Rate management
router.get('/rates', getConversionRates);
router.put('/rates', [
  body('usdToGoldRate').optional().isFloat({ min: 0 }).withMessage('USD to Gold rate must be positive'),
  body('eggsToGoldRate').optional().isFloat({ min: 0 }).withMessage('Eggs to Gold rate must be positive'),
], updateConversionRates);

module.exports = router;