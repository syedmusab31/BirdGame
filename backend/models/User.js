const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  purchaseBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  withdrawBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  referralCode: {
    type: String,
    unique: true,
    required: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  totalWithdrawed: {
    type: Number,
    default: 0,
    min: 0
  },
  lastBonusClaim: {
    type: Date,
    default: null
  },
  birds: [{
    birdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bird'
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    daysRemaining: {
      type: Number,
      default: 120
    },
    lastEggCollection: {
      type: Date,
      default: Date.now
    },
    uncollectedEggs: {
      type: Number,
      default: 0
    }
  }],
  eggStock: {
    green: { type: Number, default: 0 },
    brown: { type: Number, default: 0 },
    blue: { type: Number, default: 0 },
    yellow: { type: Number, default: 0 },
    red: { type: Number, default: 0 },
    king: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Generate referral code before save
userSchema.pre('save', async function(next) {
  if (!this.referralCode) {
    this.referralCode = this.username + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);