import { Router } from "express";
import { randomUUID } from "node:crypto";
import { readDb, updateDb } from "../db.js";
import { HttpError } from "../errors.js";
import { UNITS, oneOf, positiveWhole, text } from "../validate.js";

export const listings = Router();

listings.get("/", async (req, res) => {
  const { listings: all } = await readDb();
  const q = typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";
  const category = typeof req.query.category === "string" ? req.query.category : "";
  const farmer = typeof req.query.farmer === "string" ? req.query.farmer : "";
  const result = all
    .filter((l) => !q || l.name.toLowerCase().includes(q))
    .filter((l) => !category || l.category === category)
    .filter((l) => !farmer || l.farmerName === farmer)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(result);
});

listings.get("/:id", async (req, res) => {
  const { listings: all } = await readDb();
  const listing = all.find((l) => l.id === req.params.id);
  if (!listing) throw new HttpError(404, "Listing not found.");
  res.json(listing);
});

listings.post("/", async (req, res) => {
  const body = req.body ?? {};
  const listing = await updateDb((data) => {
    const created = {
      id: randomUUID(),
      name: text(body.name, "Name", 2, 80),
      category: oneOf(body.category, "Category", data.categories),
      unit: oneOf(body.unit, "Unit", UNITS),
      pricePerUnit: positiveWhole(body.pricePerUnit, "Price per unit"),
      available: positiveWhole(body.available, "Available quantity"),
      farmerName: text(body.farmerName, "Farmer name", 2, 60),
      createdAt: new Date().toISOString(),
    };
    data.listings.push(created);
    return created;
  });
  res.status(201).json(listing);
});
