import { createContext, useContext, useState } from "react";

// There is no login in this project (not part of the brief). The name and role only decide
// what the screens show; the server still checks that the farmer name matches the listing.
const UserContext = createContext(null);
const KEY = "farmconnect-user";

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? { name: "", role: "buyer" };
  } catch {
    return { name: "", role: "buyer" };
  }
}

export function UserProvider({ children }) {
  const [user, setUserState] = useState(loadUser);
  const setUser = (next) => {
    setUserState(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
