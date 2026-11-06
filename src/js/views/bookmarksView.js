/** @file Renders saved recipes in the bookmarks popover. */

import view from "./view.js";
import previewView from "./previewView.js";

/** Displays saved recipe previews and handles initial bookmark rendering. */
class BookmarksView extends view {
  _parentElement = document.querySelector(".bookmarks__list");
  _errorMessage = "No bookmarks yet. Find a nice recipe and bookmark it !";
  _successmessage = "";

  /**
   * Registers a render callback for page load when the bookmarks list exists.
   * @param {() => void} handler Callback that renders current bookmarks.
   * @returns {void}
   */
  addHandlerRender(handler) {
    if (this._parentElement) window.addEventListener("load", handler);
  }

  /**
   * Builds a preview item for each saved recipe.
   * @returns {string} Concatenated bookmark preview markup.
   */
  _generateMarkup() {
    return this._data
      .map((bookmark) => previewView.render(bookmark, false))
      .join("");
  }
}

export default new BookmarksView();
