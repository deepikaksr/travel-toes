import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import ExpenseTracker from './pages/ExpenseTracker'; // Import the ExpenseTracker page
import './styles.css';

function App() {
  // Function to check if the user is authenticated
  const isAuthenticated = () => {
    return !!localStorage.getItem('token'); // If token exists, return true
  };

  // Private route component to protect certain routes
  const PrivateRoute = ({ element: Component }) => {
    return isAuthenticated() ? <Component /> : <Navigate to="/" />;
  };

  return (
    <Router>
      <Header />
      <div className="container mt-4">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route path="/home" element={<PrivateRoute element={Home} />} />
          <Route path="/expense-tracker" element={<PrivateRoute element={ExpenseTracker} />} /> {/* Add ExpenseTracker */}
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
