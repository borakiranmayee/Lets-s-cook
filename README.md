# 🍛 Let's Cook

Find Indian recipes from what's already in your kitchen, plan meals around the grocery stores you shop at, and get a combined shopping list that crosses out what you already have.

- **My Kitchen**: pick your ingredients (English, Hindi or regional names work: *aloo*, *jeera*, *kandi pappu*) and see what you can cook now, plus recipes that are 1–3 items away.
- **Plan Meals**: choose stores (Kroger, Walmart, Target, Costco, Patel Brothers…), the number of people, meals per day and days. The plan only uses recipes your stores can supply, and lunch and dinner come with rice or roti.
- **Shopping List**: quantities are scaled and combined across recipes and grouped by aisle. Tick items you already have and they're crossed out and remembered.

Built with Next.js, which serves both the API (`/api/*`) and the webpage. There is no database: recipe data lives in `src/data/`, and each user's kitchen and list are saved in their browser.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests
npm run lint       # type check
```

## Deploy for free (Cloudflare Workers)

The app runs on Cloudflare Workers through the [OpenNext adapter](https://opennext.js.org/cloudflare). The free plan allows 100,000 requests a day, and the app doesn't sleep when idle.

**One-time setup (auto-deploys on every push to `main`):**

1. Sign up or log in at [dash.cloudflare.com](https://dash.cloudflare.com). The free plan is enough.
2. Go to **Workers & Pages → Create → Import a repository**, connect GitHub and pick this repo.
3. Use these settings:
   - **Project name:** `lets-cook` (must match `name` in `wrangler.jsonc`)
   - **Build command:** `npx opennextjs-cloudflare build`
   - **Deploy command:** `npx opennextjs-cloudflare deploy`
4. Click **Deploy**. The site goes live at `https://lets-cook.<your-subdomain>.workers.dev`.

**Or deploy from your own computer:**

```bash
npx wrangler login
npm run deploy
```

Run `npm run preview` to test the app locally in the Cloudflare runtime before deploying.

## API

Interactive docs are at `/docs` on the running site.

| Method | Path | What it does |
|---|---|---|
| GET | `/api/ingredients?q=&category=` | Search ingredients (matches aliases too) |
| GET | `/api/categories` | Ingredient categories |
| GET | `/api/recipes?q=&diet=&mealType=&course=` | List recipes |
| GET | `/api/recipes/{id}?servings=` | Recipe scaled to servings |
| POST | `/api/recipes/match` | What can I cook with these ingredients? |
| GET | `/api/stores` | Supported stores |
| POST | `/api/plans/suggest` | Meal plan from stores, people, meals/day, days |
| POST | `/api/shopping-list` | Combined list; `inPantry: true` = show struck through |

```bash
curl -X POST http://localhost:3000/api/recipes/match \
  -H 'Content-Type: application/json' \
  -d '{"ingredients": ["anda", "pyaz", "hari mirch", "dhania", "oil"]}'
```

## Editing the data

| File | What's in it |
|---|---|
| `src/data/ingredients.ts` | Ingredients, aliases and categories. `specialty: true` = usually only at Indian stores; `staple: true` = assumed at home (salt, water) |
| `src/data/recipes.ts` | Recipes. Mark non-essential ingredients `optional: true` so they don't block a match |
| `src/data/stores.ts` | What each store carries. Indian stores carry everything; other stores list the specialty items they **do** carry and the regular items they **don't** |

`npm test` checks that every recipe and store references real ingredients.

> Store availability is a best-effort estimate and varies by location.

## Roadmap ideas

- More recipes and regions, then other cuisines
- Accounts and a database (e.g. Supabase free tier) so your kitchen syncs across devices
- Live product data (Kroger has a public product API)
- Swapping a single meal in the plan
