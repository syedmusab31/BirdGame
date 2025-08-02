const User = require('../models/User');
const Bird = require('../models/Bird');
const Referral = require('../models/Referral');

// @desc    Get all available birds
// @route   GET /api/birds
// @access  Private
const getAllBirds = async (req, res) => {
  try {
    const birds = await Bird.find({ isActive: true }).sort({ price: 1 });
    
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

// @desc    Buy a bird
// @route   POST /api/birds/buy/:birdId
// @access  Private
const buyBird = async (req, res) => {
  try {
    const { birdId } = req.params;
    const bird = await Bird.findById(birdId);
    console.log("Bird ID from request:", birdId);
    console.log("Bird from DB:", bird);
    if (!bird || !bird.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Bird not found or not available'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (user.purchaseBalance < bird.price) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient purchase balance'
      });
    }

    // Deduct from purchase balance
    user.purchaseBalance -= bird.price;
    
    // Add bird to user's collection
    user.birds.push({
      birdId: bird._id,
      purchaseDate: new Date(),
      daysRemaining: 120,
      lastEggCollection: new Date(),
      uncollectedEggs: 0
    });

    await user.save();

    // Handle referral commission if user was referred
    if (user.referredBy) {
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        const commission = Math.round(bird.price * 0.05 * 100) / 100; // 5% commission
        referrer.purchaseBalance += commission;
        referrer.referralEarnings += commission;
        await referrer.save();

        // Update referral record
        await Referral.findOneAndUpdate(
          { referrerId: user.referredBy, referredUserId: user._id },
          { 
            $inc: { 
              commissionEarned: commission,
              totalPurchases: bird.price
            }
          }
        );
      }
    }

    res.json({
      success: true,
      message: 'Bird purchased successfully',
      data: {
        bird: bird.name,
        price: bird.price,
        newBalance: user.purchaseBalance
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's birds
// @route   GET /api/birds/my-birds
// @access  Private
// const getMyBirds = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id)
//       .populate('birds.birdId', 'name price eggsPerHour eggsPerMonth');

//     const myBirds = user.birds.map(userBird => ({
//       _id: userBird._id,
//       bird: userBird.birdId,
//       purchaseDate: userBird.purchaseDate,
//       daysRemaining: userBird.daysRemaining,
//       lastEggCollection: userBird.lastEggCollection,
//       uncollectedEggs: userBird.uncollectedEggs,
//       isAlive: userBird.daysRemaining > 0
//     }));

//     res.json({
//       success: true,
//       data: myBirds
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
const getMyBirds = async (req, res) => {
    try {
      // Step 1: Fetch all active bird types from DB
      const allBirds = await Bird.find({ isActive: true }).select('name');
  
      // Step 2: Get the logged-in user with their birds populated
      const user = await User.findById(req.user.id).populate(
        'birds.birdId',
        'name price eggsPerHour eggsPerMonth'
      );
  
      // Step 3: Format user's bird data
      const myBirds = user.birds.map(userBird => ({
        _id: userBird._id,
        bird: userBird.birdId,
        purchaseDate: userBird.purchaseDate,
        daysRemaining: userBird.daysRemaining,
        lastEggCollection: userBird.lastEggCollection,
        uncollectedEggs: userBird.uncollectedEggs,
        isAlive: userBird.daysRemaining > 0
      }));
  
      // Step 4: Initialize bird type counts to 0
      const birdQuantities = {};
      allBirds.forEach(bird => {
        birdQuantities[bird.name] = 0;
      });
  
      // Step 5: Count how many of each type the user has
      for (const b of myBirds) {
        const name = b.bird?.name;
        if (name in birdQuantities) {
          birdQuantities[name]++;
        }
      }
  
      // Step 6: Send response
      res.json({
        success: true,
        data: {
          birds: myBirds,
          birdQuantities
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };
  
  

// @desc    Get bird details with user inventory count
// @route   GET /api/birds/:birdId
// @access  Private
const getBirdDetails = async (req, res) => {
  try {
    const { birdId } = req.params;
    const bird = await Bird.findById(birdId);
    
    if (!bird) {
      return res.status(404).json({
        success: false,
        message: 'Bird not found'
      });
    }

    const user = await User.findById(req.user.id);
    const userBirdCount = user.birds.filter(
      userBird => userBird.birdId.toString() === birdId && userBird.daysRemaining > 0
    ).length;

    res.json({
      success: true,
      data: {
        ...bird.toObject(),
        userCount: userBirdCount
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
  getAllBirds,
  buyBird,
  getMyBirds,
  getBirdDetails
};