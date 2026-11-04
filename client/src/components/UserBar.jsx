import { useState } from "react";
import { useUser } from "../user.jsx";

export function UserBar() {
  const { user, setUser } = useUser();
  const [name, setName] = useState(user.name);

  const save = (e) => {
    e.preventDefault();
    setUser({ ...user, name: name.trim() });
  };

  return (
    <form className="userbar" onSubmit={save}>
      <label>
        I am a
        <select value={user.role} onChange={(e) => setUser({ ...user, role: e.target.value })}>
          <option value="buyer">Buyer</option>
          <option value="farmer">Farmer</option>
        </select>
      </label>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" minLength={2} maxLength={60} required />
      </label>
      <button type="submit" disabled={name.trim() === user.name}>
        Save
      </button>
    </form>
  );
}
