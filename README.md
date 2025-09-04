
# SpendPal (Ali + Afee)

Two-user request/approve app with public dashboard.

## Stack
- Backend: Node.js/Express + MongoDB + JWT auth
- Frontend: React + Vite
- Email notifications: Nodemailer (optional; falls back to console logs)

## Quickstart

### 1) Backend
```
cd server
cp .env.example .env
# edit .env with your MONGO_URI and JWT_SECRET and (optionally) SMTP creds
npm install
npm start
```
Create users (one-time):
```
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"username":"Ali","password":"pass123","role":"requester"}'
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"username":"Afee","password":"pass123","role":"approver"}'
```
(Then disable/lock the /register route in production.)

### 2) Frontend
```
cd client
npm install
# set API base if deploying elsewhere
# echo "VITE_API_BASE=http://localhost:5000" > .env
npm run dev
```

Open http://localhost:5173

### Roles
- Ali (requester): can create/edit/delete pending requests; can mark fulfilled requests as **used** which auto-resubmits if recurring.
- Afee (approver): can **Acknowledge / Deny (with reason) / Fulfill (with proof)**; can create budgets via POST /api/budgets.

### Public Dashboard
Exposed without login:
- `GET /api/public/summary`
- `GET /api/public/requests`

### Build & Deploy
- **Backend**: Render/Railway/Heroku — set env vars from `.env.example` (MONGO_URI, JWT_SECRET, CLIENT_ORIGIN, SMTP_..., FROM_EMAIL, NOTIFY_APPROVER_EMAIL, NOTIFY_REQUESTER_EMAIL).
- **Frontend**: Vercel/Netlify — set `VITE_API_BASE` to your backend URL.

### Notes
- Email notifications will **log to console** if SMTP isn’t configured.
- CORS allows `CLIENT_ORIGIN` (comma separated). For development it allows all.
- Budgets: simple rolling total. Increase on fulfilment.
