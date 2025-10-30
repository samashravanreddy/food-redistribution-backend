const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  organization: String,
  foodType: String,
  quantity: Number,
  location: String,
  preparedAt: Date,
  status: {
    type: String,
    enum: ['available', 'accepted'],
    default: 'available',
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consumer',
    default: null,
  },
  acceptedAt: Date,
});
foodSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 });
module.exports = mongoose.model('Food', foodSchema);
