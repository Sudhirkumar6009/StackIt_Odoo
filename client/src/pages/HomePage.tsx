import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Eye,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

interface Question {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
    reputation: number;
  };
  votes: number;
  answers: number;
  views: number;
  tags: string[];
  createdAt: string;
  hasAcceptedAnswer: boolean;
}

const mockQuestions: Question[] = [
  {
    id: "1",
    title: "How to use React hooks effectively?",
    content:
      "I'm struggling with understanding when and how to use different React hooks...",
    author: { username: "developer123", reputation: 250 },
    votes: 15,
    answers: 3,
    views: 127,
    tags: ["react", "javascript", "hooks"],
    createdAt: "2024-01-15T10:30:00Z",
    hasAcceptedAnswer: true,
  },
  {
    id: "2",
    title: "Best practices for TypeScript interfaces",
    content:
      "What are the recommended patterns for defining TypeScript interfaces...",
    author: { username: "typescriptpro", reputation: 890 },
    votes: 8,
    answers: 2,
    views: 89,
    tags: ["typescript", "interfaces"],
    createdAt: "2024-01-14T15:45:00Z",
    hasAcceptedAnswer: false,
  },
  {
    id: "3",
    title: "Database design for e-commerce application",
    content:
      "I need help designing a database schema for an e-commerce platform...",
    author: { username: "dbarchitect", reputation: 456 },
    votes: 12,
    answers: 5,
    views: 203,
    tags: ["database", "sql", "design"],
    createdAt: "2024-01-13T09:15:00Z",
    hasAcceptedAnswer: true,
  },
];

const HomePage = () => {
  const [questions] = useState<Question[]>(mockQuestions);
  const [sortBy, setSortBy] = useState<"newest" | "votes" | "activity">(
    "newest"
  );
  const { isLoggedIn, user } = useAuth();

  const sortedQuestions = [...questions].sort((a, b) => {
    switch (sortBy) {
      case "votes":
        return b.votes - a.votes;
      case "activity":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  return (
    <div className="max-w-6xl mx-auto relative">
      <div className="flex justify-between items-center mb-6 mt-12">
        <h1 className="text-2xl font-bold">All Questions</h1>
        <Link to="/ask">
          <Button>Ask Question</Button>
        </Link>
      </div>

      <Tabs
        value={sortBy}
        onValueChange={(value) => setSortBy(value as any)}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="newest">Newest</TabsTrigger>
          <TabsTrigger value="votes">Most Votes</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {sortedQuestions.map((question) => (
          <div
            key={question.id}
            className="border rounded-lg p-6 bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex gap-6">
              {/* Stats */}
              <div className="flex flex-col items-center text-sm text-muted-foreground min-w-[80px]">
                <div className="flex items-center gap-1">
                  <ChevronUp className="h-4 w-4" />
                  <span className="font-medium">{question.votes}</span>
                </div>
                <span>votes</span>

                <div
                  className={`flex items-center gap-1 mt-2 ${
                    question.hasAcceptedAnswer ? "text-green-600" : ""
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">{question.answers}</span>
                </div>
                <span>answers</span>

                <div className="flex items-center gap-1 mt-2">
                  <Eye className="h-4 w-4" />
                  <span className="font-medium">{question.views}</span>
                </div>
                <span>views</span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <Link
                  to={`/questions/${question.id}`}
                  className="hover:text-primary"
                >
                  <h3 className="text-lg font-semibold mb-2 hover:underline">
                    {question.title}
                  </h3>
                </Link>

                <p className="text-muted-foreground mb-3 line-clamp-2">
                  {question.content}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {question.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{question.author.username}</span>
                    <span className="text-xs">
                      ({question.author.reputation} rep)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(question.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
