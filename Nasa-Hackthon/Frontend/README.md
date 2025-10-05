# Space Biology Knowledge Engine — Backend

Node/Express API that powers AI search, summarization, chat, plain-language explanations, study-card generation, analytics, and user-managed resources on top of NASA space-biology publications.  
Storage: **MongoDB**. AI: **Google Gemini** (embeddings + generation).

---

## Features

- **Auth**: Username + password (optional email). JWT tokens, bcrypt hashing, route guards.
- **Publications dataset**: Robust CSV importer (handles UTF-16/UTF-8/BOM/CRLF). Idempotent.
- **Semantic search**: Gemini `text-embedding-004` + cosine similarity. Filters: `year`, `own=true`.
- **AI summarizer**: Expert/Student tone toggle; optional `force=true` refresh.
- **Chat assistant**: Retrieval-augmented chat over the top-k most similar papers.
- **Plain-language explainer**: Same model with simplified wording.
- **Study cards**: Clean JSON Q&A; resilient parser; optional PDF export.
- **Stats for dashboards**: Totals, per-year counts, top words.
- **User resources**: Add your own links; treated like publications for all AI ops.
- **Contact**: Store messages (links to user if authenticated).
- **Postman collection**: All endpoints with examples.

---

## Tech

- **Node 18+**, **Express**, **Mongoose/MongoDB**
- **Google Generative AI** SDK (`@google/generative-ai`)
- Optional: PDF generator library (if `pdf=true` for cards)

---

## Quick Start

### 1) Install

```bash
git clone <YOUR_REPO_URL> space-biology-engine
cd space-biology-engine
npm install
```

### 2) Configure environment

Create `config.env` in the project root:

```ini
# ----- Server -----
PORT=3000
NODE_ENV=development
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d

# ----- MongoDB -----
# Use a URI that EXPLICITLY names the DB (we use space-bio)
MONGODB_URI=mongodb+srv://USER:PASS@CLUSTER.mongodb.net/space-bio?retryWrites=true&w=majority

# ----- Google Gemini -----
GOOGLE_API_KEY=AIza...your_key...

# Optional: override dataset URL (raw CSV)
# DATA_URL=https://raw.githubusercontent.com/theeCaesar/SB_publication_PMC.csv/main/SB_publication_PMC.csv
```

> The server also forces `{ dbName: 'space-bio' }` to avoid accidental writes to `test`.

### 3) Import the dataset

```bash
npm run import:data
```

- Downloads the CSV (if missing), fixes encodings, and imports unique `{ title, link }`.

### 4) Create embeddings (recommended once)

```bash
npm run embed:all
```

- Generates Gemini `text-embedding-004` vectors for docs missing `embedding`.
- If you skip this, `/search` will compute & save missing vectors on demand (slower first hit).

### 5) Run the API

```bash
npm run dev
# or
npm start
```

Base URL: `http://localhost:3000`

---

## Folder Layout

```
controllers/        # Route handlers (auth, search, summarize, chat, cards, analysis, resources, contact)
models/             # Mongoose schemas (Publication, User, ContactMessage)
routes/             # Express routers
utils/              # Gemini wrapper, importer, embedding script, helpers
data/               # Cached CSV after download
postman_collection.json
config.env          # Your env file (not committed)
```

---

## Data Model (simplified)

**Publication**

- `title: string` (required)
- `link: string` (required, unique)
- `year?: number`
- `summary?: string`
- `embedding?: number[]` (Gemini vector)
- `user?: ObjectId | null` (null for NASA; set for user resources)
- timestamps

**User**

- `username: string` (required, unique)
- `email?: string`
- `password: string` (hashed)
- timestamps

**ContactMessage**

- `user?: ObjectId`
- `email?: string`
- `message: string`
- timestamps

---

## Authentication

**Signup**  
`POST /api/v1/auth/signup`

```json
{ "username": "astro", "email": "astro@example.com", "password": "S3cure!pass" }
```

**Login**  
`POST /api/v1/auth/login`

