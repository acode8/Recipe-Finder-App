import React, { useEffect, useState } from "react";
import "./App.css";

/* Ingredient dataset */
const categoryItems = {
  All: [
    "Paneer",
    "Spinach",
    "Cauliflower",
    "Rice",
    "Chicken",
    "Beef",
    "Egg",
    "Tuna",
    "Salmon",
    "Tofu",
    "Broccoli",
    "Carrot",
    "Quinoa",
  ],
  Veg: ["Paneer", "Spinach", "Cauliflower", "Rice"],
  "Non-Veg": ["Chicken", "Beef", "Egg", "Tuna", "Salmon"],
  Vegan: ["Tofu", "Broccoli", "Carrot", "Quinoa"],
};

/* --- Veg / Non-Veg / Vegan Detection Helpers --- */
const NON_VEG_KEYWORDS = [
  "chicken",
  "beef",
  "pork",
  "fish",
  "salmon",
  "tuna",
  "shrimp",
  "prawn",
  "egg",
  "bacon",
  "ham",
  "crab",
  "lamb",
];
const VEGAN_BLACKLIST = [
  ...NON_VEG_KEYWORDS,
  "milk",
  "cheese",
  "butter",
  "yogurt",
  "cream",
  "paneer",
  "ghee",
];

const norm = (s) => (s || "").toLowerCase();

function isNonVeg(meal) {
  const name = norm(meal.strMeal);
  return NON_VEG_KEYWORDS.some((nv) => name.includes(nv));
}

function isVegan(meal) {
  const name = norm(meal.strMeal);
  return !VEGAN_BLACKLIST.some((nv) => name.includes(nv));
}

function isVeg(meal) {
  return !isNonVeg(meal);
}

/* Filter utility */
function filterByCategory(meals, category) {
  if (!meals || !Array.isArray(meals)) return [];
  if (category === "Non-Veg") return meals.filter(isNonVeg);
  if (category === "Veg") return meals.filter(isVeg);
  if (category === "Vegan") return meals.filter(isVegan);
  return meals;
}

