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
 * @property {string} [description] Recipe description used for search.
 * @property {string} [category] Optional local recipe category.
 * @property {string} [key] Optional key for user-generated recipes.
 * @property {boolean} [bookmarked] Whether the recipe is bookmarked.
 */

/**
 * Ingredient input values collected from the add-recipe form before conversion
 * to the numeric/null quantity shape expected by the recipe API.
 * @typedef {Object} RecipeIngredientFormData
 * @property {string} quantity User-entered amount; empty when unspecified.
 * @property {string} unit User-entered measurement unit; empty when unspecified.
 * @property {string} description Required ingredient name and preparation details.
 */

/**
 * Raw values submitted by the add-recipe form.
 * @typedef {Object} RecipeFormData
 * @property {string} title Recipe title.
 * @property {string} sourceUrl Recipe directions URL.
 * @property {string} image Recipe image URL.
 * @property {string} publisher Recipe publisher.
 * @property {string} cookingTime Cooking time in minutes.
 * @property {string} servings Number of servings.
 * @property {RecipeIngredientFormData[]} ingredients Ingredients entered by the user.
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

/** Monotonically increasing token that prevents stale searches replacing newer results. */
let searchRequestId = 0;

/**
 * Normalizes text for case- and punctuation-insensitive recipe matching.
 * @param {string} value Text to normalize.
 * @returns {string} Lowercase text with normalized spaces and punctuation.
 */