```json
{ "username": "astro", "password": "S3cure!pass" }
```

Use `Authorization: Bearer <token>` for protected routes.

---

## Core Endpoints (summary)

> See `postman_collection.json` for full examples and environments.

### Search

`GET /api/v1/search?q=<text>&limit=10&year=2021&own=true`

- Computes query embedding.
- Ensures docs have embeddings (computes/saves if missing).
- Ranks by cosine similarity.
- `own=true` restricts to the authenticated user’s resources.

**Response**

```json
{
  "query": "microgravity stem cells",
  "count": 5,
  "results": [
    { "id": "66f...", "title": "...", "link": "https://...", "score": 0.84 }
  ]
}
```

### Summarize

`GET /api/v1/summarize/:id?style=expert|student&force=true`

- Generates or refreshes a concise summary in the requested tone.
- Stores summary on the document for reuse.

### Chat (RAG)

`POST /api/v1/chat`

```json
{
  "messages": [
    {
      "role": "user",
      "content": "How does microgravity affect bone formation?"
    }
  ],
  "top_k": 5
}
```

- Retrieves top-k similar docs and uses them as chat context.

### Plain-language Explainer

`POST /api/v1/explain`

```json
{ "text": "Original abstract or paragraph..." }
```

- Returns a simpler explanation (student mode).

### Study Cards

`GET /api/v1/cards/:id?count=8&pdf=false`

- Returns `[{ "question": "...", "answer": "..." }, ...]`
- With `pdf=true` (if enabled), returns a PDF download URL too.

### Stats / Dashboard

`GET /api/v1/analysis/stats`

- Returns totals, per-year counts, top words, etc., for charts.

### User Resources (auth)

- **Add**: `POST /api/v1/users/resources`
  ```json
  { "title": "My Doc", "link": "https://...", "year": 2024 }
  ```
- **List**: `GET /api/v1/users/resources`
- **Delete**: `DELETE /api/v1/users/resources/:id`

### Contact

`POST /api/v1/contact`

```json
{ "email": "me@example.com", "message": "Hi team!" }
```

---

## Postman

1. Import `postman_collection.json`.
2. Set environment variable `baseUrl` = `http://localhost:3000`.
3. After login/signup, set `token` to your JWT, and Postman will send `Authorization: Bearer {{token}}` automatically.
4. Try:
   - **Import** → **Embed** → **Search** → **Summarize** → **Cards**.

---

## Frontend Integration Notes

- Set the Vue app’s API base to `http://localhost:3000` (central config or `.env`).
- Use `/api/v1/analysis/stats` for dashboard charts.
- Search page should pass `q`, with optional `year` and `own=true`.
- Summarize page can toggle `style=expert|student` and `force=true`.

---

## Scripts

```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "import:data": "node utils/importData.js",
    "embed:all": "node utils/embedAll.js",
    "debug:db": "node utils/debugDb.js"
  }
}
```

---

## Troubleshooting

- **Gemini 400 “API key not valid”**

  - Ensure the env var is **GOOGLE_API_KEY** (exact name), no quotes/whitespace.
  - Key must have access to `generativelanguage.googleapis.com`.
  - Restart Node after changes.

- **Search returns empty**

  - Run `npm run embed:all`.
  - Confirm the same DB: run `npm run debug:db` and check `DB.name`.
  - Make sure both server and importer use `/space-bio` (or pass `{ dbName: 'space-bio' }`).

- **Importer says “Parsed 0 rows”**

  - The importer auto-handles BOM/UTF-16/CRLF and re-downloads empty files.
  - If network issues persist, manually save the CSV as UTF-8 and re-run.

- **Duplicate link errors**
  - Expected on re-imports; `link` is unique and we dedupe by `link`.

---

## Security

- Rotate API keys regularly and keep them out of source control.
- Use a strong `JWT_SECRET`.
- Add rate limiting and CORS allowlists for public deployments.
- Serve over HTTPS in production; enable helmet and secure headers.

---

## Attribution

