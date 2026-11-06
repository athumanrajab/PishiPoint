# PishiPoint

PishiPoint is an interactive recipe discovery application built with HTML, Sass, and vanilla JavaScript. Discover Tanzanian dishes and international cuisine, search by recipe or ingredient in English and Swahili, adjust serving sizes, save bookmarks, and submit recipes.

## Features

- Search recipes by dish name or ingredient
- Search Tanzanian recipes using English or Swahili names and ingredients
- Search recipe titles, descriptions, and ingredients with case-insensitive, partial-word matching
- Discover 107 local Tanzanian recipes alongside international API results
- Browse paginated recipe search results
- View recipe images, ingredients, cooking time, and directions
- Adjust ingredient quantities when changing serving sizes
- Bookmark recipes and open them from the recipe tools
- Submit recipes with separate amount, unit, and ingredient fields; add or remove ingredient rows as needed
- Explore Tanzanian dishes and global cuisine from the landing page
- Search featured dishes directly from the landing page
- Responsive layouts for desktop and mobile devices
- Accessible keyboard focus indicators and reduced-motion support
- Scroll reveals, image effects, and a responsive sticky header
- Optimized WebP branding and food images, lazy-loaded below-the-fold imagery, and on-demand loading of the local recipe dataset

## Project Structure

```text
PishiPoint/
├── index.html                   # Landing page, featured dishes, and recipe form
├── recipes.html                 # Recipe search, details, and recipe form
├── package.json                 # Dependencies and npm scripts
├── package-lock.json            # Locked npm dependency versions
├── .gitignore                   # Ignored dependencies and build files
├── src/
│   ├── img/                     # Optimized WebP branding, food photography, and icon sprite
│   ├── js/
│   │   ├── config.js            # API and application settings
│   │   ├── controller.js        # MVC event and action coordination
│   │   ├── helpers.js           # Shared API request helper
│   │   ├── model.js             # Recipe search, API, upload, and bookmark logic
│   │   ├── scrollAnimations.js  # Scroll reveals and sticky-header state
│   │   └── views/               # Rendering and user interaction
│   ├── data/
│   │   └── tanzania-recipes.json # Local Tanzanian recipe dataset
│   └── sass/                    # Application styles and responsive layouts
└── dir/                         # Generated production build (created by npm run build)
```

## Run Locally

Install [Node.js](https://nodejs.org/) and npm, then clone the repository and enter the project directory:

```bash
git clone https://github.com/athumanrajab/PishiPoint.git
cd PishiPoint
```

Install dependencies and start the Parcel development server:

```bash
npm install
npm start
```

Open the local URL printed by Parcel, usually:

```text
http://localhost:1234
```

Create a production build with:

```bash
npm run build
```

## How to Use

1. Open PishiPoint and search for a dish or ingredient in English or Swahili, such as **chicken**, **kuku**, or **wali wa nazi**.
2. Select **Find a recipe** to see local Tanzanian matches alongside international recipes.
3. Choose a result to view its ingredients, cooking time, and directions.
4. Adjust servings, bookmark recipes, or revisit saved recipes from **Bookmarks**.
5. To submit a recipe, select **Add recipe**, enter its details, and add each ingredient using the separate amount, unit, and ingredient fields. Amount and unit are optional; ingredient names are required.
6. Discover more dishes from the landing page’s Tanzanian and global sections.

## Performance

- Large local images are served as resized WebP assets to reduce transfer size.
- Images below the fold use native lazy loading.
- The Tanzanian recipe dataset is downloaded and indexed only when a local search or recipe detail needs it, keeping it out of the initial JavaScript bundle.
- The app uses Parcel for production bundling and optimization.

## Technologies

- HTML5
- Sass (SCSS)
- Vanilla JavaScript (ES modules)
- JavaScript MVC architecture
- Parcel
- Forkify-compatible recipe API
- Local Tanzanian recipe dataset (`src/data/tanzania-recipes.json`)
- Fetch API and JSON
- Browser local storage
- Intersection Observer and Mutation Observer
- CSS animations and scroll-driven effects
- Google Fonts (Inter and Manrope)

## Visit the Website

[Visit PishiPoint](https://pishipoint.netlify.app/)

Source code: [GitHub repository](https://github.com/athumanrajab/PishiPoint)

## Contact

LinkedIn: [Athuman Rajab Athuman](https://www.linkedin.com/in/athuman-rajab-53443a35a/)
