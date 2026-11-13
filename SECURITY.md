# Security audit: Tabkha back end

Audit of the Express + MongoDB API against the seven holes in Session 21 ("Security & Best Practices"). Each entry records the attack, the result before the fix, the fix, and the result after the fix. All attacks were run with Thunder Client against the local server.

## Summary

| # | Hole | Result before | Fix | Result after |
|---|------|---------------|-----|--------------|
| 1 | Mass assignment | Forged `createdAt` / `updatedAt` saved | zod `validate` middleware | Dates are today's, extra fields dropped |
| 2 | NoSQL injection (login) | Logged in without knowing the email | zod string types + `sanitizeFilter` | 400, request rejected |
| 3 | Brute force | 20 wrong passwords, all answered 401 | `express-rate-limit` | 6th attempt answered 429 |
| 4 | Missing headers | `x-powered-by: Express`, no CSP, no HSTS | `helmet` | Header gone, CSP and HSTS present |
| 5 | Secrets | No leaked secret in git history | `.env`, fail-fast `config.js`, rotated secret | Server refuses to start without them |
| 6 | IDOR | Already safe | `userId` filter on every query | Other users' ids answer 404 |
| 7 | XSS | API stores text, never renders it | Front-end rule (Milestone 3) | Not exploitable on the API |

## 1. Mass assignment

- **Attack:** `POST /api/recipes` with extra fields in the body: `createdAt` and `updatedAt` set to `2000-01-01`, and a fake `userId`.
- **Before:** the recipe was saved with the forged 2000 timestamps. (The fake `userId` was already ignored, because the owner is set from the token after the body is spread.)
- **Fix:** a zod schema per route (`RecipeInput`, `PantryInput`) and a `validate` middleware that runs `safeParse` and replaces `req.body` with the parsed result. Fields not in the schema are dropped. PATCH uses `.partial()` of the same schema, written with `.optional()` (not `.default()`) so a partial update never resets other fields. Size limits (`.max()`) cap titles, steps, tags and ingredient counts. The body is also capped with `express.json({ limit: '10kb' })`.
- **After:** the same request returns 201 with today's `createdAt` / `updatedAt` and the real owner's `userId`. Bad data (unknown unit, quantity 0, empty title) returns 400.

## 2. NoSQL injection

- **Attack:** `POST /api/auth/login` with `{"email":{"$ne":null},"password":"anything"}`, an operator object instead of an email string.
- **Before:** 200 and a valid token for an existing user.
- **Fix:** zod schemas `SignupInput` / `LoginInput` require `email` and `password` to be strings. `mongoose.set('sanitizeFilter', true)` is enabled as a backstop, so `$` operators in a filter are treated as plain values. The recipe search parses `req.query.search` with `z.string().max(100)`, and only the intended `$regex` is marked with `mongoose.trusted(...)`.
- **After:** the same login request returns 400 ("expected string, received object"). A search such as `?search[$ne]=x` is not exploitable: Express 5 does not turn it into an object, so it matches nothing.

## 3. Brute force

- **Attack:** repeated `POST /api/auth/login` with a wrong password.
- **Before:** 20 wrong attempts in a row were all answered 401, with no limit.
- **Fix:** `express-rate-limit`: 5 attempts per 15 minutes on `/api/auth/login`, 300 requests per 15 minutes on `/api`. `trust proxy` is set to 1 so the limiter sees the real client behind a host's proxy.
- **After:** the 6th login attempt returns 429 "Too many attempts. Try again later." Note: successful logins also count, and the counter resets when the server restarts.

## 4. Missing security headers

- **Attack:** inspect the response headers of `GET /`.
- **Before:** `x-powered-by: Express` was sent, and there was no `content-security-policy` or `strict-transport-security`.
- **Fix:** `app.use(helmet())`.
- **After:** `x-powered-by` is gone, and `content-security-policy` and `strict-transport-security` are present. HSTS only takes effect over HTTPS, which comes with the Milestone 4 deployment.

## 5. Secrets

- **Attack:** search the repo history and tracked files for leaked secrets (`git log -p` for `SECRET`, and for the Atlas `mongodb+srv` string).
- **Before:** nothing was committed. During testing, a JWT secret appeared in a screenshot, so it was treated as exposed.
- **Fix:** secrets live only in `server/.env`, which is in `.gitignore`; `.env.example` holds fake values. `server/config.js` stops the server at startup if `MONGODB_URI` or `JWT_SECRET` is missing. The exposed JWT secret was rotated (a new 64-hex value from the slide's command, never shared).
- **After:** history and tracked files contain no secret. Starting without the variables fails immediately with `Missing env var: ...`.

## 6. IDOR (checked, already safe)

- **Attack:** use one user's token to read, update or delete another user's recipe or pantry item by id.
- **Result:** 404. Every query filters on `{ _id, userId: req.userId }`, and `userId` always comes from the verified token, never from the body.

## 7. XSS (checked, not exploitable on the API)

- **Attack:** save a recipe titled `<img src=x onerror=alert(1)>`.
- **Result:** it is stored and returned as plain text in JSON. The API never renders HTML, so nothing runs.
- **Rule for Milestone 3:** the React client must display recipe text as text only and never use `dangerouslySetInnerHTML`. The token is sent as a Bearer header, so it is kept in the browser and an XSS bug could read it. That is a reason to keep the rule above.
- **Image links:** the recipe `imageUrl` is shown in an `<img src>`. The server only accepts an empty value or a link starting with `http://` or `https://`, so values like `javascript:` are rejected with 400.
