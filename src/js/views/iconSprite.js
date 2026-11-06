/** @file Parses and mounts the shared SVG icon sprite into the document. */

import spriteMarkup from "bundle-text:../../img/icons.svg.txt";

/** Parsed SVG sprite root containing symbols referenced by the application. */
const sprite = new DOMParser().parseFromString(
  spriteMarkup,
  "image/svg+xml",
).documentElement;

/** Makes the sprite symbols available to inline SVG `<use>` references. */
document.body.append(sprite);
