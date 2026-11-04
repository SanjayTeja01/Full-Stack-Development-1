import { useState } from "react";
import { api, rupees, useApi } from "../api.js";
import { ListingForm } from "../components/ListingForm.jsx";
import { OfferList } from "../components/OfferList.jsx";
import { Status } from "../components/Status.jsx";
import { useUser } from "../user.jsx";

export function FarmerDashboard() {
  const { user } = useUser();
  if (user.role !== "farmer" || !user.name) {
    return (
      <section>
        <h1>Farmer dashboard</h1>
        <p className="muted">Choose Farmer at the top and save your name to manage your listings.</p>
      </section>
    );
  }
  return <Dashboard farmerName={user.name} />;
}

function Dashboard({ farmerName }) {
  const name = encodeURIComponent(farmerName);
  const listings = useApi(`/listings?farmer=${name}`);
  const offers = useApi(`/offers?farmer=${name}`);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const answer = async (offerId, action) => {
    setBusyId(offerId);
    setActionError(null);
    try {
      await api(`/offers/${offerId}/${action}`, { method: "POST", body: { farmerName } });
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
      // Reload both: accepting an offer changes the listing's stock too.
      offers.reload();
      listings.reload();
    }
  };

  return (
    <section>
      <h1>Farmer dashboard</h1>
      <ListingForm farmerName={farmerName} onCreated={listings.reload} />

      <h2>My listings</h2>
      <Status loading={listings.loading} error={listings.error} onRetry={listings.reload} empty={listings.data?.length === 0} emptyText="You have no listings yet.">
        <table>
          <thead>
            <tr>
              <th>Produce</th>
              <th>Price</th>
              <th>Available</th>
            </tr>
          </thead>
          <tbody>
            {listings.data?.map((l) => (
              <tr key={l.id}>
                <td>{l.name}</td>
                <td>
                  {rupees(l.pricePerUnit)} / {l.unit}
                </td>
                <td>
                  {l.available} {l.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Status>

      <h2>Offers on my produce</h2>
      {actionError && <p className="alert" role="alert">{actionError}</p>}
      <Status loading={offers.loading} error={offers.error} onRetry={offers.reload} empty={offers.data?.length === 0} emptyText="No offers yet.">
        <OfferList
          offers={offers.data ?? []}
          showBuyer
          actions={(o) =>
            o.status === "pending" && (
              <div className="actions">
                <button disabled={busyId === o.id} onClick={() => answer(o.id, "accept")}>
                  Accept
                </button>
                <button className="secondary" disabled={busyId === o.id} onClick={() => answer(o.id, "reject")}>
                  Reject
                </button>
              </div>
            )
          }
        />
      </Status>
    </section>
  );
}
