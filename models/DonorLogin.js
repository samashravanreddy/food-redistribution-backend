const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

module.exports = mongoose.model('Donor', donorSchema);
