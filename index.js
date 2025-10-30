const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Ensure dotenv is configured correctly at the start
const dotenv = require('dotenv');

// Models
const ConsumerLogin = require('./models/ConsumerLogin');
const ConsumerRegister = require('./models/ConsumerRegister');
const Donor = require('./models/DonorLogin');
const DonorRegister = require('./models/DonorRegister');
const DonatedFood = require('./models/DonatedFood');
const Food = require('./models/Food');

// Middlewares
const authMiddleware = require('./middlewares/authMiddleware');

// Routes
const donorFoodRoutes = require('./routes/donorFoodRoutes');
const consumerRoutes = require('./routes/consumerRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("✅ MongoDB Connected");

    const dbName = mongoose.connection.name;
    console.log("🧩 Connected DB:", dbName);

    Food.countDocuments()
      .then(count => {
        console.log("🍽 Total food items in DB:", count);
      })
      .catch(err => {
        console.error("❌ Error counting food items:", err.message);
      });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Root Route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running");
});

// 🔐 Consumer Register Route
app.post("/api/consumer/register", async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const existingUser = await ConsumerRegister.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newConsumer = new ConsumerRegister({ name, email, phone, password });
    await newConsumer.save();

    res.status(201).json({ message: "Consumer registered successfully" });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔐 Consumer Login Route with JWT
app.post("/api/consumer/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const consumer = await ConsumerRegister.findOne({ email });

    if (!consumer) {
      return res.status(404).json({ message: "Consumer not found" });
    }

    const isMatch = await bcrypt.compare(password, consumer.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: consumer._id, email: consumer.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const { password: _, ...consumerWithoutPassword } = consumer.toObject();

    res.status(200).json({
      message: "Login successful",
      token,
      consumer: consumerWithoutPassword,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔐 Donor Login Route
app.post("/api/donor/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const donor = await DonorRegister.findOne({ email });

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    const isMatch = await bcrypt.compare(password, donor.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: donor._id, email: donor.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const { password: _, ...donorWithoutPassword } = donor.toObject();

    res.status(200).json({
      message: "Login successful",
      token,
      role: "donor",
      donor: donorWithoutPassword,
    });
  } catch (err) {
    console.error("Donor login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// 📝 Donor Registration API
app.post("/api/donor/register", async (req, res) => {
  const { name, organization, mobile, email, address, password } = req.body;

  try {
    const existing = await DonorRegister.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Donor already registered with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDonor = new DonorRegister({
      name,
      organization,
      mobile,
      email,
      address,
      password: hashedPassword,
      role: "donor"
    });

    await newDonor.save();

    res.status(201).json({ message: "Donor registered successfully", donor: newDonor });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// 🔐 Consumer Dashboard Route (Protected)
app.use("/api/consumer", consumerRoutes);

// 🔐 Donor uploads food info (protected)
app.use("/api/donor/food", donorFoodRoutes);

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
