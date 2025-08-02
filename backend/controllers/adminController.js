const User = require('../models/User');
const Bird = require('../models/Bird');
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const Settings = require('../models/Settings');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const pendingDeposits = await Deposit.countDocuments({ status: 'pending' });
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const totalBirds = await Bird.countDocuments();

    const totalDeposits = await Deposit.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalWithdrawals = await Withdrawal.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$usdAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        pendingDeposits,
        pendingWithdrawals,
        totalBirds,
        totalDeposits: totalDeposits[0]?.total || 0,
        totalWithdrawals: totalWithdrawals[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new bird
// @route   POST /api/admin/birds
// @access  Private/Admin
const createBird = async (req, res) => {
  try {
    const { name, price, eggsPerHour, eggsPerMonth } = req.body;

    // Check if bird type already exists
    const existingBird = await Bird.findOne({ name });
    if (existingBird) {
      return res.status(400).json({
        success: false,
        message: 'Bird type already exists'
      });
    }

    // Check if we already have 6 birds
    const birdCount = await Bird.countDocuments();
    if (birdCount >= 6) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 6 bird types allowed'
      });
    }

    const bird = await Bird.create({
      name,
      price,
      eggsPerHour,
      eggsPerMonth
    });

    res.status(201).json({
      success: true,
      message: 'Bird created successfully',
      data: bird
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all birds for admin
// @route   GET /api/admin/birds
// @access  Private/Admin
const getAllBirds = async (req, res) => {
  try {
    const birds = await Bird.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: birds
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update bird
// @route   PUT /api/admin/birds/:id
// @access  Private/Admin
const updateBird = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, eggsPerHour, eggsPerMonth, isActive } = req.body;

    const bird = await Bird.findByIdAndUpdate(
      id,
      { name, price, eggsPerHour, eggsPerMonth, isActive },
      { new: true, runValidators: true }
    );

    if (!bird) {
      return res.status(404).json({
        success: false,
        message: 'Bird not found'
      });
    }

    res.json({
      success: true,
      message: 'Bird updated successfully',
      data: bird
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false })
      .select('username email createdAt purchaseBalance withdrawBalance')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all deposit requests
// @route   GET /api/admin/deposits
// @access  Private/Admin
const getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

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

// @desc    Update deposit status
// @route   PUT /api/admin/deposits/:id
// @access  Private/Admin
const updateDepositStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const deposit = await Deposit.findById(id);
    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found'
      });
    }

    const oldStatus = deposit.status;

    deposit.status = status;
    deposit.adminNote = adminNote || '';
    await deposit.save();

    // If approved, add gold to user's purchase balance
    if (status === 'approved' && deposit.oldStatus !== 'approved') {
      const user = await User.findById(deposit.userId);
      if (user) {
        user.purchaseBalance += deposit.goldAmount;
        await user.save();
      }
    }

    res.json({
      success: true,
      message: 'Deposit status updated successfully',
      data: deposit
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all withdrawal requests
// @route   GET /api/admin/withdrawals
// @access  Private/Admin
const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

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

// @desc    Update withdrawal status
// @route   PUT /api/admin/withdrawals/:id
// @access  Private/Admin
const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
    }

    withdrawal.status = status;
    withdrawal.adminNote = adminNote || '';
    await withdrawal.save();

    // If approved, update user's total withdrawal amount
    if (status === 'approved') {
      const user = await User.findById(withdrawal.userId);
      if (user) {
        user.totalWithdrawed += withdrawal.usdAmount;
        await user.save();
      }
    } else if (status === 'declined') {
      // If declined, return gold to user's withdraw balance
      const user = await User.findById(withdrawal.userId);
      if (user) {
        user.withdrawBalance += withdrawal.goldAmount;
        await user.save();
      }
    }

    res.json({
      success: true,
      message: 'Withdrawal status updated successfully',
      data: withdrawal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get conversion rates
// @route   GET /api/admin/rates
// @access  Private/Admin
const getConversionRates = async (req, res) => {
  try {
    const rates = await Settings.find({ 
      key: { $in: ['usdToGoldRate', 'eggsToGoldRate'] } 
    });

    const ratesObject = {};
    rates.forEach(rate => {
      ratesObject[rate.key] = rate.value;
    });

    res.json({
      success: true,
      data: ratesObject
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update conversion rates
// @route   PUT /api/admin/rates
// @access  Private/Admin
const updateConversionRates = async (req, res) => {
  try {
    const { usdToGoldRate, eggsToGoldRate } = req.body;

    if (usdToGoldRate) {
      await Settings.findOneAndUpdate(
        { key: 'usdToGoldRate' },
        { value: usdToGoldRate },
        { upsert: true }
      );
    }

    if (eggsToGoldRate) {
      await Settings.findOneAndUpdate(
        { key: 'eggsToGoldRate' },
        { value: eggsToGoldRate },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      message: 'Conversion rates updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
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
};