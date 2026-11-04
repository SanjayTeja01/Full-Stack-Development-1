import express from "express";
import { readDb } from "./db.js";
import { HttpError } from "./errors.js";
import { listings } from "./routes/listings.js";
import { offers } from "./routes/offers.js";

export const app = express();
app.use(express.json({ limit: "10kb" }));

app.get("/api/categories", async (_req, res) => {
  res.json((await readDb()).categories);
});
app.use("/api/listings", listings);
app.use("/api/offers", offers);

app.use("/api", (_req, _res) => {
  throw new HttpError(404, "Unknown API path.");
});

// Known problems get their own status and message; anything else is logged and hidden from the user.
app.use((err, _req, res, _next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Request body is not valid JSON." });
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});
