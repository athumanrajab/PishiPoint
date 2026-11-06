/** @file Reads recipe searches and handles search-form submission. */

/**
 * Encapsulates search input access and search-related event handling.
 */
class SearchView {
  #parentElement = document.querySelector(".search");

  /**
   * Returns the trimmed value currently entered in the search field.
   * @returns {string} Search query.
   */
  getQuery() {
    return this.#parentElement.querySelector(".search__field").value.trim();
  }

  /**
   * Sets the search field to the provided query.
   * @param {string} query Query to display.
   * @returns {void}
   */
  setQuery(query) {
    this.#parentElement.querySelector(".search__field").value = query;
  }

  /**
   * Registers search submission and dish-link handlers.
   * On the landing page, submits by navigating to the recipe page; on the
   * recipe page, updates the URL query and invokes the supplied callback.
   * @param {() => void} handler Callback that performs a search on the recipe page.
   * @returns {void}
   */
  addHandlerSearch(handler) {
    this.#parentElement.addEventListener("submit", (e) => {
      e.preventDefault();

      const query = this.getQuery();
      if (!query) return;

      if (document.body.dataset.page !== "recipes") {
        window.location.href = `recipes.html?search=${encodeURIComponent(query)}`;
        return;
      }

      const url = new URL(window.location.href);
      url.searchParams.set("search", query);
      window.history.replaceState(null, "", url);
      handler();
    });

    document.addEventListener("click", (e) => {
      const queryLink = e.target.closest("[data-search-query]");
      if (!queryLink) return;

      e.preventDefault();
      this.#parentElement.querySelector(".search__field").value =
        queryLink.dataset.searchQuery;
      this.#parentElement.requestSubmit();
    });
  }
}

export default new SearchView();
