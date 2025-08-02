const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goldAmount: {
    type: Number,
    required: true,
    min: 7000
  },
  usdAmount: {
    type: Number,
    required: true,
    min: 1
  },
  payeerAccountId: {
    type: String,
    required: true,
    trim: true
  },
  payeerAccountName: {
    type: String,
    required: true,
    trim: true
  },
  conversionRate: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending'
  },
  adminNote: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);