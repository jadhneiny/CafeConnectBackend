const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  availability: {
    Monday: Number,
    Tuesday: Number,
    Wednesday: Number,
    Thursday: Number,
    Friday: Number,
    Saturday: Number,
    Sunday: Number,
  },
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
