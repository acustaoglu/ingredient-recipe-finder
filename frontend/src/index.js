// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import App from './App';
import { AuthProvider } from './context/AuthContext';
import { RecipeProvider } from './context/RecipeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <RecipeProvider>
      <App />
    </RecipeProvider>
  </AuthProvider>
);
