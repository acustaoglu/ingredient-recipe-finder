// src/pages/RecipeSearch.js

import React, { useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { RecipeContext } from '../context/RecipeContext';

export default function RecipeSearch() {
  const { recipes, setRecipes, detailsCache, setDetailsCache } = useContext(RecipeContext);

  // Local states for removable chips
  const [chips, setChips] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1); // Arrow-key highlight
  const [showControls, setShowControls] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5); // Items per page
  const [totalResults, setTotalResults] = useState(0);
  const totalPages = Math.ceil(totalResults / limit);

  // Refs
  const containerRef = useRef(null);

  // Keydown: SHIFT+Enter => search, arrow keys => navigate, Enter => expand
  const handleContainerKeyDown = (e) => {
    // SHIFT+Enter => search
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleSearch(1); // Reset to first page on new search
      return;
    }

    // ArrowDown => selectedIndex++
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (recipes.length > 0) {
        setSelectedIndex((prev) => Math.min(prev + 1, recipes.length - 1));
      }
    }
    // ArrowUp => selectedIndex--
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    }
    // Enter/Space on a selected item => toggleExpand
    else if ((e.key === 'Enter' || e.key === ' ') && !e.shiftKey) {
      if (selectedIndex >= 0 && selectedIndex < recipes.length) {
        e.preventDefault();
        toggleExpand(recipes[selectedIndex].id);
      }
    }
  };

  // Search function with page parameter
  const handleSearch = async (page = 1) => {
    if (!chips.length) {
      toast.error('Please add at least one ingredient (chip).');
      return;
    }
    setLoading(true);
    setExpandedRecipeId(null);
    setSelectedIndex(-1);
    setCurrentPage(page);

    // Convert chips => e.g. 'tomato,onion'
    const ingredients = chips.join(',');

    try {
      const response = await axios.get('http://localhost:4000/api/recipes/complex', {
        params: { query: ingredients, page, limit }
      });
      // Expected response: { results, totalResults, page, limit }
      const data = response.data;
      setRecipes(data.results || []);
      setTotalResults(data.totalResults || 0);
      setDetailsCache({});
    } catch (error) {
      console.error('Search error:', error.response?.data || error.message);
      toast.error('Error fetching recipes. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (recipeId) => {
    if (expandedRecipeId === recipeId) {
      setExpandedRecipeId(null);
      return;
    }
    if (!detailsCache[recipeId]) {
      try {
        const response = await axios.get(`http://localhost:4000/api/recipes/${recipeId}/details`);
        setDetailsCache((prev) => ({ ...prev, [recipeId]: response.data }));
      } catch (err) {
        console.error('Error fetching details:', err.response?.data || err.message);
        toast.error('Could not fetch recipe details.');
        return;
      }
    }
    setExpandedRecipeId(recipeId);
  };

  const addToFavorites = async (e, recipe) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      toast.error('Please log in first.');
      return;
    }
    try {
      await axios.post(
        `http://localhost:4000/api/users/${userId}/favorites`,
        { recipeId: recipe.id, recipeName: recipe.title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Favorite added!');
    } catch (err) {
      console.error('Add favorite error:', err.response?.data || err.message);
      toast.error('Could not add favorite.');
    }
  };

  // Enter to add a chip
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addChip();
    }
  };

  // Add chip (case-insensitive)
  const addChip = () => {
    if (!inputValue.trim()) return;
    const chip = inputValue.trim().toLowerCase();
    if (!chips.includes(chip)) {
      setChips([...chips, chip]);
    }
    setInputValue('');
  };

  const removeChip = (chipToRemove) => {
    setChips(chips.filter((c) => c !== chipToRemove));
  };

  const toggleControlsInfo = () => {
    setShowControls((prev) => !prev);
  };

  // Handle pagination
  const goToPrevPage = () => {
    if (currentPage > 1) {
      handleSearch(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      handleSearch(currentPage + 1);
    }
  };

  // Auto-focus container so arrow keys, shift+enter, etc. are captured
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  return (
    <div
      style={{ maxWidth: '1800px', margin: '10px 40px' }}
      tabIndex={0}
      ref={containerRef}
      onKeyDown={handleContainerKeyDown}
    >
      <h2 className="mb-4">
        Search Recipes by Ingredients (Removable Chips)
      </h2>

      {/* Expandable controls info button */}
      <button 
        className="btn btn-success mb-3 me-2"
        type="button"
        onClick={toggleControlsInfo}
      >
        {showControls ? 'Hide Controls Info' : 'Show Controls Info'}
      </button>
      {showControls && (
        <div className="alert alert-secondary">
          <ul className="mb-0">
            <li><strong>Shift+Enter</strong> to perform a search anywhere on this page.</li>
            <li><strong>Arrow Keys</strong> to highlight recipes in the list.</li>
            <li><strong>Enter / Space</strong> on a highlighted item to expand/collapse details.</li>
            <li><strong>Enter</strong> in ingredient field to add a chip.</li>
            <li>Click "x" on a chip to remove an ingredient.</li>
          </ul>
        </div>
      )}

      {/* Chip input area */}
      <div className="mb-4">
        <label className="form-label" htmlFor="ingredient-input">
          Add an Ingredient:
        </label>
        <div className="d-flex flex-wrap mb-2">
          {chips.map((chip) => (
            <div 
              key={chip}
              className="badge bg-secondary text-white me-2 mb-2 d-flex align-items-center"
              style={{ fontSize: '1rem' }}
            >
              <span>{chip}</span>
              <button
                type="button"
                className="btn-close btn-close-white ms-2"
                aria-label="Remove"
                onClick={() => removeChip(chip)}
                style={{ fontSize: '0.6rem' }}
              />
            </div>
          ))}
        </div>

        <div className="input-group">
          <input
            id="ingredient-input"
            type="text"
            className="form-control"
            placeholder="e.g., tomato"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="btn btn-outline-secondary" type="button" onClick={addChip}>
            Add
          </button>
        </div>
      </div>

      {/* "Search" button */}
      <div className="mb-4">
        <button
          className="btn btn-primary me-2"
          onClick={() => handleSearch(1)} // Start from page 1 on new search
          disabled={!chips.length}
        >
          Search
        </button>
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="text-center mb-3">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {/* Display results with pagination */}
      <ul className="list-group">
        {recipes.map((recipe, idx) => {
          const isExpanded = expandedRecipeId === recipe.id;
          const details = detailsCache[recipe.id] || null;
          const isSelected = idx === selectedIndex; // Arrow-key highlight
          const itemStyle = {
            backgroundColor: isSelected ? '#e8f4fa' : 'transparent'
          };

          return (
            <li
              key={recipe.id}
              className="list-group-item"
              style={itemStyle}
            >
              <div
                className="d-flex align-items-center"
                style={{ cursor: 'pointer' }}
                onClick={() => toggleExpand(recipe.id)}
              >
                {recipe.image && (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      marginRight: '1rem'
                    }}
                  />
                )}
                <div className="flex-grow-1">
                  <strong>{recipe.title}</strong>
                </div>
                <div style={{ fontSize: '1.2rem', marginLeft: '1rem' }}>
                  {isExpanded ? '▲' : '▼'}
                </div>
              </div>

              {isExpanded && details && (
                <div className="mt-3">
                  <p><strong>Servings:</strong> {details.servings}</p>
                  <p><strong>Ready in:</strong> {details.readyInMinutes} minutes</p>
                  
                  <p><strong>Ingredients:</strong></p>
                  <ul>
                    {details.extendedIngredients && details.extendedIngredients.map((ing) => (
                      <li key={ing.id || ing.original}>
                        {ing.original}
                      </li>
                    ))}
                  </ul>

                  <p><strong>Instructions:</strong></p>
                  <div dangerouslySetInnerHTML={{ __html: details.instructions }} />

                  <p>
                    <strong>Source:</strong>{' '}
                    <a href={details.sourceUrl} target="_blank" rel="noreferrer">
                      {details.sourceUrl}
                    </a>
                  </p>

                  <button
                    className="btn btn-sm btn-success mt-2"
                    onClick={(e) => addToFavorites(e, recipe)}
                  >
                    Add to Favorites
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Pagination Controls */}
      {recipes.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <button
            className="btn btn-outline-primary"
            onClick={goToPrevPage}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            className="btn btn-outline-primary"
            onClick={goToNextPage}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
