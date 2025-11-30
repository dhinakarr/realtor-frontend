// pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api.js';

export default function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/api/auth/login', {
        email: username, // backend expects email
        password,
      });

      const data = res.data.data;

      // Save tokens
      localStorage.setItem('accessToken', data.token.accessToken);
      localStorage.setItem('refreshToken', data.token.refreshToken);
      localStorage.setItem('user', JSON.stringify(data));
	  
	  //console.log("LoginPage Data Received: "+JSON.stringify(data));
      // Update parent state
      setUser(data);

      navigate('/dashboard');
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <form
        className="card p-4 w-25"
        onSubmit={handleLogin}
        style={{ borderRadius: '12px', boxShadow: '0 0 12px rgba(0,0,0,0.2)' }}
      >
        <h4 className="mb-3 text-center">Login</h4>
        <input
          className="form-control mb-2"
          placeholder="Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="form-control mb-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          className="btn btn-primary w-100"
          style={{ backgroundColor: 'hsl(270, 60%, 40%)', border: 'none' }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
