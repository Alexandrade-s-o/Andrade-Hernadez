import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const getStoredUser = () => {
  const raw = localStorage.getItem("qa_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);

  const login = ({ token, user: authUser }) => {
    localStorage.setItem("qa_token", token);
    localStorage.setItem("qa_user", JSON.stringify(authUser));
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem("qa_token");
    localStorage.removeItem("qa_user");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
