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
        // Store token and userId in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId); // Store the userId

        navigate('/home'); // Redirect to home page
      } else {
        alert(data.msg); // Display error message
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred while logging in. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', height: '50vh' }}>
      <div>
        <br /><br />
        <h2 className="text-center">Login</h2>
        <form className="mb-3" onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '400px' }}>
          <input className="form-control" type="email" placeholder="Email" required style={{ marginBottom: '10px' }} />
          <input className="form-control" type="password" placeholder="Password" required style={{ marginBottom: '30px' }} />
          <button className="btn btn-primary" type="submit" style={{ width: '100px', margin: '0 auto' }}>Login</button>
        </form>
        <p className="text-center mt-3">
          New user?{' '}
          <span onClick={() => navigate('/signup')} style={{ color: 'blue', cursor: 'pointer' }}>
            Sign up here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
