/** Small landing-page entry: recipe application code loads on the Explore page. */
import "./views/iconSprite.js";
import "./scrollAnimations.js";

// CDN endpoints exist at runtime, rather than as files for Parcel to bundle.
// Native lazy loading still controls when these below-the-fold images download.
document.querySelectorAll("img[data-cdn-src]").forEach(image => {
  image.src = image.dataset.cdnSrc;
  image.removeAttribute("data-cdn-src");
});

// Add search parameters after bundling so each query shares one recipe page.
// Real hrefs preserve keyboard navigation, new tabs, and browser link actions.
document.querySelectorAll("a[data-search-query]").forEach(link => {
  const url = new URL(link.href);
  url.searchParams.set("search", link.dataset.searchQuery);
  link.href = url.href;
});

const toggle = document.querySelector(".nav__toggle");
const nav = document.querySelector(".nav");
const closeNavigation = () => {
  toggle.setAttribute("aria-expanded", "false");
  nav.classList.remove("nav--open");
};
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  toggle.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("nav--open", open);
});
nav.addEventListener("click", event => {
  if (event.target.closest(".nav__link")) closeNavigation();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeNavigation();
});

// Preserve previously shared recipe links pointing to the homepage.
const redirectRecipe = () => {
  if (/^#[a-f\d]{24}$/i.test(window.location.hash)) {
    window.location.replace(`recipes.html${window.location.hash}`);
  }
};
redirectRecipe();
window.addEventListener("hashchange", redirectRecipe);
