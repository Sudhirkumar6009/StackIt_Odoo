import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null; // Added token to the interface
  setLogin: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // Added token state

  // Check if user is already logged in on app load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (storedToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setIsLoggedIn(true);
        setUser(parsedUser);
        setToken(storedToken); // Set the token in state
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const setLogin = (newToken: string, userData: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsLoggedIn(true);
    setUser(userData);
    setToken(newToken); // Set the token in state
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setToken(null); // Clear the token from state
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, setLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
