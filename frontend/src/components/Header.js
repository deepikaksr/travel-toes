import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Import the logo image

const Header = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        {/* Logo and Title */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} alt="Logo" style={{ width: '50px', height: '50px' }} />
          <span className="ms-2" style={{ fontWeight: 'bold', fontSize: '24px' }}>TRAVEL TOES</span>
        </Link>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/home">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/expense-tracker">Expense Tracker</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/budget">Budget Management</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/signup">Signup</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/">Login</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
