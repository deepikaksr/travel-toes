import React, { useState } from 'react';

const ExpenseTracker = () => {
  const [date, setDate] = useState('');
  const [expenses, setExpenses] = useState({});
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [category, setCategory] = useState('Food'); // Default category
  const [customCategory, setCustomCategory] = useState('');
  const [editingExpense, setEditingExpense] = useState(null); // For editing
  const [amount, setAmount] = useState(0); // Single state for amount

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  const handleAddExpense = (event) => {
    event.preventDefault();

    const categoryToUse = category === 'Other' ? customCategory : category;

    if (date && amount && categoryToUse) {
      const newExpenses = { ...expenses };
      if (!newExpenses[date]) {
        newExpenses[date] = [];
      }

      if (editingExpense) {
        // If editing an expense, replace it
        newExpenses[date][editingExpense.index] = {
          amount: parseFloat(amount), // Ensure amount is a number
          category: categoryToUse, // Use the updated category
        };
        setEditingExpense(null); // Clear editing state after update
      } else {
        // Otherwise, add a new expense
        newExpenses[date].push({ amount: parseFloat(amount), category: categoryToUse });
      }

      setExpenses(newExpenses);
      setTotalExpenses((prevTotal) => prevTotal + (editingExpense ? parseFloat(amount) - parseFloat(expenses[editingExpense.date][editingExpense.index].amount) : parseFloat(amount)));
      resetForm(); // Reset form fields except date
    }
  };

  const resetForm = () => {
    setAmount(0); // Reset amount
    setCategory('Food'); // Reset category to default
    setCustomCategory(''); // Reset custom category
    setEditingExpense(null); // Clear editing state
  };

  const handleEditExpense = (date, index) => {
    const expenseToEdit = expenses[date][index];
    setEditingExpense({ date, index });
    setAmount(expenseToEdit.amount); // Set amount to the expense amount
    setCategory(expenseToEdit.category); // Set category for editing
    if (expenseToEdit.category === 'Other') {
      setCustomCategory(expenseToEdit.category); // Set custom category if 'Other'
    } else {
      setCustomCategory(''); // Clear custom category if it's not 'Other'
    }
  };

  const handleNextDate = () => {
    // Clear the amount and editing state
    resetForm();

    // Clear the expenses for the current date if needed
    // If you want to keep the previous date's expenses, do not clear expenses here
    setDate(''); // Clear the current date
  };

  // Calculate daily totals
  const dailyTotals = Object.entries(expenses).map(([date, expenseList]) => {
    const dailyTotal = expenseList.reduce((sum, expense) => sum + expense.amount, 0);
    return { date, total: dailyTotal, expenses: expenseList };
  });

  return (
    <div className="container">
      <h2 className="text-center mb-4">Expense Tracker</h2>

      <div className="mb-4">
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="form-control"
        />
      </div>

      {date && (
        <form onSubmit={handleAddExpense}>
          <div className="mb-3">
            <input
              type="number"
              placeholder="Expense Amount"
              required
              className="form-control"
              value={amount || ''} // Allow empty state for initial render
              onChange={(e) => setAmount(e.target.value)} // Use setAmount to update the state
            />
          </div>
          <div className="mb-3">
            <select
              className="form-select"
              value={category}
              onChange={(e) => {
                const selectedCategory = e.target.value;
                setCategory(selectedCategory);
                if (selectedCategory !== 'Other') {
                  setCustomCategory(''); // Clear custom category if not 'Other'
                }
              }}
            >
              <option value="Food">Food</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Travel">Travel</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {category === 'Other' && (
            <div className="mb-3">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Specify Other Category"
                className="form-control"
                required={category === 'Other'} // Make it required if 'Other' is selected
              />
            </div>
          )}
          <button type="submit" className="btn btn-primary">
            {editingExpense ? 'Update Expense' : 'Add Expense'}
          </button>
        </form>
      )}

      {dailyTotals.length > 0 && (
        <div className="mt-4">
          <h4 className="text-center">Daily Expense Summary</h4>
          <ul className="list-group">
            {dailyTotals.map(({ date, total, expenses: expenseList }, index) => (
              <li key={index} className="list-group-item">
                <strong>{date}:</strong> Total Expenses = ₹{total.toFixed(2)}
                <ul>
                  {expenseList.map((expense, expIndex) => (
                    <li key={expIndex}>
                      ₹{expense.amount} - {expense.category}{' '}
                      <button
                        className="btn btn-link text-warning"
                        onClick={() => handleEditExpense(date, expIndex)}
                      >
                        Edit
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 text-center">
        <h5>Total Expenses: ₹{totalExpenses.toFixed(2)}</h5>
        <button className="btn btn-secondary" onClick={handleNextDate}>
          Next Date
        </button>
      </div>
    </div>
  );
};

export default ExpenseTracker;