- Dataset: Space-biology publications CSV (see `DATA_URL` in env).
- Embeddings & generation: Google Gemini.
- © Your Team / Hackathon Project.

---

**Happy building!** If you want Dockerfiles, CI/CD, or production Helm charts added later, say the word and we’ll extend this.

---

## Frontend Setup (Vue 3 Dashboard)

A Vue 3 + Vite app that connects to this backend and renders search results, summaries, chat, study cards, and analytics with a space-themed UI.

### 1) Requirements

- Node 18+
- npm or pnpm
- Backend running at `http://localhost:3000` (or your deployed URL)

### 2) Create / Use the Project

If you already have a Vue project, skip to step 3. Otherwise:

```bash
npm create vite@latest space-bio-front -- --template vue
cd space-bio-front
npm install
```

> If you prefer TypeScript: `--template vue-ts` (and ensure `@vue/tsconfig` is installed).

### 3) Environment Variables

Create a `.env` in the frontend root:

```
VITE_API_BASE_URL=http://localhost:3000
```

### 4) Install UI deps

Recommended minimal stack for charts and state:

```bash
npm i axios pinia vue-router
npm i chart.js vue-chartjs
```

### 5) Base Theme (space palette)

Create `src/assets/theme.css` and import it in `src/main.js`:

```css
:root {
  --color-bg: #000714;
  --color-bg-2: #001940;
  --color-primary: #0033a0; /* deep navy */
  --color-accent: #0a81d1; /* bright blue */
  --text-high: #e8f1ff;
  --text-dim: #9db7d5;
}
html,
body,
#app {
  height: 100%;
  background: radial-gradient(
      1000px 60% at 50% 0%,
      var(--color-bg-2) 0%,
      #001030 40%,
      var(--color-bg) 80%
    ), var(--color-primary);
  color: var(--text-high);
}
a {
  color: var(--color-accent);
}
.button-primary {
  background: var(--color-accent);
  color: #031833;
  border: 1px solid var(--color-accent);
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 600;
}
```

### 6) Axios client

Create `src/lib/api.js`:

```js
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: false,
});

// Attach JWT if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Optional: handle 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      // Optionally redirect to login
    }
    return Promise.reject(err);
  }
);
```

### 7) Router + Store

Create `src/router/index.js`:

```js
import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Search from "@/views/Search.vue";
import Stats from "@/views/Stats.vue";
import Cards from "@/views/Cards.vue";
import Chat from "@/views/Chat.vue";
import Login from "@/views/Login.vue";
import Signup from "@/views/Signup.vue";
import Resources from "@/views/Resources.vue";
import Contact from "@/views/Contact.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/search", component: Search },
  { path: "/stats", component: Stats },
  { path: "/cards/:id", component: Cards, props: true },
  { path: "/chat", component: Chat },
  { path: "/login", component: Login },
  { path: "/signup", component: Signup },
  { path: "/resources", component: Resources },
  { path: "/contact", component: Contact },
];

export default createRouter({ history: createWebHistory(), routes });
```

Create `src/stores/auth.js`:

```js
import { defineStore } from "pinia";
import { api } from "@/lib/api";

export const useAuth = defineStore("auth", {
  state: () => ({ user: null, token: localStorage.getItem("token") || "" }),
  actions: {
    async signup(payload) {
      const { data } = await api.post("/api/v1/auth/signup", payload);
      this.user = data.user;
      this.token = data.token;
      localStorage.setItem("token", this.token);
    },
    async login(payload) {
      const { data } = await api.post("/api/v1/auth/login", payload);
      this.user = data.user;
      this.token = data.token;
      localStorage.setItem("token", this.token);
    },
    logout() {
      this.user = null;
      this.token = "";
      localStorage.removeItem("token");
    },
  },
});
```

Wire in `src/main.js`:

```js
import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "@/router";
import App from "./App.vue";
import "@/assets/theme.css";

createApp(App).use(createPinia()).use(router).mount("#app");
```

### 8) Pages – minimal calls

