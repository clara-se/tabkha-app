# Tabkha (طبخة)

Tabkha is a full-stack web app (React, Express, MongoDB) that helps home cooks keep their recipes in one place and see what they can cook from the ingredients they have. Capstone project for the Web Development course.

Team: Clara Seif, Georges Saab, Karam Said

## Status

- Milestone 1 (wireframes and schema): see docs/milestone-1.pdf
- Milestone 2 (back end: auth and CRUD routes): done
- Milestone 3 (React front end connected to the API): done
- Milestone 4: runs locally, not deployed yet

## Features

- Sign up, log in and log out (JWT authentication)
- Recipes: create, view, edit, delete, and search by title
- Recipe pictures from an image link (a placeholder is shown if there is none)
- Pantry: add items with a quantity and a unit, update and delete them
- "Can I cook this?": compares a recipe's ingredients with your pantry and
  shows, for each ingredient, whether you have enough, not enough, are missing
  it, or have it in a different unit
- Every user sees only their own recipes and pantry
- Responsive design (phone and desktop)

## What you need

- Node.js version 20 or later (check with `node -v`)
- A MongoDB Atlas database

## Project structure

- `client/` is the React front end (built with Vite). It runs on http://localhost:5173
- `server/` is the Express back end. It runs on http://localhost:3000
- `docs/` holds the Milestone 1 document and the Lighthouse report

The React app talks to the API over HTTP. After login the API returns a token,
and the client sends it as `Authorization: Bearer <token>` on every private
request.

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

You should see `connected to MongoDB`. Opening http://localhost:3000 in a browser shows `{"status":"ok"}`.

**3. Terminal 2: the client**

Open a second terminal. Make sure it is in the main `tabkha-app` folder, not inside `server` (if it is, run `cd ..` first). Then:

```
cd client
npm install
npm run dev
```

Open http://localhost:5173 in a browser.

## Environment variables

Each side keeps its own env file, and Git ignores them so secrets are
never pushed.

**Server.** In `server/`, make a copy of `.env.example` named `.env`.
The values in the example are fake: replace them with your own. The
server reads these four values from `.env`:

- `PORT`: the port the server listens on (3000)
- `MONGODB_URI`: your MongoDB Atlas connection string, ending with the database name
- `JWT_SECRET`: a long random string used to sign login tokens
- `CLIENT_ORIGIN`: the address of the React app (`http://localhost:5173`)

**Client.** In `client/`, create a file `.env.development` with one line:

```
VITE_API_URL=http://localhost:3000
```

For a production build (`npm run build`), create `client/.env.production`
with the API address to use. To try the production build locally:

```
cd client
npm run build
npm run preview -- --port 5173
```

Use port 5173, because the server only allows the origin set in `CLIENT_ORIGIN`.

## Tests

```
cd server
npm test
```

```
cd client
npm test
```

## API routes

All responses are JSON. Every route except signup and login needs the
header `Authorization: Bearer <token>`. A token is valid for 1 hour.
Units for ingredients and pantry items: `g`, `kg`, `ml`, `l`, `piece`,
`tbsp`, `tsp`.

### Auth (public)

| Method | Path | Body | Success | Errors |
|---|---|---|---|---|
| POST | `/api/auth/signup` | `email`, `password` (8+ characters) | 201 `{ token, user }` | 400 bad input, 409 email already registered |
| POST | `/api/auth/login` | `email`, `password` | 200 `{ token }` | 401 invalid email or password, 429 too many attempts |

### Recipes (need a token; each user sees only their own)

| Method | Path | Body | Success | Errors |
|---|---|---|---|---|
| GET | `/api/recipes?search=` | none | 200 list, newest first; `search` matches the title | 400 |
| GET | `/api/recipes/:id` | none | 200 recipe | 400 invalid id, 404 not found |
| GET | `/api/recipes/:id/cook` | none | 200 `{ canCook, ingredients }`, one entry per ingredient with its status | 400 invalid id, 404 not found |
| POST | `/api/recipes` | `title` (required, max 120), `sourceUrl`, `imageUrl` (empty or starting with http:// or https://), `ingredients` `[{name, quantity, unit}]`, `steps`, `tags` | 201 recipe | 400 bad data |
| PATCH | `/api/recipes/:id` | any of the fields above | 200 updated recipe | 400 bad id or data, 404 not found |
| DELETE | `/api/recipes/:id` | none | 204 | 400 invalid id, 404 not found |

### Pantry (need a token; each user sees only their own)

| Method | Path | Body | Success | Errors |
|---|---|---|---|---|
| GET | `/api/pantry` | none | 200 list, sorted by name | none |
| POST | `/api/pantry` | `name`, `quantity` (above 0), `unit` | 201 item | 400 bad data |
| PATCH | `/api/pantry/:id` | any of the fields above | 200 updated item | 400 bad id or data, 404 not found |
| DELETE | `/api/pantry/:id` | none | 204 | 400 invalid id, 404 not found |

### Errors on every protected route

- 401 `Missing token` when the header is absent.
- 401 `Invalid or expired token` when the token is wrong or older than 1 hour.
- 404 `Not found` for any route that does not exist.

### Examples

These use curl. On Windows PowerShell, `curl` is not the real curl, so use
`curl.exe` or a tool such as Thunder Client.

```
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"hunter222"}'
```
Response: `{"token":"eyJ...","user":{"id":"...","email":"alice@test.com"}}`

```
curl -X POST http://localhost:3000/api/recipes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Tabbouleh","ingredients":[{"name":"parsley","quantity":2,"unit":"piece"}],"steps":"Chop and mix"}'
```
Response (201): the saved recipe with its `_id` and `userId`.

```
curl http://localhost:3000/api/pantry -H "Authorization: Bearer <token>"
```
Response (200): `[{"_id":"...","name":"flour","quantity":500,"unit":"g"}]`

## Tech stack

- Front end: React, Vite, react-router-dom
- Back end: Node.js, Express
- Database: MongoDB with Mongoose
- Security: bcrypt, jsonwebtoken, helmet, express-rate-limit, cors, zod
- Tests: Vitest, Testing Library, supertest

## More documents

- [SECURITY.md](SECURITY.md): security measures and the attacks I tested
- [PERFORMANCE.md](PERFORMANCE.md): Lighthouse results and what I tried