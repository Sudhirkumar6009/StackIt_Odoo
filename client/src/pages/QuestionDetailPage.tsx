
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronUp, ChevronDown, MessageSquare, Calendar, User, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import RichTextEditor from '@/components/RichTextEditor';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

interface Answer {
  id: string;
  content: string;
  author: {
    username: string;
    reputation: number;
  };
  votes: number;
  isAccepted: boolean;
  createdAt: string;
}

interface Question {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
    reputation: number;
  };
  votes: number;
  views: number;
  tags: string[];
  createdAt: string;
  answers: Answer[];
}

const mockQuestion: Question = {
  id: '1',
  title: 'How to use React hooks effectively?',
  content: '<p>I\'m struggling with understanding when and how to use different React hooks. Can someone explain the best practices for using <strong>useState</strong>, <strong>useEffect</strong>, and custom hooks?</p><p>Here\'s what I\'ve tried so far:</p><pre><code>const [count, setCount] = useState(0);\n\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);</code></pre><p>But I\'m not sure if this is the right approach for more complex scenarios.</p>',
  author: { username: 'developer123', reputation: 250 },
  votes: 15,
  views: 127,
  tags: ['react', 'javascript', 'hooks'],
  createdAt: '2024-01-15T10:30:00Z',
  answers: [
    {
      id: '1',
      content: '<p>Great question! Here are some best practices for React hooks:</p><h3>useState</h3><ul><li>Use functional updates when the new state depends on the previous state</li><li>Don\'t call useState inside loops or conditions</li></ul><h3>useEffect</h3><ul><li>Always include dependencies in the dependency array</li><li>Use cleanup functions for side effects</li></ul><p>Here\'s an improved version of your code:</p><pre><code>const [count, setCount] = useState(0);\n\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n  \n  // Cleanup function\n  return () => {\n    document.title = \'React App\';\n  };\n}, [count]);</code></pre>',
      author: { username: 'reactmaster', reputation: 1250 },
      votes: 8,
      isAccepted: true,
      createdAt: '2024-01-15T11:15:00Z'
    },
    {
      id: '2',
      content: '<p>To add to the previous answer, here are some additional tips:</p><ul><li>Create custom hooks to reuse stateful logic</li><li>Use useCallback and useMemo for performance optimization</li><li>Consider useReducer for complex state management</li></ul>',
      author: { username: 'hooksenthusiast', reputation: 780 },
      votes: 3,
      isAccepted: false,
      createdAt: '2024-01-15T14:30:00Z'
    }
  ]
};

const QuestionDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [question] = useState<Question>(mockQuestion);
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = (type: 'up' | 'down', targetType: 'question' | 'answer', targetId?: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote.",
        variant: "destructive",
      });
      return;
    }

    // Mock vote functionality
    toast({
      title: "Vote recorded",
      description: `Your ${type}vote has been recorded.`,
    });
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
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Answer submitted!",
        description: "Your answer has been posted successfully.",
      });
      
      setNewAnswer('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                onClick={() => handleVote('up', 'question')}
                className="p-2"
              >
                <ChevronUp className="h-6 w-6" />
              </Button>
              <span className="text-lg font-semibold">{question.votes}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('down', 'question')}
                className="p-2"
              >
                <ChevronDown className="h-6 w-6" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
              
              <div className="prose max-w-none mb-4" 
                   dangerouslySetInnerHTML={{ __html: question.content }} />
              
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
                  <span>{question.author.username}</span>
                  <span className="text-xs">({question.author.reputation} rep)</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>{question.views} views</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
        </h2>
        
        <div className="space-y-4">
          {question.answers.map((answer) => (
            <Card key={answer.id} className={answer.isAccepted ? 'border-green-200 bg-green-50/50' : ''}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Vote buttons */}
                  <div className="flex flex-col items-center space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote('up', 'answer', answer.id)}
                      className="p-2"
                    >
                      <ChevronUp className="h-6 w-6" />
                    </Button>
                    <span className="text-lg font-semibold">{answer.votes}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote('down', 'answer', answer.id)}
                      className="p-2"
                    >
                      <ChevronDown className="h-6 w-6" />
                    </Button>
                    {answer.isAccepted && (
                      <div className="p-2">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="prose max-w-none mb-4"
                         dangerouslySetInnerHTML={{ __html: answer.content }} />
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{answer.author.username}</span>
                        <span className="text-xs">({answer.author.reputation} rep)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
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
                {isSubmitting ? 'Submitting...' : 'Post Your Answer'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionDetailPage;