**Search** (`src/views/Search.vue`):

```vue
<script setup>
import { ref } from "vue";
import { api } from "@/lib/api";
const q = ref("");
const year = ref("");
const own = ref(false);
const results = ref([]);
async function doSearch() {
  const { data } = await api.get("/api/v1/search", {
    params: {
      q: q.value,
      year: year.value || undefined,
      own: own.value || undefined,
      limit: 10,
    },
  });
  results.value = data.results || [];
}
</script>

<template>
  <section>
    <h1>Semantic Search</h1>
    <input v-model="q" placeholder="Search…" />
    <input v-model="year" placeholder="Year (optional)" />
    <label><input type="checkbox" v-model="own" /> My resources only</label>
    <button class="button-primary" @click="doSearch">Search</button>
    <ul>
      <li v-for="r in results" :key="r.id">
        <a :href="r.link" target="_blank">{{ r.title }}</a> —
        {{ r.score.toFixed(3) }}
      </li>
    </ul>
  </section>
</template>
```

**Summary** (part of a Paper view):

```js
// GET /api/v1/summarize/:id?style=student|expert&force=false
```

**Cards** (`src/views/Cards.vue`):

```vue
<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { api } from "@/lib/api";
const route = useRoute();
const cards = ref([]);
onMounted(async () => {
  const { data } = await api.get(`/api/v1/cards/${route.params.id}`, {
    params: { count: 8, pdf: false },
  });
  cards.value = data.cards || data || [];
});
</script>

<template>
  <section>
    <h1>Study Cards</h1>
    <ul>
      <li v-for="(c, i) in cards" :key="i">
        <strong>Q:</strong> {{ c.question }}<br /><strong>A:</strong>
        {{ c.answer }}
      </li>
    </ul>
  </section>
</template>
```

**Stats** (`src/views/Stats.vue`) with Chart.js:

```vue
<script setup>
import { onMounted, ref } from "vue";
import { api } from "@/lib/api";
import { Bar } from "vue-chartjs";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const data = ref({ labels: [], datasets: [] });

onMounted(async () => {
  const res = await api.get("/api/v1/analysis/stats");
  const years = Object.keys(res.data.yearCounts || {}).sort();
  const counts = years.map((y) => res.data.yearCounts[y]);
  data.value = {
    labels: years,
    datasets: [{ label: "Publications per year", data: counts }],
  };
});
</script>

<template>
  <section>
    <h1>Insights</h1>
    <Bar
      :data="data"
      :options="{ responsive: true, maintainAspectRatio: false }"
      style="height: 420px;"
    />
  </section>
</template>
```

### 9) Hero with Stars + Rotating Earth

You can drop in a ready component called `HeroSection.vue` that renders a twinkling starfield (Canvas) and a rotating Earth limb (SVG) using the app palette `#0033A0` and `#0A81D1`.

- Place the component at `src/components/HeroSection.vue`.
- Use it in `src/views/Home.vue`:

```vue
<template><HeroSection /></template>
<script setup>
import HeroSection from "@/components/HeroSection.vue";
</script>
```

> (We shared a full HeroSection example earlier—paste it as-is, or ask Cursor to generate it using these specs).

For a full 3D globe instead of SVG limb, consider:

- **Globe.gl**: `npm i globe.gl three` (realistic textures + atmosphere)
- **Cobe**: `npm i cobe` (lightweight, silky rotation)
- **VueCesium**: `npm i vue-cesium cesium` (heavy but stunning, full 3D globe)

### 10) CORS

Make sure your backend allows the frontend origin (dev server is usually `http://localhost:5173`). In Express:

```js
const cors = require("cors");
app.use(cors({ origin: ["http://localhost:5173"], credentials: false }));
```

### 11) Run the Frontend

```bash
npm run dev
# open http://localhost:5173
```

### 12) Deploy notes

- Set `VITE_API_BASE_URL` to your production API URL.
- Enable HTTPS and CDN caching.
- Consider code-splitting (`router` lazy routes) for faster first paint.
