import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));

  const value = useMemo(
    () => ({
      token,
      role,
      user,
      login(authToken, authRole, authUser) {
        localStorage.setItem("token", authToken);
        localStorage.setItem("role", authRole);
        localStorage.setItem("user", JSON.stringify(authUser));
        setToken(authToken);
        setRole(authRole);
        setUser(authUser);
      },
      logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        setToken("");
        setRole("");
        setUser(null);
      }
    }),
    [role, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
