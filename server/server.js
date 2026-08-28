const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const scanRoutes = require('./routes/scan');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/scan', scanRoutes);
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});