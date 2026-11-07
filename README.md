# Tabkha (طبخة)

Tabkha is a full-stack web app (React, Express, MongoDB) that helps home cooks keep their recipes in one place and see what they can cook from the ingredients they have. Capstone project for the Web Development course.

Team: Clara Seif, Georges Saab, Karam Said

## Status

Milestone 1: project scaffold. The server and the client both start, and the wireframes and database schema are being finalized.

## What you need

- Node.js version 20 or later (check with `node -v`)

## Project structure

- `client/` is the React front end (built with Vite). It runs on http://localhost:5173
- `server/` is the Express back end. It runs on http://localhost:3000

## How to run it

**1. Get the project**

Clone the repository, then go into its folder:

```
git clone https://github.com/clara-se/tabkha-app.git
cd tabkha-app
```

You are now in the main folder, the one that contains `client` and `server`. Both terminals below must start from this folder.

**2. Terminal 1: the server**

From the main `tabkha-app` folder:

```
cd server
npm install
npm run dev
```

You should see `Listening on http://localhost:3000`. Opening that address in a browser shows `{"status":"ok"}`.

**3. Terminal 2: the client**

Open a second terminal. Make sure it is in the main `tabkha-app` folder, not inside `server` (if it is, run `cd ..` first). Then:

```
cd client
npm install
npm run dev
```

Open http://localhost:5173 in a browser.

## Environment variables

Each side keeps its own `.env` file, and Git ignores it so secrets are never pushed. In `server/`, make a copy of `.env.example` named `.env`. The values in the example are fake. From Milestone 2, the server will read the real database connection string and secret from `.env`.

## Tech stack

React and Vite (front end), Node.js and Express (back end), MongoDB with Mongoose (database).