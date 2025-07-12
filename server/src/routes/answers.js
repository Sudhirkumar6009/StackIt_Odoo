const express = require('express');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');
const { auth, userAuth } = require('../middleware/auth');
const router = express.Router();

// Post answer to question
/*
Example Request:
POST /api/questions/64f8a1b2c3d4e5f6g7h8i9j0/answers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "content": "Async/await is syntactic sugar for promises. Here's how it works:\n\n```javascript\nasync function fetchData() {\n  try {\n    const response = await fetch('/api/data');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}\n```"
}

Example Response:
{
  "_id": "64f8a1b2c3d4e5f6g7h8i9j2",
  "content": "Async/await is syntactic sugar for promises...",
  "userId": {
    "_id": "64f8a1b2c3d4e5f6g7h8i9j3",
    "username": "janedoe"
  },
  "questionId": "64f8a1b2c3d4e5f6g7h8i9j0",
  "votes": [],
  "voteCount": 0,
  "createdAt": "2023-09-06T11:00:00.000Z"
}
*/
router.post('/questions/:questionId/answers', auth, userAuth, async (req, res) => {
  try {
    const { content } = req.body; // Changed from req.query to req.body
    const questionId = req.params.questionId;

    console.log('Received answer submission:', { content, questionId }); // Debug log

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = new Answer({
      content,
      userId: req.user._id,
      questionId
    });

    await answer.save();
    await answer.populate('userId', 'username');

    // Add answer to question
    question.answers.push(answer._id);
    await question.save();

    // Add notification to question author
    if (question.userId.toString() !== req.user._id.toString()) {
      await User.findByIdAndUpdate(question.userId, {
        $push: {
          notifications: {
            type: 'question_answered',
            content: `Someone answered your question: "${question.title}"`,
            link: `/questions/${questionId}`
          }
        }
      });
    }

    res.status(201).json(answer);
  } catch (error) {
    console.error('Error creating answer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Vote on answer
/*
Example Request:
POST /api/answers/64f8a1b2c3d4e5f6g7h8i9j2/vote?vote=1
Authorization: Bearer <token>

Note: 
- vote=1 for upvote, vote=-1 for downvote
- If user already voted the same way, it removes the vote
- If user voted differently, it switches the vote
- User ID is automatically recorded with each vote
*/
router.post('/:id/vote', auth, userAuth, async (req, res) => {
  try {
    const vote = Number(req.query.vote);
    const answerId = req.params.id;
    const userId = req.user._id; // Use authenticated user ID

    if (![1, -1].includes(vote)) {
      return res.status(400).json({ message: 'Vote must be 1 or -1' });
    }

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user already voted
    const existingVoteIndex = answer.votes.findIndex(v => v.userId.toString() === userId.toString());

    if (existingVoteIndex > -1) {
      // User has already voted
      const currentVote = answer.votes[existingVoteIndex].vote;
      
      if (currentVote === vote) {
        // Same vote - remove it (toggle off)
        answer.votes.splice(existingVoteIndex, 1);
      } else {
        // Different vote - switch from upvote to downvote or vice versa
        answer.votes[existingVoteIndex].vote = vote;
      }
    } else {
      // First time voting - add new vote with user ID
      answer.votes.push({ userId, vote });
    }

    await answer.save();
    
    // Return updated vote count and user's current vote status
    const userCurrentVote = answer.votes.find(v => v.userId.toString() === userId.toString());
    
    res.json({ 
      message: 'Vote recorded', 
      voteCount: answer.voteCount,
      userVote: userCurrentVote ? userCurrentVote.vote : null,
      totalVotes: answer.votes.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;
