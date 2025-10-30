const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const consumerLoginSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Pre-save hook to hash the password before saving to the database
consumerLoginSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // If the password isn't modified, skip hashing

  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
    this.password = await bcrypt.hash(this.password, salt); // Hash the password with the salt
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('ConsumerLogin', consumerLoginSchema);
