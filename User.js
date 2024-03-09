const mongoose = require('mongoose');

//user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Removes whitespace from both ends
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures email addresses are unique in the collection
    trim: true,
    lowercase: true, // Converts the email to lowercase
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Create the model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
