# West LA Courts — Live Tennis Court Finder

A real-time web app that aggregates tennis court availability across West Los Angeles, so players can find and book open courts without checking multiple sites.

**Live demo:** _coming soon_

---

## What it does

- Scrapes court availability data on demand via a Supabase Edge Function
- Displays courts in a filterable, sortable **list view** with live status badges (Open / Limited / Full)
- Shows court locations on an **interactive satellite map** (Leaflet) with color-coded markers and booking popups
- **Auto-refreshes** every 5 minutes — no manual reload needed
- Links directly to each court's official booking page

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui (Radix UI) |
| Data fetching | TanStack Query (React Query) |
| Backend / DB | Supabase (Postgres + Edge Functions) |
| Maps | Leaflet.js with Esri satellite tiles |
| Routing | React Router v6 |
| Testing | Vitest, Testing Library |

---

## Architecture highlights

- **`useCourts` hook** — wraps TanStack Query to fetch from a Supabase view (`public_court_availability`) with a 5-minute polling interval
- **`scrape-courts` Edge Function** — triggered on demand from the UI; scrapes source sites and upserts results into Supabase
- **`CourtMap`** — manages Leaflet map lifecycle via `useRef`/`useEffect`, rebuilds markers reactively when court data changes
- **`CourtList`** — client-side filtering (by status) and sorting (by name, price, availability) using `useMemo`

---

## Getting started

**Prerequisites:** Node.js 18+, a Supabase project with the `public_court_availability` view and `scrape-courts` Edge Function deployed.

```sh
# 1. Clone
git clone https://github.com/mia373/la-tennis-court-finder.git
cd la-tennis-court-finder

# 2. Install dependencies
npm install

# 3. Set environment variables
cp .env.example .env   # add your Supabase URL + anon key

# 4. Start dev server
npm run dev
```

Other scripts:

```sh
npm run build     # production build
npm run test      # run tests with Vitest
npm run lint      # ESLint
```

---

## Project structure

```
src/
├── components/
│   ├── CourtList.tsx      # filterable card grid
│   ├── CourtMap.tsx       # Leaflet map with reactive markers
│   └── ui/                # shadcn/ui primitives
├── hooks/
│   └── useCourts.ts       # data fetching + polling
├── integrations/
│   └── supabase/          # generated Supabase client + types
└── pages/
    └── Index.tsx          # main page: filter bar, tabs, sort controls
```