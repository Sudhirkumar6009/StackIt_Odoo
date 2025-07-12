const express = require('express');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Ban user
/*
Example Request:
PUT /api/admin/ban-user/64f8a1b2c3d4e5f6g7h8i9j1?banned=true
Authorization: Bearer <admin-token>
*/
router.put('/ban-user/:id', auth, adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const banned = req.query.banned !== undefined ? req.query.banned === 'true' : undefined;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot ban admin users' });
    }

    user.banned = banned !== undefined ? banned : !user.banned;
    await user.save();

    res.json({ 
      message: `User ${user.banned ? 'banned' : 'unbanned'} successfully`,
      user 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send platform-wide notification
/*
Example Request:
POST /api/admin/notifications?content=Welcome%20to%20StackIt!%20We've%20updated%20our%20community%20guidelines.&link=/guidelines
Authorization: Bearer <admin-token>
*/
router.post('/notifications', auth, adminAuth, async (req, res) => {
  try {
    const { content, link } = req.query;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const notification = {
      type: 'platform_message',
      content,
      link: link || null
    };

    await User.updateMany(
      { banned: false },
      { $push: { notifications: notification } }
    );

    res.json({ message: 'Notification sent to all users' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users (admin view)
/*
Example Request:
GET /api/admin/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Admin token required)

Example Response:
[
  {
    "_id": "64f8a1b2c3d4e5f6g7h8i9j1",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "banned": false,
    "createdAt": "2023-09-05T10:30:00.000Z"
  },
  {
    "_id": "64f8a1b2c3d4e5f6g7h8i9j2",
    "username": "janedoe",
    "email": "jane@example.com",
    "role": "admin",
    "banned": false,
    "createdAt": "2023-09-04T08:15:00.000Z"
  }
]
*/
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;