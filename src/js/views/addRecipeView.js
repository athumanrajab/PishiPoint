/** @file Controls the add-recipe modal and form submission. */

import view from "./view.js";

/**
 * @typedef {import("../model.js").RecipeFormData} RecipeFormData
 */

/** Manages the recipe form, modal visibility, and submit events. */
class AddRecipeView extends view {
  _parentElement = document.querySelector(".upload");
  _window = document.querySelector(".add-recipe-window");
  _overlay = document.querySelector(".overlay");
  _btnOpen = document.querySelector(".nav__btn--add-recipe");
  _btnClose = document.querySelector(".btn--close-modal");
  _ingredientList = document.querySelector(".upload__ingredients");
  _feedback = document.querySelector(".upload__feedback");
  _submitButton = document.querySelector(".upload__btn");
  _errorMessage = "Unable to upload the recipe. Please try again.";
  _successMessage = "Recipe was successfully uploaded!";

  /** Initializes the modal's open and close event handlers. */
  constructor() {
    super();
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
    this._addHandlerIngredientRows();
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

  /** Adds and removes ingredient rows without limiting recipe size. @returns {void} */
  _addHandlerIngredientRows() {
    this._parentElement.addEventListener("click", (event) => {
      if (event.target.closest(".upload__add-ingredient")) {
        this._addIngredientRow();
      }

      const removeButton = event.target.closest(".ingredient-row__remove");
      if (removeButton && this._ingredientList.children.length > 1) {
        removeButton.closest(".ingredient-row").remove();
        this._updateRemoveButtons();
      }
    });
  }

  /** Adds a blank ingredient row and focuses its description input. @returns {void} */
  _addIngredientRow() {
    const row = this._ingredientList.firstElementChild.cloneNode(true);
    row.querySelectorAll("input").forEach((input) => {
      input.value = "";
      input.removeAttribute("id");
    });
    row.querySelector(".ingredient-row__remove").disabled = false;
    this._ingredientList.append(row);
    this._updateRemoveButtons();
    row.querySelector('[name="ingredient-description"]').focus();
  }

  /** Keeps one ingredient row and disables removal of the final row. @returns {void} */
  _updateRemoveButtons() {
    const rows = [...this._ingredientList.children];
    rows.forEach((row) => {
      row.querySelector(".ingredient-row__remove").disabled = rows.length === 1;
    });
  }

  /**
   * Builds recipe input data and structured ingredient objects from the form.
   * @returns {RecipeFormData} Form details and ingredient rows.
   */
  _getFormData() {
    const data = Object.fromEntries(new FormData(this._parentElement));
    data.ingredients = [...this._ingredientList.querySelectorAll(".ingredient-row")]
      .map((row) => ({
        quantity: row.querySelector('[name="ingredient-quantity"]').value.trim(),
        unit: row.querySelector('[name="ingredient-unit"]').value.trim(),
        description: row
          .querySelector('[name="ingredient-description"]')
          .value.trim(),
      }))
      .filter((ingredient) => ingredient.description);
    return data;
  }

  /**
   * Registers form submission and passes its values to the supplied handler.
   * @param {(data: RecipeFormData) => void | Promise<void>} handler Callback that uploads submitted recipe data.
   * @returns {void}
   */
  addHandlerUpload(handler) {
    this._parentElement.addEventListener("submit", (e) => {
      e.preventDefault();
      this.clearFeedback();
      handler(this._getFormData());
    });
  }

  /**
   * Disables duplicate submissions and announces the upload state.
   * @param {boolean} isSubmitting Whether a recipe request is in progress.
   * @returns {void}
   */
  setSubmitting(isSubmitting) {
    this._submitButton.disabled = isSubmitting;
    this._submitButton.querySelector("span").textContent = isSubmitting
      ? "Uploading..."
      : "Upload";
    if (isSubmitting) this._feedback.textContent = "Uploading your recipe…";
  }

  /** Clears current upload feedback. @returns {void} */
  clearFeedback() {
    this._feedback.textContent = "";
    this._feedback.className = "upload__feedback";
  }

  /**
   * Shows an upload error without removing entered form values.
   * @param {string} [message=this._errorMessage] Error details to display.
   * @returns {void}
   */
  renderError(message = this._errorMessage) {
    this._feedback.textContent = message;
    this._feedback.className = "upload__feedback upload__feedback--error";
  }

  /**
   * Shows upload success feedback.
   * @param {string} [message=this._successMessage] Success details to display.
   * @returns {void}
   */
  renderMessage(message = this._successMessage) {
    this._feedback.textContent = message;
    this._feedback.className = "upload__feedback upload__feedback--success";
  }

  /** Restores the form to one blank ingredient row. @returns {void} */
  resetForm() {
    this._parentElement.reset();
    while (this._ingredientList.children.length > 1) {
      this._ingredientList.lastElementChild.remove();
    }
    this._updateRemoveButtons();
    this.clearFeedback();
  }

  /**
   * This view renders form feedback directly instead of generating form markup.
   * @returns {undefined}
   */
  _generateMarkup() {}
}

export default new AddRecipeView();
