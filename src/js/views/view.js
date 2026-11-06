/** @file Provides shared rendering and feedback behavior for MVC views. */

/**
 * Base class for views that render markup into a parent DOM element.
 * Subclasses provide `_generateMarkup` and configure parent and message fields.
 * @abstract
 */
export default class View {
  _data;

  /**
   * Renders supplied data, or returns its markup when rendering is disabled.
   * Empty data is shown as an error using the subclass's configured message.
   * @param {*} data Data used to generate the view markup.
   * @param {boolean} [render=true] Whether to insert markup into the parent element.
   * @returns {string | void} Generated markup when `render` is false.
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    // Getting rid of any content including the welcome message
    this._clear();
    // Insert our html markup
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  /**
   * Updates existing DOM text and attributes to match newly generated markup.
   * @param {*} data New view data.
   * @returns {void}
   */
  update(data) {
    this._data = data;

    const newMarkup = this._generateMarkup();

    // NOTE: Convert the markup string to the DOM object that is living in the memory so that we can then use to compare it with the actual DOM that's in the page
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll("*"));
    const currentElements = Array.from(
      this._parentElement.querySelectorAll("*"),
    );

    newElements.forEach((newEl, i) => {
      const curEl = currentElements[i];
      // console.log(curEl, newEl.isEqualNode(curEl));

      // Update changed text
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ""
      ) {
        curEl.textContent = newEl.textContent;
      }

      // Update change attributes
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach((attr) =>
          curEl.setAttribute(attr.name, attr.value),
        );
      }
    });
  }

  // TODO: Clearing recipe container
  /** Removes all child content from the view's parent element. @returns {void} */
  _clear() {
    this._parentElement.innerHTML = "";
  }

  // TODO: Render a loading spinner
  /** Replaces the view content with a loading indicator. @returns {void} */
  renderSpinner() {
    const markup = `
          <div class="spinner">
            <svg>
              <use href="#icon-loader"></use>
            </svg>
          </div>`;
    this._parentElement.innerHTML = "";
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  // TODO: Implementing errors and success messages
  /**
   * Replaces the view content with an error message.
   * @param {string} [message=this._errorMessage] Error text to display.
   * @returns {void}
   */
  renderError(message = this._errorMessage) {
    const markup = `
              <div class="error">
                <div>
                  <svg>
                    <use href="#icon-alert-triangle"></use>
                  </svg>
                </div>
                <p>${message}</p>
              </div>`;
    // Getting rid of any content including the welcome message
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  /**
   * Replaces the view content with a success/information message.
   * @param {string} [message=this._successMessage] Text to display.
   * @returns {void}
   */
  renderMessage(message = this._successMessage) {
    const markup = `
              <div class="message">
                <div>
                  <svg>
                    <use href="#icon-smile"></use>
                  </svg>
                </div>
                <p>${message}</p>
              </div>`;
    // Getting rid of any content including the welcome message
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

}
