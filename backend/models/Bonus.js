const mongoose = require('mongoose');

const bonusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 10,
    max: 100
  },
  type: {
    type: String,
    default: 'daily'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bonus', bonusSchema);