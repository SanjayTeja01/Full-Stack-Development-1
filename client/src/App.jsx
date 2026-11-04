import { NavLink, Route, Routes } from "react-router-dom";
import { UserBar } from "./components/UserBar.jsx";
import { Marketplace } from "./pages/Marketplace.jsx";

export function App() {
  return (
    <>
      <header>
        <strong className="brand">FarmConnect</strong>
        <nav>
          <NavLink to="/" end>
            Marketplace
          </NavLink>
        </nav>
        <UserBar />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
