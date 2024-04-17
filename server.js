const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const connectToMongoDB = require('./database.js'); // Adjust the path as necessary
const User = require('./User'); 
const TempUser = require('./TempUser');
const MenuItem = require('./MenuItems');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false, 
  auth: {
    user: 'Cafeconnectaub@outlook.com',
    pass: 'zaudvbesibtrinaj',
  },
  tls: {
    ciphers:'SSLv3'
  }
});

const sendVerificationEmail = (userEmail, verificationCode) => {
  const mailOptions = {
    from: 'Cafeconnectaub@outlook.com', // Sender address
    to: userEmail, // List of receivers
    subject: 'Verify Your Email', // Subject line
    text: `Your verification code is: ${verificationCode}`, 
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return;
    }
    console.log(`Email sent: ${info.response}`);
  });
};

// POST: Create a new menu item
app.post('/api/createItem', async (req, res) => {
  const newItem = new MenuItem(req.body);
  try {
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET: Retrieve all menu items
app.get('/api/getMenuItems', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// DELETE: Remove a menu item
app.delete('/api/menuItems/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// PUT: Update an existing menu item
app.put('/api/menuItems/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const item = await MenuItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Manually merge the top-level fields
    Object.keys(updateData).forEach(key => {
      if (key === 'availability' && typeof updateData[key] === 'object') {
        item[key] = {...item[key], ...updateData[key]}; // Merge availability objects
      } else {
        item[key] = updateData[key];
      }
    });

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!email.endsWith('@mail.aub.edu')) {
      return res.status(400).send('Email must end with @mail.aub.edu');
  }

  try {
      const existingUser = await User.findOne({ email });
      const tempUserExists = await TempUser.findOne({ email });
      if (existingUser || tempUserExists) {
          return res.status(400).send('Email already in use');
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      const tempUser = new TempUser({
          name,
          email,
          password: hashedPassword,
          verificationCode
      });
      await tempUser.save();

      sendVerificationEmail(email, verificationCode);

      res.status(200).send('Verification code sent to email. Please verify to complete registration.');
  } catch (error) {
      console.error('Signup error:', error);
      res.status(500).send('Error during signup');
  }
});

app.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/verify', async (req, res) => {
  const { email, verificationCode } = req.body;

  // Check if the email and verification code are provided
  if (!email || !verificationCode) {
      return res.status(400).send('Email and verification code are required.');
  }

  try {
    
      const tempUser = await TempUser.findOne({ email });

      if (!tempUser || tempUser.verificationCode !== verificationCode) {
          return res.status(400).send('Invalid verification code or email.');
      }

      const newUser = new User({
          name: tempUser.name,
          email: tempUser.email,
          password: tempUser.password, 
      });
      await newUser.save();

      await TempUser.deleteOne({ email });

      res.send('Email verified successfully and user created.');
  } catch (error) {
      console.error('Verification error:', error);
      res.status(500).send('An error occurred during verification.');
  }
});

 app.use(express.static('C:/Users/User/Desktop/proj271sprint4/CafeConnectFrontend/build')); //Adjust the path here

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
