import { NavLink, Route, Routes } from "react-router-dom";
import { UserBar } from "./components/UserBar.jsx";
import { Marketplace } from "./pages/Marketplace.jsx";
import { ListingDetail } from "./pages/ListingDetail.jsx";
import { FarmerDashboard } from "./pages/FarmerDashboard.jsx";
import { BuyerOffers } from "./pages/BuyerOffers.jsx";

export function App() {
  return (
    <>
      <header>
        <strong className="brand">FarmConnect</strong>
        <nav>
          <NavLink to="/" end>
            Marketplace
          </NavLink>
          <NavLink to="/farmer">Farmer dashboard</NavLink>
          <NavLink to="/buyer">My offers</NavLink>
        </nav>
        <UserBar />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/farmer" element={<FarmerDashboard />} />
          <Route path="/buyer" element={<BuyerOffers />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
