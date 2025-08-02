const crypto = require('crypto');

// Generate random referral code
const generateReferralCode = (username) => {
  const randomString = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${username.slice(0, 3).toUpperCase()}${randomString}`;
};

// Calculate eggs generated over time
const calculateEggsGenerated = (eggsPerHour, lastCollection) => {
  const now = new Date();
  const timeDiff = now - lastCollection;
  const hoursElapsed = timeDiff / (1000 * 60 * 60);
  
  return Math.floor(hoursElapsed * eggsPerHour);
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format gold amount
const formatGold = (amount) => {
  return `${amount.toLocaleString()} Gold`;
};

// Calculate time remaining
const calculateTimeRemaining = (targetDate) => {
  const now = new Date();
  const timeDiff = targetDate - now;
  
  if (timeDiff <= 0) {
    return '00:00:00';
  }
  
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Validate payeer ID format
const validatePayeerID = (payeerID) => {
  const payeerRegex = /^P\d{7,10}$/;
  return payeerRegex.test(payeerID);
};

// Generate random bonus amount
const generateBonusAmount = (min = 10, max = 100) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Check if enough time has passed for bonus claim
const canClaimBonus = (lastClaimDate) => {
  if (!lastClaimDate) return true;
  
  const now = new Date();
  const hoursSinceLastClaim = (now - lastClaimDate) / (1000 * 60 * 60);
  return hoursSinceLastClaim >= 24;
};

// Calculate referral commission
const calculateReferralCommission = (purchaseAmount, commissionRate = 0.05) => {
  return Math.round(purchaseAmount * commissionRate * 100) / 100;
};

// Round to 2 decimal places
const roundToTwo = (num) => {
  return Math.round(num * 100) / 100;
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Generate pagination info
const getPaginationInfo = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNext,
    hasPrev
  };
};

module.exports = {
  generateReferralCode,
  calculateEggsGenerated,
  formatCurrency,
  formatGold,
  calculateTimeRemaining,
  validatePayeerID,
  generateBonusAmount,
  canClaimBonus,
  calculateReferralCommission,
  roundToTwo,
  sanitizeInput,
  getPaginationInfo
};