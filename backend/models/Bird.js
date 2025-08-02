const mongoose = require('mongoose');

const birdSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['green', 'brown', 'blue', 'yellow', 'red', 'king']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  eggsPerHour: {
    type: Number,
    required: true,
    min: 0
  },
  eggsPerMonth: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bird', birdSchema);