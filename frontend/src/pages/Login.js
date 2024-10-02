// Login.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        navigate('/home'); // Redirect to home page
      } else {
        alert(data.msg); // Display error message
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred while logging in. Please try again.'); // General error message
    }
  };

  return (
    <div>
      <h2 className="text-center">Login</h2>
      <form className="mb-3" onSubmit={handleLogin}>
        <input className="form-control" type="email" placeholder="Email" required />
        <input className="form-control mt-2" type="password" placeholder="Password" required />
        <button className="btn btn-primary mt-3" type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
