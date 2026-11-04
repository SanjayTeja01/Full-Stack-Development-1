# FarmConnect

A small marketplace where farmers list produce and buyers make offers on it. The farmer accepts or rejects each offer, and accepting reduces the listing's stock. Built with React (Vite, React Router) and Express. Data is saved in a JSON file on the server, so it survives a page refresh and a server restart.

## What works

- **Marketplace:** every listing, newest first, with search by name and a category filter.
- **Listing page:** price, stock and an offer form for buyers.
- **Farmer dashboard:**
  - add a listing (name, category, unit, price per unit, quantity);
  - see your listings and their current stock;
  - accept or reject the offers on them.
- **My offers:** a buyer's offers and whether each one is pending, accepted or rejected.
- **States:** every list shows a loading state, an empty state and an error message with "Try again" if the server can't be reached.

## What it does not do

- **No login.** You pick Buyer or Farmer and type a name; it is saved in your browser (`localStorage`). This is a classroom project, and login was not part of the brief. The server still checks that the farmer name matches the listing before it accepts an offer, but anyone can type any name.
- No payments, delivery or chat.

## Run it

You need Node.js 22 or newer. Use two terminals.

```bash
# terminal 1: API on http://localhost:4000
cd server
npm install
npm run dev
```

```bash
# terminal 2: website on http://localhost:5173
cd client
npm install
npm run dev
```

Open http://localhost:5173. The first start creates `server/data/db.json` from `server/data/seed.json`, which holds only the five categories. Delete `db.json` to start empty again.

## API

All responses are JSON. Errors come back as `{ "error": "message" }`.

| Method | Path | Does | Errors |
| --- | --- | --- | --- |
| GET | `/api/categories` | List the categories | |
| GET | `/api/listings?q=&category=&farmer=` | List listings, filtered | |
| GET | `/api/listings/:id` | Get one listing | 404 |
| POST | `/api/listings` | Create a listing | 400 for bad input |
| GET | `/api/offers?buyer=&farmer=&listingId=` | List offers, filtered | |
| POST | `/api/offers` | Make an offer | 400 for bad input or an offer on your own listing; 404 unknown listing; 409 more than the stock |
| POST | `/api/offers/:id/accept` | Accept an offer and reduce the stock | 403 not your listing; 404; 409 already answered or not enough stock |
| POST | `/api/offers/:id/reject` | Reject an offer | 403; 404; 409 already answered |

The server checks every field itself and never trusts the browser:

- names are 2 to 80 characters;
- the category and unit must be from the known lists;
- prices and quantities must be whole numbers greater than 0.

Changes to the data file are made one at a time. So two offers accepted at the same moment cannot sell the same stock twice; `server/test/api.test.js` tests this.

## Tests

```bash
cd server
npm test
```

There are 8 tests. They cover bad input, unknown ids, invalid JSON, an offer on your own listing, more than the stock, the wrong farmer, a double accept and two accepts at once. Each test run uses a temporary copy of the data, never your `db.json`.

## Folder structure

```
server/
  src/index.js           starts the server
  src/app.js             routes, the 404 for unknown paths, error handling
  src/db.js              reads and writes data/db.json safely
  src/validate.js        input checks shared by the routes
  src/routes/listings.js listings endpoints
  src/routes/offers.js   offers endpoints
  test/api.test.js       API tests
client/src/
  api.js                 fetch wrapper and the useApi hook
  user.jsx               the chosen role and name
  pages/                 Marketplace, ListingDetail, FarmerDashboard, BuyerOffers
  components/            Status, UserBar, ListingForm, OfferForm, OfferList
```
