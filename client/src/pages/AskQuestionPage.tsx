import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RichTextEditor from "@/components/RichTextEditor";
import TagSelector from "@/components/TagSelector";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

const backend = import.meta.env.VITE_BACKEND;

interface Tag {
  value: string;
  label: string;
}

const AskQuestionPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth(); // Now token will be available from context
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to ask a question.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // No need for the localStorage fallback now, but we can keep it for safety
    const authToken = token || localStorage.getItem("token");
    if (!authToken) {
      toast({
        title: "Authentication required",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!title.trim() || !content.trim() || tags.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and select at least one tag.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${backend}/api/questions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          description: content,
          tags: tags.map((tag) => tag.value).join(","),
        }),
      });

      console.log(
        "Sending request with token:",
        authToken.substring(0, 10) + "..."
      );

      if (response.status === 401) {
        toast({
          title: "Authentication failed",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to post question");
      }

      toast({
        title: "Question posted!",
        description: "Your question has been successfully posted.",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Error posting question:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to post question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">
          Please log in to ask a question
        </h1>
        <Button onClick={() => navigate("/login")}>Log In</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your programming question? Be specific."
                className="mt-2"
              />
            </div>

            <div>
              <Label>Content</Label>
              <div className="mt-2">
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Provide details about your question. Include what you've tried and what specific help you need."
                />
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="mt-2">
                <TagSelector
                  selectedTags={tags}
                  onChange={setTags}
                  placeholder="Add up to 5 tags to describe your question"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Add tags to help others find and answer your question
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Question"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AskQuestionPage;
