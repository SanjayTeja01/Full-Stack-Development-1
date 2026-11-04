import { useState } from "react";
import { Link } from "react-router-dom";
import { rupees, useApi } from "../api.js";
import { Status } from "../components/Status.jsx";

export function Marketplace() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const categories = useApi("/categories");
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (category) params.set("category", category);
  const listings = useApi(`/listings?${params}`);

  return (
    <section>
      <h1>Marketplace</h1>
      <div className="filters">
        <input type="search" placeholder="Search produce" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search produce" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {categories.data?.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <Status
        loading={listings.loading}
        error={listings.error}
        onRetry={listings.reload}
        empty={listings.data?.length === 0}
        emptyText={q || category ? "No listings match your search." : "No produce listed yet. Farmers can add listings from their dashboard."}
      >
        <ul className="grid">
          {listings.data?.map((l) => (
            <li key={l.id} className="card">
              <Link to={`/listings/${l.id}`}>
                <h3>{l.name}</h3>
              </Link>
              <p className="muted">
                {l.category} · by {l.farmerName}
              </p>
              <p>
                <strong>{rupees(l.pricePerUnit)}</strong> per {l.unit}
              </p>
              <p className={l.available === 0 ? "alert-text" : "muted"}>
                {l.available === 0 ? "Sold out" : `${l.available} ${l.unit} available`}
              </p>
            </li>
          ))}
        </ul>
      </Status>
    </section>
  );
}
