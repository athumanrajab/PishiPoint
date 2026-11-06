/** @file Recipe, search, serving, and bookmark application state and API actions. */

import { async } from "regenerator-runtime";
import { API_URL, RES_PER_PAGE, API_KEY } from "./config.js";
// import { getJSON, sendJSON } from "./helpers.js";
import { AJAX } from "./helpers.js";

import "core-js/stable";

/**
 * @typedef {Object} RecipeIngredient
 * @property {number | null} quantity Ingredient amount, when provided.
 * @property {string} unit Measurement unit.
 * @property {string} description Ingredient name and preparation details.
 */

/**
 * @typedef {Object} Recipe
 * @property {string} id Recipe identifier.
 * @property {string} title Recipe title.
 * @property {string} publisher Recipe publisher.
 * @property {string} sourceUrl Recipe directions URL.
 * @property {string} image Recipe image URL.
 * @property {number} servings Number of servings.
 * @property {number} cookingTime Cooking time in minutes.
 * @property {RecipeIngredient[]} ingredients Recipe ingredients.
 * @property {string} [key] Optional key for user-generated recipes.
 * @property {boolean} [bookmarked] Whether the recipe is bookmarked.
 */

/**
 * @typedef {Object} RecipeSearchState
 * @property {string} query Current search query.
 * @property {Array<Pick<Recipe, "id" | "image" | "title" | "publisher" | "key">>} results Search results.
 * @property {number} resultsPerPage Number of results per page.
 * @property {number} page Current results page.
 */

/**
 * Mutable application data shared by the model, views, and controller.
 * @type {{recipe: Partial<Recipe>, search: RecipeSearchState, bookmarks: Recipe[]}}
 */
export const state = {
  recipe: {},
  search: {
    query: "",
    results: [],
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

/**
 * Converts the API's recipe response into the application's recipe shape.
 * @param {Object} data API response containing `data.recipe`.
 * @returns {Recipe} Normalized recipe data.
 */
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  // console.log(recipe);

  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }), //Conditionally include the recipe key if it exists.
  };
};

/**
 * Loads one recipe and synchronizes its bookmark state.
 * @param {string} id Recipe identifier to load.
 * @returns {Promise<void>}
 * @throws {Error} Propagates API request errors.
 */
// TODO: loading Recipe
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${API_KEY}`);

    state.recipe = createRecipeObject(data);

    // console.log(recipe);
    if (state.bookmarks.some((bookmark) => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Loads and normalizes recipes matching a search query.
 * Resets pagination to the first page after a successful load.
 * @param {string} query Search term.
 * @returns {Promise<void>}
 * @throws {Error} Propagates API request errors.
 */
// TODO: Implementing search results - Part 1 (Without pagination)
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);

    // NOTE: Lets create a new array by using map
    state.search.results = data.data.recipes.map((dt) => {
      return {
        id: dt.id,
        image: dt.image_url,
        title: dt.title,
        publisher: dt.publisher,
        ...(dt.key && { key: dt.key }),
      };
    });

    // Reset the default page to 1 after loading the search result
    state.search.page = 1;
  } catch (error) {
    console.error(`Oppps 💩: ${error}`);
    throw error;
  }
};

/**
 * Selects the requested page from the current search results.
 * @param {number} [page=state.search.page] One-based page number.
 * @returns {RecipeSearchState["results"]} Recipes on the selected page.
 */
// TODO: Implementing pagination
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

/**
 * Recalculates ingredient quantities for a new serving count.
 * @param {number} newServings Desired number of servings.
 * @returns {void}
 */
// TODO: Update recipe servings
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach((ing) => {
    // Formula used: newQuantity = oldQuantity * newServings / oldServing
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

/** Persists the current bookmark collection to local storage. @returns {void} */
// TODO: Persist data in local storage
const persistBookmarks = function () {
  localStorage.setItem("bookmark", JSON.stringify(state.bookmarks));
};

/**
 * Adds a recipe to bookmarks and persists the change.
 * @param {Recipe} recipe Recipe to bookmark.
 * @returns {void}
 */
// TODO: Implementing add bookmarking feature
export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
  }

  persistBookmarks();
};

/**
 * Removes a recipe from bookmarks and persists the change.
 * @param {string} id Identifier of the recipe to remove.
 * @returns {void}
 */
// TODO: Implementing remove bookmarking feature
export const deleteBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex((el) => el.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current recipe as NOT bookmarked
  if (id === state.recipe.id) {
    state.recipe.bookmarked = false;
  }

  persistBookmarks();
};

/** Restores saved bookmarks from local storage when available. @returns {void} */
const init = function () {
  const storage = localStorage.getItem("bookmark");
  if (storage) {
    state.bookmarks = JSON.parse(storage);
  }
};

init();

// NOTE: A function that will help clearing the bookmarks during development
/**
 * Clears local storage bookmarks for development.
 * @returns {void}
 */
const clearBookmarks = function () {
  localStorage.clear("bookmark");
};
clearBookmarks();

// TODO: A function to upload recipe in the API

/**
 * Parses form ingredients, uploads a recipe, and bookmarks the created recipe.
 * @param {Record<string, string>} newRecipe Recipe form values.
 * @returns {Promise<void>}
 * @throws {Error} If an ingredient is malformed or the API request fails.
 */
export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter((entry) => entry[0].startsWith("ingredient") && entry[1] !== "")
      .map((ing) => {
        const ingArr = ing[1].split(",").map((el) => el.trim());
        // const ingArr = ing[1].replaceAll(" ", "").split(",");
        if (ingArr.length !== 3)
          throw new Error(
            "Wrong ingredient format! Please use the correct format",
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (error) {
    throw error;
  }
};
