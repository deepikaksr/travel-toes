import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BudgetManagement = () => {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState('Food');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);

  useEffect(() => {
    fetchExpenses();
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/budgets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBudgets(data.budgets);
        calculateTotalBudget(data.budgets);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

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
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const calculateTotalBudget = (budgetsList) => {
    const total = budgetsList.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
    setTotalBudget(total);
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    if (!budgetAmount || isNaN(budgetAmount) || parseFloat(budgetAmount) <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = budgets.some(b => b.category === category) ? 'PUT' : 'POST';
      const url = method === 'PUT' 
        ? `http://localhost:5000/api/budgets/${category}`
        : 'http://localhost:5000/api/budgets';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category,
          amount: parseFloat(budgetAmount)
        })
      });

      if (response.ok) {
        await fetchBudgets(); // Refresh budgets from server
        setBudgetAmount('');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to set budget');
      }
    } catch (error) {
      console.error('Error setting budget:', error);
      alert('Failed to set budget');
    }
  };

  const handleDeleteBudget = async (categoryToDelete) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/budgets/${categoryToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchBudgets(); // Refresh budgets from server
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete budget');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget');
    }
  };

  const calculateAmountSpent = (category) => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const calculateTotalSpent = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const calculateBalance = () => {
    const totalSpent = calculateTotalSpent();
    return totalBudget - totalSpent;
  };

  const chartData = {
    labels: budgets.map(budget => budget.category),
    datasets: [
      {
        label: 'Budget Amount',
        data: budgets.map(budget => budget.amount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Actual Spending',
        data: budgets.map(budget => calculateAmountSpent(budget.category)),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Budget vs. Spending by Category'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Budget Management</h1>
      
      <div className="text-center mb-4">
        <h4>Total Trip Budget: ${totalBudget.toFixed(2)}</h4>
        <h4>Balance: ${calculateBalance().toFixed(2)}</h4>
      </div>

      <div className="row">
        <div className="col-md-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Set Budget</h5>
              <form onSubmit={handleSetBudget}>
                <div className="mb-3">
                  <label className="form-label">Category:</label>
                  <select 
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Budget Amount:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    Set Budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Budget vs. Spending</h5>
              <div className="chart-container">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-body">
          <h5 className="card-title">Budget Overview</h5>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Budget Amount</th>
                  <th>Amount Spent</th>
                  <th>Remaining</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map(budget => {
                  const amountSpent = calculateAmountSpent(budget.category);
                  const remaining = budget.amount - amountSpent;
                  return (
                    <tr key={budget.category}>
                      <td>{budget.category}</td>
                      <td>${budget.amount.toFixed(2)}</td>
                      <td>${amountSpent.toFixed(2)}</td>
                      <td className={remaining < 0 ? 'text-danger' : 'text-success'}>
                        ${remaining.toFixed(2)}
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteBudget(budget.category)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )})}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mt-4 mb-4">
        <div className="card-body text-center">
          <h5 className="mb-3">To explore more, navigate to expense page:</h5>
          <Link to="/expense-tracker" className="btn btn-secondary">
            Go to Expense Tracker
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BudgetManagement;