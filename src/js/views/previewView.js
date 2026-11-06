/** @file Generates reusable recipe preview list-item markup. */

import view from "./view.js";

/**
 * Renders an individual recipe as a link and preview card.
 * @extends View
 */
class previewView extends view {
  _parentElement = "";

  /**
   * Builds a preview item and marks it active when it matches the URL hash.
   * @returns {string} HTML markup for the recipe preview.
   */
  _generateMarkup() {
    const id = window.location.hash.slice(1);
    const recipeUrl =
      document.body.dataset.page === "recipes" ? `#${this._data.id}` : `recipes.html#${this._data.id}`;

    return `
          <li class="preview">
            <a class="preview__link ${this._data.id === id ? "preview__link--active" : ""}" href="${recipeUrl}">
              <figure class="preview__fig">
                <img src="${this._data.image}" alt="${this._data.title}" loading="lazy" decoding="async" width="56" height="56" />
              </figure>
              <div class="preview__data">
                <h4 class="preview__title">${this._data.title}</h4>
                <p class="preview__publisher">${this._data.publisher}</p>
                <div class="preview__user-generated ${this._data.key ? "" : "hidden"}">
                  <svg>
                    <use href="#icon-user"></use>
                  </svg>
                </div>
              </div>
            </a>
          </li>`;
  }
}

export default new previewView();
