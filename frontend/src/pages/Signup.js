// Signup.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const fullName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;

    const res = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      navigate('/home'); // Redirect to home page
    } else {
      alert(data.msg); // Display error message
    }
  };

  return (
    <div>
      <h2 className="text-center">Signup</h2>
      <form className="mb-3" onSubmit={handleSignup}>
        <input className="form-control" type="text" placeholder="Full Name" required />
        <input className="form-control mt-2" type="email" placeholder="Email" required />
        <input className="form-control mt-2" type="password" placeholder="Password" required />
        <button className="btn btn-primary mt-3" type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