const normalizeSearchText = function (value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’‘`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
};

/** Maps common English and Swahili dish names to equivalent local-search terms. */
const searchAliases = new Map([
  ["kuku", ["chicken"]],
  ["chicken", ["kuku"]],
  ["kuku wa kuchoma", ["grilled chicken"]],
  ["grilled chicken", ["kuku wa kuchoma"]],
  ["mchuzi wa kuku", ["chicken stew", "chicken coconut stew"]],
  ["chicken stew", ["mchuzi wa kuku"]],
  ["wali wa nazi", ["coconut rice"]],
  ["coconut rice", ["wali wa nazi"]],
  ["maharage", ["beans", "bean"]],
  ["beans", ["maharage"]],
  ["bean", ["maharage"]],
  ["ndizi nyama", ["green bananas with beef", "banana and beef stew"]],
  ["banana and meat stew", ["ndizi nyama", "green bananas with beef"]],
  ["ugali", ["sima", "maize meal"]],
  ["sima", ["ugali"]],
  ["samaki", ["fish"]],
  ["fish", ["samaki"]],
  ["viazi", ["potato", "potatoes"]],
  ["potato", ["viazi"]],
  ["potatoes", ["viazi"]],
  ["nyama ya ngombe", ["beef"]],
  ["ngombe", ["beef"]],
  ["beef", ["nyama ya ngombe", "ngombe"]],
  ["chapati", ["chapatti", "chapati laini"]],
  ["chapatti", ["chapati"]],
  ["pilau", ["pilaw"]],
  ["pilaw", ["pilau"]],
]);

/** Provides English API queries for Swahili terms the external service may not index. */
const swahiliToEnglishSearchTerms = new Map([
  ["kuku", "chicken"],
  ["kuku wa kuchoma", "grilled chicken"],
  ["mchuzi wa kuku", "chicken stew"],
  ["wali wa nazi", "coconut rice"],
  ["maharage", "beans"],
  ["ndizi nyama", "green bananas beef"],
  ["banana and meat stew", "banana beef stew"],
  ["ugali", "ugali"],
  ["sima", "ugali"],
  ["samaki", "fish"],
  ["viazi", "potatoes"],
  ["nyama ya ngombe", "beef"],
  ["ngombe", "beef"],
  ["chapati", "chapati"],
  ["pilau", "pilau"],
  ["pilaw", "pilau"],
]);

/**
 * Converts local dataset recipes to the field names expected by existing views.
 * @param {Object} recipe Recipe from the Tanzanian JSON dataset.
 * @param {string} recipe.source_url Source URL using the dataset's snake_case schema.
 * @param {string} recipe.image_url Image URL using the dataset's snake_case schema.
 * @param {number} recipe.cooking_time Cooking time using the dataset's snake_case schema.
 * @returns {Recipe} Recipe normalized for the application.
 */
const normalizeLocalRecipe = function (recipe) {
  return {
    ...recipe,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    cookingTime: recipe.cooking_time,
  };
};

let localRecipes;
let localRecipeSearchIndex;
let localRecipesPromise;

/**
 * Loads and indexes the local recipe dataset only when the user needs it.
 * @returns {Promise<Recipe[]>} Normalized Tanzanian recipes.
 */
const loadLocalRecipes = function () {
  if (!localRecipesPromise) {
    localRecipesPromise = import("../data/tanzania-recipes.json")
      .then((module) => {
        const recipes = module.default ?? module;
        localRecipes = recipes.map(normalizeLocalRecipe);
        localRecipeSearchIndex = localRecipes.map((recipe) => ({
          recipe,
          title: normalizeSearchText(recipe.title),
          description: normalizeSearchText(recipe.description ?? ""),
          ingredients: normalizeSearchText(
            recipe.ingredients
              .map((ingredient) => ingredient.description)
              .join(" "),
          ),
        }));
        return localRecipes;
      })
      .catch((error) => {
        localRecipesPromise = undefined;
        throw error;
      });
  }

  return localRecipesPromise;
};

/**
 * Expands a search term with known English/Swahili alternatives.
 * @param {string} query User-entered search term.
 * @returns {string[]} Normalized search variants.
 */
const expandSearchQuery = function (query) {
  const normalizedQuery = normalizeSearchText(query);
  return [
    normalizedQuery,
    ...(searchAliases.get(normalizedQuery) ?? []).map(normalizeSearchText),
  ];
};

/**
 * Tests a normalized text field against a search phrase, allowing word prefixes.
 * @param {string} text Normalized indexed text.
 * @param {string} query Normalized search phrase.
 * @returns {boolean} Whether the field contains the query.
 */
const matchesSearchText = function (text, query) {
  if (!query) return false;
  if (text.includes(query)) return true;

  const textWords = text.split(" ");
  return query.split(" ").every((queryWord) =>
    textWords.some((textWord) => textWord.startsWith(queryWord)),
  );
};

/**
 * Finds local Tanzanian recipes by title, description, or ingredient.
 * @param {string} query User-entered search term.
 * @returns {Recipe[]} Matching local recipes, ranked by match relevance.
 */
const searchLocalRecipes = function (query) {
  const variants = expandSearchQuery(query);

  return localRecipeSearchIndex
    .map((entry, index) => {
      const score = variants.reduce((bestScore, variant) => {
        const titleMatch = matchesSearchText(entry.title, variant);
        const descriptionMatch = matchesSearchText(entry.description, variant);
        const ingredientMatch = matchesSearchText(entry.ingredients, variant);
        const currentScore = titleMatch
          ? 3
          : descriptionMatch
            ? 2
            : ingredientMatch
              ? 1
              : 0;
        return Math.max(bestScore, currentScore);
      }, 0);

      return { recipe: entry.recipe, score, index };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((match) => match.recipe);
};

/**
 * Places local Tanzanian matches in search state before the API request completes.
 * @param {string} query User-entered search term.
 * @returns {Promise<Recipe[] | null>} Matching local recipes, or null if superseded.
 */
export const loadLocalSearchResults = async function (query) {
  const requestId = ++searchRequestId;
  await loadLocalRecipes();

  if (requestId !== searchRequestId) return null;

  state.search.query = query;
  state.search.results = searchLocalRecipes(query);
  state.search.page = 1;
  return state.search.results;
};

/**
 * Returns an English equivalent for the API when the query is a known Swahili term.
 * @param {string} query User-entered search term.
 * @returns {string} Search term to send to the API.
 */
const getApiSearchQuery = function (query) {
  const normalizedQuery = normalizeSearchText(query);
  return swahiliToEnglishSearchTerms.get(normalizedQuery) ?? query;
};

/**
 * Creates a title key used to deduplicate local and API search results.
 * @param {string} title Recipe title.
 * @returns {string} Normalized title with parenthetical alternate names removed.
 */
const getRecipeTitleKey = function (title) {
  return normalizeSearchText(title.replace(/\([^)]*\)/g, ""));
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
    ...(recipe.description && { description: recipe.description }),
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
    const localRecipe = id.startsWith("tz-")
      ? (await loadLocalRecipes()).find((recipe) => recipe.id === id)
      : undefined;
    if (localRecipe) {
      state.recipe = {
        ...localRecipe,
        ingredients: localRecipe.ingredients.map((ingredient) => ({ ...ingredient })),
        bookmarked: state.bookmarks.some((bookmark) => bookmark.id === id),
      };
      return;
    }

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
 * @param {Recipe[]} localResults Local matches already shown.
 * @returns {Promise<void>}
 * @throws {Error} Propagates API request errors.
 */
// TODO: Implementing search results - Part 1 (Without pagination)
export const loadSearchResults = async function (query, localResults) {
  const requestId = searchRequestId;

  try {
    state.search.query = query;
    state.search.results = localResults;
    state.search.page = 1;

    let apiResults = [];

    if (localResults.length < RES_PER_PAGE) {
      try {
        const apiQuery = encodeURIComponent(getApiSearchQuery(query));
        const data = await AJAX(`${API_URL}?search=${apiQuery}&key=${API_KEY}`);
        apiResults = data.data.recipes.map((recipe) => ({
          id: recipe.id,
          image: recipe.image_url,
          title: recipe.title,
          publisher: recipe.publisher,
          ...(recipe.key && { key: recipe.key }),
        }));
      } catch (error) {
        if (requestId !== searchRequestId) return;
        if (localResults.length === 0) throw error;
        console.warn("Recipe API search failed; showing matching local recipes.", error);
      }
    }

    if (requestId !== searchRequestId) return;

    const seenIds = new Set();
    const seenTitles = new Set();
    state.search.results = [...localResults, ...apiResults].filter((recipe) => {
      const titleKey = getRecipeTitleKey(recipe.title);
      if (seenIds.has(recipe.id) || seenTitles.has(titleKey)) return false;

      seenIds.add(recipe.id);
      seenTitles.add(titleKey);
      return true;
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

// TODO: A function to upload recipe in the API

/**
 * Parses form ingredients, uploads a recipe, and bookmarks the created recipe.
 * @param {RecipeFormData} newRecipe Recipe form values.
 * @returns {Promise<void>}
 * @throws {Error} If recipe details are invalid or the API request fails.
 */
export const uploadRecipe = async function (newRecipe) {
  const requiredFields = ["title", "sourceUrl", "image", "publisher"];
  for (const field of requiredFields) {
    if (!newRecipe[field]?.trim()) {
      throw new Error(`Please enter a value for ${field}.`);
    }
  }

  const cookingTime = Number(newRecipe.cookingTime);
  const servings = Number(newRecipe.servings);
  if (!Number.isFinite(cookingTime) || cookingTime <= 0) {
    throw new Error("Prep time must be a number greater than zero.");
  }
  if (!Number.isFinite(servings) || servings <= 0) {
    throw new Error("Servings must be a number greater than zero.");
  }

  for (const [field, value] of [
    ["Recipe URL", newRecipe.sourceUrl],
    ["Image URL", newRecipe.image],
  ]) {
    let url;
    try {
      url = new URL(value);
    } catch {
      throw new Error(`${field} must be a valid web address.`);
    }
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error(`${field} must start with http:// or https://.`);
    }
  }

  if (!Array.isArray(newRecipe.ingredients) || newRecipe.ingredients.length === 0) {
    throw new Error("Add at least one ingredient before uploading.");
  }

  const ingredients = newRecipe.ingredients.map((ingredient, index) => {
    const description = ingredient.description.trim();
    if (!description) {
      throw new Error(`Enter a description for ingredient ${index + 1}.`);
    }

    const quantity = ingredient.quantity.trim();
    const parsedQuantity = quantity === "" ? null : Number(quantity);
    if (
      parsedQuantity !== null &&
      (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0)
    ) {
      throw new Error(`Ingredient ${index + 1} amount must be greater than zero.`);
    }

    return {
      quantity: parsedQuantity,
      unit: ingredient.unit.trim(),
      description,
    };
  });

  const recipe = {
    title: newRecipe.title.trim(),
    source_url: newRecipe.sourceUrl.trim(),
    image_url: newRecipe.image.trim(),
    publisher: newRecipe.publisher.trim(),
    cooking_time: cookingTime,
    servings,
    ingredients,
  };
  const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
  state.recipe = createRecipeObject(data);
  addBookmark(state.recipe);
};
