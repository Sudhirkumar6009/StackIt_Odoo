import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, User, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "./NotificationBell";

const backend = import.meta.env.VITE_BACKEND;

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `${backend}/api/questions?search=${encodeURIComponent(
            searchTerm
          )}&limit=10`
        );
        const data = await response.json();
        setSearchResults(data.questions || []);
        setShowDropdown(true);
      } catch (error) {
        setSearchResults([]);
        setShowDropdown(false);
      }
    };

    const debounce = setTimeout(fetchQuestions, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  // Hide dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAskQuestion = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/ask");
  };

  const handleResultClick = (id: string) => {
    setShowDropdown(false);
    setSearchTerm("");
    navigate(`/questions/${id}`);
  };

  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold text-primary">
              StackIt
            </Link>
            <div className="hidden md:flex relative" ref={dropdownRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search questions..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
              />
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 top-full left-0 w-64 bg-white border rounded shadow mt-1 max-h-64 overflow-auto">
                  {searchResults.map((q: any) => (
                    <div
                      key={q._id}
                      className="px-4 py-2 hover:bg-muted cursor-pointer"
                      onClick={() => handleResultClick(q._id)}
                    >
                      <div className="font-medium">{q.title}</div>
                    </div>
                  ))}
                </div>
              )}
              {showDropdown && searchResults.length === 0 && (
                <div className="absolute z-10 top-full left-0 w-64 bg-white border rounded shadow mt-1 px-4 py-2 text-muted-foreground">
                  No questions found.
                </div>
              )}
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
