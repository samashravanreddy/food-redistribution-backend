const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const consumerRegisterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
});

// Pre-save hook to hash the password before saving to the database
consumerRegisterSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Skip hashing if password isn't modified

  try {
    const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
  } catch (err) {
    next(err); // Pass any error to the next middleware
  }
});

module.exports = mongoose.model("ConsumerRegister", consumerRegisterSchema);
