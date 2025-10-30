// Inside routes/donorFoodRoutes.js
const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const DonatedFood = require("../models/DonatedFood");
const Food = require("../models/Food");
const DonorRegister = require("../models/DonorRegister");

// Donor uploads food
router.post("/", authMiddleware, async (req, res) => {
  const { foodType, quantity, location, preparedAt } = req.body;
  console.log("📥 Incoming donation data:", req.body); // Log incoming data
    console.log("🔐 Authenticated donor ID:", req.user.id); // Log token-based user ID

  if (!foodType || !quantity || !location || !preparedAt) {
   console.warn("⚠️ Missing required fields");
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
  const donor = await DonorRegister.findById(req.user.id);
      if (!donor) {
        return res.status(404).json({ message: "Donor not found" });
   }
      // Step 1: Create a new Food entry
      const newFood = new Food({
        organization: donor.organization || "Unknown",
        foodType,
        quantity,
        location,
        preparedAt,
        status: "available",
      });

      const savedFood = await newFood.save();
       // Step 2: Create DonatedFood with foodId from savedFood
    const donatedFood = new DonatedFood({
      donorId: req.user.id,
      organization: donor?.organization || "Unknown",
      foodType,
      quantity,
      location,
      preparedAt,
      foodId: savedFood._id, // ✅ Linking
    });

    await donatedFood.save();

    console.log("✅ Food donation saved:", donatedFood); // Confirm save


    res.status(201).json({ message: "Food donated successfully", donatedFood });
  } catch (err) {
    console.error("Error donating food:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Donor fetches own donations
router.get("/", authMiddleware, async (req, res) => {
  try {
   console.log("🔍 Fetching donations for donor ID:", req.user.id);
    const myFood = await DonatedFood.find({ donorId: req.user.id }).sort({ createdAt: -1 });
    console.log("📦 Donations found:", myFood.length);
    res.status(200).json({ foodDonations: myFood });
  } catch (err) {
    console.error("Error fetching donor's food:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
