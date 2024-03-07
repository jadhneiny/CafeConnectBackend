// server2.js

const express = require('express');
const connectToMongoDB = require('./database');
const { registerUser, loginUser } = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 3000;

connectToMongoDB();

// Middleware to parse JSON requests
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('CafeConnect Test');
});

app.post('/register', registerUser);
app.post('/login', loginUser);

// Additional routes can be added for other functionality

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
