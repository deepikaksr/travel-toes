import React, { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { useNavigate, Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement
);

const ExpenseTracker = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [category, setCategory] = useState('Food');
  const [customCategory, setCustomCategory] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchExpenses();
  }, [navigate]);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/expenses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses);
        setTotalExpenses(data.totalExpenses);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/');
      return;
    }

    const amountValue = parseFloat(amount);
    const categoryValue = category === 'Other' ? customCategory : category;

    if (!date || isNaN(amountValue) || !categoryValue) {
      alert('Please fill in all fields correctly');
      return;
    }

    const expenseData = {
      date,
      category: categoryValue,
      amount: amountValue,
    };

    try {
      let url = 'http://localhost:5000/api/expenses';
      let method = 'POST';

      if (editingExpense) {
        url = `http://localhost:5000/api/expenses/${editingExpense._id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenseData)
      });

      if (response.ok) {
        resetForm();
        fetchExpenses();
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save expense. Please try again.');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchExpenses();
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete expense.');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setDate(expense.date.split('T')[0]);
    setAmount(expense.amount.toString());
    
    if (['Food', 'Transport', 'Shopping', 'Entertainment'].includes(expense.category)) {
      setCategory(expense.category);
      setCustomCategory('');
    } else {
      setCategory('Other');
      setCustomCategory(expense.category);
    }
  };

  const resetForm = () => {
    setDate('');
    setAmount('');
    setCategory('Food');
    setCustomCategory('');
    setEditingExpense(null);
  };

  // Chart data preparation
  const expensesByDate = expenses.reduce((acc, expense) => {
    const dateKey = expense.date.split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(expense);
    return acc;
  }, {});

  const lineChartData = {
    labels: Object.keys(expensesByDate).sort(),
    datasets: [{
      label: 'Daily Spending',
      data: Object.entries(expensesByDate).map(([date, dayExpenses]) => 
        dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      ),
      fill: true,
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4,
    }]
  };

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const pieChartData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
      ],
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 4,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 8,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        titleFont: {
          size: 12
        },
        bodyFont: {
          size: 11
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10
          }
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10
          }
        }
      }
    }
  };

  const pieChartOptions = {
    ...chartOptions,
    aspectRatio: 3.0,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        position: 'right',
      }
    }
  };

  // Tips with icons
  const tips = [
    {
      icon: "📊",
      tip: "Track your spending regularly to stay aware of your financial situation."
    },
    {
      icon: "🎯",
      tip: "Set a budget for different categories and stick to it."
    },
    {
      icon: "📈",
      tip: "Review your expenses at the end of the month to identify areas for improvement."
    },
    {
      icon: "💰",
      tip: "Use cash for discretionary spending to help limit overspending."
    },
    {
      icon: "🏦",
      tip: "Consider creating an emergency fund to handle unexpected expenses."
    },
    {
      icon: "🛒",
      tip: "Prioritize needs over wants when making purchases to avoid impulsive buying."
    }
  ];

  return (
    <div className="container mt-5">
      <div className="text-center mb-5">
        <h2 className="display-4 mb-3">Expense Tracker</h2>
        <h3 className="text-muted">Total Expenses: ${totalExpenses.toFixed(2)}</h3>
      </div>
      
      {/* Centered container with maximum width */}
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <form onSubmit={handleSubmit} className="bg-light p-4 rounded shadow-sm">
            <div className="mb-3">
              <label htmlFor="date" className="form-label">Date:</label>
              <input
                type="date"
                id="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="amount" className="form-label">Amount:</label>
              <input
                type="number"
                id="amount"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="category" className="form-label">Category:</label>
              <select
                id="category"
                className="form-select"
                value={category}
                onChange={(e) => {
                  if (e.target.value === 'Other') {
                    setCustomCategory('');
                  }
                  setCategory(e.target.value);
                }}
              >
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
              {category === 'Other' && (
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="Specify category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                />
              )}
            </div>
            
            <div className="d-grid">
              <button type="submit" className="btn btn-primary">
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="table-responsive mt-4">
        <h4 className="mb-3">Your Expenses:</h4>
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => (
              <tr key={expense._id}>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>{expense.category}</td>
                <td>${expense.amount.toFixed(2)}</td>
                <td>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditExpense(expense)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteExpense(expense._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-5">
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4 className="card-title text-center mb-4">Daily Spending</h4>
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="card shadow-sm">
          <div className="card-body">
            <h4 className="card-title text-center mb-4">Category Breakdown</h4>
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-center mb-4">Tips for Better Expense Management</h4>
        <div className="row g-4">
          {tips.map((tip, index) => (
            <div key={index} className="col-md-6 col-lg-4">
              <div className={`card h-100 border-0 shadow-sm ${tip.color}`}>
                <div className="card-body text-center">
                  <div className="display-4 mb-3">{tip.icon}</div>
                  <p className="card-text">{tip.tip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="card shadow-sm">
          <div className="card-body">
            <br />
            <h5 className="text-center mb-3">To explore more, navigate to budget page:</h5>
            <div className="d-flex justify-content-center">
              <Link to="/budget-management" className="btn btn-secondary">
                Go to Budget Management
              </Link>
            </div>
            <br />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;