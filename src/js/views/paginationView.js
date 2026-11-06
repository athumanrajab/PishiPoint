/** @file Renders pagination controls and delegates page-selection clicks. */

import view from "./view.js";

/** Displays previous/next controls for the current search-results page. */
class PaginationView extends view {
  _parentElement = document.querySelector(".pagination");

  /**
   * Registers a delegated click handler for pagination buttons.
   * @param {(page: number) => void} handler Callback receiving the selected page.
   * @returns {void}
   */
  addHandlerClick(handler) {
    this._parentElement.addEventListener("click", function (e) {
      const btn = e.target.closest(".btn--inline");

      if (!btn) return;

      const goToPage = +btn.dataset.goto;

      handler(goToPage);
    });
  }

  /**
   * Generates previous/next buttons when multiple result pages are available.
   * @returns {string} Pagination button markup, or an empty string for one page.
   */
  _generateMarkup() {
    const currentPage = this._data.page;
    // console.log(currentPage);
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage,
    );

    // Page 1, and there are other pages
    if (currentPage === 1 && numPages > 1) {
      return `
          <button data-goto="${currentPage + 1}" class="btn--inline pagination__btn--next">
            <span>Page ${currentPage + 1}</span>
            <svg class="search__icon">
              <use href="#icon-arrow-right"></use>
            </svg>
          </button> 
      `;
    }

    // Last page
    if (currentPage === numPages && numPages > 1) {
      return `
          <button data-goto="${currentPage - 1}" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
              <use href="#icon-arrow-left"></use>
            </svg>
            <span>Page ${currentPage - 1}</span>
          </button>`;
    }

    // Other pages
    if (currentPage < numPages) {
      return `
          <button data-goto="${currentPage - 1}" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
              <use href="#icon-arrow-left"></use>
            </svg>
            <span>Page ${currentPage - 1}</span>
          </button>
          <button data-goto="${currentPage + 1}" class="btn--inline pagination__btn--next">
            <span>Page ${currentPage + 1}</span>
            <svg class="search__icon">
              <use href="#icon-arrow-right"></use>
            </svg>
          </button>
      `;
    }

    // No pagination is needed when there is only one page.
    return "";
  }
}

export default new PaginationView();
