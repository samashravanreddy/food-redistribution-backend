const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const verifyConsumerToken = require('../middlewares/authMiddleware');
const Food = require('../models/Food');
const DonatedFood = require('../models/DonatedFood');

// ✅ Accept food by ID
router.post('/accept-food', verifyConsumerToken, async (req, res) => {
  try {
    const { foodId } = req.body;
    const consumerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({ message: 'Invalid food ID format' });
    }

    const food = await Food.findById(foodId); // 🛠 Fixed from `foods` to `food`

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.status !== 'available') {
      return res.status(400).json({ message: 'Food already accepted or unavailable' });
    }

    food.status = 'accepted';
    food.acceptedBy = consumerId;
    food.acceptedAt = new Date();

    await food.save(); // 🛠 Fixed typo: was saving `foods`, which wasn't defined
    res.status(200).json({ message: 'Food accepted successfully', acceptedFood: food});
  } catch (error) {
    console.error('Error accepting food:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Dashboard: only show available food
router.get('/dashboard', verifyConsumerToken, async (req, res) => {
  try {
    const donorFoods = await DonatedFood.find()
      .populate({
        path: 'foodId',
        match: { status: 'available' }, // ✅ Only include 'available' food
      })
      .populate("donorId", "organization")
      .sort({ createdAt: -1 });

 const availableDonorFoods = donorFoods.filter(df => df.foodId !== null);
    // ✅ Filter out any DonatedFood where the populated foodId was excluded
    const formatted = donorFoods
      .filter((donatedFood) => donatedFood.foodId !== null)
      .map((donatedFood) => ({
        _id: donatedFood._id,
        foodId: donatedFood.foodId._id,
        foodType: donatedFood.foodId.foodType,
        quantity: donatedFood.foodId.quantity,
        location: donatedFood.foodId.location,
        preparedAt: donatedFood.foodId.preparedAt,
        organization: donatedFood.foodId.organization || "Unknown",
      }));

    res.status(200).json({ donorFoods: formatted });
  } catch (err) {
    console.error("Error fetching donor foods:", err.message);
    res.status(500).json({ message: "Server error while fetching donor foods" });
  }
});

// ✅ Get accepted foods for the logged-in consumer
router.get('/accepted-foods', verifyConsumerToken, async (req, res) => {
  try {
    const consumerId = req.user.id;
    const foodId = req.params.id;
    const acceptedFoods = await Food.find({
      status: 'accepted',
      acceptedBy: consumerId,
    });

    res.status(200).json({ acceptedFoods });
  } catch (error) {
    console.error("Error fetching accepted foods:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Unaccept food (revert to available)
router.put('/accepted-food/:id', verifyConsumerToken, async (req, res) => {
  try {
    const consumerId = req.user.id;
    const foodId = req.params.id;

    const foodItem = await Food.findById(foodId);

    if (!foodItem) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (
      foodItem.status !== 'accepted' ||
      foodItem.acceptedBy.toString() !== consumerId
    ) {
      return res.status(403).json({ message: 'Not authorized to unaccept this food' });
    }

    foodItem.status = 'available';
    foodItem.acceptedBy = null;
    foodItem.acceptedAt = null;

    await foodItem.save();

    res.status(200).json({ message: 'Food unaccepted successfully' });
  } catch (error) {
    console.error('Error unaccepting food:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
