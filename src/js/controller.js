/** @file Connects model operations and view events in the MVC application. */

import "./views/iconSprite.js";
import "./scrollAnimations.js";
import * as model from "./model.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";

import "core-js/stable"; //Polyfilling modern js features such as Promise.allSettled([...]);
import "regenerator-runtime/runtime"; //Polyfilling async await
import { MODAL_CLOSE_SEC } from "./config.js";
// import { MODAL_CLOSE_SEC } from "./config.js";

// TODO: Enable hot reloading
// if (module.hot) {
//   module.hot.accept();
// }

/**
 * Scrolls the recipe panel into view on narrow screens.
 * Uses instant scrolling when reduced motion is requested.
 * @returns {void}
 */
const scrollToRecipeOnSmallScreen = function () {
  if (!window.matchMedia("(max-width: 640px)").matches) return;

  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
  document.querySelector(".recipe")?.scrollIntoView({ behavior, block: "start" });
};

/**
 * Loads and renders the recipe identified by the current URL hash.
 * @returns {Promise<void>}
 */
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    // console.log(id);

    if (!id) {
      recipeView.renderMessage("Search above to bring the first recipe to the table.");
      if (model.state.search.results.length > 0) {
        resultsView.update(model.getSearchResultsPage());
      }
      return;
    }

    if (!/^(?:[a-f\d]{24}|tz-[a-z\d-]+)$/i.test(id)) return;

    // NOTE: Calling the renderSpinner()
    recipeView.renderSpinner();

    // Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    // NOTE: updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // NOTE: Loading recipe which was the function imported from model.js
    await model.loadRecipe(id);

    if (window.location.hash.slice(1) !== id) return;

    // NOTE: Rendering recipe
    recipeView.render(model.state.recipe);
    scrollToRecipeOnSmallScreen();
  } catch (err) {
    recipeView.renderError();
  }
};
// showRecipe();

// NOTE: Event handlers in MVC: Publisher-Subscriber pattern
// This is how we implement event listener and event handlers in MVC pattern
// Publisher - codes that knows when to react
// Subcriber - Codes that should be executed when the event happen
// Solution: We can subscribe to the publisher by passing into subscriber function as an argument

// TODO: Implementing search results - Part 1 - the loadSearchResults() is handled here
/**
 * Reads the current query, loads matching recipes, and renders the first page.
 * @returns {Promise<void>}
 */
const controlSearchResults = async function () {
  try {
    // Get search query
    const query = searchView.getQuery();

    if (!query) return;

    // Render spinner while waiting for the search results
    resultsView.renderSpinner();

    const localResults = await model.loadLocalSearchResults(query);
    if (!localResults) return;

    if (localResults.length > 0) {
      resultsView.render(model.getSearchResultsPage());
      paginationView.render(model.state.search);
    }

    // Load search results based on the passed query
    await model.loadSearchResults(query, localResults);

    //  Render result
    // resultsView.render(model.state.search.results); //get all results at the same time
    resultsView.render(model.getSearchResultsPage());

    // Render initial pagination button
    paginationView.render(model.state.search);
  } catch (error) {
    console.error(error);
    resultsView.renderError(error.message);
  }
};

/**
 * Renders the selected page of search results and its pagination controls.
 * @param {number} goToPage One-based page number to show.
 * @returns {void}
 */
const controlPagination = function (goToPage) {
  // Render new Result
  resultsView.render(model.getSearchResultsPage(goToPage));

  // Render new pagination button
  paginationView.render(model.state.search);
};

// TODO: Update recipe servings
/**
 * Updates recipe ingredient quantities and refreshes the recipe view.
 * @param {number} newServings Desired number of servings.
 * @returns {void}
 */
const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipeView
  // recipeView.render(model.state.recipe);

  // TODO: Implement the update method which will act as render but exceptionally it will only update text and attributes in the DOM without re-render the entire view
  recipeView.update(model.state.recipe);
};

// TODO: Implementing a function that will control adding bookmark
/**
 * Toggles the current recipe's bookmark and refreshes bookmark displays.
 * @returns {void}
 */
const controlAddBookmark = function () {
  // Add/remove a bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }

  // Update recipe view
  recipeView.update(model.state.recipe);

  // Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

/** Renders the current bookmark collection in the bookmarks view. @returns {void} */
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

// TODO: Implementing add recipe feature
/**
 * Uploads a recipe, updates the views, and closes the form after success.
 * @param {import("./model.js").RecipeFormData} newRecipe Values submitted by the recipe form.
 * @returns {Promise<void>}
 */
const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.setSubmitting(true);

    // Upload new recipe
    await model.uploadRecipe(newRecipe);

    if (document.body.dataset.page !== "recipes") {
      addRecipeView.resetForm();
      window.location.href = `recipes.html#${model.state.recipe.id}`;
      return;
    }

    // Render recipe
    recipeView.render(model.state.recipe);

    // Reset the form and show success feedback
    addRecipeView.resetForm();
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // close the form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    console.error(`Oppss! ${error}`);
    addRecipeView.renderError(error.message);
  } finally {
    addRecipeView.setSubmitting(false);
  }
};

// TODO: Implement an init() that will help us use the Publisher-Subscriber pattern
/**
 * Wires application view events to controller actions and starts page-specific search.
 * @returns {void}
 */
const init = function () {
  const navToggle = document.querySelector(".nav__toggle");
  const nav = document.querySelector(".nav");
  const bookmarkToggle = document.querySelector(".nav__btn--bookmarks");
  const bookmarkPanel = document.querySelector(".bookmarks");

  /** Closes the responsive primary navigation. @returns {void} */
  const closeNavigation = function () {
    navToggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("nav--open");
  };

  /** Closes the bookmark popover and resets its expanded state. @returns {void} */
  const closeBookmarks = function () {
    if (!bookmarkToggle || !bookmarkPanel) return;
    bookmarkToggle.setAttribute("aria-expanded", "false");
    bookmarkPanel.classList.remove("bookmarks--open");
  };

  navToggle.addEventListener("click", function () {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isExpanded));
    nav.classList.toggle("nav--open", !isExpanded);
  });

  nav.addEventListener("click", function (event) {
    if (
      event.target.closest(".nav__link") ||
      event.target.closest(".preview__link")
    ) {
      closeNavigation();
    }

    if (event.target.closest(".preview__link")) closeBookmarks();
  });

  bookmarkToggle?.addEventListener("click", function () {
    const isExpanded = bookmarkToggle.getAttribute("aria-expanded") === "true";
    bookmarkToggle.setAttribute("aria-expanded", String(!isExpanded));
    bookmarkPanel.classList.toggle("bookmarks--open", !isExpanded);
  });

  document.addEventListener("click", function (event) {
    const previewLink = event.target.closest(".preview__link");
    if (previewLink?.hash === window.location.hash) {
      scrollToRecipeOnSmallScreen();
    }

    if (
      !event.target.closest(".nav__btn--bookmarks") &&
      !event.target.closest(".bookmarks")
    ) {
      closeBookmarks();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeNavigation();
      closeBookmarks();
    }
  });

  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);

  if (document.body.dataset.page === "recipes") {
    const query = new URLSearchParams(window.location.search).get("search");
    if (query) {
      searchView.setQuery(query);
      controlSearchResults();
    }
  }
};

init();
