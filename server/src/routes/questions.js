const express = require('express');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');
const { auth, userAuth } = require('../middleware/auth');
const router = express.Router();

// Get all questions
/*
Example Request:
GET /api/questions?page=1&limit=10&tags=javascript,react&search=async

Example Response:
{
  "questions": [
    {
      "_id": "64f8a1b2c3d4e5f6g7h8i9j0",
      "title": "How to use async/await in JavaScript?",
      "description": "I'm having trouble understanding async/await...",
      "tags": ["javascript", "async"],
      "userId": {
        "_id": "64f8a1b2c3d4e5f6g7h8i9j1",
        "username": "johndoe"
      },
      "acceptedAnswerId": null,
      "voteCount": 5,
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  ],
  "totalPages": 3,
  "currentPage": 1
}
*/
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, tags, search } = req.query;
    const query = {};

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await Question.find(query)
      .populate('userId', 'username')
      .populate('acceptedAnswerId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single question with answers
/*
Example Request:
GET /api/questions/64f8a1b2c3d4e5f6g7h8i9j0

Example Response:
{
  "_id": "64f8a1b2c3d4e5f6g7h8i9j0",
  "title": "How to use async/await in JavaScript?",
  "description": "I'm having trouble understanding async/await...",
  "tags": ["javascript", "async"],
  "userId": {
    "_id": "64f8a1b2c3d4e5f6g7h8i9j1",
    "username": "johndoe"
  },
  "answers": [
    {
      "_id": "64f8a1b2c3d4e5f6g7h8i9j2",
      "content": "Async/await is syntactic sugar for promises...",
      "userId": {
        "_id": "64f8a1b2c3d4e5f6g7h8i9j3",
        "username": "janedoe"
      },
      "voteCount": 3,
      "createdAt": "2023-09-06T11:00:00.000Z"
    }
  ],
  "acceptedAnswerId": null,
  "voteCount": 5,
  "createdAt": "2023-09-06T10:30:00.000Z"
}
*/
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('userId', 'username')
      .populate({
        path: 'answers',
        populate: { path: 'userId', select: 'username' }
      })
      .populate('acceptedAnswerId');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create question
/*
Example Request:
POST /api/questions?title=How%20to%20use%20async%2Fawait%20in%20JavaScript%3F&description=I'm%20having%20trouble%20understanding%20async%2Fawait%20syntax%20and%20how%20it%20differs%20from%20promises.%20Can%20someone%20explain%20with%20examples%3F&tags=javascript,async,promises
Authorization: Bearer <token>
*/
router.post('/', auth, userAuth, async (req, res) => {
  try {
    const { title, description, tags } = req.query;
    

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const question = new Question({
      title,
      description,
      tags: tags ? tags.split(',') : [],
      userId: req.user._id
    });

    await question.save();
    await question.populate('userId', 'username');

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Vote on question
/*
Example Request:
POST /api/questions/64f8a1b2c3d4e5f6g7h8i9j0/vote?vote=1
Authorization: Bearer <token>
*/
router.post('/:id/vote', auth, userAuth, async (req, res) => {
  try {
    const vote = Number(req.query.vote); // 1 for upvote, -1 for downvote
    const questionId = req.params.id;
    const userId = req.user._id;

    if (![1, -1].includes(vote)) {
      return res.status(400).json({ message: 'Vote must be 1 or -1' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user already voted
    const existingVoteIndex = question.votes.findIndex(v => v.userId.toString() === userId.toString());

    if (existingVoteIndex > -1) {
      // Update existing vote or remove if same vote
      if (question.votes[existingVoteIndex].vote === vote) {
        question.votes.splice(existingVoteIndex, 1);
      } else {
        question.votes[existingVoteIndex].vote = vote;
      }
    } else {
      // Add new vote
      question.votes.push({ userId, vote });
    }

    await question.save();
    res.json({ message: 'Vote recorded', voteCount: question.voteCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept answer
/*
Example Request:
POST /api/questions/64f8a1b2c3d4e5f6g7h8i9j0/accept/64f8a1b2c3d4e5f6g7h8i9j2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Note: Only the question author can accept answers

Example Response:
{
  "message": "Answer accepted successfully"
}
*/
router.post('/:id/accept/:answerId', auth, userAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only question author can accept answers' });
    }

    const answer = await Answer.findById(req.params.answerId);
    if (!answer || answer.questionId.toString() !== question._id.toString()) {
      return res.status(404).json({ message: 'Answer not found for this question' });
    }

    question.acceptedAnswerId = req.params.answerId;
    await question.save();

    // Add notification to answer author
    await User.findByIdAndUpdate(answer.userId, {
      $push: {
        notifications: {
          type: 'answer_accepted',
          content: 'Your answer was accepted!',
          link: `/questions/${question._id}`
        }
      }
    });

    res.json({ message: 'Answer accepted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
router.post('/:id/accept/:answerId', auth, userAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only question author can accept answers' });
    }

    const answer = await Answer.findById(req.params.answerId);
    if (!answer || answer.questionId.toString() !== question._id.toString()) {
      return res.status(404).json({ message: 'Answer not found for this question' });
    }

    question.acceptedAnswerId = req.params.answerId;
    await question.save();

    // Add notification to answer author
    await User.findByIdAndUpdate(answer.userId, {
      $push: {
        notifications: {
          type: 'answer_accepted',
          content: 'Your answer was accepted!',
          link: `/questions/${question._id}`
        }
      }
    });

    res.json({ message: 'Answer accepted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
