/** @file Controls the add-recipe modal and form submission. */

import view from "./view.js";

/** Manages the recipe form, modal visibility, and submit events. */
class AddRecipeView extends view {
  _parentElement = document.querySelector(".upload");
  _window = document.querySelector(".add-recipe-window");
  _overlay = document.querySelector(".overlay");
  _btnOpen = document.querySelector(".nav__btn--add-recipe");
  _btnClose = document.querySelector(".btn--close-modal");
  _successMessage = "Recipe was successfully uploaded !";

  /** Initializes the modal's open and close event handlers. */
  constructor() {
    super();
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
  }

  /** Toggles the recipe form modal and its page overlay. @returns {void} */
  toggleWindow() {
    this._overlay.classList.toggle("hidden");
    this._window.classList.toggle("hidden");
  }

  /** Registers the add-recipe button to open the form modal. @returns {void} */
  _addHandlerShowWindow() {
    this._btnOpen?.addEventListener("click", this.toggleWindow.bind(this));
  }

  /** Registers close-button and overlay clicks to dismiss the modal. @returns {void} */
  _addHandlerHideWindow() {
    this._btnClose.addEventListener("click", this.toggleWindow.bind(this));
    this._overlay.addEventListener("click", this.toggleWindow.bind(this));
  }

  /**
   * Registers form submission and passes its values to the supplied handler.
   * @param {(data: Record<string, FormDataEntryValue>) => void} handler
   *   Callback that validates and uploads submitted recipe data.
   * @returns {void}
   */
  addHandlerUpload(handler) {
    this._parentElement.addEventListener("submit", function (e) {
      e.preventDefault();

      const dataArr = [...new FormData(this)];

      const data = Object.fromEntries(dataArr);

      handler(data);
      // console.log(data);
    });
  }

  /**
   * This view renders form feedback directly instead of generating form markup.
   * @returns {undefined}
   */
  _generateMarkup() {}
}

export default new AddRecipeView();
