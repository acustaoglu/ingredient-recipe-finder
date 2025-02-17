import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    // Not logged in? Redirect to /login
    return <Navigate to="/login" replace />;
  }

  return children;
}
