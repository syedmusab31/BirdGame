const User = require('../models/User');
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const Settings = require('../models/Settings');

// @desc    Create deposit request
// @route   POST /api/payment/deposit
// @access  Private
const createDeposit = async (req, res) => {
  try {
    const { payeerId, accountHolderName, amount } = req.body;
    
    const settings = await Settings.findOne({ key: 'usdToGoldRate' });
    const conversionRate = settings ? settings.value : 7000;
    
    const goldAmount = Math.round(amount * conversionRate * 100) / 100;

    const deposit = await Deposit.create({
      userId: req.user.id,
      payeerId,
      accountHolderName,
      amount,
      goldAmount,
      conversionRate
    });

    res.status(201).json({
      success: true,
      message: 'Deposit request created successfully',
      data: deposit
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user deposit history
// @route   GET /api/payment/deposits
// @access  Private
const getDepositHistory = async (req, res) => {
  try {
    const deposits = await Deposit.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: deposits
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create withdrawal request
// @route   POST /api/payment/withdraw
// @access  Private
const createWithdrawal = async (req, res) => {
  try {
    const { goldAmount, payeerAccountId, payeerAccountName } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (goldAmount < 7000) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is 7000 gold'
      });
    }

    if (user.withdrawBalance < goldAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient withdraw balance'
      });
    }

    const settings = await Settings.findOne({ key: 'usdToGoldRate' });
    const conversionRate = settings ? settings.value : 7000;
    const usdAmount = Math.round((goldAmount / conversionRate) * 100) / 100;

    const withdrawal = await Withdrawal.create({
      userId: req.user.id,
      goldAmount,
      usdAmount,
      payeerAccountId,
      payeerAccountName,
      conversionRate
    });

    // Deduct from user's withdraw balance immediately
    user.withdrawBalance -= goldAmount;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request created successfully',
      data: withdrawal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user withdrawal history
// @route   GET /api/payment/withdrawals
// @access  Private
const getWithdrawalHistory = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: withdrawals
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get conversion rates
// @route   GET /api/payment/rates
// @access  Private
const getConversionRates = async (req, res) => {
  try {
    const usdToGold = await Settings.findOne({ key: 'usdToGoldRate' });
    const eggsToGold = await Settings.findOne({ key: 'eggsToGoldRate' });

    res.json({
      success: true,
      data: {
        usdToGold: usdToGold ? usdToGold.value : 7000,
        eggsToGold: eggsToGold ? eggsToGold.value : 0.01
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createDeposit,
  getDepositHistory,
  createWithdrawal,
  getWithdrawalHistory,
  getConversionRates
};