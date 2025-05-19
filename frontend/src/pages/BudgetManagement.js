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

const BudgetTips = () => {
  const tips = [
    {
      icon: "📱",
      text: "Use the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.",
    },
    {
      icon: "🎯",
      text: "Set SMART financial goals: Specific, Measurable, Achievable, Relevant, and Time-bound.",
    },
    {
      icon: "💡",
      text: "Compare prices before major purchases and look for discounts or seasonal sales to maximize savings.",
    },
    {
      icon: "🏦",
      text: "Save at least 3-6 months of expenses in an emergency fund for unexpected costs.",
    },
    {
      icon: "📊",
      text: "Review and adjust your budget regularly - weekly check-ins help catch overspending early.",
    },
    {
      icon: "✂️",
      text: "Cut unnecessary subscriptions and automate savings to reach your financial goals faster.",
    }
  ];

  return (
    <div className="mt-4 mb-4">
      <h2 className="text-center mb-4">
        Tips for Better Expense Management
      </h2>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {tips.map((tip, index) => (
          <div key={index} className="col">
            <div className="card h-100 border shadow-sm">
              <div className="card-body text-center">
                <span style={{ fontSize: '2.5rem' }}>{tip.icon}</span>
                <p className="card-text mt-2 mb-0">{tip.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BudgetManagement = () => {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState('Food');
  const [customCategory, setCustomCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([fetchExpenses(), fetchBudgets()]);
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    setShowCustomCategory(category === 'Other');
    if (category !== 'Other') {
      setCustomCategory('');
    }
  }, [category]);

  const fetchBudgets = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/budgets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch budgets');
      }

      const data = await response.json();
      const transformedData = Array.isArray(data) ? data : (data.budgets || []);
      const processedBudgets = transformedData.map(budget => ({
        ...budget,
        category: budget.category || 'Unknown',
        amount: Number(budget.amount) || 0
      }));

      setBudgets(processedBudgets);
      calculateTotalBudget(processedBudgets);
    } catch (error) {
      setError(`Error fetching budgets: ${error.message}`);
      console.error('Error fetching budgets:', error);
      setBudgets([]);
    }
  };

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/expenses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch expenses');
      }

      const data = await response.json();
      setExpenses(Array.isArray(data.expenses) ? data.expenses : []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError(`Error fetching expenses: ${error.message}`);
      setExpenses([]);
    }
  };

  const calculateTotalBudget = (budgetsList) => {
    const total = (budgetsList || []).reduce((sum, budget) => {
      const amount = Number(budget.amount) || 0;
      return sum + amount;
    }, 0);
    setTotalBudget(total);
  };

  const validateBudgetData = () => {
    if (!category) {
      throw new Error('Please select a category');
    }
    if (category === 'Other' && !customCategory.trim()) {
      throw new Error('Please enter a custom category name');
    }
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Please enter a valid budget amount greater than 0');
    }
    return amount;
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const amount = validateBudgetData();
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const actualCategory = category === 'Other' ? customCategory : category;
      const existingBudget = budgets.find(b => b.category === actualCategory);

      const method = existingBudget ? 'PUT' : 'POST';
      const url = existingBudget 
        ? `http://localhost:5000/api/budgets/${existingBudget._id}`
        : 'http://localhost:5000/api/budgets';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: actualCategory,
          amount
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set budget');
      }

      await fetchBudgets(); // Refresh all budgets to ensure consistency

      // Reset form
      setBudgetAmount('');
      if (category === 'Other') {
        setCustomCategory('');
      }
      setError('');
    } catch (error) {
      setError(`Error setting budget: ${error.message}`);
      console.error('Error setting budget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBudget = async (categoryToDelete) => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const budgetToDelete = budgets.find(b => b.category === categoryToDelete);
      if (!budgetToDelete) {
        throw new Error('Budget not found');
      }

      const response = await fetch(`http://localhost:5000/api/budgets/${budgetToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete budget');
      }

      await fetchBudgets(); // Refresh budgets after deletion
    } catch (error) {
      setError(`Error deleting budget: ${error.message}`);
      console.error('Error deleting budget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAmountSpent = (budgetCategory) => {
    if (!budgetCategory) return 0;
    return expenses
      .filter(expense => expense.category === budgetCategory)
      .reduce((sum, expense) => {
        const amount = parseFloat(expense.amount);
        return isNaN(amount) ? sum : sum + amount;
      }, 0);
  };

  const calculateTotalSpent = () => {
    return expenses.reduce((sum, expense) => {
      const amount = parseFloat(expense.amount);
      return isNaN(amount) ? sum : sum + amount;
    }, 0);
  };

  const calculateBalance = () => {
    const totalSpent = calculateTotalSpent();
    return totalBudget - totalSpent;
  };

  const chartData = {
    labels: budgets.map(budget => budget?.category || 'Unknown'),
    datasets: [
      {
        label: 'Budget Amount',
        data: budgets.map(budget => Number(budget?.amount) || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Actual Spending',
        data: budgets.map(budget => 
          calculateAmountSpent(budget?.category)
        ),
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
<<<<<<< HEAD
    animation: {
      duration: 2000,  // Duration for each animation loop
      onComplete: function() {
        setTimeout(() => {
          if (this.chart) {
            this.chart.clear();
            this.chart.render();
          }
        }, 0);
      },
    },
  };
  
=======
  };
>>>>>>> 9bc131b5061c348ea59633ceb14f056c32a2749d

  if (isLoading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Budget Management</h1>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <div className="text-center mb-4">
        <h4>Total Trip Budget: ${totalBudget.toFixed(2)}</h4>
        <h4>Balance: ${calculateBalance().toFixed(2)}</h4>
      </div>

      {/* Centered Budget Setting Box */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
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
                    disabled={isLoading}
                  >
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                {showCustomCategory && (
                  <div className="mb-3">
                    <label className="form-label">Custom Category Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter custom category name"
                      required
                      disabled={isLoading}
                    />
                  </div>
                )}
                
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
                    disabled={isLoading}
                  />
                </div>

                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Setting Budget...' : 'Set Budget'}
                  </button>
                </div>
              </form>
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
                {budgets.length > 0 ? budgets.map((budget) => {
                  const amountSpent = calculateAmountSpent(budget.category);
                  const remaining = (budget.amount || 0) - amountSpent;
                  return (
                    <tr key={budget.category}>
                      <td>{budget.category}</td>
                      <td>${budget.amount ? budget.amount.toFixed(2) : '0.00'}</td>
                      <td>${amountSpent.toFixed(2)}</td>
                      <td className={remaining < 0 ? 'text-danger' : 'text-success'}>
                        ${remaining.toFixed(2)}
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteBudget(budget.category)}
                          disabled={isLoading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="5" className="text-center">No budgets available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Visualization moved after the table */}
      <div className="row justify-content-center mt-4 mb-4">
        <div className="col-md-12">
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

      {/* Budget Tips Section */}
      <BudgetTips />

      <div className="card shadow-sm mt-4 mb-4">
        <div className="card-body text-center">
<<<<<<< HEAD
        <br />
=======
>>>>>>> 9bc131b5061c348ea59633ceb14f056c32a2749d
          <h5 className="mb-3">To explore more, navigate to expense page:</h5>
          <Link to="/expense-tracker" className="btn btn-secondary">
            Go to Expense Tracker
          </Link>
        </div>
<<<<<<< HEAD
        <br />
=======
>>>>>>> 9bc131b5061c348ea59633ceb14f056c32a2749d
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default BudgetManagement;
=======
export default BudgetManagement;
>>>>>>> 9bc131b5061c348ea59633ceb14f056c32a2749d
