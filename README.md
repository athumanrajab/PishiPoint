# PishiPoint

PishiPoint is an interactive recipe discovery application built with HTML, Sass, and vanilla JavaScript. It helps users explore Tanzanian dishes and global cuisine, search recipes by name or ingredient, view recipe details, adjust servings, save bookmarks, and submit recipes.

## Features

- Search recipes by dish name or ingredient
- Browse paginated recipe search results
- View recipe images, ingredients, cooking time, and directions
- Adjust ingredient quantities when changing serving sizes
- Bookmark recipes and open them from the recipe tools
- Submit recipes through the add-recipe form
- Explore Tanzanian dishes and global cuisine from the landing page
- Search featured dishes directly from the landing page
- Responsive layouts for desktop and mobile devices
- Accessible keyboard focus indicators and reduced-motion support
- Scroll reveals, image effects, and a responsive sticky header

## Project Structure

```text
PishiPoint/
├── index.html                   # Landing page and featured dishes
├── recipes.html                 # Recipe search and details page
├── package.json                 # Dependencies and npm scripts
├── package-lock.json            # Locked npm dependency versions
├── .gitignore                   # Ignored dependencies and build files
├── src/
│   ├── img/                     # Branding, food photography, and icon sprite
│   ├── js/
│   │   ├── config.js            # API and application settings
│   │   ├── controller.js        # MVC event and action coordination
│   │   ├── helpers.js           # Shared API request helper
│   │   ├── model.js             # Recipe, search, and bookmark data
│   │   ├── scrollAnimations.js  # Scroll reveals and sticky-header state
│   │   └── views/               # Rendering and user interaction
│   └── sass/                    # Application styles and responsive layouts
└── dist/                        # Generated production build
```

## Run Locally

Install [Node.js](https://nodejs.org/) and npm, then clone the repository and enter the project directory:

```bash
git clone <repository-url>
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

The generated site is written to `dist/`. Recipe search and recipe submission require an internet connection to reach the recipe API.

## How to Use

1. Open PishiPoint and enter a dish or ingredient in the search field.
2. Select **Find a recipe** to see matching recipes.
3. Choose a result to view its ingredients, cooking time, and directions.
4. Use the serving controls to adjust ingredient quantities.
5. Select the bookmark control on a recipe to save or remove it.
6. Open **Bookmarks** from the recipe tools to revisit saved recipes.
7. Select **Add recipe** to enter and submit your own recipe.
8. Browse the landing page’s Tanzanian and global sections to discover featured dishes.

## Technologies

- HTML5
- Sass (SCSS)
- Vanilla JavaScript (ES modules)
- JavaScript MVC architecture
- Parcel
- Forkify-compatible recipe API
- Fetch API and JSON
- Browser local storage
- Intersection Observer and Mutation Observer
- CSS animations and scroll-driven effects
- Google Fonts (Inter and Manrope)

## Visit the Website

A public deployment URL has not been provided yet. To view the application, run it locally using the instructions above.

## Contact

LinkedIn: [Athuman Rajab Athuman](https://www.linkedin.com/in/athuman-rajab-53443a35a/)
