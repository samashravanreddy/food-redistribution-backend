const mongoose = require('mongoose');

const donorRegisterSchema = new mongoose.Schema({
  name: String,
  organization:  {type: String,required: true, },
  mobile: String,
  email: { type: String, unique: true },
  address: String,
  password: String,
  role: { type: String, default: "donor" }
});

module.exports = mongoose.model('DonorRegister', donorRegisterSchema);
