// Breaks the API on purpose: bad input, wrong farmer, stock races, double accepts.
// Each run uses a fresh copy of the seed data, never the real data/db.json.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = await mkdtemp(path.join(tmpdir(), "farmconnect-"));
process.env.DB_FILE = path.join(dir, "db.json");
const { app } = await import("../src/app.js");

let server;
let base;
before(() => {
  server = app.listen(0);
  base = `http://localhost:${server.address().port}/api`;
});
after(async () => {
  server.close();
  await rm(dir, { recursive: true, force: true });
});

async function call(method, url, body) {
  const res = await fetch(base + url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

const goodListing = { name: "Basmati rice", category: "Cereals", unit: "quintal", pricePerUnit: 4200, available: 10, farmerName: "Ravi" };

async function newListing(overrides = {}) {
  const { status, body } = await call("POST", "/listings", { ...goodListing, ...overrides });
  assert.equal(status, 201);
  return body;
}

test("creates a listing and reads it back", async () => {
  const listing = await newListing();
  const { status, body } = await call("GET", `/listings/${listing.id}`);
  assert.equal(status, 200);
  assert.equal(body.name, "Basmati rice");
});

test("rejects bad listing input with 400 and a clear message", async () => {
  const cases = [
    { name: "" },
    { category: "Gold" },
    { unit: "litre" },
    { pricePerUnit: -5 },
    { pricePerUnit: 10.5 },
    { available: "10" },
    { farmerName: undefined },
  ];
  for (const bad of cases) {
    const { status, body } = await call("POST", "/listings", { ...goodListing, ...bad });
    assert.equal(status, 400, JSON.stringify(bad));
    assert.ok(body.error);
  }
});

test("invalid JSON is a 400, not a crash", async () => {
  const { status } = await call("POST", "/listings", "{not json");
  assert.equal(status, 400);
});

test("unknown ids are 404", async () => {
  assert.equal((await call("GET", "/listings/nope")).status, 404);
  assert.equal((await call("POST", "/offers/nope/accept", { farmerName: "Ravi" })).status, 404);
});

test("a farmer cannot make an offer on their own listing", async () => {
  const listing = await newListing();
  const { status } = await call("POST", "/offers", { listingId: listing.id, buyerName: "Ravi", quantity: 1, pricePerUnit: 4000 });
  assert.equal(status, 400);
});

test("an offer cannot ask for more than the stock", async () => {
  const listing = await newListing({ available: 5 });
  const { status } = await call("POST", "/offers", { listingId: listing.id, buyerName: "Asha", quantity: 6, pricePerUnit: 4000 });
  assert.equal(status, 409);
});

test("accepting reduces stock once; a second accept is refused", async () => {
  const listing = await newListing({ available: 10 });
  const { body: offer } = await call("POST", "/offers", { listingId: listing.id, buyerName: "Asha", quantity: 4, pricePerUnit: 4000 });
  assert.equal((await call("POST", `/offers/${offer.id}/accept`, { farmerName: "Someone" })).status, 403);
  assert.equal((await call("POST", `/offers/${offer.id}/accept`, { farmerName: "Ravi" })).status, 200);
  assert.equal((await call("POST", `/offers/${offer.id}/accept`, { farmerName: "Ravi" })).status, 409);
  assert.equal((await call("GET", `/listings/${listing.id}`)).body.available, 6);
});

test("two offers accepted at the same moment cannot oversell", async () => {
  const listing = await newListing({ available: 5 });
  const make = () => call("POST", "/offers", { listingId: listing.id, buyerName: "Asha", quantity: 4, pricePerUnit: 4000 });
  const [a, b] = [(await make()).body, (await make()).body];
  const results = await Promise.all([a, b].map((o) => call("POST", `/offers/${o.id}/accept`, { farmerName: "Ravi" })));
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  assert.equal((await call("GET", `/listings/${listing.id}`)).body.available, 1);
});
