const express = require('express');
const Budget = require('../models/Budget');
const authMiddleware = require('../middleware/authMiddleware'); // Import auth middleware
const router = express.Router();

// Get all budgets for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.userId });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ msg: 'Failed to fetch budgets', error: error.message });
  }
});

// Add a new budget for the authenticated user
router.post('/', authMiddleware, async (req, res) => {
  const { category, amount } = req.body;
  try {
    const newBudget = new Budget({ userId: req.userId, category, amount });
    await newBudget.save();
    res.status(201).json(newBudget);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error for unique index
      return res.status(400).json({ msg: 'Budget already exists for this category' });
    }
    res.status(500).json({ msg: 'Failed to add budget', error: error.message });
  }
});

// Update an existing budget
router.put('/:budgetId', authMiddleware, async (req, res) => {
  const { category, amount } = req.body;
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.budgetId, userId: req.userId },
      { category, amount },
      { new: true }
    );
    if (!budget) {
      return res.status(404).json({ msg: 'Budget not found' });
    }
    res.json(budget);
  } catch (error) {
    res.status(500).json({ msg: 'Failed to update budget', error: error.message });
  }
});

// Delete a budget
router.delete('/:budgetId', authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.budgetId, userId: req.userId });
    if (!budget) {
      return res.status(404).json({ msg: 'Budget not found' });
    }
    res.json({ msg: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ msg: 'Failed to delete budget', error: error.message });
  }
});

module.exports = router;
