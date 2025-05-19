const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
});

budgetSchema.index({ userId: 1, category: 1 }, { unique: true }); // Ensure one budget per category per user

module.exports = mongoose.model('Budget', budgetSchema);
