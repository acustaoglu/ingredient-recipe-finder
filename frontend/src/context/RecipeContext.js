// src/context/RecipeContext.js

import React, { createContext, useState } from 'react';

export const RecipeContext = createContext();

export function RecipeProvider({ children }) {
  const [recipes, setRecipes] = useState([]);
  const [detailsCache, setDetailsCache] = useState({});

  return (
    <RecipeContext.Provider value={{ recipes, setRecipes, detailsCache, setDetailsCache }}>
      {children}
    </RecipeContext.Provider>
  );
}
