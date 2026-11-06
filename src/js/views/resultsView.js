/** @file Renders paginated recipe search results. */

import view from "./view.js";
import previewView from "./previewView.js";

/** Builds recipe preview markup for the search-results list. */
class ResultsView extends view {
  _parentElement = document.querySelector(".results");
  _errorMessage =
    "No recipes found for your search. Please try a different keyword!";
  _successMessage = "";

  /**
   * Builds markup for all recipes assigned to this view.
   * @returns {string} Concatenated recipe preview list items.
   */
  _generateMarkup() {
    return this._data
      .map((result) => previewView.render(result, false))
      .join("");
  }
}

export default new ResultsView();
