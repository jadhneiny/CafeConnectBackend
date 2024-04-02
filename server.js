const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const connectToMongoDB = require('./database.js'); // Adjust the path as necessary
const User = require('./User'); 
const TempUser = require('./TempUser');
const app = express();

app.use(express.json());
app.use(express.static(path.join('/Users/peterbaramki/Desktop/CafeConnectFrontend/build'))); //Adjust the path here

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

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists
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
