/** @file Adds progressive scroll reveals and a responsive sticky-header state. */

const revealSelector = [
  ".hero__copy > :not(h1)",
  ".hero__visual",
  ".section-heading",
  ".local-table > *",
  ".category-card",
  ".global-card",
  ".why-pishi__heading",
  ".why-pishi__points > article",
  ".closing-cta > *",
  ".recipe-page .search-tools",
  ".recipe-page .search-results",
];

const revealTargets = new WeakSet();
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

if (
  "IntersectionObserver" in window &&
  !motionPreference.matches
) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  /**
   * Registers unseen elements for one-time reveal when they enter the viewport.
   * @param {Element[]} elements Elements to observe.
   * @returns {void}
   */
  const observeGroup = (elements) => {
    elements.forEach((element, index) => {
      if (revealTargets.has(element)) return;

      revealTargets.add(element);
      element.classList.add("scroll-reveal");
      if (element.matches(".category-card, .global-card")) {
        element.style.setProperty(
          "--reveal-x",
          index % 2 === 0 ? "-1.2rem" : "1.2rem",
        );
      }
      element.style.setProperty(
        "--reveal-delay",
        `${Math.min(index, 5) * 70}ms`,
      );
      observer.observe(element);
    });
  };

  /**
   * Finds static and newly rendered page content that should reveal on scroll.
   * @returns {void}
   */
  const observePageContent = () => {
    revealSelector.forEach((selector) =>
      observeGroup([...document.querySelectorAll(selector)]),
    );

    document.querySelectorAll(".results, .recipe").forEach((container) => {
      observeGroup(
        [...container.children].filter(
          (element) => !element.classList.contains("spinner"),
        ),
      );
    });
  };

  observePageContent();

  const results = document.querySelector(".results");
  const recipe = document.querySelector(".recipe");
  const contentObserver = new MutationObserver(observePageContent);

  [results, recipe].filter(Boolean).forEach((container) =>
    contentObserver.observe(container, { childList: true }),
  );

  document.documentElement.classList.add("has-scroll-reveal");

  motionPreference.addEventListener("change", (event) => {
    if (!event.matches) return;

    document.documentElement.classList.remove("has-scroll-reveal");
    observer.disconnect();
    contentObserver.disconnect();
  });
}

const header = document.querySelector(".header");

if (header) {
  let isScrolled = false;

  /**
   * Toggles the compact header treatment after the page is scrolled.
   * @returns {void}
   */
  const updateHeader = () => {
    const shouldBeScrolled = window.scrollY > 24;
    if (shouldBeScrolled === isScrolled) return;

    isScrolled = shouldBeScrolled;
    header.classList.toggle("header--scrolled", isScrolled);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}
