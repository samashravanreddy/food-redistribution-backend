const mongoose = require("mongoose");

const donatedFoodSchema = new mongoose.Schema({
foodId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Food",
  required: true,
},
 acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Consumer",
    default: null,
  },
donorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "DonorRegister",
          required: true
        },
  foodType: {
    type: String,
    required: true,
    enum: ["Vegetables", "Fruits", "Curry", "Grains", "Other"], // Limiting options for food type
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"], // Ensure the quantity is a positive number
  },
  organization: {
      type:String,
      ref: "DonorRegister",
      trim: true,
    },
  location: {
    type: String,
    required: true,
    trim: true, // To remove unnecessary spaces
  },
  preparedAt: {
    type: Date,
    required: true,
  },


  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a TTL index on createdAt field for auto-deletion after 2 hours (7200 seconds)
donatedFoodSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 });

module.exports = mongoose.model("DonatedFood", donatedFoodSchema);
