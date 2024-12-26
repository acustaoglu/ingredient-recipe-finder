// routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * GET /api/recipes/complex
 * Example: /api/recipes/complex?query=tomato onion&page=1&limit=5
 */
router.get('/complex', async (req, res) => {
  try {
    const query = req.query.query || '';   // e.g., "tomato onion"
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;

    const offset = (page - 1) * limit;

    const apiKey = process.env.SPOONACULAR_API_KEY;
    const spoonacularURL = 'https://api.spoonacular.com/recipes/complexSearch';

    const response = await axios.get(spoonacularURL, {
      params: {
        apiKey: apiKey,
        query: query,
        offset: offset,
        number: limit,
        addRecipeInformation: true // includes extendedIngredients, instructions, etc.
      }
    });

    const data = response.data;

    return res.json({
      results: data.results || [],
      totalResults: data.totalResults || 0,
      page: page,
      limit: limit
    });
  } catch (error) {
    console.error('Error fetching complex search:', error.message);
    return res.status(500).json({ error: 'An error occurred while fetching recipes.' });
  }
});

router.get('/:id/details', async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = process.env.SPOONACULAR_API_KEY;
    const spoonacularURL = `https://api.spoonacular.com/recipes/${id}/information`;

    const response = await axios.get(spoonacularURL, {
      params: {
        apiKey: apiKey,
      },
    });

    // Spoonacular returns detailed data including instructions, extendedIngredients, etc.
    const recipeInfo = response.data;

    // You could return everything or pick only certain fields, e.g.:
    const formatted = {
      id: recipeInfo.id,
      title: recipeInfo.title,
      image: recipeInfo.image,
      servings: recipeInfo.servings,
      readyInMinutes: recipeInfo.readyInMinutes,
      instructions: recipeInfo.instructions, // sometimes HTML
      extendedIngredients: recipeInfo.extendedIngredients, // array of ingredient objects
      sourceUrl: recipeInfo.sourceUrl,
    };

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching detailed recipe data:', error.message);
    res.status(500).json({ error: 'Could not fetch recipe details.' });
  }
});

module.exports = router;
