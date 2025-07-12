import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, User, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "./NotificationBell";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAskQuestion = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/ask");
  };

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold text-primary">
              StackIt
            </Link>
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search questions..." className="pl-10 w-64" />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={handleAskQuestion}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ask Question
            </Button>

            {user ? (
              <div className="flex items-center space-x-3">
                <NotificationBell />
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{user.username}</span>
                  {user.role && (
                    <span className="text-xs px-2 py-1 bg-muted rounded-full">
                      {user.role}
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
