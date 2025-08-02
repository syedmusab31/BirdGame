const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Referral = require('../models/Referral');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};
const generateReferralCodeFromId = (userId) => {
    return Buffer.from(userId.toString()).toString('base64').slice(0, 8).toUpperCase();
  };

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
      const { username, email, password, referralCode } = req.body;
  
      // Check if user exists
      const userExists = await User.findOne({
        $or: [{ email }, { username }]
      });
  
      if (userExists) {
        return res.status(400).json({
          message: 'User with this email or username already exists'
        });
      }
  
      // Check for valid referral code (if provided)
      let referredBy = null;
      if (referralCode) {
        const referrer = await User.findOne({ referralCode });
        if (referrer) {
          referredBy = referrer._id;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Invalid referral code'
          });
        }
      }
  
      // Temporarily create user without referralCode (but don't save yet)
      const tempUser = new User({
        username,
        email,
        password,
        referredBy,
        referralCode: 'temp' // temporary placeholder to pass validation
      });
  
      // Now generate referral code from the ObjectId
      tempUser.referralCode = generateReferralCodeFromId(tempUser._id);
  
      // Save the user
      const user = await tempUser.save();
  
      // Create referral record if referred
      if (referredBy) {
        await Referral.create({
          referrerId: referredBy,
          referredUserId: user._id
        });
      }
  
      // Generate token
      const token = generateToken(user._id);
  
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          purchaseBalance: user.purchaseBalance,
          withdrawBalance: user.withdrawBalance,
          referralCode: user.referralCode
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };
  

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          purchaseBalance: user.purchaseBalance,
          withdrawBalance: user.withdrawBalance,
          referralCode: user.referralCode,
          isAdmin: user.isAdmin
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};