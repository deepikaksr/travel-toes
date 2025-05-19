// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Middleware to enable CORS
const cors = require('cors');
router.use(cors()); // Enable CORS for all routes

// Signup
router.post('/signup', async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, userId: newUser._id }); // Return userId on signup as well
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('Login request received', req.body); // Log the incoming request body
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Return token and userId to frontend
    res.json({ token, userId: user._id }); 
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
