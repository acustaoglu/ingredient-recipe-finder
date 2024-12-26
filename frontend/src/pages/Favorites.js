// Updated Favorites.js

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Favorites() {
  const { isLoggedIn } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Token and userId from localStorage
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (isLoggedIn) {
      fetchFavorites();
    } else {
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const fetchFavorites = async () => {
    if (!token || !userId) {
      toast.error('Please log in first.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:4000/api/users/${userId}/favorites`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavorites(response.data || []);
    } catch (error) {
      console.error('Fetch favorites error:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Could not fetch favorites.');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId) => {
    if (!token || !userId) {
      toast.error('Please log in first.');
      return;
    }
    try {
      await axios.delete(
        `http://localhost:4000/api/users/${userId}/favorites/${favoriteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Recipe removed from favorites.');
      fetchFavorites(); // Refresh list
    } catch (error) {
      console.error('Remove favorite error:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Could not remove favorite.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2 className="mb-3">My Favorites</h2>

      {loading && (
        <div className="text-center mb-3">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {!loading && favorites.length === 0 && <p>You have no favorite recipes yet.</p>}

      <ul className="list-group">
        {favorites.map((fav) => (
          <li
            key={fav.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <strong>{fav.recipeName}</strong>
            <div>
              <a
                href={`https://spoonacular.com/recipes/${fav.recipeName}-${fav.recipeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-secondary me-2"
              >
                View Recipe
              </a>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => removeFavorite(fav.id)}
              >
                Remove Recipe
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
