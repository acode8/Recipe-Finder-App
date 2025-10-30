# Recipe Finder App

Live demo: https://gmd9v9-5173.csb.app/  
Repo: https://github.com/acode8/Recipe-Finder-App

## Purpose
A simple recipe search & filter application that helps users find recipes and filter by dietary preference (veg, non-veg, vegan).

## Features
- Search recipes by name/ingredient
- Filter results: All | Veg | Non-Veg | Vegan
- Responsive UI
- Deployed on CodeSandbox

## How the dietary filter works
- Primary: Uses `strCategory` (if available) to detect vegetarian/vegan meals.
- Secondary: Scans ingredient fields (`strIngredient1..20`) for animal-product keywords.
- This combined approach increases detection accuracy for datasets without explicit diet tags.

## ChatGPT Assistance (Level 1 evidence)
I used ChatGPT to design the filtering logic and to prepare this README:
- Date(s): 2025-10-28 — 2025-10-29
- Summary: ChatGPT provided the ingredient-scan functions and the submission checklist.

## How to run locally
1. Clone:
   ```bash
   git clone https://github.com/acode8/Recipe-Finder-App.git
   cd Recipe-Finder-App

//    
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
Link- http://localhost:5173/
