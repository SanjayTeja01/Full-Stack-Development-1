import { useApi } from "../api.js";
import { OfferList } from "../components/OfferList.jsx";
import { Status } from "../components/Status.jsx";
import { useUser } from "../user.jsx";

export function BuyerOffers() {
  const { user } = useUser();
  const offers = useApi(`/offers?buyer=${encodeURIComponent(user.name)}`);

  return (
    <section>
      <h1>My offers</h1>
      {!user.name ? (
        <p className="muted">Save your name at the top to see your offers.</p>
      ) : (
        <Status loading={offers.loading} error={offers.error} onRetry={offers.reload} empty={offers.data?.length === 0} emptyText="You have not made any offers yet.">
          <OfferList offers={offers.data ?? []} />
        </Status>
      )}
    </section>
  );
}
