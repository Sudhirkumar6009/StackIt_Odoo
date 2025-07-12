import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronUp,
  MessageSquare,
  Eye,
  Calendar,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

const backend = import.meta.env.VITE_BACKEND;

interface Question {
  _id: string;
  title: string;
  description: string;
  userId: {
    _id: string;
    username: string;
  };
  tags: string[];
  votes: Array<{ userId: string; vote: number }>;
  answers: string[];
  acceptedAnswerId?: string;
  voteCount: number;
  createdAt: string;
}

interface ServerResponse {
  questions: Question[];
  totalPages: number;
  currentPage: number;
}

const HomePage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "votes" | "activity">(
    "newest"
  );
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${backend}/api/questions`);

        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }

        const data: ServerResponse = await response.json();
        setQuestions(data.questions);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load questions. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const sortedQuestions = [...questions].sort((a, b) => {
    switch (sortBy) {
      case "votes":
        return b.voteCount - a.voteCount;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <h2 className="text-xl font-bold text-destructive mb-4">
          Something went wrong
        </h2>
        <p className="mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

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

      {sortedQuestions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h2 className="text-xl font-medium mb-2">No questions yet</h2>
          <p className="mb-6 text-muted-foreground">
            Be the first to ask a question!
          </p>
          <Link to="/ask">
            <Button>Ask a Question</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedQuestions.map((question) => (
            <div
              key={question._id}
              className="border rounded-lg p-6 bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex gap-6">
                {/* Stats */}
                <div className="flex flex-col items-center text-sm text-muted-foreground min-w-[80px]">
                  <div className="flex items-center gap-1">
                    <ChevronUp className="h-4 w-4" />
                    <span className="font-medium">{question.voteCount}</span>
                  </div>
                  <span>votes</span>

                  <div
                    className={`flex items-center gap-1 mt-2 ${
                      question.acceptedAnswerId ? "text-green-600" : ""
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-medium">
                      {question.answers.length}
                    </span>
                  </div>
                  <span>answers</span>

                  <div className="flex items-center gap-1 mt-2">
                    <Eye className="h-4 w-4" />
                    <span className="font-medium">0</span>
                  </div>
                  <span>views</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <Link
                    to={`/questions/${question._id}`}
                    className="hover:text-primary"
                  >
                    <h3 className="text-lg font-semibold mb-2 hover:underline">
                      {question.title}
                    </h3>
                  </Link>

                  <p className="text-muted-foreground mb-3 line-clamp-2">
                    {question.description.replace(/<[^>]*>/g, "")}
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
                      <span>{question.userId.username}</span>
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
      )}
    </div>
  );
};

export default HomePage;
