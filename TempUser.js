const mongoose = require('mongoose');

const tempUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verificationCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: '24h' } }
});

const TempUser = mongoose.model('TempUser', tempUserSchema);

module.exports = TempUser;
