import { useState } from "react";
import { api, useApi } from "../api.js";

const empty = { name: "", category: "", unit: "quintal", pricePerUnit: "", available: "" };

export function ListingForm({ farmerName, onCreated }) {
  const categories = useApi("/categories");
  const [form, setForm] = useState(empty);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api("/listings", {
        method: "POST",
        body: { ...form, pricePerUnit: Number(form.pricePerUnit), available: Number(form.available), farmerName },
      });
      setForm(empty);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h3>Add a listing</h3>
      <label>
        Produce name
        <input value={form.name} onChange={set("name")} minLength={2} maxLength={80} required />
      </label>
      <label>
        Category
        <select value={form.category} onChange={set("category")} required disabled={!categories.data}>
          <option value="">{categories.error ? "Could not load categories" : "Choose…"}</option>
          {categories.data?.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <div className="row">
        <label>
          Unit
          <select value={form.unit} onChange={set("unit")}>
            <option value="quintal">quintal</option>
            <option value="kg">kg</option>
          </select>
        </label>
        <label>
          Price per unit (₹)
          <input type="number" min="1" step="1" value={form.pricePerUnit} onChange={set("pricePerUnit")} required />
        </label>
        <label>
          Available
          <input type="number" min="1" step="1" value={form.available} onChange={set("available")} required />
        </label>
      </div>
      {error && <p className="alert" role="alert">{error}</p>}
      <button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Publish listing"}
      </button>
    </form>
  );
}
