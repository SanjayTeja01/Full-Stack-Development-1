import { useState } from "react";
import { api, rupees } from "../api.js";

export function OfferForm({ listing, buyerName, onSent }) {
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(String(listing.pricePerUnit));
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await api("/offers", {
        method: "POST",
        body: { listingId: listing.id, buyerName, quantity: Number(quantity), pricePerUnit: Number(price) },
      });
      setQuantity("");
      onSent();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const total = Number(quantity) * Number(price);

  return (
    <form className="card form" onSubmit={submit}>
      <h3>Make an offer</h3>
      <div className="row">
        <label>
          Quantity ({listing.unit})
          <input type="number" min="1" max={listing.available} step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </label>
        <label>
          Your price per {listing.unit} (₹)
          <input type="number" min="1" step="1" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </label>
      </div>
      {total > 0 && <p className="muted">Total: {rupees(total)}</p>}
      {error && <p className="alert" role="alert">{error}</p>}
      <button type="submit" disabled={sending}>
        {sending ? "Sending…" : "Send offer"}
      </button>
    </form>
  );
}
