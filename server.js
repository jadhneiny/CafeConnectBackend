const express = require('express');
const connectToMongoDB = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

connectToMongoDB();

app.get('/', (req, res) => {
  res.send('CafeConnect Test');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
