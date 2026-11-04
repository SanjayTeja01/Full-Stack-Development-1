# Team guide: who owns what

This code was written with an AI assistant as a starting point. The course allows any tool, but **you own every line you push**, and 40 marks are a code read. So each member brings in their own part on their own branch, from their own GitHub account. Before you commit, you:

1. **Read** every line. Change anything you would write differently, and delete anything you cannot explain.
2. **Run** it.
3. **Break it:** wrong input, server stopped, page refreshed.
4. **Commit** with a message that says what changed and why.

Then open a pull request. **The reviewer named below must read it, leave at least one comment, and merge it.** Nobody merges their own pull request.

If your course asks you to say how AI was used, say so honestly in your report.

## Setup (everyone, once)

```bash
git config --global user.name "Your Name"
git config --global user.email "the-email-on-your-github-account"
git clone https://github.com/<owner>/farmconnect.git
```

For each task:

```bash
git checkout main
git pull
git checkout -b <branch-name>
# make your changes, then:
git add <your files>
git commit -m "<what and why>"
git push -u origin <branch-name>
```

Then open a pull request on GitHub.

## The five parts (merge in this order)

| # | Member | Branch(es) | Files | Reviewer |
|---|---|---|---|---|
| 1 | Member 1 | `server-setup` | `.gitignore`, `server/package.json`, `server/src/index.js`, `server/src/app.js` (only the categories route and error handling at first), `db.js`, `errors.js`, `validate.js`, `server/data/seed.json` | Member 2 |
| 2 | Member 2 | `listings-api` | `server/src/routes/listings.js`, plus the `app.use("/api/listings", …)` line in `app.js` | Member 3 |
| 3 | Member 3 | `offers-api`, then `api-tests` | `server/src/routes/offers.js`, plus its `app.use` line, then `server/test/api.test.js` | Member 4 |
| 4 | Member 4 | `client-setup`, then `marketplace` | `client/package.json`, `vite.config.js`, `index.html`, `main.jsx`, `App.jsx` (Marketplace route only), `styles.css`, `api.js`, `user.jsx`, `UserBar.jsx`, `Status.jsx`, then `Marketplace.jsx` | Member 5 |
| 5 | Member 5 | `listing-and-offers`, `farmer-dashboard`, `readme` | `ListingDetail.jsx`, `OfferForm.jsx`, then `ListingForm.jsx`, `OfferList.jsx`, `FarmerDashboard.jsx`, `BuyerOffers.jsx` and their routes in `App.jsx`, then `README.md` | Member 1 |

Members 4 and 5 can start the website while Members 2 and 3 finish the API. The paths are fixed in the README's API table.

## Be ready to explain (code read)

- **Member 1:**
  - Why `updateDb` uses a queue: two requests at once must not both read the old stock.
  - Why it writes a `.tmp` file and then renames it.
  - How the error handler turns `HttpError` into a status code, and why unknown errors become a 500 with no details.
- **Member 2:**
  - What each check in `validate.js` stops.
  - Why prices are whole rupees.
  - How the `q` and `category` filters work.
  - Why the response is sorted newest first.
- **Member 3:**
  - Every 400, 403, 404 and 409 in `offers.js`, and when each one happens.
  - Why accept checks the stock again: it may have been sold since the offer was made.
  - How the "two accepts at once" test proves the queue works.
- **Member 4:**
  - What `useApi` returns, and when it fetches again.
  - Where the loading, empty and error states come from (`Status.jsx`).
  - Why there is no login, and what `user.jsx` saves in `localStorage`.
- **Member 5:**
  - How the offer form sends whole numbers.
  - Why the dashboard reloads both lists after Accept.
  - Why the README lists only what works, including the "What it does not do" section.

## Demo script (one flow, about 2 minutes)

1. Choose **Farmer** at the top, type "Ravi" and click Save. On **Farmer dashboard**, add "Sona Masoori rice", Cereals, quintal, ₹3800, 20 available.
2. In a private window, choose **Buyer**, type "Asha" and click Save. Open the listing and offer 8 quintal at ₹3700.
3. Back in the first window, refresh the page. The offer is there. Click **Accept**. The stock drops from 20 to 12.
4. Refresh both windows. Everything is still there, because it is saved in the JSON file.
5. Break it on purpose: try to accept the same offer again (it is refused), or stop the server and show the error message with "Try again".
