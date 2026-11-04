import { Router } from "express";
import { randomUUID } from "node:crypto";
import { readDb, updateDb } from "../db.js";
import { HttpError } from "../errors.js";
import { positiveWhole, text } from "../validate.js";

export const offers = Router();

offers.get("/", async (req, res) => {
  const { offers: all } = await readDb();
  const { buyer, farmer, listingId } = req.query;
  const result = all
    .filter((o) => typeof buyer !== "string" || o.buyerName === buyer)
    .filter((o) => typeof farmer !== "string" || o.farmerName === farmer)
    .filter((o) => typeof listingId !== "string" || o.listingId === listingId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(result);
});

offers.post("/", async (req, res) => {
  const body = req.body ?? {};
  const offer = await updateDb((data) => {
    const listing = data.listings.find((l) => l.id === body.listingId);
    if (!listing) throw new HttpError(404, "Listing not found.");
    const buyerName = text(body.buyerName, "Buyer name", 2, 60);
    if (buyerName === listing.farmerName) throw new HttpError(400, "You cannot make an offer on your own listing.");
    const quantity = positiveWhole(body.quantity, "Quantity");
    if (quantity > listing.available) {
      throw new HttpError(409, `Only ${listing.available} ${listing.unit} available.`);
    }
    const created = {
      id: randomUUID(),
      listingId: listing.id,
      listingName: listing.name,
      unit: listing.unit,
      farmerName: listing.farmerName,
      buyerName,
      quantity,
      pricePerUnit: positiveWhole(body.pricePerUnit, "Price per unit"),
      status: "pending",
      createdAt: new Date().toISOString(),
      decidedAt: null,
    };
    data.offers.push(created);
    return created;
  });
  res.status(201).json(offer);
});

/** Shared checks for accept and reject: the offer exists, is still pending, and the caller listed it. */
function findPendingOffer(data, id, farmerName) {
  const offer = data.offers.find((o) => o.id === id);
  if (!offer) throw new HttpError(404, "Offer not found.");
  if (text(farmerName, "Farmer name", 2, 60) !== offer.farmerName) {
    throw new HttpError(403, "Only the farmer who listed this can answer the offer.");
  }
  if (offer.status !== "pending") throw new HttpError(409, `This offer was already ${offer.status}.`);
  return offer;
}

offers.post("/:id/accept", async (req, res) => {
  const offer = await updateDb((data) => {
    const found = findPendingOffer(data, req.params.id, req.body?.farmerName);
    const listing = data.listings.find((l) => l.id === found.listingId);
    // Stock may have gone to another buyer since this offer was made.
    if (!listing || listing.available < found.quantity) {
      throw new HttpError(409, "Not enough stock left to accept this offer.");
    }
    listing.available -= found.quantity;
    found.status = "accepted";
    found.decidedAt = new Date().toISOString();
    return found;
  });
  res.json(offer);
});

offers.post("/:id/reject", async (req, res) => {
  const offer = await updateDb((data) => {
    const found = findPendingOffer(data, req.params.id, req.body?.farmerName);
    found.status = "rejected";
    found.decidedAt = new Date().toISOString();
    return found;
  });
  res.json(offer);
});
