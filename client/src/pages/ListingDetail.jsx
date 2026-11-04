import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { rupees, useApi } from "../api.js";
import { Status } from "../components/Status.jsx";
import { OfferForm } from "../components/OfferForm.jsx";
import { useUser } from "../user.jsx";

export function ListingDetail() {
  const { id } = useParams();
  const { user } = useUser();
  const listing = useApi(`/listings/${id}`);
  const [sent, setSent] = useState(false);
  const l = listing.data;

  let offerArea = null;
  if (l) {
    if (user.role !== "buyer") offerArea = <p className="muted">Switch to Buyer at the top to make an offer.</p>;
    else if (!user.name) offerArea = <p className="muted">Enter and save your name at the top to make an offer.</p>;
    else if (user.name === l.farmerName) offerArea = <p className="muted">This is your own listing.</p>;
    else if (l.available === 0) offerArea = <p className="muted">This listing is sold out.</p>;
    else if (sent)
      offerArea = (
        <p className="success">
          Offer sent. Track it on <Link to="/buyer">My offers</Link>.
        </p>
      );
    else offerArea = <OfferForm listing={l} buyerName={user.name} onSent={() => setSent(true)} />;
  }

  return (
    <section>
      <Link to="/">← Back to marketplace</Link>
      <Status loading={listing.loading} error={listing.error} onRetry={listing.reload}>
        {l && (
          <>
            <h1>{l.name}</h1>
            <p className="muted">
              {l.category} · listed by {l.farmerName} on {new Date(l.createdAt).toLocaleDateString("en-IN")}
            </p>
            <p>
              <strong>{rupees(l.pricePerUnit)}</strong> per {l.unit} · {l.available} {l.unit} available
            </p>
            {offerArea}
          </>
        )}
      </Status>
    </section>
  );
}
