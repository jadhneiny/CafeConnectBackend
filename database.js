const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://cafeconnectaub:CMPS271@cafedb.p4hlveb.mongodb.net/?retryWrites=true&w=majority&appName=CafeDB";

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB Atlas successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB Atlas', error);
  }
};

module.exports = connectToMongoDB;