export default function App() {
  const [category, setCategory] = useState("Non-Veg");
  const [ingredient, setIngredient] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
const [favorites, setFavorites] = useState(() => {
  try {
    const savedFavorites = localStorage.getItem("my_recipe_favs");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  } catch (error) {
    console.error("Error loading favorites from localStorage", error);
    return [];
  }
});

// Persist favorites to localStorage whenever favorites change
useEffect(() => {
  if (favorites.length > 0) {
    localStorage.setItem("my_recipe_favs", JSON.stringify(favorites));
  }
}, [favorites]);

  // Fetch recipes
  async function fetchRecipes(customIngredient) {
    const q = (customIngredient || ingredient || "").trim();
    if (!q) {
      setError("Please choose or type an ingredient.");
      return;
    }
    setError(null);
    setRecipes([]);
    setLoading(true);
    try {
      const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(
        q
      )}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      setRecipes(filterByCategory(data.meals || [], category));

      if (!data.meals)
        setError(
          `We're cooking up recipes for "${q}" soon! Try another ingredient meanwhile`
        );
    } catch {
      setError("Failed to fetch recipes.");
    } finally {
      setLoading(false);
    }
  }

  // Fetch recipe details
  async function fetchRecipeDetails(id) {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
      );
      const data = await res.json();
      setSelected((data.meals && data.meals[0]) || null);
    } catch {
      setError("Failed to fetch recipe details.");
    } finally {
      setLoading(false);
    }
  }

  // Favorite toggle
  function toggleFavorite(meal) {
    const exists = favorites.find((f) => f.idMeal === meal.idMeal);
    if (exists) {
      setFavorites(favorites.filter((f) => f.idMeal !== meal.idMeal));
    } else {
      setFavorites([
        ...favorites,
        {
          idMeal: meal.idMeal,
          strMeal: meal.strMeal,
          strMealThumb: meal.strMealThumb,
        },
      ]);
    }
  }

  // Extract ingredients from details
  function extractIngredients(detail) {
    if (!detail) return [];
    const items = [];
    for (let i = 1; i <= 20; i++) {
      const ing = detail[`strIngredient${i}`];
      const measure = detail[`strMeasure${i}`];
      if (ing && ing.trim()) items.push({ ingredient: ing, measure });
    }
    return items;
  }

  return (
    <div className="relative min-h-screen text-neutral-800 flex flex-col items-center p-6">
      {/* Background image */}
      <div className="absolute inset-0 bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1950&q=80')] opacity-30 blur-sm"></div>

      <div className="relative z-10 w-full max-w-7xl">
        {/* Navbar */}
        <header className="flex justify-between items-center bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-4 shadow-sm mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-brown">
            The Recipe Hub
          </h1>
          <button
            onClick={() => setRecipes(favorites)}
            className="px-4 md:px-5 py-2 rounded-xl bg-white/60 border border-beige text-brown font-medium hover:bg-white/80 transition"
          >
            Saved ({favorites.length})
          </button>
        </header>

        {/* Category Section */}
        <section className="bg-white/50 backdrop-blur-md border border-white/50 rounded-2xl p-6 mb-6 shadow-md">
          <div className="flex justify-center gap-3 mb-4 flex-wrap">
            {Object.keys(categoryItems).map((cat) => (
              <button
                key={cat}
                onClick={async () => {
                  setCategory(cat);
                  setLoading(true);
                  setError(null);
                  setRecipes([]);

                  try {
                    // Get all ingredients for selected category
                    const ingredients = categoryItems[cat];

                    // Fetch recipes for each ingredient
                    const allData = await Promise.all(
                      ingredients.map(async (ing) => {
                        const res = await fetch(
                          `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(
                            ing
                          )}`
                        );
                        const data = await res.json();
                        return data.meals || [];
                      })
                    );

                    // Merge all and remove duplicates by idMeal
                    const merged = allData.flat().reduce((acc, meal) => {
                      if (!acc.some((m) => m.idMeal === meal.idMeal))
                        acc.push(meal);
                      return acc;
                    }, []);

                    setRecipes(filterByCategory(merged, cat));
                  } catch {
                    setError("Failed to fetch category recipes.");
                  } finally {
                    setLoading(false);
                  }
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  category === cat
                    ? "bg-brown text-white"
                    : "bg-white/60 border border-beige text-brown hover:bg-brown/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Ingredient Quick Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {categoryItems[category].map((it) => (
              <button
                key={it}
                onClick={() => {
                  setIngredient(it);
                  fetchRecipes(it);
                }}
                className="px-4 py-2 rounded-full bg-white/60 border border-beige text-brown text-sm hover:bg-brown hover:text-white transition"
              >
                {it}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center w-full px-2">
            <input
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              className="w-full sm:flex-1 p-3 rounded-xl border border-beige bg-white/70 focus:outline-none"
              placeholder="Type an ingredient (e.g., Chicken or Tomato)"
            />
            <button
              onClick={() => fetchRecipes()}
              className="px-5 py-3 rounded-xl bg-brown text-white font-semibold hover:bg-brown/90 transition w-full sm:w-auto"
            >
              Search
            </button>
          </div>
        </section>

        {/* Error / Loader */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-center mb-4">
            {error}
          </div>
        )}
        {loading && (
          <div className="flex justify-center py-6">
            <div className="animate-spin h-10 w-10 border-4 border-brown border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Placeholder before recipes */}
        {!loading && recipes.length === 0 && !ingredient && (
          <div className="flex flex-col items-center text-center py-16">
            <img
              src="https://cdn-icons-png.flaticon.com/512/706/706164.png"
              alt="food"
              className="w-28 h-28 mb-6 opacity-90"
            />
            <h2 className="text-3xl font-semibold text-[#3c2f2f] mb-2">
              Hey! What do you feel like cooking today? Explore Delicious
              Recipes 🍽️
            </h2>
            <p className="text-[#6b4f36] max-w-md text-sm">
              Choose a category or ingredient to discover amazing dishes from
              around the world.
            </p>
          </div>
        )}

        {/* Recipe Grid */}
        {recipes.length > 0 && (
          <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {recipes.map((r) => (
              <article
                key={r.idMeal}
                className="relative bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl overflow-hidden shadow-md hover:scale-[1.02] transition-transform"
              >
                <img
                  src={r.strMealThumb}
                  alt={r.strMeal}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg text-brown">
                    {r.strMeal}
                  </h3>
                  <div className="mt-3 flex justify-center gap-3">
                    <button
                      onClick={() => fetchRecipeDetails(r.idMeal)}
                      className="px-4 py-2 rounded-lg bg-brown text-white hover:bg-brown/90 transition"
                    >
                      View Recipe
                    </button>
                    <button
                      onClick={() => toggleFavorite(r)}
                      className={`px-3 py-2 rounded-lg border ${
                        favorites.find((f) => f.idMeal === r.idMeal)
                          ? "bg-brown text-white border-brown"
                          : "bg-white/70 text-brown border-beige"
                      }`}
                    >
                      ♥
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </main>
        )}

        {/* Modal for recipe details */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-lg flex flex-col max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="relative flex-shrink-0">
                <img
                  src={selected.strMealThumb}
                  alt={selected.strMeal}
                  className="w-full h-64 object-cover rounded-t-2xl"
                />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 bg-white/80 rounded-full w-9 h-9 flex items-center justify-center text-lg font-bold hover:bg-white transition"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-6">
                <h2 className="text-2xl font-bold text-brown mb-2">
                  {selected.strMeal}
                </h2>

                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Ingredients</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm leading-relaxed">
                      {extractIngredients(selected).map((it, idx) => (
                        <li key={idx} className="text-gray-800">
                          <span className="font-medium">{it.ingredient}</span>
                          {it.measure ? ` — ${it.measure}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Instructions</h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {selected.strInstructions}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
                <button
                  onClick={() => toggleFavorite(selected)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    favorites.find((f) => f.idMeal === selected.idMeal)
                      ? "bg-brown text-white"
                      : "bg-white text-brown border border-brown hover:bg-brown hover:text-white"
                  }`}
                >
                  {favorites.find((f) => f.idMeal === selected.idMeal)
                    ? "Saved ❤️"
                    : "Save Recipe ♥"}
                </button>

                <a
                  href={`https://www.themealdb.com/meal/${selected.idMeal}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition"
                >
                  Open Full Source
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
