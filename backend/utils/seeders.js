const User = require('../models/User');
const Bird = require('../models/Bird');
const Settings = require('../models/Settings');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ isAdmin: true });
    if (!adminExists) {
      const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
      
      await User.create({
        username: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@birdfarm.com',
        password: adminPassword,
        isAdmin: true,
        referralCode: 'ADMIN001'
      });
      
      console.log('Admin user created successfully');
    }

    // Create default birds if none exist
    const birdCount = await Bird.countDocuments();
    if (birdCount === 0) {
      const defaultBirds = [
        {
          name: 'green',
          price: 100,
          eggsPerHour: 1,
          eggsPerMonth: 720
        },
        {
          name: 'brown',
          price: 250,
          eggsPerHour: 2.5,
          eggsPerMonth: 1800
        },
        {
          name: 'blue',
          price: 500,
          eggsPerHour: 5,
          eggsPerMonth: 3600
        },
        {
          name: 'yellow',
          price: 1000,
          eggsPerHour: 10,
          eggsPerMonth: 7200
        },
        {
          name: 'red',
          price: 2500,
          eggsPerHour: 25,
          eggsPerMonth: 18000
        },
        {
          name: 'king',
          price: 5000,
          eggsPerHour: 50,
          eggsPerMonth: 36000
        }
      ];

      await Bird.insertMany(defaultBirds);
      console.log('Default birds created successfully');
    }

    // Create default settings if don't exist
    const defaultSettings = [
      {
        key: 'usdToGoldRate',
        value: 7000,
        description: '1 USD = 7000 Gold'
      },
      {
        key: 'eggsToGoldRate',
        value: 0.01,
        description: '100 Eggs = 1 Gold'
      },
      {
        key: 'purchaseBalancePercentage',
        value: 0.30,
        description: '30% of egg sales go to purchase balance'
      },
      {
        key: 'withdrawBalancePercentage',
        value: 0.70,
        description: '70% of egg sales go to withdraw balance'
      },
      {
        key: 'referralCommission',
        value: 0.05,
        description: '5% referral commission'
      },
      {
        key: 'exchangeProfitPercentage',
        value: 0.03,
        description: '3% profit on balance exchange'
      },
      {
        key: 'minWithdrawalGold',
        value: 7000,
        description: 'Minimum withdrawal amount in gold'
      },
      {
        key: 'birdLifespanDays',
        value: 120,
        description: 'Bird lifespan in days'
      },
      {
        key: 'eggCollectionIntervalMinutes',
        value: 10,
        description: 'Minimum interval between egg collections'
      },
      {
        key: 'uncollectedEggPenalty',
        value: 0.20,
        description: '20% penalty for uncollected eggs from dead birds'
      },
      {
        key: 'dailyBonusMin',
        value: 10,
        description: 'Minimum daily bonus amount'
      },
      {
        key: 'dailyBonusMax',
        value: 100,
        description: 'Maximum daily bonus amount'
      }
    ];

    for (let setting of defaultSettings) {
      const exists = await Settings.findOne({ key: setting.key });
      if (!exists) {
        await Settings.create(setting);
      }
    }

    console.log('Default settings created successfully');
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;