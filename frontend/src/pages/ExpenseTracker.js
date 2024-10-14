import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement, // Import ArcElement for pie chart
} from 'chart.js';

// Register the necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement // Register ArcElement here
);

const ExpenseTracker = () => {
  const [date, setDate] = useState('');
  const [expenses, setExpenses] = useState({});
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [category, setCategory] = useState('Food');
  const [customCategory, setCustomCategory] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);
  const [amount, setAmount] = useState(0);

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
        newExpenses[date][editingExpense.index] = {
          amount: parseFloat(amount),
          category: categoryToUse,
        };
        setEditingExpense(null);
      } else {
        newExpenses[date].push({ amount: parseFloat(amount), category: categoryToUse });
      }

      setExpenses(newExpenses);
      setTotalExpenses((prevTotal) => prevTotal + (editingExpense ? parseFloat(amount) - parseFloat(expenses[editingExpense.date][editingExpense.index].amount) : parseFloat(amount)));
      resetForm();
    }
  };

  const resetForm = () => {
    setAmount(0);
    setCategory('Food');
    setCustomCategory('');
    setEditingExpense(null);
  };

  const handleEditExpense = (date, index) => {
    const expenseToEdit = expenses[date][index];
    setEditingExpense({ date, index });
    setAmount(expenseToEdit.amount);
    setCategory(expenseToEdit.category);
    if (expenseToEdit.category === 'Other') {
      setCustomCategory(expenseToEdit.category);
    } else {
      setCustomCategory('');
    }
  };

  const handleNextDate = () => {
    resetForm();
    setDate('');
  };

  const dailyTotals = Object.entries(expenses).map(([date, expenseList]) => {
    const dailyTotal = expenseList.reduce((sum, expense) => sum + expense.amount, 0);
    return { date, total: dailyTotal, expenses: expenseList };
  });

  // Prepare data for line chart (spending trend)
  const lineChartData = {
    labels: dailyTotals.map(entry => entry.date),
    datasets: [
      {
        label: 'Daily Spending',
        data: dailyTotals.map(entry => entry.total),
        fill: true,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  };

  // Prepare data for pie chart (category breakdown)
  const categoryTotals = {};
  dailyTotals.forEach(entry => {
    entry.expenses.forEach(expense => {
      if (categoryTotals[expense.category]) {
        categoryTotals[expense.category] += expense.amount;
      } else {
        categoryTotals[expense.category] = expense.amount;
      }
    });
  });

  const pieChartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: 'Category Spending Breakdown',
        data: Object.values(categoryTotals),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false, // Disable aspect ratio maintenance
  };

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
              value={amount || ''}
              onChange={(e) => setAmount(e.target.value)}
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
                  setCustomCategory('');
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
                required={category === 'Other'}
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

      {dailyTotals.length > 0 && (
        <div className="mt-4">
          <h4 className="text-center">Spending Trend</h4>
          <div style={{ position: 'relative', height: '300px', width: '100%' }}>
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>
      )}

      {Object.keys(categoryTotals).length > 0 && (
        <div className="mt-4">
          <h4 className="text-center">Category Spending Breakdown</h4>
          <div style={{ position: 'relative', height: '300px', width: '100%' }}>
            <Pie data={pieChartData} options={chartOptions} />
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Tips for Better Expense Management</h5>
            <ul>
              <li>Track your expenses daily to stay within your budget.</li>
              <li>Set aside a specific amount for discretionary spending.</li>
              <li>Review your spending patterns monthly and adjust as needed.</li>
              <li>Consider using budgeting apps for better tracking.</li>
              <li>Always keep a buffer for unexpected expenses.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;
