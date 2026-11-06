/** @file Renders recipe details and handles serving and bookmark controls. */

import Fraction from "fraction.js";
import view from "./view.js";

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
 * @property {string} sourceUrl URL for the recipe directions.
 * @property {string} image Recipe image URL.
 * @property {number} servings Number of servings.
 * @property {number} cookingTime Cooking time in minutes.
 * @property {RecipeIngredient[]} ingredients Ingredients used in the recipe.
 * @property {string} [key] Optional key for user-generated recipes.
 * @property {boolean} [bookmarked] Whether the recipe is bookmarked.
 */

/**
 * Renders recipe details and registers recipe-specific interactions.
 */
class RecipeView extends view {
  _parentElement = document.querySelector(".recipe");
  _errorMessage = "We could not find that recipe. Please try another one!";
  _successmessage = "";

  /**
   * Registers a callback for initial page load and recipe hash changes.
   * @param {() => void} handler Callback that loads and renders the selected recipe.
   * @returns {void}
   */
  // TODO: Registering a Publisher, while handler will act as a subsciber
  addHandlerRender(handler) {
    // NOTE: Listening for load and hashchange events
    const events = ["hashchange", "load"];
    events.forEach((event) => window.addEventListener(event, handler));
  }

  /**
   * Delegates serving-control clicks to the supplied callback.
   * @param {(servings: number) => void} handler Receives the requested serving count.
   * @returns {void}
   */
  addHandlerUpdateServings(handler) {
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".btn--update-servings");

      if (!btn) return;

      const updateTo = +btn.dataset.updateTo;

      if (updateTo > 0) {
        handler(updateTo);
      }
    });
  }

  /**
   * Delegates bookmark-button clicks to the supplied callback.
   * @param {() => void} handler Callback that toggles the current recipe bookmark.
   * @returns {void}
   */
  addHandlerAddBookmark(handler) {
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".btn--bookmark");
      if (!btn) return;
      handler();
    });
  }

  /**
   * Builds the recipe view markup from the current view data.
   * @returns {string} HTML markup for the recipe details and ingredients.
   */
  _generateMarkup() {
    // console.log(this._data);
    return `<figure class="recipe__fig">
          <img src="${this._data.image}" alt="${this._data.title}" class="recipe__img" />
          <h1 class="recipe__title">
            <span>${this._data.title}</span>
          </h1>
        </figure>

        <div class="recipe__details">
          <div class="recipe__info">
            <svg class="recipe__info-icon">
              <use href="#icon-clock"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--minutes">${this._data.cookingTime}</span>
            <span class="recipe__info-text">minutes</span>
          </div>
          <div class="recipe__info">
            <svg class="recipe__info-icon">
              <use href="#icon-users"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--people">${this._data.servings}</span>
            <span class="recipe__info-text">SERVINGS</span>

            <div class="recipe__info-buttons">
              <button class="btn--tiny btn--update-servings" data-update-to="${this._data.servings - 1}">
                <svg>
                  <use href="#icon-minus-circle"></use>
                </svg>
              </button>
              <button class="btn--tiny btn--update-servings" data-update-to="${this._data.servings + 1}">
                <svg>
                  <use href="#icon-plus-circle"></use>
                </svg>
              </button>
            </div>
          </div>

          <div class="recipe__user-generated ${this._data.key ? "" : "hidden"}">
            <svg>
              <use href="#icon-user"></use>
            </svg>
          </div>
          <button class="btn--round btn--bookmark">
            <svg class="">
              <use href="#icon-bookmark${this._data.bookmarked ? "-fill" : ""}"></use>
            </svg>
          </button>
        </div>

        <div class="recipe__ingredients">
          <h2 class="heading--2">Recipe ingredients</h2>
          <ul class="recipe__ingredient-list">
          ${this._data.ingredients.map(this._generateMarkupIngredient).join("")}
          </ul>
        </div>

        <div class="recipe__directions">
          <h2 class="heading--2">How to cook it</h2>
          <p class="recipe__directions-text">
            This recipe was carefully designed and tested by
            <span class="recipe__publisher">${this._data.publisher}</span>. Please check out
            directions at their website.
          </p>
          <a
            class="btn--small recipe__btn"
            href="${this._data.sourceUrl}"
            target="_blank"
          >
            <span>Directions</span>
            <svg class="search__icon">
              <use href="#icon-arrow-right"></use>
            </svg>
          </a>
        </div>`;
  }

  /**
   * Builds a single ingredient list item.
   * @param {RecipeIngredient} ing Ingredient data to display.
   * @returns {string} HTML markup for the ingredient.
   */
  _generateMarkupIngredient(ing) {
    return `
            <li class="recipe__ingredient">
              <svg class="recipe__icon">
                <use href="#icon-check"></use>
              </svg>
              <div class="recipe__quantity">${ing.quantity ? new Fraction(ing.quantity).toFraction(true) : ""}</div>
              <div class="recipe__description">
                <span class="recipe__unit">${ing.unit}</span>
                ${ing.description}
              </div>
            </li>
            `;
  }
}

export default new RecipeView();
