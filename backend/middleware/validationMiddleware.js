const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  validate
];

// User login validation
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate
];

// Deposit validation
const depositValidation = [
  body('payeerId')
    .notEmpty()
    .withMessage('Payeer ID is required')
    .trim(),
  
  body('accountHolderName')
    .notEmpty()
    .withMessage('Account holder name is required')
    .trim(),
  
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least $1'),
  
  validate
];

// Withdrawal validation
const withdrawalValidation = [
  body('goldAmount')
    .isFloat({ min: 7000 })
    .withMessage('Minimum withdrawal is 7000 gold'),
  
  body('payeerAccountId')
    .notEmpty()
    .withMessage('Payeer account ID is required')
    .trim(),
  
  body('payeerAccountName')
    .notEmpty()
    .withMessage('Payeer account name is required')
    .trim(),
  
  validate
];

// Bird creation validation
const birdValidation = [
  body('name')
    .isIn(['green', 'brown', 'blue', 'yellow', 'red', 'king'])
    .withMessage('Invalid bird type'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('eggsPerHour')
    .isFloat({ min: 0 })
    .withMessage('Eggs per hour must be a positive number'),
  
  body('eggsPerMonth')
    .isFloat({ min: 0 })
    .withMessage('Eggs per month must be a positive number'),
  
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  depositValidation,
  withdrawalValidation,
  birdValidation
};