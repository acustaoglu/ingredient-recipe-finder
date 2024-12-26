// src/pages/Login.js

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:4000/api/auth/login', {
        username,
        password
      });
      // Suppose we get { token, userId } from the backend
      const { token, userId } = response.data;

      // Store token and userId
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);

      // Update authentication state
      setIsLoggedIn(true);

      toast.success('Logged in successfully!');
      navigate('/'); // Redirect to Search tab after login
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      toast.error('Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label">Username:</label>
          <input 
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Password:</label>
          <input 
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  );
}
