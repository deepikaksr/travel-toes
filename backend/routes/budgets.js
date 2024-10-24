const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const auth = require('../middleware/authMiddleware');

// Get all budgets for the user
router.get('/api/budgets', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.userId }); // Changed from req.user._id
    res.json({ budgets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new budget
router.post('/api/budgets', auth, async (req, res) => {
    try {
      console.log('Received budget creation request:', {
        body: req.body,
        userId: req.userId,
        headers: {
          ...req.headers,
          authorization: 'Bearer [hidden]' // Don't log the actual token
        }
      });
  
      const { category, amount } = req.body;
      
      // Validate inputs
      if (!category) {
        return res.status(400).json({ message: 'Category is required' });
      }
      
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Valid amount is required' });
      }
  
      // Check if budget already exists
      const existingBudget = await Budget.findOne({ 
        userId: req.userId,
        category 
      });
  
      console.log('Existing budget check:', {
        exists: !!existingBudget,
        category,
        userId: req.userId
      });
  
      if (existingBudget) {
        return res.status(400).json({ 
          message: 'Budget already exists for this category',
          existingBudget // Include details for debugging
        });
      }
  
      const budget = new Budget({
        userId: req.userId,
        category,
        amount
      });
  
      await budget.save();
      console.log('Budget saved successfully:', budget);
      
      res.status(201).json({ 
        message: 'Budget created successfully',
        budget 
      });
    } catch (error) {
      console.error('Budget creation error:', error);
      res.status(400).json({ 
        message: error.message,
        error: error.toString(),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

module.exports = router;