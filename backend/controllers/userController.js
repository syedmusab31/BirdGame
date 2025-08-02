const User = require('../models/User');
const Bird = require('../models/Bird');
const Bonus = require('../models/Bonus');
const Referral = require('../models/Referral');
const Settings = require('../models/Settings');
const moment = require('moment');

// @desc    Get user dashboard data
// @route   GET /api/user/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('birds.birdId')
      .select('-password');
      const stockSummary = Object.entries(user.eggStock || {}).map(([birdType, count]) => ({
        bird: birdType,
        unsoldEggs: count
      }));
    res.json({
      success: true,
      data: {
        username: user.username,
        email: user.email,
        registrationDate: user.createdAt,
        purchaseBalance: user.purchaseBalance,
        withdrawBalance: user.withdrawBalance,
        referralEarnings: user.referralEarnings,
        totalWithdrawed: user.totalWithdrawed,
        birds: user.birds,
        eggStock: user.eggStock
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Collect eggs from all birds
// @route   POST /api/user/collect-eggs
// @access  Private
// const collectEggs = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).populate('birds.birdId');
    
//     if (!user.birds.length) {
//       return res.status(400).json({
//         success: false,
//         message: 'No birds to collect eggs from'
//       });
//     }

//     let totalCollected = {};
//     const now = new Date();

//     for (let userBird of user.birds) {
//       if (userBird.daysRemaining <= 0) continue;

//       const bird = userBird.birdId;
//       const timeDiff = now - userBird.lastEggCollection;
//       const hoursElapsed = timeDiff / (1000 * 60 * 60);
      
//       if (hoursElapsed >= 0.167) { // 10 minutes minimum
//         const eggsToCollect = Math.floor(hoursElapsed * bird.eggsPerHour);
        
//         if (eggsToCollect > 0) {
//           user.eggStock[bird.name] += eggsToCollect;
//           userBird.lastEggCollection = now;
//           userBird.uncollectedEggs = 0;
          
//           totalCollected[bird.name] = (totalCollected[bird.name] || 0) + eggsToCollect;
//         }
//       }
//     }

//     await user.save();

//     res.json({
//       success: true,
//       message: 'Eggs collected successfully',
//       collected: totalCollected
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
// const collectEggs = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).populate('birds.birdId');

//     if (!user.birds.length) {
//       return res.status(400).json({
//         success: false,
//         message: 'No birds to collect eggs from'
//       });
//     }

//     let totalCollected = {};
//     const now = new Date();

//     for (let userBird of user.birds) {
//       if (userBird.daysRemaining <= 0) continue;

//       const bird = userBird.birdId;
//       if (!bird || !bird.eggsPerHour) continue;

//       const lastCollected = userBird.lastEggCollection || userBird.purchaseDate;
//       const timeDiff = now - lastCollected;
//       const hoursElapsed = timeDiff / (1000 * 60 * 60); // milliseconds to hours

//       if (hoursElapsed >= 0.167) { // at least 10 minutes
//         const eggsToCollect = Math.floor(hoursElapsed * bird.eggsPerHour);

//         if (eggsToCollect > 0) {
//           if (!user.eggStock[bird.name]) {
//             user.eggStock[bird.name] = 0;
//           }

//           user.eggStock[bird.name] += eggsToCollect;
//           userBird.lastEggCollection = now;
//           userBird.uncollectedEggs = 0;

//           totalCollected[bird.name] = (totalCollected[bird.name] || 0) + eggsToCollect;
//         }
//       }
//     }

//     await user.save();

//     res.json({
//       success: true,
//       message: 'Eggs collected successfully',
//       collected: totalCollected
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
const collectEggs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('birds.birdId');

    if (!user.birds.length) {
      return res.status(400).json({
        success: false,
        message: 'No birds to collect eggs from'
      });
    }

    const now = new Date();
    let totalCollected = {};
    let waitingTimes = {};

    for (let userBird of user.birds) {
      if (userBird.daysRemaining <= 0) continue;

      const bird = userBird.birdId;
      if (!bird || !bird.eggsPerHour) continue;

      const lastCollected = userBird.lastEggCollection || userBird.purchaseDate;
      const diffMs = now - lastCollected;
      const hoursElapsed = diffMs / (1000 * 60 * 60);

      if (hoursElapsed >= 0.167) { // 10 minutes passed
        const eggsToCollect = Math.floor(hoursElapsed * bird.eggsPerHour);

        if (!user.eggStock[bird.name]) {
          user.eggStock[bird.name] = 0;
        }

        user.eggStock[bird.name] += eggsToCollect;
        userBird.lastEggCollection = now;
        userBird.uncollectedEggs = 0;

        totalCollected[bird.name] = (totalCollected[bird.name] || 0) + eggsToCollect;
      } else {
        const minutesLeft = Math.ceil((0.167 - hoursElapsed) * 60);
        waitingTimes[bird.name] = minutesLeft;
      }
    }

    await user.save();

    res.json({
      success: true,
      message: Object.keys(totalCollected).length > 0 ? 'Eggs collected successfully' : 'No eggs ready to collect',
      collected: totalCollected,
      wait: waitingTimes
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};



// @desc    Get eggs to be collected
// @route   GET /api/user/eggs-to-collect
// @access  Private
const getEggsToCollect = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('birds.birdId');
    
    const eggsToCollect = {};
    const birdCounts = {};
    const now = new Date();

    for (let userBird of user.birds) {
      if (userBird.daysRemaining <= 0) continue;

      const bird = userBird.birdId;
      const timeDiff = now - userBird.lastEggCollection;
      const hoursElapsed = timeDiff / (1000 * 60 * 60);
      
      const eggsReady = Math.floor(hoursElapsed * bird.eggsPerHour);
      
      eggsToCollect[bird.name] = (eggsToCollect[bird.name] || 0) + eggsReady;
      birdCounts[bird.name] = (birdCounts[bird.name] || 0) + 1;
    }

    res.json({
      success: true,
      data: {
        eggsToCollect,
        birdCounts
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Get eggs to be sold
// @route   GET /api/user/eggs-to-sell
// @access  Private
const getSellEggs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('birds.birdId');

    const birdTypes = ['green', 'brown', 'blue', 'yellow', 'red', 'king'];
    const eggsToCollect = {};
    const now = new Date();

    // Initialize all bird types with 0
    for (const bird of birdTypes) {
      eggsToCollect[bird] = {
        eggs: 0,
        gold: 0
      };
    }

    for (let userBird of user.birds) {
      if (userBird.daysRemaining <= 0) continue;

      const bird = userBird.birdId;
      const timeDiff = now - userBird.lastEggCollection;
      const hoursElapsed = timeDiff / (1000 * 60 * 60);
      const eggsReady = Math.floor(hoursElapsed * bird.eggsPerHour);

      // 100 eggs = 1 gold
      const gold = eggsReady / 100;

      eggsToCollect[bird.name].eggs += eggsReady;
      eggsToCollect[bird.name].gold += gold;
    }

    res.json({
      success: true,
      conversionRate: {
        eggsPerGold: 100,
        goldPerEgg: 0.01
      },
      data: eggsToCollect
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




// @desc    Sell all eggs
// @route   POST /api/user/sell-eggs
// @access  Private
const sellAllEggs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const settings = await Settings.findOne({ key: 'eggsToGoldRate' });
    const conversionRate = settings ? settings.value : 0.01;

    let totalEggs = 0;
    const eggsByType = {};

    // Calculate total eggs and by type
    for (let birdType in user.eggStock) {
      const eggs = user.eggStock[birdType];
      if (eggs > 0) {
        totalEggs += eggs;
        eggsByType[birdType] = eggs;
        user.eggStock[birdType] = 0;
      }
    }

    if (totalEggs === 0) {
      return res.status(400).json({
        success: false,
        message: 'No eggs to sell'
      });
    }

    const totalGold = +(totalEggs * conversionRate).toFixed(2);
const purchaseGold = +(totalGold * 0.3).toFixed(2);
const withdrawGold = +(totalGold * 0.7).toFixed(2);


    user.purchaseBalance += purchaseGold;
    user.withdrawBalance += withdrawGold;

    await user.save();

    res.json({
      success: true,
      message: 'Eggs sold successfully',
      data: {
        totalEggs,
        totalGold,
        purchaseGold,
        withdrawGold,
        eggsByType
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Claim daily bonus
// @route   POST /api/user/claim-bonus
// @access  Private
const claimDailyBonus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const now = new Date();

    // Check if 24 hours have passed since last bonus
    if (user.lastBonusClaim) {
      const hoursSinceLastClaim = (now - user.lastBonusClaim) / (1000 * 60 * 60);
      if (hoursSinceLastClaim < 24) {
        const hoursLeft = Math.ceil(24 - hoursSinceLastClaim);
        return res.status(400).json({
          success: false,
          message: `Please wait ${hoursLeft} hours before claiming next bonus`
        });
      }
    }

    // Generate random bonus amount (10-100 gold)
    const bonusAmount = Math.floor(Math.random() * 91) + 10;
    
    user.purchaseBalance += bonusAmount;
    user.lastBonusClaim = now;
    await user.save();

    // Save bonus record
    await Bonus.create({
      userId: user._id,
      amount: bonusAmount
    });

    res.json({
      success: true,
      message: 'Daily bonus claimed successfully',
      bonusAmount,
      newBalance: user.purchaseBalance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get bonus history
// @route   GET /api/user/bonus-history
// @access  Private
const getBonusHistory = async (req, res) => {
  try {
    const bonuses = await Bonus.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: bonuses
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get referral data
// @route   GET /api/user/referrals
// @access  Private
const getReferrals = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const referrals = await Referral.find({ referrerId: req.user.id })
      .populate('referredUserId', 'username createdAt')
      .sort({ createdAt: -1 });

    const referralLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/register?ref=${user.referralCode}`;

    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink,
        totalEarnings: user.referralEarnings,
        referrals: referrals.map(ref => ({
          username: ref.referredUserId.username,
          registrationDate: ref.referredUserId.createdAt,
          commissionEarned: ref.commissionEarned,
          totalPurchases: ref.totalPurchases
        }))
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Exchange balance (withdraw to purchase)
// @route   POST /api/user/exchange-balance
// @access  Private
const exchangeBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    if (amount > user.withdrawBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient withdraw balance'
      });
    }

    const exchangeAmount = Math.round(amount * 1.03 * 100) / 100; // 3% profit
    
    user.withdrawBalance -= amount;
    user.purchaseBalance += exchangeAmount;
    
    await user.save();

    res.json({
      success: true,
      message: 'Balance exchanged successfully',
      data: {
        exchangedAmount: amount,
        receivedAmount: exchangeAmount,
        newWithdrawBalance: user.withdrawBalance,
        newPurchaseBalance: user.purchaseBalance
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
  getDashboard,
  collectEggs,
  getEggsToCollect,
  sellAllEggs,
  claimDailyBonus,
  getBonusHistory,
  getReferrals,
  exchangeBalance,
  getSellEggs
};