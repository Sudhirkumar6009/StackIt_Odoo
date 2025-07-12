const express = require('express');
const User = require('../models/User');
const { auth, userAuth } = require('../middleware/auth');
const router = express.Router();

// Get all notifications for logged-in user
/*
Example Request:
GET /api/notifications
Authorization: Bearer <token>

Example Response:
{
  "notifications": [
    {
      "_id": "64f8a1b2c3d4e5f6g7h8i9j0",
      "type": "answer_accepted",
      "content": "Your answer was accepted!",
      "read": false,
      "link": "/questions/64f8a1b2c3d4e5f6g7h8i9j1",
      "createdAt": "2023-09-06T10:30:00.000Z"
    },
    {
      "_id": "64f8a1b2c3d4e5f6g7h8i9j2",
      "type": "question_answered",
      "content": "Someone answered your question: 'How to use async/await?'",
      "read": true,
      "link": "/questions/64f8a1b2c3d4e5f6g7h8i9j3",
      "createdAt": "2023-09-06T09:15:00.000Z"
    }
  ],
  "unreadCount": 1,
  "totalCount": 2
}
*/
router.get('/', auth, userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notifications = user.notifications.sort((a, b) => b.createdAt - a.createdAt);
    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({
      notifications,
      unreadCount,
      totalCount: notifications.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get unread notifications only
/*
Example Request:
GET /api/notifications/unread
Authorization: Bearer <token>

Example Response:
{
  "notifications": [
    {
      "_id": "64f8a1b2c3d4e5f6g7h8i9j0",
      "type": "answer_accepted",
      "content": "Your answer was accepted!",
      "read": false,
      "link": "/questions/64f8a1b2c3d4e5f6g7h8i9j1",
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  ],
  "count": 1
}
*/
router.get('/unread', auth, userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const unreadNotifications = user.notifications
      .filter(n => !n.read)
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      notifications: unreadNotifications,
      count: unreadNotifications.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark notification as read
/*
Example Request:
PUT /api/notifications/64f8a1b2c3d4e5f6g7h8i9j0/read
Authorization: Bearer <token>

Example Response:
{
  "message": "Notification marked as read"
}
*/
router.put('/:notificationId/read', auth, userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notification = user.notifications.id(req.params.notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await user.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark all notifications as read
/*
Example Request:
PUT /api/notifications/read-all
Authorization: Bearer <token>

Example Response:
{
  "message": "All notifications marked as read",
  "updatedCount": 3
}
*/
router.put('/read-all', auth, userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let updatedCount = 0;
    user.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        updatedCount++;
      }
    });

    await user.save();

    res.json({ 
      message: 'All notifications marked as read',
      updatedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete specific notification
/*
Example Request:
DELETE /api/notifications/64f8a1b2c3d4e5f6g7h8i9j0
Authorization: Bearer <token>

Example Response:
{
  "message": "Notification deleted successfully"
}
*/
router.delete('/:notificationId', auth, userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notificationIndex = user.notifications.findIndex(
      n => n._id.toString() === req.params.notificationId
    );

    if (notificationIndex === -1) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    user.notifications.splice(notificationIndex, 1);
    await user.save();

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear all notifications
/*
Example Request:
DELETE /api/notifications/clear-all
Authorization: Bearer <token>

Example Response:
{
  "message": "All notifications cleared",
  "deletedCount": 5
}
*/
router.delete('/clear-all', auth, userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const deletedCount = user.notifications.length;
    user.notifications = [];
    await user.save();

    res.json({ 
      message: 'All notifications cleared',
      deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
