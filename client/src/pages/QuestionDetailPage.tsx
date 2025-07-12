import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronUp,
  ChevronDown,
  Calendar,
  User,
  Check,
  Loader2,
  Trash2,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import RichTextEditor from "@/components/RichTextEditor";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { useNotifications } from "@/hooks/useNotifications";

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
  const { createNotification } = useNotifications();
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

    console.log('Accept button clicked');
    console.log('Current user:', user);
    console.log('Question author:', question.userId);
    console.log('User ID comparison:', question.userId._id, '===', user.id);

    // Check if user is the question author - fix the comparison
    if (question.userId._id !== user.id) {
      toast({
        title: "Permission denied",
        description: "Only the question author can accept answers",
        variant: "destructive",
      });
      return;
    }

    // Check if there's already an accepted answer
    if (question.acceptedAnswerId) {
      toast({
        title: "Answer already accepted",
        description: "This question already has an accepted answer",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Sending accept request...');
      const response = await fetch(
        `${backend}/api/questions/${id}/accept/${answerId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to accept answer");
      }

      // Update local state
      setQuestion({
        ...question,
        acceptedAnswerId: answerId,
      });

      // Create notification for answer author
      const acceptedAnswer = question.answers.find((a) => a._id === answerId);
      if (acceptedAnswer && acceptedAnswer.userId._id !== user.id) {
        try {
          await createNotification(
            acceptedAnswer.userId._id,
            "answer_accepted",
            `Your answer to "${question.title}" was accepted!`,
            `/questions/${question._id}`
          );
        } catch (notifError) {
          console.log('Notification creation failed, but answer was accepted');
        }
      }

      toast({
        title: "Answer accepted",
        description: "You have marked this answer as accepted.",
      });
    } catch (error: any) {
      console.error('Error accepting answer:', error);
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
      console.log('Submitting answer for question:', id);
      console.log('Answer content:', newAnswer);
      console.log('Token available:', !!localStorage.getItem("token"));

      const response = await fetch(`${backend}/api/questions/${id}/answers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newAnswer }),
      });

      console.log('Response status:', response.status);
      console.log('Response URL:', response.url);
      
      if (response.status === 404) {
        throw new Error("Route not found. Please check the server configuration.");
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit answer");
      }

      // Refresh question to get updated answers
      const questionResponse = await fetch(`${backend}/api/questions/${id}`);
      if (questionResponse.ok) {
        const questionData = await questionResponse.json();
        setQuestion(questionData);
      }

      // Create notification for question author if it's not their own question
      if (question && question.userId._id !== user.id) {
        try {
          await createNotification(
            question.userId._id,
            "question_answered",
            `Someone answered your question: "${question.title}"`,
            `/questions/${question._id}`
          );
        } catch (notifError) {
          console.log('Notification creation failed, but answer was posted');
        }
      }

      toast({
        title: "Answer submitted!",
        description: "Your answer has been posted successfully.",
      });

      setNewAnswer("");
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit answer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!user || user.role !== 'admin') return;
    
    if (!confirm('Are you sure you want to delete this question and all its answers? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${backend}/api/questions/${id}/admin-delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      toast({
        title: "Question deleted",
        description: "The question and all its answers have been deleted.",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!user || user.role !== 'admin') return;
    
    if (!confirm('Are you sure you want to delete this answer? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${backend}/api/questions/${id}/answers/${answerId}/admin-delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete answer');
      }

      // Refresh question to get updated answers
      const questionResponse = await fetch(`${backend}/api/questions/${id}`);
      if (questionResponse.ok) {
        const questionData = await questionResponse.json();
        setQuestion(questionData);
      }

      toast({
        title: "Answer deleted",
        description: "The answer has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete answer",
        variant: "destructive",
      });
    }
  };

  const handleBanUser = async (userId: string, username: string) => {
    if (!user || user.role !== 'admin') return;
    
    if (!confirm(`Are you sure you want to ban user "${username}"? This will prevent them from logging in.`)) {
      return;
    }

    try {
      const response = await fetch(`${backend}/api/admin/ban-user/${userId}?banned=true`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to ban user');
      }

      toast({
        title: "User banned",
        description: `User "${username}" has been banned successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to ban user",
        variant: "destructive",
      });
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
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold flex-1">{question.title}</h1>
                {user && user.role === 'admin' && (
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteQuestion}
                      className="flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Question</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBanUser(question.userId._id, question.userId.username)}
                      className="flex items-center space-x-1 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <UserX className="h-4 w-4" />
                      <span>Ban User</span>
                    </Button>
                  </div>
                )}
              </div>

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
                    
                    {/* Accepted answer check mark */}
                    {question.acceptedAnswerId === answer._id && (
                      <div className="p-2">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                    )}
                    
                    {/* Accept button - fix the user ID comparison */}
                    {user && 
                     question.userId._id === user.id && 
                     !question.acceptedAnswerId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-800 border border-green-600"
                          onClick={() => {
                            console.log('Accept button clicked for answer:', answer._id);
                            handleAcceptAnswer(answer._id);
                          }}
                        >
                          ✓ Accept
                        </Button>
                      )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="prose max-w-none flex-1"
                        dangerouslySetInnerHTML={{ __html: answer.content }}
                      />
                      {user && user.role === 'admin' && (
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteAnswer(answer._id)}
                            className="flex items-center space-x-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBanUser(answer.userId._id, answer.userId.username)}
                            className="flex items-center space-x-1 text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <UserX className="h-4 w-4" />
                            <span>Ban</span>
                          </Button>
                        </div>
                      )}
                    </div>

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
