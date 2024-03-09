const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const connectToMongoDB = require('./database.js'); // Adjust the path as necessary
const User = require('./User'); 
const app = express();

app.use(express.json());
app.use(express.static(path.join('"Path to your front end"/build'))); //Adjust the path here

app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!email.endsWith('@mail.aub.edu')) {
    return res.status(400).send('Email must end with @example.com');
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert the new user into the database
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).send('User created successfully');
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).send('Error creating user');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 8080;

const startServer = async () => {
  await connectToMongoDB();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

startServer();
