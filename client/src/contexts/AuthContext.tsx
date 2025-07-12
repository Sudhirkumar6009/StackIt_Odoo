import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface User {
  _id?: string; // Add _id as optional since it comes from server
  id: string;
  username: string;
  email: string;
  role?: string;
  banned?: boolean; // Add banned field
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  loading: boolean; // Add loading state to interface
  setLogin: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser) {
          const userData = JSON.parse(savedUser);
          console.log("Loaded user data:", userData);

          // Ensure the user object has the correct ID field
          if (userData._id && !userData.id) {
            userData.id = userData._id;
          }

          setToken(savedToken);
          setUser(userData);
          setIsLoggedIn(true); // Set isLoggedIn to true when user data is loaded
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const setLogin = (newToken: string, userData: User) => {
    console.log("Setting login with user data:", userData);

    // Ensure the user object has both _id and id fields
    const processedUserData = { ...userData };
    if (userData._id && !userData.id) {
      processedUserData.id = userData._id;
    }
    if (userData.id && !userData._id) {
      processedUserData._id = userData.id;
    }

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(processedUserData));
    setIsLoggedIn(true);
    setUser(processedUserData);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
  };

  // Update isLoggedIn based on user state
  useEffect(() => {
    setIsLoggedIn(!!user && !!token);
  }, [user, token]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, token, loading, setLogin, logout }}
    >
      {!loading && children}
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
