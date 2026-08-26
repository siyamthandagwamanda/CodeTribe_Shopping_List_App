<img src="https://socialify.git.ci/siyamthandagwamanda/CodeTribe_Shopping_List_App/image?language=1&owner=1&name=1&stargazers=1&theme=Light" alt="CodeTribe_Shopping_List_App" width="640" height="320" />

#1. setting up an @ import alias in vite is mainly about making your imports cleaner, shorter, and easier to maintain.

A shopping list app built with **React** and **Redux Toolkit**, with a
small local "fake backend" (json-server) for storing users, lists, and
items.

This project is written in plain JavaScript (no TypeScript) with
comments throughout, to make it easier to follow while learning Redux.

## What's inside

- **React** — builds the UI (pages, buttons, forms)
- **Redux Toolkit** — holds shared app data (the logged-in user,
  shopping lists, items, toast notifications) in one place, so any
  component can read or update it
- **React Router** — switches between pages (login, dashboard, a
  single list, profile) without full page reloads
- **json-server** — a tiny fake REST API that reads/writes to
  `db.json`, so the app behaves like it's talking to a real backend
- **bcryptjs** — hashes passwords before they're stored

## Project structure

```
src/
  app/
    store.js       -> creates the Redux store
    hooks.js        -> useAppDispatch / useAppSelector helpers
  features/
    auth/           -> login, register, and the auth Redux slice
    notifications/  -> toast pop-up messages and their Redux slice
    shopping-list/   -> dashboard, list detail, and the shopping Redux slice
  pages/            -> landing, profile, shared list, 404
  components/       -> shared UI pieces (header, protected routes, toasts)
  lib/              -> small helpers (fetch wrapper, localStorage wrapper)
```

Each "slice" file (e.g. `authSlice.js`, `shoppingSlice.js`,
`notificationsSlice.js`) is a self-contained piece of Redux: it
defines the starting state, the actions that can change it, and
(for data that comes from the server) `createAsyncThunk` functions
that fetch/save data and update state automatically.

## Running the app

You need two things running at the same time: the fake API server and
the React dev server.

1. Install dependencies:
   ```
   npm install
   ```
2. Start both servers together:
   ```
   npm run dev:all
   ```
   This runs `npm run server` (json-server on http://localhost:3000)
   and `npm run dev` (Vite on http://localhost:5173) side by side.

   Or, run them separately in two terminals if you prefer:
   ```
   npm run server   # terminal 1 - the fake API
   npm run dev      # terminal 2 - the React app
   ```
3. Open http://localhost:5173 in your browser.

## Other scripts

- `npm run build` — builds a production version into `dist/`
- `npm run lint` — checks the code for common mistakes
- `npm run preview` — serves the production build locally

## Bugs fixed in this version

- The app was calling `/list` on the API, but the database's
  collection is named `lists` (plural) — every list-related request
  was failing. All requests now correctly use `/lists`.
- Deleting a list removed its items but never removed the list
  itself, so it would reappear after refreshing. The delete action
  now removes the list record too.
- `package.json` referenced a version of `typescript-eslint` that
  doesn't exist, which made `npm install` fail. The project has been
  converted to plain JavaScript, so this dependency isn't needed at
  all anymore.
- A broken empty `<link>` tag in `index.html` was removed.
