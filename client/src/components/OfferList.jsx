import { rupees } from "../api.js";

/** A table of offers. `actions` renders extra buttons for a row (used on the farmer dashboard). */
export function OfferList({ offers, showBuyer, actions }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Produce</th>
          {showBuyer ? <th>Buyer</th> : <th>Farmer</th>}
          <th>Quantity</th>
          <th>Price</th>
          <th>Status</th>
          {actions && <th />}
        </tr>
      </thead>
      <tbody>
        {offers.map((o) => (
          <tr key={o.id}>
            <td>{o.listingName}</td>
            <td>{showBuyer ? o.buyerName : o.farmerName}</td>
            <td>
              {o.quantity} {o.unit}
            </td>
            <td>{rupees(o.pricePerUnit)}</td>
            <td>
              <span className={`badge ${o.status}`}>{o.status}</span>
            </td>
            {actions && <td>{actions(o)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
