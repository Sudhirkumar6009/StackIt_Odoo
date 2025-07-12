import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronUp,
  ChevronDown,
  Calendar,
  User,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import RichTextEditor from "@/components/RichTextEditor";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

const backend = import.meta.env.VITE_BACKEND;

interface User {
  _id: string;
  username: string;
}

// Make sure you're using this interface and not a different User interface from another file

interface Answer {
  _id: string;
  content: string;
  userId: {
    _id: string;
    username: string;
  };
  voteCount: number;
  createdAt: string;
}

interface Question {
  _id: string;
  title: string;
  description: string;
  userId: {
    _id: string;
    username: string;
  };
  tags: string[];
  voteCount: number;
  createdAt: string;
  answers: Answer[];
  acceptedAnswerId?: string;
}

const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${backend}/api/questions/${id}`);

        if (!response.ok) {
          throw new Error("Question not found");
        }

        const data = await response.json();
        setQuestion(data);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load question details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionDetails();
  }, [id]);

  const handleVote = async (
    type: "up" | "down",
    targetType: "question" | "answer",
    targetId?: string
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote.",
        variant: "destructive",
      });
      return;
    }

    try {
      const voteValue = type === "up" ? 1 : -1;
      const endpoint =
        targetType === "question"
          ? `${backend}/api/questions/${id}/vote?vote=${voteValue}`
          : `${backend}/api/answers/${targetId}/vote?vote=${voteValue}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register vote");
      }

      // Update local state to reflect the vote
      if (targetType === "question" && question) {
        setQuestion({
          ...question,
          voteCount: data.voteCount,
        });
      } else if (question) {
        const updatedAnswers = question.answers.map((answer) =>
          answer._id === targetId
            ? { ...answer, voteCount: data.voteCount }
            : answer
        );
        setQuestion({
          ...question,
          answers: updatedAnswers,
        });
      }

      toast({
        title: "Vote recorded",
        description: `Your ${type}vote has been recorded.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register vote",
        variant: "destructive",
      });
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user || !question) return;

    // Check if user is the question author
    if (!question.userId._id) {
      toast({
        title: "Permission denied",
        description: "Only the question author can accept answers",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${backend}/api/questions/${id}/accept/${answerId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to accept answer");
      }

      // Update local state
      setQuestion({
        ...question,
        acceptedAnswerId: answerId,
      });

      toast({
        title: "Answer accepted",
        description: "You have marked this answer as accepted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept answer",
        variant: "destructive",
      });
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit an answer.",
        variant: "destructive",
      });
      return;
    }

    if (!newAnswer.trim()) {
      toast({
        title: "Empty answer",
        description: "Please write your answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${backend}/api/questions/${id}/answers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newAnswer }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit answer");
      }

      // Refresh question to get updated answers
      const questionResponse = await fetch(`${backend}/api/questions/${id}`);
      const questionData = await questionResponse.json();
      setQuestion(questionData);

      toast({
        title: "Answer submitted!",
        description: "Your answer has been posted successfully.",
      });

      setNewAnswer("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit answer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-xl font-bold text-destructive mb-4">
          Question not found
        </h2>
        <p className="mb-6">{error}</p>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Question */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Vote buttons */}
            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote("up", "question")}
                className="p-2"
              >
                <ChevronUp className="h-6 w-6" />
              </Button>
              <span className="text-lg font-semibold">
                {question.voteCount}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote("down", "question")}
                className="p-2"
              >
                <ChevronDown className="h-6 w-6" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">{question.title}</h1>

              <div
                className="prose max-w-none mb-4"
                dangerouslySetInnerHTML={{ __html: question.description }}
              />

              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
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
        </CardContent>
      </Card>

      {/* Answers */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {question.answers.length} Answer
          {question.answers.length !== 1 ? "s" : ""}
        </h2>

        <div className="space-y-4">
          {question.answers.map((answer) => (
            <Card
              key={answer._id}
              className={
                question.acceptedAnswerId === answer._id
                  ? "border-green-200 bg-green-50/50"
                  : ""
              }
            >
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Vote buttons */}
                  <div className="flex flex-col items-center space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote("up", "answer", answer._id)}
                      className="p-2"
                    >
                      <ChevronUp className="h-6 w-6" />
                    </Button>
                    <span className="text-lg font-semibold">
                      {answer.voteCount}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote("down", "answer", answer._id)}
                      className="p-2"
                    >
                      <ChevronDown className="h-6 w-6" />
                    </Button>
                    {question.acceptedAnswerId === answer._id && (
                      <div className="p-2">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                    )}
                    {user &&
                      question.userId._id == user.id &&
                      !question.acceptedAnswerId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-800"
                          onClick={() => handleAcceptAnswer(answer._id)}
                        >
                          Accept
                        </Button>
                      )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div
                      className="prose max-w-none mb-4"
                      dangerouslySetInnerHTML={{ __html: answer.content }}
                    />

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{answer.userId.username}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(answer.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Answer form */}
      {user && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <RichTextEditor
                content={newAnswer}
                onChange={setNewAnswer}
                placeholder="Write your answer here..."
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Post Your Answer"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionDetailPage;
