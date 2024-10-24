const express = require('express');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/authMiddleware'); // Import auth middleware
const router = express.Router();

// Get all expenses for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId });
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    res.json({ expenses, totalExpenses });
  } catch (error) {
    res.status(500).json({ msg: 'Failed to fetch expenses', error: error.message });
  }
});

// Add a new expense for the authenticated user
router.post('/', authMiddleware, async (req, res) => {
  const { date, category, amount } = req.body;
  try {
    const newExpense = new Expense({ userId: req.userId, date, category, amount });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ msg: 'Failed to add expense', error: error.message });
  }
});

// Update an existing expense
router.put('/:expenseId', authMiddleware, async (req, res) => {
  const { date, category, amount } = req.body;
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.expenseId, userId: req.userId },
      { date, category, amount },
      { new: true }
    );
    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ msg: 'Failed to update expense', error: error.message });
  }
});

// Delete an expense
router.delete('/:expenseId', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.expenseId, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }
    res.json({ msg: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ msg: 'Failed to delete expense', error: error.message });
  }
});

module.exports = router;
