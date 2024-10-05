import React from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const fullName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        navigate('/home'); // Redirect to home page
      } else {
        alert(data.msg); // Display error message
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert('An error occurred during signup. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', height: '50vh' }}>
      <div>
        <br /><br />
        <h2 className="text-center">Signup</h2>
        <form className="mb-3" onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', width: '400px' }}>
          <input className="form-control" type="text" placeholder="Full Name" required style={{ marginBottom: '10px' }} />
          <input className="form-control" type="email" placeholder="Email" required style={{ marginBottom: '10px' }} />
          <input className="form-control" type="password" placeholder="Password" required style={{ marginBottom: '30px' }} />
          <button className="btn btn-primary" type="submit" style={{ width: '200px', margin: '0 auto' }}>Signup</button>
        </form>

        {/* Line for existing users to navigate to login */}
        <p className="text-center mt-3">
          Already have an account?{' '}
          <span onClick={() => navigate('/')} style={{ color: 'blue', cursor: 'pointer' }}>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
